import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:9999/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export const loginUser = async (studentId, password) => {
  try {
    const response = await api.post("/auth/login", { studentId, password });
    return response.data.token;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("jwt");
};

export const getUserProfile = async (userId) => {
  try {
    const token = getToken();
    const response = await api.get(`/auth/getUserById/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const token = getToken();
    const response = await api.get("/auth/getAllUsers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const token = getToken();
    const response = await api.patch(
      `/auth/changepassword/${userId}`,
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to change password:", error);
    throw error;
  }
};
