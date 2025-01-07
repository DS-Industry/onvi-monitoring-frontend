import axios from "axios";
import useAuthStore from "@/config/store/authSlice";

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
    if (showSnackbar) {
      const successStatuses = [200, 201];
      if (successStatuses.includes(response.status)) {
        showSnackbar("Your request has been processed!", "success");
      }
    } else {
      console.error("Snackbar function not initialized.");
    }
    return response;
  },
  (error) => {
    if (showSnackbar) {
      if (error.response?.status === 401) {
        showSnackbar("Unauthorized! Please log in again.", "error");
      } else if (error.response?.status === 500) {
        showSnackbar("Server error occurred. Please try again later.", "error");
        console.log("Server error is coming.");
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