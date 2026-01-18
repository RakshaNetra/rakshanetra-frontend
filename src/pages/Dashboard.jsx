import { useEffect, useState } from "react";
import { fetchDashboardData } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Shield,
  Smartphone,
  Activity,
  User,
  MapPin,
  Clock,
  LogOut,
  AlertTriangle,
  Wifi,
  Globe,
  Cpu,
  Bot,
  LifeBuoy,
} from "lucide-react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData()
      .then((res) => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard load failed:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-mono animate-pulse">
            Initializing System...
          </p>
        </div>
      </div>
    );
  }

  // Safe destructuring with fallbacks
  const { user, sessions = [], activity_logs = [] } = dashboardData || {};

  // Calculate Stats
  const activeSessions = sessions.filter((s) => s.is_active).length;
  const totalSessions = sessions.length;
  const recentActivityTime = activity_logs[0]
    ? new Date(activity_logs[0].timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  // Process Activity Logs for Chart (Group by Hour)
  const chartData = activity_logs
    .slice()
    .reverse()
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      event: 1, // Simple count for visualization
      name: log.event,
    }))
    .slice(-10); // Last 10 events

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111] text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-500" />
              Command Center
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">
              System Status: <span className="text-green-500">ONLINE</span> |
              ID: {user?.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/device"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition group"
              title="Device Report"
            >
              <Smartphone className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
            </Link>
            <Link
              to="/profile"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition group"
              title="Profile"
            >
              <User className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Wifi className="w-5 h-5 text-cyan-400" />}
            label="Active Sessions"
            value={activeSessions}
            subtext={`${totalSessions} Total Sessions`}
            color="border-cyan-500/20 bg-cyan-500/5"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-green-400" />}
            label="Last Activity"
            value={recentActivityTime}
            subtext="System Log Updated"
            color="border-green-500/20 bg-green-500/5"
          />
          <StatCard
            icon={<Globe className="w-5 h-5 text-indigo-400" />}
            label="Current IP"
            value={user?.device_info?.ip_address || "Hidden"}
            subtext={`${user?.device_info?.city}, ${user?.device_info?.country}`}
            color="border-indigo-500/20 bg-indigo-500/5"
          />
          <StatCard
            icon={<Shield className="w-5 h-5 text-amber-400" />}
            label="Account Status"
            value={user?.is_active === "true" ? "Active" : "Restricted"}
            subtext={user?.is_admin ? "Administrator Access" : "Standard User"}
            color="border-amber-500/20 bg-amber-500/5"
          />
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Charts & Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50"></div>
              <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                Live Traffic Stream
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorEvent"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="event"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEvent)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Session List */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                Recent Sessions
              </h3>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          session.is_active
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            : "bg-gray-600"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {session.device_info.user_agent.split("/")[0]}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {session.ip_address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(session.last_activity).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(session.last_activity).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {sessions.length > 5 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/profile"
                    className="text-xs text-cyan-500 hover:text-cyan-400 transition"
                  >
                    View All Sessions
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Profile & Tools */}
          <div className="space-y-6">
            {/* User Card */}
            <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/10 rounded-xl p-6 text-center relative overflow-hidden">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[2px] mb-3">
                <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                  {user?.profile_pic_url ? (
                    <img
                      src={user.profile_pic_url}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.full_name?.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">
                {user?.full_name}
              </h2>
              <p className="text-cyan-400 text-sm mb-4">@{user?.username}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-left bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="text-gray-500">Joined</div>
                <div className="text-right text-gray-300">
                  {new Date(user?.joined_at).toLocaleDateString()}
                </div>
                <div className="text-gray-500">ISP</div>
                <div
                  className="text-right text-gray-300 truncate"
                  title={user?.device_info?.org}
                >
                  {user?.device_info?.isp}
                </div>
              </div>
            </div>

            {/* RakshaMitra AI Chat Card */}
            <div className="group bg-gradient-to-br from-green-900/10 to-teal-900/10 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Bot className="w-24 h-24 text-green-500 transform -rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                RakshaMitra AI
              </h3>
              <p className="text-sm text-gray-400 mb-4 relative z-10">
                Chat with our AI security expert. Analyze threats, scan text,
                and get instant advice.
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition relative z-10"
              >
                Start Chat <Bot className="w-4 h-4" />
              </Link>
            </div>

            {/* Recovery Tool Card */}
            <div className="group bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Shield className="w-24 h-24 text-indigo-500 transform rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Recovery Assistant
              </h3>
              <p className="text-sm text-gray-400 mb-4 relative z-10">
                Locked out? Generate step-by-step recovery guides for major
                platforms instantly.
              </p>
              <Link
                to="/recovery"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition relative z-10"
              >
                Launch Helper <Cpu className="w-4 h-4" />
              </Link>
            </div>

            {/* Recent Logs List */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                Audit Log
              </h3>
              <div className="space-y-4">
                {activity_logs.slice(0, 10).map((log) => (
                  <div
                    key={log._id}
                    className="relative pl-4 border-l-2 border-white/10"
                  >
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-cyan-500"></div>
                    <p className="text-sm text-gray-200 font-medium">
                      {log.event}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()} •{" "}
                      {log.ip === "Unknown" ? "Local" : log.ip}
                    </p>
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

// Helper Component for Stats
function StatCard({ icon, label, value, subtext, color }) {
  return (
    <div
      className={`p-4 rounded-xl border ${color} backdrop-blur-sm transition-transform hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <div className="max-w-[160px]">
            <h4 className="mt-1 text-2xl font-bold text-white truncate">
              {value}
            </h4>
          </div>
        </div>
        <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
      </div>
      <p className="text-xs text-gray-500 truncate">{subtext}</p>
    </div>
  );
}
