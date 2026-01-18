import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DeviceDetailsPage from "./pages/Device";
import RecoveryHelper from "./pages/RecoveryHelper";
import ChatBot from "./pages/ChatBot";
import "./App.css";

// 1. Helper to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};

// 2. Prevent logged-in users from seeing Login/Register pages
const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// 3. Prevent logged-out users from seeing Dashboard/Profile pages
const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES (Redirect to Dashboard if already logged in) */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* PRIVATE ROUTES (Redirect to Login if not logged in) */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/device" element={<DeviceDetailsPage />} />
        <Route path="/chat" element={<ChatBot />} />
        <Route path="/recovery" element={<RecoveryHelper />} />
      </Route>
    </Routes>
  );
}

export default App;
