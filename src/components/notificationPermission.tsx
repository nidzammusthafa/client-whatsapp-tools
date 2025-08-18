"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const requestNotificationPermission = () => {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        toast.success("Izin notifikasi diberikan!");
      } else {
        toast.warning("Izin notifikasi ditolak.");
      }
    });
  }
};

export const NotificationPermission = () => {
  useEffect(() => {
    // Minta izin saat komponen dimuat
    if (Notification.permission !== "granted") {
      requestNotificationPermission();
    }
  }, []);

  return null;
};
