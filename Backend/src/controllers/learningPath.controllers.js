import { User } from "../models/user.model.js";
import { LearningPath } from "../models/LearningPath.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Helper: find matched teachers ─────────────────────────────────────────────
const findTeachersForSkill = async (skillTag, currentUser) => {
  try {
    const potentialTeachers = await User.find({
      _id: { $ne: currentUser._id },
      skillsProficientAt: { $in: [skillTag] },
      username: { $exists: true, $ne: "" },
    })
      .select("_id name username picture rating skillsToLearn skillsProficientAt")
      .lean();

    const tagged = potentialTeachers.map((teacher) => {
      const swapMatch = teacher.skillsToLearn.some((s) =>
        (currentUser.skillsProficientAt || []).includes(s)
      );
      return { ...teacher, swapMatch };
    });

    tagged.sort((a, b) => {
      if (a.swapMatch && !b.swapMatch) return -1;
      if (!a.swapMatch && b.swapMatch) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    return tagged.slice(0, 3).map((t) => ({
      userId: t._id,
      name: t.name,
      username: t.username,
      picture: t.picture,
      rating: t.rating || 0,
      swapMatch: t.swapMatch,
    }));
  } catch (error) {
    console.error("Error finding teachers:", error);
    return [];
  }
};

// ── Generate Learning Path ────────────────────────────────────────────────────
export const generateLearningPath = async (req, res) => {
  try {
    const { goal, hoursPerWeek, timeline, currentLevel, specificGoal } = req.body;
    const currentUser = req.user;

    console.log("Generate path for user:", currentUser._id, "email:", currentUser.email);

    if (!goal || !hoursPerWeek || !timeline || !currentLevel || !specificGoal) {
      return res.status(400).json({ message: "All fields including specific goal are required" });
    }

    const alreadyKnows = (currentUser.skillsProficientAt || []).join(", ") || "Nothing mentioned";
    const wantsToLearn = (currentUser.skillsToLearn || []).join(", ") || "Not specified";

    const prompt = `
You are an expert learning path generator for SkillSwap, a skill exchange platform.

CRITICAL RULES:
1. NEVER include skills the user already knows as a learning phase
2. Start from WHERE THEY ARE NOW, not from scratch
3. Build a COMPLETE, DETAILED path towards their specific goal
4. Each skillTag MUST be a single skill name like "React" or "Node.js"

User Profile:
- Skills ALREADY KNOWN (DO NOT include): ${alreadyKnows}
- Skills they WANT to learn: ${wantsToLearn}
- Current level: ${currentLevel}
- Main goal: ${goal}
- Specific goal: ${specificGoal}
- Time available: ${hoursPerWeek} per week
- Timeline: ${timeline}

Generate 4-6 phases specific to their goal.
Respond ONLY with a valid JSON array, no explanation, no markdown:
[
  {
    "phase": 1,
    "title": "Phase 1 — React Fundamentals",
    "duration": "Week 1-4",
    "topics": ["Components & JSX", "Props & State", "useEffect & useState", "React Router"],
    "reason": "React is the most in-demand frontend framework",
    "skillTag": "React"
  }
]
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2000,
    });

    const rawResponse = completion.choices[0]?.message?.content || "[]";

    let phases = [];
    try {
      const cleaned = rawResponse.replace(/```json|```/g, "").trim();
      phases = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", rawResponse);
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    // Filter out skills user already knows
    const filteredPhases = phases.filter(
      (phase) => !(currentUser.skillsProficientAt || [])
        .map(s => s.toLowerCase())
        .includes(phase.skillTag.toLowerCase())
    );

    // Find teachers for each phase
    const phasesWithTeachers = await Promise.all(
      filteredPhases.map(async (phase) => {
        const teachers = await findTeachersForSkill(phase.skillTag, currentUser);
        return { ...phase, teachers };
      })
    );

    // Save with both userId AND email for reliable cross-lookup
    const learningPath = await LearningPath.findOneAndUpdate(
      { userId: currentUser._id },
      {
        userId: currentUser._id,
        userEmail: currentUser.email,
        goal, hoursPerWeek, timeline, currentLevel, specificGoal,
        generatedPath: phasesWithTeachers,
      },
      { upsert: true, new: true }
    );

    console.log("Learning path saved with userId:", currentUser._id, "email:", currentUser.email);

    return res.status(200).json({
      message: "Learning path generated successfully",
      data: learningPath,
    });
  } catch (error) {
    console.error("Error generating learning path:", error);
    return res.status(500).json({ message: error.message || "Some error occurred" });
  }
};

// ── Get Learning Path ─────────────────────────────────────────────────────────
export const getLearningPath = async (req, res) => {
  try {
    const currentUser = req.user;
    console.log("Get path for user:", currentUser._id, "email:", currentUser.email);

    // Strategy 1: find by userId directly
    let learningPath = await LearningPath.findOne({ userId: currentUser._id });

    // Strategy 2: find by email (path was saved during registration
    // with unregistered _id, but email is the same)
    if (!learningPath && currentUser.email) {
      learningPath = await LearningPath.findOne({ userEmail: currentUser.email });

      if (learningPath) {
        console.log("Found path by email, updating userId to registered id");
        // Reassign to registered userId so future lookups hit Strategy 1
        await LearningPath.findByIdAndUpdate(learningPath._id, {
          userId: currentUser._id
        });
      }
    }

    if (!learningPath) {
      return res.status(404).json({ message: "No learning path found" });
    }

    return res.status(200).json({
      message: "Learning path fetched successfully",
      data: learningPath,
    });
  } catch (error) {
    console.error("Error fetching learning path:", error);
    return res.status(500).json({ message: error.message || "Some error occurred" });
  }
};