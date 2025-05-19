// src/hooks/useFirebaseMessaging.ts
import { useEffect } from "react";
import { onMessage, messaging } from "@/utils/firebase";
import { notification } from "antd"; // Import antd's notification API

export const useFirebaseMessaging = () => {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
    //   console.log("Message received in foreground:", payload);
      alert(`Notification: ${payload.notification?.title}`);

      const { title, body } = payload.notification || {};

      // Show Ant Design notification
      notification.open({
        message: title || "New Message",
        description: body || "You have a new notification.",
        placement: "topRight",
        duration: 5,
      });
    });

    return () => unsubscribe();
  }, []);
};
