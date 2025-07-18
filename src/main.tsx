import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "./config/i18n/index.ts";
import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';
import { datadogLogs } from "@datadog/browser-logs";

const ENV = import.meta.env.VITE_MODE;

if (ENV === "staging") {
datadogRum.init({
  applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
  clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
  site: import.meta.env.VITE_DATADOG_SITE || "datadoghq.eu",
  service: import.meta.env.VITE_DATADOG_SERVICE || "onvi-app",
  env: import.meta.env.VITE_DATADOG_ENV || "staging",
  version: "0.0.0",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  plugins: [reactPlugin({ router: true })],
  startSessionReplayRecordingManually: true,
});

datadogRum.startSessionReplayRecording();

  datadogLogs.init({
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: import.meta.env.VITE_DATADOG_SITE || "datadoghq.eu",
    service: import.meta.env.VITE_DATADOG_SERVICE || "onvi-app",
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
  });
}

// main.tsx or App.tsx
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => {
      // console.log("Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
