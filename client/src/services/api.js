import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://carehub-api-3v7y.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = sessionStorage.getItem("carehub-storage");
    if (userInfo) {
      const { state } = JSON.parse(userInfo);
      if (state && state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
