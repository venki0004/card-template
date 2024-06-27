import axios from "axios";
import { toast } from 'react-toastify';
import { logout } from "./auth";
import { decryptData } from "./encryption";

const baseURL = process.env.REACT_APP_BACKEND_URL;

// Create an Axios instance with default configurations
export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    if (config) {
      config.withCredentials = true;
      if(localStorage.getItem("user-token")) {
        config.headers["Authorization"] = `Bearer ${decryptData(localStorage.getItem("user-token"))}`;
      }
      if(localStorage.getItem("X-VALIDATE")) {
        config.headers["x-csrf-token"] =  decryptData(localStorage.getItem("X-VALIDATE"));
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response.status === 401) {
      logout();
      toast.dismiss();
      toast.error('UNAUTHORIZED ACCESS.', {
        position: toast.POSITION.TOP_RIGHT,
      });
      window.location.href = '/';
      return Promise.reject(new Error('Unauthorized access')); // Reject the promise with an Error object
    } else if (error?.response?.data?.errors) {
      const { errors } = error.response.data;
      let errorMessage = 'INTERNET ERROR: ' + JSON.stringify(errors);
      if (errors.message) {
        errorMessage = errors.message;
      } else {
        for (const key in errors) {
          if (errors[key]) {
            errorMessage += `${errors[key][0]} `;
          }
        }
      }
      return Promise.reject(new Error(errorMessage)); // Reject the promise with an Error object containing the custom error message
    } else {
      const message = error.response?.data?.message ?? 'An error occurred while processing your request'
      return Promise.reject(new Error(message)); // Reject the promise with a generic error message
    }
  }
);

