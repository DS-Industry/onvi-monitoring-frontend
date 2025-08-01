import axios from "axios";
import useAuthStore from "@/config/store/authSlice";
import i18n from "@/config/i18n";
import { datadogLogs } from "@datadog/browser-logs";

let showToast: (
  message: string,
  type: "success" | "error" | "info" | "warning"
) => void;

export const setToastFunction = (toastFunction: typeof showToast) => {
  showToast = toastFunction;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const jwtToken = useAuthStore.getState().tokens?.accessToken;
    if (jwtToken !== null) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    datadogLogs.logger.info("API Request Initiated", {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString(),
    });

    return config;
  },
  (error) => {
    datadogLogs.logger.error("Request setup error", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return Promise.reject(error);
  }
);

const getTranslatedError = (code: number) => i18n.t(`errors.${String(code)}`);

api.interceptors.response.use(
  (response) => {
    datadogLogs.logger.info("API Response Received", {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const method = error.config?.method;
    const status = error.response?.status || "No Response";
    const code = error.response?.data?.code || null;

    datadogLogs.logger.error("API Error", {
      url,
      method,
      status,
      code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    if (!showToast) {
      console.error("Toast function is not initialized.");
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const logout = useAuthStore.getState().clearTokens;
      logout();
      window.location.href = "/login";
    }

    const endpoint = error.config?.url;
    if (!endpoint) {
      showToast(i18n.t("errors.other.unexpectedErrorOccurred"), "error");
      return Promise.reject(error);
    }

    if (error.response) {
      const errorCode = error.response.data?.code;
      const errorMessage = errorCode
        ? getTranslatedError(errorCode)
        : "An error occurred. Please try again.";
      showToast(errorMessage, "error");
    } else if (error.request) {
      showToast(i18n.t("errors.other.noResponseFromServer"), "error");
    } else {
      showToast(i18n.t("errors.other.unexpectedErrorOccurred"), "error");
    }

    return Promise.reject(error);
  }
);

export default api;
