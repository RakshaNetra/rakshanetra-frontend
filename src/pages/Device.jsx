import React from "react";
import { getDeviceData } from "../services/api";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Shield,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Battery,
  Wifi,
  Layers,
  Unlock,
  ArrowLeft,
  Activity,
  Info,
} from "lucide-react";

export default function DeviceDetailsPage() {
  const [deviceData, setDeviceData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDeviceData();
        setDeviceData(response.data);
      } catch (error) {
        console.error("Error fetching device data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-mono animate-pulse">
            Scanning Device...
          </p>
        </div>
      </div>
    );

  if (!deviceData)
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-gray-400">
        <p className="mb-4">No device data found.</p>
        <Link to="/dashboard" className="text-cyan-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );

  const { username, synced_at, data } = deviceData;
  const {
    device_info_page,
    app_scan_page,
    permission_checker_page,
    malware_scan_page,
  } = data || {};

  // Calculations for Stats
  const totalApps = app_scan_page?.data?.length || 0;
  const riskyApps =
    app_scan_page?.data?.filter((a) => a.is_suspicious).length || 0;
  const malwareCount = malware_scan_page?.data
    ? Object.values(malware_scan_page.data).filter((m) => m.malicious).length
    : 0;
  const deviceInfo = device_info_page?.data?.device_info || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111] text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-cyan-500" />
              Device Report
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Target: <span className="text-white font-bold">{username}</span> |
              Last Sync: <span className="text-cyan-400">{synced_at}</span>
            </p>
          </div>
          <Link
            to="/dashboard"
            className="mt-4 md:mt-0 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Layers className="w-5 h-5 text-indigo-400" />}
            label="Total Apps"
            value={totalApps}
            color="bg-indigo-500/10 border-indigo-500/20"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
            label="Risky Apps"
            value={riskyApps}
            color="bg-amber-500/10 border-amber-500/20"
          />
          <StatCard
            icon={<Shield className="w-5 h-5 text-red-400" />}
            label="Malware Detected"
            value={malwareCount}
            color={
              malwareCount > 0
                ? "bg-red-500/10 border-red-500/20"
                : "bg-green-500/10 border-green-500/20"
            }
            textColor={malwareCount > 0 ? "text-red-400" : "text-green-400"}
          />
          <StatCard
            icon={<Cpu className="w-5 h-5 text-cyan-400" />}
            label="Android Version"
            value={deviceInfo?.["Android Version"] || "N/A"}
            color="bg-cyan-500/10 border-cyan-500/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL: Malware & Info */}
          <div className="space-y-6">
            {/* Malware Scan */}
            {malware_scan_page?.data && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" /> Malware Analysis
                </h3>
                <div className="space-y-3">
                  {Object.entries(malware_scan_page.data).map(
                    ([name, result], idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5"
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-200 truncate">
                            {name}
                          </p>
                          <p className="text-xs text-gray-500 truncate w-32 md:w-48 font-mono">
                            SHA: {result.apk_sha256?.substring(0, 12)}...
                          </p>
                        </div>
                        {result.malicious ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/20 font-bold">
                            Infected
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/20 font-bold">
                            Clean
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Device Info */}
            {deviceInfo && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-500" /> Device Specs
                </h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Model" value={deviceInfo.Model} />
                  <InfoRow label="Brand" value={deviceInfo.Brand} />
                  <InfoRow
                    label="Manufacturer"
                    value={deviceInfo.Manufacturer}
                  />
                  <InfoRow
                    label="Android Version"
                    value={deviceInfo["Android Version"]}
                  />
                  <InfoRow
                    label="Supported ABIs"
                    value={deviceInfo["Supported ABIs"]}
                  />
                  <InfoRow label="Hardware" value={deviceInfo.Hardware} />
                  <InfoRow
                    label="Kernel Version"
                    value={deviceInfo["Kernel Version"]}
                  />
                  <InfoRow label="SDK" value={deviceInfo["SDK Version"]} />
                  <InfoRow label="Uptime" value={deviceInfo.Uptime} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COL: Apps & Permissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Permissions */}
            {permission_checker_page?.data && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-amber-500" /> Permission Audit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permission_checker_page.data.map((app, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 p-4 rounded-lg border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white text-sm">
                          {app.app_name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {app.version_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {app.permissions.slice(0, 5).map((perm, pIdx) => (
                          <span
                            key={pIdx}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              perm.isDangerous
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-gray-700/30 border-gray-600 text-gray-400"
                            }`}
                          >
                            {perm.name.split(".").pop()}
                          </span>
                        ))}
                        {app.permissions.length > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
                            +{app.permissions.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installed Apps */}
            {app_scan_page?.data && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" /> Installed
                  Applications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {app_scan_page.data.map((app, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <strong
                          className="text-xs font-semibold text-gray-200 truncate w-3/4"
                          title={app.app_name}
                        >
                          {app.app_name}
                        </strong>
                        {app.is_suspicious && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mb-1">
                        {app.package_name}
                      </p>
                      <div className="flex gap-2">
                        <span
                          className={`text-[10px] px-1.5 rounded ${
                            app.is_system_app
                              ? "bg-gray-700 text-gray-300"
                              : "bg-indigo-500/20 text-indigo-300"
                          }`}
                        >
                          {app.is_system_app ? "System" : "User"}
                        </span>
                        {app.is_suspicious ? (
                          <span className="text-[10px] px-1.5 rounded bg-red-500/20 text-red-300">
                            Suspicious
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 rounded bg-green-500/10 text-green-500">
                            Safe
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, textColor = "text-white" }) {
  return (
    <div
      className={`p-4 rounded-xl border ${color} flex items-center justify-between`}
    >
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-white font-medium truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}
