




import { Meeting } from "../models/meeting.model.js";
import { User } from "../models/user.model.js";
import { addXP } from "../utils/creditEngine.js";

// ── Helper: award XP to both participants on completion ──
const awardCompletionXP = async (hostId, participantId) => {
  const BASE_XP = 30;

  const [host, participant] = await Promise.all([
    User.findById(hostId),
    User.findById(participantId),
  ]);

  if (host) {
    addXP(host, BASE_XP);
    // Host taught the session
    host.totalSessionsTaught = (host.totalSessionsTaught || 0) + 1;
    await host.save();
  }

  if (participant) {
    addXP(participant, BASE_XP);
    // Participant completed a session
    participant.totalSessionsCompleted = (participant.totalSessionsCompleted || 0) + 1;
    await participant.save();
  }
};

// ── Schedule a meeting ────────────────────────────────────
export const scheduleMeeting = async (req, res) => {
  try {
    const { participantId, date, time } = req.body;

    const meeting = await Meeting.create({
      host: req.user._id,
      participant: participantId,
      date,
      time,
    });

    console.log("Meeting saved:", meeting);

    res.status(200).json({
      success: true,
      message: "Meeting scheduled successfully",
      data: meeting,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to schedule meeting" });
  }
};

// ── Complete a meeting & award XP ────────────────────────
// POST /meeting/complete/:meetingId
// Either the host OR the participant can mark it done
export const completeMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const currentUserId = req.user._id.toString();

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const isHost        = meeting.host.toString() === currentUserId;
    const isParticipant = meeting.participant.toString() === currentUserId;

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "You are not part of this meeting" });
    }

    if (meeting.status === "Completed") {
      return res.status(400).json({ message: "Meeting already completed" });
    }

    meeting.status = "Completed";
    await meeting.save();

    // Award XP to both
    await awardCompletionXP(meeting.host, meeting.participant);

    res.status(200).json({
      success: true,
      message: "Session marked as completed! XP awarded to both participants.",
      data: meeting,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to complete meeting" });
  }
};

// ── Get all meetings for current user ────────────────────
export const getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
 
    const meetings = await Meeting.find({
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host",        "name username picture")
      .populate("participant", "name username picture")
      .sort({ date: -1, time: -1 });   // newest first
 
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

export const markMissed = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const currentUserId = req.user._id.toString();
 
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
 
    const isHost        = meeting.host.toString()        === currentUserId;
    const isParticipant = meeting.participant.toString() === currentUserId;
 
    if (!isHost && !isParticipant)
      return res.status(403).json({ message: "You are not part of this meeting" });
 
    if (meeting.status === "Completed")
      return res.status(400).json({ message: "Cannot mark a completed meeting as missed" });
 
    meeting.status = "Missed";
    await meeting.save();
 
    res.status(200).json({ success: true, message: "Session marked as missed.", data: meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark meeting as missed" });
  }
};