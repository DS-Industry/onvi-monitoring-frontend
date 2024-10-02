import axios from "axios";
import useAuthStore from "@/config/store/authSlice";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

api.interceptors.request.use(
    (config) => {
        const jwtToken = useAuthStore.getState().tokens?.accessToken;

        if(jwtToken !== null) {
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
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.log('Unauthorized, redirect to login or refresh token');
      }
      return Promise.reject(error);
    }
  );
  
  export default api;