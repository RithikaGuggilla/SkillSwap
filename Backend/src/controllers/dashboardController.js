

import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";

/* =========================
   DASHBOARD STATS
========================= */

export const getDashboardStats = async (req, res) => {
  try {

    const userId = req.user._id;

    const requestsSent = await Request.countDocuments({
      sender: userId
    });

    const pendingRequests = await Request.countDocuments({
      receiver: userId,
      status: "Pending"
    });

    const connections = await Request.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "Connected"
    });

    const meetingsScheduled = await Meeting.countDocuments({
  $or: [{ host: userId }, { participant: userId }],
  status: { $in: ["Scheduled", "Completed"] }
});


    res.json({
  stats: {
    requestsSent,
    pendingRequests,
    connections,
    meetingsScheduled,
    meetingsDone },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard stats error" });
  }
};


/* =========================
   RECENT ACTIVITY
========================= */

export const getActivity = async (req, res) => {
  try {

    const userId = req.user._id;

    const requests = await Request.find({
      receiver: userId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("sender", "name");

    const requestActivity = requests
      .filter(r => r.sender)
      .map((r) => ({
        text: `${r.sender.name} sent you a skill request`,
        createdAt: r.createdAt
      }));


    const connected = await Request.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "Connected"
    }).populate("sender receiver", "name");

    const connectionActivity = connected
      .filter(c => c.sender && c.receiver)
      .map((c) => {

        const otherUser =
          c.sender._id.toString() === userId.toString()
            ? c.receiver.name
            : c.sender.name;

        return {
          text: `You connected with ${otherUser}`,
          createdAt: c.updatedAt
        };

      });

    const activity = [...requestActivity, ...connectionActivity]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    res.status(200).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Activity fetch failed"
    });
  }
};


/* =========================
   LEARNING PROGRESS
========================= */

export const getLearning = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const progress = (user.skillsToLearn || []).map((skill) => ({
      skill,
      percent: Math.floor(Math.random() * 70) + 10,
      sessionsCompleted: 2,
      level: "Beginner"
    }));

    res.status(200).json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Learning progress fetch failed"
    });
  }
};


/* =========================
   FULL DASHBOARD OVERVIEW
========================= */

export const getDashboardOverview = async (req, res) => {
  try {

    const userId = req.user._id;

    const requestsSent = await Request.countDocuments({
      sender: userId
    });

    const pendingRequests = await Request.countDocuments({
      receiver: userId,
      status: "Pending"
    });

   const connectionsData = await Request.find({
  $or: [{ sender: userId }, { receiver: userId }],
  status: "Connected"
});

const uniqueUsers = new Set();

connectionsData.forEach((r) => {
  const otherUser =
    r.sender.toString() === userId.toString()
      ? r.receiver.toString()
      : r.sender.toString();

  uniqueUsers.add(otherUser);
});

const connections = uniqueUsers.size;



    const upcomingSessions = await Meeting.find({
  $or: [{ host: userId }, { participant: userId }],
  status: "Scheduled",
  date: { $gte: new Date().toISOString().split("T")[0] }
})
.populate("host participant", "name username picture")
.sort({ date: 1, time: 1 })
.limit(5);


console.log("Upcoming Sessions:", upcomingSessions);

    const validSessions = upcomingSessions.filter(
  s => s.host && s.participant
);

const meetingsScheduled = validSessions.length;

    // const formattedSessions = validSessions
    //   .filter(s => s.host && s.participant)
    //   .map((session) => {

    //     const otherUser =
    //       session.host._id.toString() === userId.toString()
    //         ? session.participant
    //         : session.host;

    //     return {
    //       name: otherUser.name,
    //       username: otherUser.username,
    //       picture: otherUser.picture,
    //       date: session.date,
    //       time: session.time
    //     };

    //   });


    const formattedSessions = validSessions.map((session) => {
  const otherUser =
    session.host._id.toString() === userId.toString()
      ? session.participant
      : session.host;
 
  return {
    _id: session._id,        // ← ADD THIS
    name: otherUser.name,
    username: otherUser.username,
    picture: otherUser.picture,
    date: session.date,
    time: session.time,
  };
});
 










    const requests = await Request.find({
      receiver: userId,
      status: "Pending"
    })
      .populate("sender", "name username picture")
      .limit(4);

    const pendingList = requests
      .filter(r => r.sender)
      .map((r) => ({
        name: r.sender.name,
        username: r.sender.username,
        picture: r.sender.picture
      }));


    const user = await User.findById(userId);

   const matches = await User.find({
  skillsProficientAt: { $in: user.skillsToLearn || [] },
  skillsToLearn: { $in: user.skillsProficientAt || [] }, // 🔥 ADD THIS
  _id: { $ne: userId }
})
.select("name username picture rating skillsProficientAt skillsToLearn")
.limit(4);


    const requestActivity = requests
      .filter(r => r.sender)
      .map((r) => ({
        text: `${r.sender.name} sent you a skill request`,
        createdAt: r.createdAt
      }));


    const connected = await Request.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "Connected"
    }).populate("sender receiver", "name");

    const connectionActivity = connected
      .filter(c => c.sender && c.receiver)
      .map((c) => {

        const otherUser =
          c.sender._id.toString() === userId.toString()
            ? c.receiver.name
            : c.sender.name;

        return {
          text: `You connected with ${otherUser}`,
          createdAt: c.updatedAt
        };

      });


    const activity = [...requestActivity, ...connectionActivity]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);


    const learningProgress = (user.skillsToLearn || []).map((skill) => ({
      skill,
      percent: Math.floor(Math.random() * 60) + 20,
      sessionsCompleted: 2,
      level: "Beginner"
    }));

    const meetingsDone = await Meeting.countDocuments({
  $or: [{ host: userId }, { participant: userId }],
  status: "Completed"
});

    res.json({
      stats: {
        requestsSent,
        pendingRequests,
        connections,
        meetingsScheduled,
        meetingsDone,
      },
      pendingRequests: pendingList,
      skillMatches: matches,
      recentActivity: activity,
      learningProgress,
      upcomingSessions: formattedSessions
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Dashboard overview error"
    });
  }
};