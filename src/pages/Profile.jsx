import { useEffect, useState } from "react";
import {
  getSessions,
  updateProfile,
  logoutDevice,
  logoutAll,
  changePassword,
  getProfile,
} from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Key,
  LogOut,
  Smartphone,
  Globe,
  Clock,
  Save,
  Plus,
  Trash2,
  Camera,
  ArrowLeft,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    profile_pic_url: "",
    emergency_contacts: [],
  });
  const [userInfo, setUserInfo] = useState(null);
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, sessionsRes] = await Promise.all([
        getProfile(),
        getSessions(),
      ]);
      const userData = profileRes.data;
      setUserInfo(userData);
      setProfileForm({
        full_name: userData.full_name || "",
        profile_pic_url: userData.profile_pic_url || "",
        emergency_contacts: userData.emergency_contacts || [],
      });
      setSessions(sessionsRes.data || []);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      alert("Profile updated successfully!");
      const res = await getProfile();
      setUserInfo(res.data);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogoutDevice = async (sessionId) => {
    if (!window.confirm("Logout this device?")) return;
    try {
      await logoutDevice(sessionId);
      const res = await getSessions();
      setSessions(res.data || []);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Logout from all devices?")) return;
    try {
      await logoutAll();
      localStorage.clear();
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwords.current, passwords.new);
      alert("Password changed successfully");
      setPasswords({ current: "", new: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const addContact = () => {
    setProfileForm((prev) => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { name: "", email: "" }],
    }));
  };

  const updateContact = (index, field, value) => {
    const updated = [...profileForm.emergency_contacts];
    updated[index][field] = value;
    setProfileForm({ ...profileForm, emergency_contacts: updated });
  };

  const removeContact = (index) => {
    const updated = profileForm.emergency_contacts.filter(
      (_, i) => i !== index
    );
    setProfileForm({ ...profileForm, emergency_contacts: updated });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-mono animate-pulse">
            Loading your profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111] text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center gap-3">
            <User className="w-8 h-8 text-cyan-500" />
            Account Settings
          </h1>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL: User Card & Security */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>

              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[2px] mb-4">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  {userInfo?.profile_pic_url ? (
                    <img
                      src={userInfo.profile_pic_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                      {userInfo?.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-white">
                {userInfo?.full_name}
              </h2>
              <p className="text-cyan-400 text-sm mb-4">
                @{userInfo?.username}
              </p>

              <div className="space-y-3 text-left bg-black/30 p-4 rounded-lg border border-white/5 text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4" /> {userInfo?.email}
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Shield className="w-4 h-4" />{" "}
                  {userInfo?.is_admin ? "Administrator" : "User"}
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Clock className="w-4 h-4" /> Joined{" "}
                  {new Date(userInfo?.joined_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" /> Security
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full bg-black/40 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full bg-black/40 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                />
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg text-sm font-semibold transition">
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COL: Edit Form & Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Details */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-500" /> Edit Profile Details
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/40 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          full_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Avatar URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full bg-black/40 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                        value={profileForm.profile_pic_url}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            profile_pic_url: e.target.value,
                          })
                        }
                      />
                      <div className="p-2 bg-white/5 rounded border border-white/10 flex items-center justify-center">
                        <Camera className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-2">
                    Emergency Contacts
                  </label>
                  <div className="space-y-2">
                    {profileForm.emergency_contacts.map((contact, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          placeholder="Contact Name"
                          className="flex-1 bg-black/40 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-cyan-500 text-sm focus:outline-none"
                          value={contact.name}
                          onChange={(e) =>
                            updateContact(index, "name", e.target.value)
                          }
                        />
                        <input
                          placeholder="Contact Email"
                          className="flex-1 bg-black/40 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-cyan-500 text-sm focus:outline-none"
                          value={contact.email}
                          onChange={(e) =>
                            updateContact(index, "email", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addContact}
                    className="mt-2 text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <Plus className="w-3 h-3" /> Add Contact
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Sessions */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-500" /> Active
                  Sessions
                </h3>
                <button
                  onClick={handleLogoutAll}
                  className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 px-3 py-1 bg-red-500/10 rounded border border-red-500/20"
                >
                  <LogOut className="w-3 h-3" /> Logout All
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-black/40 rounded-lg">
                        <Smartphone className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {session.device_info.user_agent}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 px-2 py-0.5 rounded">
                            <Globe className="w-3 h-3" /> {session.ip_address}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 px-2 py-0.5 rounded">
                            {session.device_info.city},{" "}
                            {session.device_info.country}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Last Active:{" "}
                          {new Date(session.last_activity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLogoutDevice(session.session_id)}
                      className="mt-3 sm:mt-0 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded text-sm transition"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
