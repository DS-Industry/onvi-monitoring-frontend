/* public/firebase-messaging-sw.js */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
/* eslint-disable */
importScripts(
  "https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "onvione-monitoring.firebaseapp.com",
    projectId: "onvione-monitoring",
    storageBucket: "onvione-monitoring.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_MESSAGING_ID,
    appId: import.meta.env.VITE_APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message ",
//     payload
//   );
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  });
});
