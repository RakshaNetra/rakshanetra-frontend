import { useState } from "react";
import { initiateRecovery } from "../services/api";
import { Link } from "react-router-dom";
import {
  LifeBuoy,
  Search,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Clock,
  ExternalLink,
  ChevronRight,
  Lock,
  Smartphone,
  Mail,
} from "lucide-react";

export default function RecoveryHelper() {
  const [platform, setPlatform] = useState("");
  const [lang, setLang] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!platform) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await initiateRecovery(platform, lang);
      setResult(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Utility: Smart Link Parser ---
  const parseSmartLink = (inputStr) => {
    if (!inputStr) return { url: null, text: "" };

    // Regex to find http/https URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = inputStr.match(urlRegex);

    if (match) {
      const url = match[0];
      let text = inputStr.replace(url, "").trim();
      text = text.replace(/[:\-\s]+$/, "");

      // If no text remains (input was just a URL), try to get hostname
      if (!text) {
        try {
          text = new URL(url).hostname;
        } catch {
          text = "External Link";
        }
      }
      return { url, text };
    }
    // No URL found
    return { url: null, text: "" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111] text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center gap-3">
              <LifeBuoy className="w-8 h-8 text-cyan-500" />
              Recovery Assistant
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              AI-Powered Account Recovery Strategy Engine
            </p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition text-sm text-gray-400 hover:text-white group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Dashboard
          </Link>
        </div>

        {/* --- Search Module --- */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-1 shadow-2xl">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2 p-2"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Enter Platform (e.g., Facebook, Google, Instagram)"
                className="w-full bg-black/40 text-white pl-12 pr-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-gray-600"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
              />
            </div>

            <div className="relative w-full md:w-48">
              <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <select
                className="w-full bg-black/40 text-white pl-12 pr-8 py-3 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer transition-colors"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bhojpuri">Bhojpuri</option>
                <option value="Bengali">Bengali</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Kannada">Kannada</option>
                <option value="Odia">Odia</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Assamese">Assamese</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">↻</span>
              ) : (
                "Generate Guide"
              )}
            </button>
          </form>

          {error && (
            <div className="mx-2 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* --- Results View --- */}
        {result && result.json_data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* LEFT COL: Main Guides */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meta Header */}
              <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h2 className="font-bold text-indigo-100">
                      {result.title}
                    </h2>
                    <p className="text-xs text-indigo-400/60">
                      ID: {result.recovery_id}
                    </p>
                  </div>
                </div>
                {result.from_cache && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">
                    ⚡ Cached
                  </span>
                )}
              </div>

              {/* Warnings / Alerts */}
              {result.json_data.warnings?.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl">
                  <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Critical Warnings
                  </h3>
                  <ul className="space-y-2">
                    {result.json_data.warnings.map((warn, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-red-200/80 bg-red-500/5 p-3 rounded-lg border border-red-500/10"
                      >
                        <span className="text-red-500 font-bold">•</span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: warn.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-white">$1</strong>'
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guide Scenarios */}
              <div className="space-y-6">
                {Object.entries(result.json_data.guide).map(([key, value]) => {
                  if (key === "Post-Recovery Security Recommendations")
                    return null;
                  return (
                    <GuideSection
                      key={key}
                      title={key}
                      data={value}
                      parser={parseSmartLink}
                    />
                  );
                })}
              </div>
            </div>

            {/* RIGHT COL: Sidebar Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Support Links
                </h3>
                {result.json_data.support_contacts?.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition text-sm text-cyan-400 group mb-2"
                  >
                    <span className="truncate">
                      {parseSmartLink(link).text}
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </a>
                ))}
              </div>

              {/* Verification Methods */}
              {result.json_data.alternative_verification && (
                <div className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Required Assets
                  </h3>
                  <div className="space-y-2">
                    {result.json_data.alternative_verification.map(
                      (item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-sm text-gray-300 p-2 rounded hover:bg-white/5 transition"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Post Recovery Recommendations */}
              {result.json_data.guide[
                "Post-Recovery Security Recommendations"
              ] && (
                <div className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 rounded-xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Secure Your Account
                  </h3>
                  <ul className="space-y-3">
                    {result.json_data.guide[
                      "Post-Recovery Security Recommendations"
                    ].map((rec, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-400 border-l-2 border-green-500/30 pl-3"
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: rec.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-green-300">$1</strong>'
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper Component for Sections ---
function GuideSection({ title, data }) {
  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all hover:border-cyan-500/30 group">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        {data.estimated_time_minutes && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-black/40 px-2 py-1 rounded border border-white/5">
            <Clock className="w-3 h-3" /> {data.estimated_time_minutes} min
          </span>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Official Link Button */}
        {data.official_link && (
          <a
            href={data.official_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-semibold transition"
          >
            Go to Official Page <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Steps */}
        {data.steps && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Execution Steps
            </h4>
            <div className="relative border-l border-white/10 ml-3 space-y-6">
              {data.steps.map((step, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#121212]"></span>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: step.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-white">$1</strong>'
                        ),
                      }}
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        {data.troubleshooting && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <LifeBuoy className="w-3 h-3" /> Troubleshooting
            </h4>
            <ul className="space-y-2">
              {data.troubleshooting.map((tip, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-amber-200/70">
                  <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: tip.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-amber-100">$1</strong>'
                      ),
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
