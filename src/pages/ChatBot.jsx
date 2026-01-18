import { useState, useEffect, useRef } from "react";
import {
  sendChatMessage,
  getChatHistory,
  endChatSession,
} from "../services/api";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  User,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Paperclip,
  MessageSquare,
  Plus,
  Menu,
  X,
  File,
  Image as ImageIcon,
} from "lucide-react";

export default function ChatBot() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // File Upload State
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSessionId, sessions, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      setInitialLoading(true);
      const res = await getChatHistory(50, 0);
      if (res.success && res.data?.items) {
        const sortedSessions = res.data.items.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setSessions(sortedSessions);

        if (!selectedSessionId && sortedSessions.length > 0) {
          setSelectedSessionId(sortedSessions[0].session_id);
        }
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
    // Reset input so same file can be selected again if needed
    e.target.value = null;
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || loading) return;

    // Optimistic Update
    const tempMsg = {
      role: "user",
      content:
        input || (files.length > 0 ? `Sent ${files.length} file(s)` : ""),
      ts: new Date().toISOString(),
    };

    // Update local session state
    const currentSessionIndex = sessions.findIndex(
      (s) => s.session_id === selectedSessionId
    );

    if (selectedSessionId && currentSessionIndex !== -1) {
      const updatedSessions = [...sessions];
      updatedSessions[currentSessionIndex].messages.push(tempMsg);
      const activeSession = updatedSessions.splice(currentSessionIndex, 1)[0];
      updatedSessions.unshift(activeSession);
      setSessions(updatedSessions);
    }

    const currentInput = input;
    const currentFiles = [...files]; // Copy files for sending

    setInput("");
    setFiles([]); // Clear UI immediately
    setLoading(true);

    try {
      const res = await sendChatMessage(currentInput, currentFiles);

      if (res.success && res.data) {
        const { reply, session_id } = res.data;
        const botMsg = {
          role: "assistant",
          content: reply,
          ts: new Date().toISOString(),
        };

        setSessions((prevSessions) => {
          const existingIndex = prevSessions.findIndex(
            (s) => s.session_id === session_id
          );

          if (existingIndex !== -1) {
            const updatedSessions = [...prevSessions];
            updatedSessions[existingIndex].messages.push(botMsg);
            updatedSessions[existingIndex].updated_at =
              new Date().toISOString();
            const item = updatedSessions.splice(existingIndex, 1)[0];
            updatedSessions.unshift(item);
            return updatedSessions;
          } else {
            const newSession = {
              session_id: session_id,
              updated_at: new Date().toISOString(),
              messages: [tempMsg, botMsg],
            };
            return [newSession, ...prevSessions];
          }
        });
        setSelectedSessionId(session_id);
      }
    } catch (error) {
      alert("Failed to send message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (
      !window.confirm(
        "Start a new chat session? This clears the active context."
      )
    )
      return;
    try {
      await endChatSession();
      setSelectedSessionId(null);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (error) {
      alert("Failed to reset session. " + error.message);
    }
  };

  const handleSelectSession = (id) => {
    setSelectedSessionId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const activeMessages =
    sessions.find((s) => s.session_id === selectedSessionId)?.messages || [];

  return (
    // Main Container: h-screen ensures it fits viewport perfectly
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-[#0a0a0a] border-r border-white/5 
        transform transition-transform duration-300 md:relative md:translate-x-0 
        flex flex-col h-full
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-gray-200">
            <Bot className="w-5 h-5 text-green-500" />
            <span>Chat History</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white py-3 rounded-xl font-medium transition shadow-lg shadow-green-900/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Session List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-1">
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => handleSelectSession(session.session_id)}
              className={`w-full text-left p-3 rounded-lg transition group relative border ${
                selectedSessionId === session.session_id
                  ? "bg-white/5 border-green-500/30"
                  : "border-transparent hover:bg-white/5 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare
                  className={`w-4 h-4 shrink-0 ${
                    selectedSessionId === session.session_id
                      ? "text-green-400"
                      : "text-gray-600"
                  }`}
                />
                <div className="overflow-hidden w-full">
                  <p
                    className={`text-sm font-medium truncate ${
                      selectedSessionId === session.session_id
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {session.messages[0]?.content || "New Conversation"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    {new Date(session.updated_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {sessions.length === 0 && !initialLoading && (
            <div className="text-center py-10 text-gray-600 text-xs px-4">
              No history yet. Start a new chat to begin.
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-[#080808] shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col h-full relative w-full bg-[#050505]">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-white flex items-center gap-2">
                RakshaMitra AI
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] border border-green-500/20">
                  Beta
                </span>
              </h2>
              <p className="text-[10px] text-gray-500 hidden sm:block">
                {selectedSessionId
                  ? `Session ID: ${selectedSessionId}`
                  : "Start a new conversation"}
              </p>
            </div>
          </div>
          <button
            onClick={loadHistory}
            className="p-2 text-gray-500 hover:text-green-400 transition hover:bg-white/5 rounded-lg"
            title="Sync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {/* Messages (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {(!selectedSessionId && sessions.length === 0) ||
            (selectedSessionId && activeMessages.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Bot className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200">
                  How can I help?
                </h3>
                <p className="text-sm text-gray-500 max-w-md mt-2">
                  I can analyze files, answer security questions, or help you
                  understand threats.
                </p>
              </div>
            ) : null}

            {activeMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/5 ${
                    msg.role === "user" ? "bg-indigo-600" : "bg-[#1a1a1a]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                  <div
                    className={`p-4 rounded-2xl shadow-md text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-[#121212] border border-white/10 text-gray-200 rounded-tl-none"
                    }`}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                  </div>
                  <p
                    className={`text-[10px] text-gray-600 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(msg.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 animate-pulse border border-white/5">
                  <Bot className="w-5 h-5 text-green-500" />
                </div>
                <div className="bg-[#121212] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area (Fixed at Bottom) */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/5 shrink-0 z-20">
          <div className="max-w-3xl mx-auto">
            {/* File Preview Area */}
            {files.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 px-3 py-1.5 rounded-lg text-xs text-gray-300 shrink-0"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-3 h-3 text-purple-400" />
                    ) : (
                      <File className="w-3 h-3 text-blue-400" />
                    )}
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-gray-500 hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 bg-[#121212] border border-white/10 p-2 rounded-xl focus-within:border-green-500/50 transition-all shadow-lg ring-1 ring-white/0 focus-within:ring-green-500/20"
            >
              {/* Hidden File Input */}
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-3 text-gray-500 hover:text-green-400 hover:bg-white/5 rounded-lg transition"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={
                  selectedSessionId
                    ? "Type a message..."
                    : "Start a new conversation..."
                }
                className="flex-1 bg-transparent text-white placeholder:text-gray-600 text-sm p-3 focus:outline-none resize-none max-h-32 custom-scrollbar leading-relaxed"
                rows={1}
                style={{ minHeight: "44px" }}
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && files.length === 0)}
                className="p-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all transform active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-2">
              RakshaMitra AI can make mistakes. Verify important security info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
