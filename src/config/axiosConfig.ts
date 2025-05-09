import axios from "axios";
import useAuthStore from "@/config/store/authSlice";
import i18n from "@/config/i18n";

let showSnackbar: (message: string, type: "success" | "error" | "info" | "warning") => void;

export const setSnackbarFunction = (snackbarFunction: typeof showSnackbar) => {
  showSnackbar = snackbarFunction;
};

const api = axios.create({
  baseURL: 'https://d5dgrl80pu15j74ov536.apigw.yandexcloud.net',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const jwtToken = useAuthStore.getState().tokens?.accessToken;
    if (jwtToken !== null) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getTranslatedError = (code: number) => i18n.t(`errors.${String(code)}`);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!showSnackbar) {
      console.error("Snackbar function is not initialized.");
      return Promise.reject(error);
    }

    const endpoint = error.config?.url;
    if (!endpoint) {
      showSnackbar("Unexpected error occurred. Please try again.", "error");
      return Promise.reject(error);
    }

    if (error.response) {
      const errorCode = error.response.data?.code;
      const errorMessage = errorCode ? getTranslatedError(errorCode) : "An error occurred. Please try again.";
      showSnackbar(errorMessage, "error");
    } else if (error.request) {
      showSnackbar("No response from the server. Check your internet connection.", "error");
    } else {
      showSnackbar("Unexpected error occurred. Please try again.", "error");
    }

    return Promise.reject(error);
  }
);

export default api;
