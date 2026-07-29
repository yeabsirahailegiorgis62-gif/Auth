import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "../utils/authTokens";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      setUser(response.data.user);
    } catch (err) {
      clearTokens();
      setUser(null);
      throw err;
    }
  };

  const checkAuth = async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!accessToken || !refreshToken) {
      setLoading(false);
      return;
    }

    try {
      await fetchProfile();
    } catch (err) {
      console.error("Auth check failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (data) => {
    setError(null);
    setMessage(null);

    const response = await api.post("/auth/register", data);
    setMessage("Account created successfully. Please log in.");
    return response;
  };

  const login = async ({ email, password }) => {
    setError(null);
    setMessage(null);

    try {
      const response = await api.post("/auth/login", { email, password });
      setTokens(response.data);
      await fetchProfile();
      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        // Handle account lockout
        throw error;
      }
      throw error;
    }
  };

  const oauthLogin = async (tokens) => {
    setError(null);
    setMessage(null);

    setTokens(tokens);
    await fetchProfile();
  };

  const logout = async () => {
    setError(null);
    setMessage(null);

    try {
      const refreshToken = getRefreshToken();
      await api.post("/auth/logout", { refreshToken });
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const logoutAll = async () => {
    setError(null);
    setMessage(null);

    try {
      await api.post("/auth/logout-all");
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    message,
    register,
    login,
    oauthLogin,
    logout,
    logoutAll,
    setError,
    setMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
