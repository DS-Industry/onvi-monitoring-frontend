import axios from "axios";
import useAuthStore from "@/config/store/authSlice";
import { useTranslation } from "react-i18next";

let showSnackbar: (message: string, type: "success" | "error" | "info" | "warning") => void;

// Setter to initialize the `showSnackbar` function
export const setSnackbarFunction = (snackbarFunction: typeof showSnackbar) => {
  showSnackbar = snackbarFunction;
};

const api = axios.create({
  //baseURL: 'http://localhost:5000',
  baseURL: 'https://d5dgrl80pu15j74ov536.apigw.yandexcloud.net',
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    const jwtToken = useAuthStore.getState().tokens?.accessToken;

    if (jwtToken !== null) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

api.interceptors.response.use(
  (response) => {
    // if (showSnackbar) {
    //   const successStatuses = [200, 201];
    //   if (successStatuses.includes(response.status) && response.config.method !== "get") {
    //     showSnackbar("Your request has been processed!", "success");
    //   }
    // } else {
    //   console.error("Snackbar function not initialized.");
    // }
    return response;
  },
  (error) => {
    if (showSnackbar) {
      const { t } = useTranslation();
      const { response } = error;

      // Extract error message from API response if it exists
      const apiMessage = response?.data?.message;
      if (apiMessage) {
        // Show the error message from the API response
        showSnackbar(t(`errors.${String(response?.data?.code)}`), "error");
      } else {
        showSnackbar("An error occurred. Please try again.", "error");
      }
    } else {
      console.error("Snackbar function not initialized.");
    }
    return Promise.reject(error);
  }
);

export default api;