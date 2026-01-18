import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DeviceDetailsPage from "./pages/Device";
import RecoveryHelper from "./pages/RecoveryHelper";
import ChatBot from "./pages/ChatBot";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/device" element={<DeviceDetailsPage />} />
      <Route path="/recovery" element={<RecoveryHelper />} />
      <Route path="/chat" element={<ChatBot />} />
    </Routes>
  );
}

export default App;
