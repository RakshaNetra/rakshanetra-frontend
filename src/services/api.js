import axios from "axios";

const API = axios.create({
  baseURL: "https://rakshanetra-api.koyeb.app",
});

// Helper to get headers with token
const getAuthHeaders = (contentType = "application/json") => {
  const token = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return { headers };
};

/**
 * AUTHENTICATION
 */

export const login = async (username, password) => {
  try {
    const response = await API.post("/login", { username, password });
    const data = response.data?.data || response.data;
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return data.user || data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.message ||
        "Login failed"
    );
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await API.post("/resend-otp", { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail?.[0]?.msg || "Failed to resend OTP"
    );
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await API.post("/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail?.[0]?.msg || "Request failed");
  }
};

export const resetPassword = async (email, otp, new_password) => {
  try {
    const response = await API.post("/reset-password", {
      email,
      otp,
      new_password,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail?.[0]?.msg || "Reset password failed"
    );
  }
};

export const changePassword = async (current_password, new_password) => {
  try {
    const response = await API.post(
      "/change-password",
      { current_password, new_password },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail?.[0]?.msg || "Change password failed"
    );
  }
};

/**
 * DASHBOARD & DATA
 */

export const fetchDashboardData = async () => {
  const response = await API.get("/dashboard", getAuthHeaders());
  return response.data;
};

export const getDeviceData = async () => {
  const response = await API.get("/mobile/get_data", getAuthHeaders());
  return response.data;
};

/**
 * ACCOUNT RECOVERY
 */

export const initiateRecovery = async (platform, lang = "English") => {
  try {
    // Platform and lang are passed as query parameters
    const response = await API.post(
      `/recovery/initiate?platform=${encodeURIComponent(
        platform
      )}&lang=${encodeURIComponent(lang)}`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail?.[0]?.msg || "Failed to initiate recovery"
    );
  }
};

/**
 * RAKSHAMITRA AI (CHATBOT)
 */

export const sendChatMessage = async (message, files = []) => {
  try {
    const formData = new FormData();
    // Send message even if empty string if files are present
    if (message !== null && message !== undefined) {
      formData.append("message", message);
    }

    if (files && files.length > 0) {
      // Loop through FileList or Array
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    const response = await API.post(
      "/rakshamitra/chat",
      formData,
      getAuthHeaders(null)
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail?.[0]?.msg || "Failed to send message"
    );
  }
};

export const getChatHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await API.post(
      "/rakshamitra/history",
      { limit, offset },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch chat history. " + error.message);
  }
};

export const endChatSession = async () => {
  try {
    const response = await API.post(
      "/rakshamitra/end_session",
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to end session. " + error.message);
  }
};

/**
 * USER PROFILE & SESSIONS
 */

export const getProfile = async () => {
  const response = await API.get("/profile", getAuthHeaders());
  return response.data;
};

export const getSessions = async () => {
  const response = await API.get("/my-sessions", getAuthHeaders());
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.patch("/profile", profileData, getAuthHeaders());
  return response.data;
};

export const logoutDevice = async (session_id) => {
  const response = await API.post(
    "/logout-device",
    { session_id },
    getAuthHeaders()
  );
  return response.data;
};

export const logoutAll = async () => {
  const response = await API.post("/logout-all", {}, getAuthHeaders());
  return response.data;
};
