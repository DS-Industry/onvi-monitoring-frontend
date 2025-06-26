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
    apiKey: "AIzaSyBy4cTKXjWzCxV4nd4hxZi1y74TF9qo1Aw",
    authDomain: "onvione-monitoring.firebaseapp.com",
    projectId: "onvione-monitoring",
    storageBucket: "onvione-monitoring.firebasestorage.app",
    messagingSenderId: "645871534181",
    appId: "1:645871534181:web:8cd42b272a364cdea9c68c",
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
