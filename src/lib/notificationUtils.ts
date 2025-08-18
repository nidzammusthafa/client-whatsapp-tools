export const showNotification = (title: string, message: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const audio = new Audio("/notification.mp3"); // Pastikan file ada di folder public
    audio.play().catch((e) => console.error("Gagal memutar audio:", e));

    const options = {
      body: message,
      icon: "/favicon.ico", // Ikon notifikasi Anda
      vibrate: [200, 100, 200], // Getaran untuk perangkat seluler
    };

    new Notification(title, options);
  } else {
    // Fallback jika izin tidak diberikan
    console.log(`[Notification] ${title}: ${message}`);
  }
};
