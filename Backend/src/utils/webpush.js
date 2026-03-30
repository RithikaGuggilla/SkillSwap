
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:skillswap.support.team@gmail.com",               // ← change to your email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log("✅ Push sent");
  } catch (err) {
    console.error("❌ Push failed:", err.message);
  }
};

export default webpush;