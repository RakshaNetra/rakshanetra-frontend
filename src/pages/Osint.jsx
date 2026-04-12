import { useState, useRef } from "react";
import { runOsintScan } from "../services/api";
import { Link } from "react-router-dom";
import {
  Search,
  Globe,
  Phone,
  User,
  Monitor,
  Link2,
  ImageIcon,
  File,
  BrainCircuit,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Shield,
  MapPin,
  Camera,
  Server,
  Info,
} from "lucide-react";

export default function Osint() {
  const [mode, setMode] = useState("single"); // 'single' or 'multi'
  const [runCorrelation, setRunCorrelation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  // Single Search State
  const [singleType, setSingleType] = useState("domain");
  const [singleInput, setSingleInput] = useState("");
  const [singleFile, setSingleFile] = useState(null);

  // Multi Search State
  const [multiForm, setMultiForm] = useState({
    domain: "",
    phone: "",
    username: "",
    ip_address: "",
    target_url: "",
    image_url: "",
  });
  const [multiFile, setMultiFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleMultiChange = (e) => {
    setMultiForm({ ...multiForm, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e, isSingle = false) => {
    if (e.target.files && e.target.files.length > 0) {
      if (isSingle) setSingleFile(e.target.files[0]);
      else setMultiFile(e.target.files[0]);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearResults();

    const formData = new FormData();
    formData.append("run_correlation", runCorrelation);

    if (mode === "single") {
      if (singleType === "image_file" && singleFile) {
        formData.append("image_file", singleFile);
      } else if (singleInput) {
        formData.append(singleType, singleInput);
      } else {
        setError("Please provide an input for the search.");
        setLoading(false);
        return;
      }
    } else {
      // Multi Mode
      let hasData = false;
      Object.keys(multiForm).forEach((key) => {
        if (multiForm[key]) {
          formData.append(key, multiForm[key]);
          hasData = true;
        }
      });
      if (multiFile) {
        formData.append("image_file", multiFile);
        hasData = true;
      }

      if (!hasData) {
        setError("Please fill at least one field for a multi-search.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await runOsintScan(formData);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date to IST
  const formatIST = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111] text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center gap-3">
              <Search className="w-8 h-8 text-cyan-500" />
              OSINT Nexus
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Deep Web Reconnaissance & Target Analysis
            </p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

        {/* --- CONTROLS PANEL --- */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-white/5 pb-4">
            {/* Mode Switcher */}
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setMode("single")}
                className={`px-6 py-2 rounded-md text-sm font-bold transition ${
                  mode === "single"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Single Target
              </button>
              <button
                onClick={() => setMode("multi")}
                className={`px-6 py-2 rounded-md text-sm font-bold transition ${
                  mode === "multi"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Multi Vector
              </button>
            </div>

            {/* AI Correlation Toggle */}
            <label className="flex items-center cursor-pointer gap-3 p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/10">
              <span
                className={`text-sm font-bold flex items-center gap-2 ${runCorrelation ? "text-green-400" : "text-gray-500"}`}
              >
                <BrainCircuit className="w-5 h-5" />
                AI Correlation Engine
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={runCorrelation}
                  onChange={() => setRunCorrelation(!runCorrelation)}
                />
                <div
                  className={`block w-10 h-6 rounded-full transition-colors ${runCorrelation ? "bg-green-500" : "bg-gray-700"}`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${runCorrelation ? "translate-x-4" : ""}`}
                ></div>
              </div>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SINGLE MODE FORM */}
            {mode === "single" && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <select
                    className="w-full bg-black/40 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer"
                    value={singleType}
                    onChange={(e) => {
                      setSingleType(e.target.value);
                      setSingleInput("");
                      setSingleFile(null);
                    }}
                  >
                    <option value="domain">🌐 Domain</option>
                    <option value="phone">📱 Phone Number</option>
                    <option value="username">👤 Username</option>
                    <option value="ip_address">🖥️ IP Address</option>
                    <option value="target_url">🔗 Target URL</option>
                    <option value="image_url">🖼️ Image URL</option>
                    <option value="image_file">📁 Upload Image (EXIF)</option>
                  </select>
                </div>

                <div className="flex-1">
                  {singleType === "image_file" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, true)}
                      className="w-full bg-black/40 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${singleType.replace("_", " ")}...`}
                      value={singleInput}
                      onChange={(e) => setSingleInput(e.target.value)}
                      className="w-full bg-black/40 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {/* MULTI MODE FORM */}
            {mode === "multi" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputGroup
                  icon={<Globe />}
                  label="Domain"
                  name="domain"
                  val={multiForm.domain}
                  fn={handleMultiChange}
                />
                <InputGroup
                  icon={<Phone />}
                  label="Phone"
                  name="phone"
                  val={multiForm.phone}
                  fn={handleMultiChange}
                  placeholder="+91..."
                />
                <InputGroup
                  icon={<User />}
                  label="Username"
                  name="username"
                  val={multiForm.username}
                  fn={handleMultiChange}
                />
                <InputGroup
                  icon={<Monitor />}
                  label="IP Address"
                  name="ip_address"
                  val={multiForm.ip_address}
                  fn={handleMultiChange}
                />
                <InputGroup
                  icon={<Link2 />}
                  label="Target URL"
                  name="target_url"
                  val={multiForm.target_url}
                  fn={handleMultiChange}
                />
                <InputGroup
                  icon={<ImageIcon />}
                  label="Image URL"
                  name="image_url"
                  val={multiForm.image_url}
                  fn={handleMultiChange}
                />

                <div className="lg:col-span-3 bg-black/30 p-4 rounded-lg border border-dashed border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {multiFile
                        ? multiFile.name
                        : "Optional: Upload Image for EXIF Data"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-sm transition"
                  >
                    Select File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, false)}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">↻</span> Scanning Targets...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" /> Execute OSINT Scan
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- RESULTS PANEL --- */}
        {results && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AI Correlation Report */}
            {results.correlation && (
              <div
                className={`p-6 rounded-xl border ${results.correlation.risk_level === "HIGH" ? "bg-red-900/10 border-red-500/30" : "bg-green-900/10 border-green-500/30"} shadow-2xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <BrainCircuit
                      className={
                        results.correlation.risk_level === "HIGH"
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    />
                    AI Correlation Report
                  </h2>
                  <span
                    className={`px-3 py-1 rounded font-bold text-xs border ${results.correlation.risk_level === "HIGH" ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-green-500/20 border-green-500/50 text-green-400"}`}
                  >
                    Risk: {results.correlation.risk_score}/100 (
                    {results.correlation.risk_level})
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  {results.correlation.analysis.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Key Insights
                    </h3>
                    <ul className="space-y-2">
                      {results.correlation.analysis.insights.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-cyan-200/80 flex gap-2"
                        >
                          <CheckCircle className="w-4 h-4 shrink-0 text-cyan-500" />{" "}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Identified Threats
                    </h3>
                    <ul className="space-y-2">
                      {results.correlation.analysis.threats.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-red-200/80 flex gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />{" "}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* General Grid for Smaller Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Domain Info */}
              {results.domain && (
                <ResultCard icon={<Globe />} title="Domain Intelligence">
                  <InfoRow label="Domain" value={results.domain.domain} />
                  <InfoRow
                    label="A Records"
                    value={results.domain.dns_records?.A?.join(", ")}
                  />
                  <InfoRow
                    label="Registrar"
                    value={results.domain.whois?.registrar}
                  />
                  <InfoRow
                    label="Creation"
                    value={formatIST(results.domain.whois?.creation_date)}
                  />
                  <InfoRow
                    label="Expiry"
                    value={formatIST(results.domain.whois?.expiration_date)}
                  />
                  <InfoRow
                    label="Nameservers"
                    value={results.domain.whois?.name_servers?.join(", ")}
                  />
                </ResultCard>
              )}

              {/* IP Geo Info */}
              {results.ip_geo && (
                <ResultCard icon={<MapPin />} title="IP Geolocation">
                  <InfoRow label="IP Address" value={results.ip_geo.ip} />
                  <InfoRow
                    label="Country"
                    value={results.ip_geo.geo?.country}
                  />
                  <InfoRow
                    label="Region/City"
                    value={`${results.ip_geo.geo?.region}, ${results.ip_geo.geo?.city}`}
                  />
                  <InfoRow
                    label="Coordinates"
                    value={`${results.ip_geo.geo?.latitude}, ${results.ip_geo.geo?.longitude}`}
                  />
                  <InfoRow label="ISP" value={results.ip_geo.network?.isp} />
                  <InfoRow
                    label="Organization"
                    value={results.ip_geo.network?.organization}
                  />
                </ResultCard>
              )}

              {/* Phone Info */}
              {results.phone && (
                <ResultCard icon={<Phone />} title="Phone Analysis">
                  <InfoRow
                    label="Number"
                    value={results.phone.formatted?.intl}
                  />
                  <InfoRow
                    label="Country"
                    value={`${results.phone.location} (${results.phone.country_code})`}
                  />
                  <InfoRow label="Carrier" value={results.phone.carrier} />
                  <InfoRow label="Type" value={results.phone.number_type} />
                  <InfoRow
                    label="Timezone"
                    value={results.phone.timezones?.join(", ")}
                  />
                  <InfoRow
                    label="Valid Status"
                    value={results.phone.valid ? "✅ Valid" : "❌ Invalid"}
                  />
                </ResultCard>
              )}

              {/* URL Scan Info */}
              {results.urlscan && (
                <ResultCard icon={<Link2 />} title="URL Scan Report">
                  <InfoRow label="Target" value={results.urlscan.url} />
                  <InfoRow label="Resolved IP" value={results.urlscan.ip} />
                  <InfoRow
                    label="Risk Score"
                    value={results.urlscan.risk_score}
                  />
                  <InfoRow
                    label="Status"
                    value={
                      results.urlscan.malicious ? "❌ Malicious" : "✅ Clean"
                    }
                  />
                  {results.urlscan.screenshot && (
                    <div className="mt-4 border border-white/10 rounded overflow-hidden">
                      <img
                        src={results.urlscan.screenshot}
                        alt="Website Screenshot"
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                </ResultCard>
              )}
            </div>

            {/* Username/Social Profiles - Full Width */}
            {results.username && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" /> Digital
                  Footprint: {results.username.summary.username}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Checked {results.username.summary.total_sites_checked} sites.
                  Found {results.username.summary.profiles_found} active
                  profiles.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {results.username.results
                    .filter(
                      (res) =>
                        res.status === "found" || res.status_code === 200,
                    )
                    .map((profile, idx) => (
                      <a
                        key={idx}
                        href={profile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition group"
                      >
                        <Globe className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 mb-2" />
                        <span className="text-xs font-bold text-gray-300">
                          {profile.site}
                        </span>
                        <span className="text-[10px] text-gray-600 uppercase mt-1">
                          {profile.category}
                        </span>
                      </a>
                    ))}
                </div>
              </div>
            )}

            {/* EXIF Metadata - Full Width */}
            {results.exif && results.exif.success && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" /> EXIF Metadata
                  Forensics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase border-b border-white/10 pb-2 mb-2">
                      Device
                    </h4>
                    <InfoRow label="Make" value={results.exif.device?.make} />
                    <InfoRow label="Model" value={results.exif.device?.model} />
                    <InfoRow
                      label="Software"
                      value={results.exif.device?.software}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase border-b border-white/10 pb-2 mb-2">
                      Image Details
                    </h4>
                    <InfoRow
                      label="Resolution"
                      value={`${results.exif.basic?.size?.width} x ${results.exif.basic?.size?.height}`}
                    />
                    <InfoRow
                      label="Date Taken"
                      value={formatIST(results.exif.timestamps?.created)}
                    />
                    <InfoRow
                      label="Format"
                      value={results.exif.basic?.format}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase border-b border-white/10 pb-2 mb-2">
                      Camera Settings
                    </h4>
                    <InfoRow
                      label="Exposure"
                      value={
                        results.exif.camera?.exposure_time
                          ? `${results.exif.camera.exposure_time}s`
                          : "N/A"
                      }
                    />
                    <InfoRow
                      label="F-Number"
                      value={
                        results.exif.camera?.f_number
                          ? `f/${results.exif.camera.f_number}`
                          : "N/A"
                      }
                    />
                    <InfoRow label="ISO" value={results.exif.camera?.iso} />
                    <InfoRow
                      label="Focal Length"
                      value={
                        results.exif.camera?.focal_length
                          ? `${results.exif.camera.focal_length}mm`
                          : "N/A"
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function InputGroup({ icon, label, name, val, fn, placeholder }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3.5 text-gray-500 w-5 h-5">
        {icon}
      </div>
      <input
        type="text"
        name={name}
        placeholder={placeholder || label}
        value={val}
        onChange={fn}
        className="w-full bg-black/40 text-white pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none placeholder:text-gray-600 text-sm"
      />
    </div>
  );
}

function ResultCard({ icon, title, children }) {
  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl h-full">
      <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="p-1.5 bg-white/5 rounded-lg text-indigo-400">
          {icon}
        </span>
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className="text-gray-200 font-mono text-right max-w-[60%] truncate"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
