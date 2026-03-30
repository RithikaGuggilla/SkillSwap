

import cron from "node-cron";
import { Meeting } from "../models/meeting.model.js";
import { PushSubscription } from "../models/PushSubscription.model.js";
import { Notification } from "../models/Notification.model.js";
import { User } from "../models/user.model.js";
import { sendPushNotification } from "./webpush.js";
import { sendReminderEmail } from "./sendEmail.js";

export const startReminderCron = () => {

  // ── Midnight cleanup: delete reminder notifications whose session day has passed ──
  cron.schedule("0 0 * * *", async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0]; // "2026-03-22"

      const result = await Notification.deleteMany({
        type: "session_reminder",
        "meta.sessionDate": { $lte: yesterdayStr },
      });
      console.log(`🧹 Deleted ${result.deletedCount} old reminder notifications`);
    } catch (err) {
      console.error("❌ Cleanup error:", err.message);
    }
  });

  // ── Every minute: check for sessions starting in 1 hour ──
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    // TEST window: now → +2 mins (change back to 59-61 after testing)
    // const from = new Date(now.getTime() - 30 * 1000);
    // const to   = new Date(now.getTime() + 2 * 60 * 1000);


    const from = new Date(now.getTime() + 59 * 60 * 1000);
    const to   = new Date(now.getTime() + 61 * 60 * 1000);
 

    try {
      const meetings = await Meeting.find({})
        .populate("host",        "name username")
        .populate("participant", "name username");

      for (const meeting of meetings) {
        const [year, month, day] = meeting.date.split("-").map(Number);
        const [hours, mins]      = meeting.time.split(":").map(Number);
        const sessionTime        = new Date(year, month - 1, day, hours, mins, 0);

        if (sessionTime >= from && sessionTime <= to) {
          console.log(`✅ Reminder match: ${meeting.date} ${meeting.time}`);

          const hostName        = meeting.host?.name        || "your session partner";
          const participantName = meeting.participant?.name || "your session partner";

          const usersToNotify = [
            { userId: meeting.host?._id,        otherName: participantName },
            { userId: meeting.participant?._id,  otherName: hostName },
          ].filter(u => u.userId);

          for (const { userId, otherName } of usersToNotify) {

            // ── Save to DB (shows in dropdown) ──
            await Notification.create({
              recipient: userId,
              type:      "session_reminder",
              title:     "⏰ Session Reminder",
              message:   `Your session with ${otherName} starts at ${meeting.time} — starts in 1 hour!`,
              link:      "/dashboard",
              meta:      { sessionDate: meeting.date, sessionTime: meeting.time },
            });

            // ── Send browser push (works even when tab is closed) ──
            const record = await PushSubscription.findOne({ user: userId });
            if (record) {
              await sendPushNotification(record.subscription, {
                title: "⏰ Session Reminder",
                body:  `Your session with ${otherName} starts at ${meeting.time} — 1 hour to go!`,
                url:   "/dashboard",
              });
              console.log(`✅ Push sent to ${userId}`);
            } else {
              console.log(`⚠️ No push subscription for ${userId}`);
            }

            // ── Send email reminder ──
            const userDoc = await User.findById(userId).select("email name");
            if (userDoc?.email) {
              await sendReminderEmail({
                toEmail:     userDoc.email,
                toName:      userDoc.name,
                otherName,
                sessionTime: meeting.time,
                sessionDate: meeting.date,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Cron error:", err.message);
    }
  });

  console.log("⏰ Session reminder cron started");
};