import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import React, { Suspense } from "react";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleCallback from "./pages/GoogleCallback";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loaded components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const DocumentEditor = React.lazy(() => import("./pages/DocumentEditor"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Dashboard...</div>}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Editor...</div>}>
                      <DocumentEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/document/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Editor...</div>}>
                      <DocumentEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
