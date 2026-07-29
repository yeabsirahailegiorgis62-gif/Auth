import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { oauthLogin, setError } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("Google login failed. Please try again.");
      navigate("/login");
      return;
    }

    const tokens = { accessToken, refreshToken };

    oauthLogin(tokens)
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        setError("Unable to complete Google login.");
        navigate("/login");
      });
  }, [navigate, oauthLogin, setError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        Finishing Google sign in...
      </div>
    </div>
  );
}
