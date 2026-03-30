
import { useEffect } from "react";
import axios from "axios";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData  = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const usePushNotifications = (user) => {
  useEffect(() => {
    if (!user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const setup = async () => {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("✅ Service worker registered");

        // Get VAPID public key from backend
        const { data } = await axios.get("/push/vapid-key");
        const publicKey = data.data.publicKey;

        // Check existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // Ask for permission + subscribe
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("🔕 Push notification permission denied");
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly:      true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        // Save subscription to backend
        await axios.post("/push/subscribe", { subscription }, { withCredentials: true });
        console.log("✅ Push subscription saved");
      } catch (err) {
        console.error("❌ Push setup failed:", err.message);
      }
    };

    setup();
  }, [user]);
};