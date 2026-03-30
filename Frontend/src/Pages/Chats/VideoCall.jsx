import Whiteboard from "./Whiteboard";
import React, { useEffect, useRef, useState, useCallback } from "react";

const Icon = ({ d, size = 20, fill = "none", stroke = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  Mic:           "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
  MicOff:        "M1 1l22 22M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6M17 16.95A7 7 0 0 1 5 10v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8",
  Video:         "M23 7l-7 5 7 5V7zM1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z",
  VideoOff:      "M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10M1 1l22 22",
  Monitor:       "M2 3h20a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9 15v3m-4 0h8",
  MessageSquare: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  Users:         "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  Phone:         "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  Copy:          "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1",
  Send:          "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  X:             "M18 6L6 18M6 6l12 12",
  Whiteboard:    "M2 3h20v14H2zM8 21h8M12 17v4",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600&family=Google+Sans+Text:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .gm-root {
    --bg: #202124; --surface: #2d2e31; --surface2: #3c3f44; --border: #444;
    --text: #e8eaed; --text-muted: #9aa0a6; --accent: #8ab4f8; --accent-hover: #aecbfa;
    --danger: #ea4335; --danger-hover: #c5221f; --green: #34a853;
    font-family: 'Google Sans Text','Google Sans',sans-serif;
    background: var(--bg); color: var(--text);
    height: 100vh; display: flex; flex-direction: column; overflow: hidden;
  }

  /* Header */
  .gm-header { display:flex; align-items:center; justify-content:space-between; padding:10px 20px; background:var(--bg); border-bottom:1px solid #333; flex-shrink:0; z-index:10; }
  .gm-header-left { display:flex; align-items:center; gap:12px; }
  .gm-call-time { font-size:13px; color:var(--text-muted); font-family:'Google Sans'; }
  .gm-meeting-name { font-size:15px; font-weight:500; }
  .gm-header-right { display:flex; align-items:center; gap:8px; }
  .gm-invite-btn { display:flex; align-items:center; gap:6px; background:var(--surface2); border:1px solid var(--border); color:var(--accent); border-radius:24px; padding:6px 14px; font-size:13px; font-weight:500; cursor:pointer; transition:background 0.15s; font-family:'Google Sans'; }
  .gm-invite-btn:hover { background:#44474e; }

  /* Body */
  .gm-body { display:flex; flex:1; overflow:hidden; }

  /* Normal video area */
  .gm-videos { flex:1; display:flex; flex-direction:column; position:relative; background:var(--bg); overflow:hidden; }
  .gm-video-grid { flex:1; display:grid; gap:4px; padding:12px; overflow:hidden; height:100%; align-items:stretch; }
  .gm-video-grid.layout-1 { grid-template-columns:1fr; }
  .gm-video-grid.layout-2 { grid-template-columns:1fr 1fr; }
  .gm-tile { background:var(--surface); border-radius:12px; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; min-height:0; width:100%; height:100%; }
  .gm-tile video { width:100%; height:100%; object-fit:cover; border-radius:12px; position:relative; z-index:1; }
  .gm-tile-label { position:absolute; bottom:10px; left:12px; background:rgba(0,0,0,0.6); color:#fff; font-size:13px; padding:3px 8px; border-radius:4px; font-family:'Google Sans'; z-index:2; }
  .gm-tile-muted { position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.55); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:var(--danger); z-index:2; }
  .gm-avatar-placeholder { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#4285f4,#34a853); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:600; color:#fff; font-family:'Google Sans'; }

  /* PiP */
  .gm-self-pip { position:absolute; bottom:90px; right:16px; width:160px; height:100px; border-radius:10px; overflow:hidden; border:2px solid var(--border); z-index:5; background:var(--surface); box-shadow:0 4px 20px rgba(0,0,0,0.5); transition:box-shadow 0.2s; }
  .gm-self-pip:hover { box-shadow:0 6px 28px rgba(0,0,0,0.7); }
  .gm-self-pip-label { position:absolute; bottom:5px; left:7px; font-size:11px; color:#fff; background:rgba(0,0,0,0.5); padding:1px 5px; border-radius:3px; }

  /* Screen share badge */
  .gm-screenshare-badge { position:absolute; top:10px; left:50%; transform:translateX(-50%); background:var(--green); color:#fff; padding:5px 14px; border-radius:20px; font-size:13px; font-family:'Google Sans'; font-weight:500; display:flex; align-items:center; gap:6px; z-index:10; }

  /* Whiteboard layout */
  .gm-wb-layout { display:flex; flex:1; overflow:hidden; }
  .gm-wb-strip { width:200px; flex-shrink:0; display:flex; flex-direction:column; gap:6px; padding:8px; background:var(--bg); border-right:1px solid #333; }
  .gm-wb-tile { border-radius:10px; overflow:hidden; position:relative; background:var(--surface); aspect-ratio:16/9; width:100%; flex-shrink:0; }
  .gm-wb-tile video { width:100%; height:100%; object-fit:cover; }
  .gm-wb-tile-label { position:absolute; bottom:5px; left:7px; background:rgba(0,0,0,0.6); color:#fff; font-size:11px; padding:2px 6px; border-radius:3px; font-family:'Google Sans'; }
  .gm-wb-avatar { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#4285f4,#34a853); display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:600; color:#fff; }
  .gm-wb-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  /* Controls */
  .gm-controls { display:flex; align-items:center; justify-content:center; gap:8px; padding:14px 20px; background:var(--bg); border-top:1px solid #333; flex-shrink:0; position:relative; }
  .gm-ctrl-btn { display:flex; flex-direction:column; align-items:center; gap:4px; background:var(--surface2); border:none; color:var(--text); border-radius:50%; width:48px; height:48px; cursor:pointer; transition:background 0.15s,transform 0.1s; justify-content:center; }
  .gm-ctrl-btn:hover { background:#44474e; transform:scale(1.05); }
  .gm-ctrl-btn.active { background:var(--surface2); color:var(--accent); }
  .gm-ctrl-btn.off { background:var(--surface2); color:var(--danger); }
  .gm-ctrl-label { font-size:10px; color:var(--text-muted); margin-top:4px; font-family:'Google Sans'; }
  .gm-ctrl-group { display:flex; flex-direction:column; align-items:center; }
  .gm-end-btn { background:var(--danger); border:none; color:#fff; border-radius:28px; padding:10px 24px; font-size:14px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:8px; transition:background 0.15s; font-family:'Google Sans'; height:48px; margin:0 8px; }
  .gm-end-btn:hover { background:var(--danger-hover); }
  .gm-badge { position:absolute; top:-2px; right:-2px; background:var(--danger); color:#fff; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center; font-family:'Google Sans'; font-weight:600; }

  /* Sidebar */
  .gm-sidebar { width:320px; background:var(--surface); border-left:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; animation:slideIn 0.2s ease; }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  .gm-sidebar-tabs { display:flex; border-bottom:1px solid var(--border); flex-shrink:0; }
  .gm-tab { flex:1; padding:14px 0; text-align:center; font-size:13px; font-weight:500; color:var(--text-muted); cursor:pointer; border-bottom:2px solid transparent; transition:color 0.15s; font-family:'Google Sans'; }
  .gm-tab.active { color:var(--accent); border-bottom-color:var(--accent); }
  .gm-tab:hover:not(.active) { color:var(--text); }
  .gm-sidebar-close { position:absolute; top:8px; right:8px; background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:4px; border-radius:50%; transition:background 0.15s; display:flex; align-items:center; justify-content:center; }
  .gm-sidebar-close:hover { background:var(--surface2); color:var(--text); }

  /* Chat */
  .gm-chat { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .gm-chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:14px; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
  .gm-chat-messages::-webkit-scrollbar { width:4px; }
  .gm-chat-messages::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  .gm-msg { display:flex; flex-direction:column; gap:3px; }
  .gm-msg-meta { display:flex; align-items:baseline; gap:6px; }
  .gm-msg-name { font-size:12px; font-weight:600; color:var(--accent); font-family:'Google Sans'; }
  .gm-msg-time { font-size:11px; color:var(--text-muted); }
  .gm-msg-text { font-size:14px; color:var(--text); line-height:1.45; }
  .gm-msg.own .gm-msg-name { color:var(--green); }
  .gm-chat-input-area { padding:12px 14px; border-top:1px solid var(--border); display:flex; align-items:center; gap:8px; }
  .gm-chat-input { flex:1; background:var(--surface2); border:1px solid var(--border); border-radius:24px; padding:9px 14px; color:var(--text); font-size:14px; outline:none; resize:none; font-family:'Google Sans Text'; transition:border 0.15s; }
  .gm-chat-input:focus { border-color:var(--accent); }
  .gm-chat-input::placeholder { color:var(--text-muted); }
  .gm-send-btn { background:var(--accent); border:none; color:#1a1a2e; border-radius:50%; width:36px; height:36px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; flex-shrink:0; }
  .gm-send-btn:hover { background:var(--accent-hover); }
  .gm-send-btn:disabled { background:var(--surface2); color:var(--text-muted); cursor:default; }

  /* People */
  .gm-people { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:8px; }
  .gm-person { display:flex; align-items:center; gap:12px; padding:10px; border-radius:8px; transition:background 0.15s; }
  .gm-person:hover { background:var(--surface2); }
  .gm-person-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#4285f4,#1565c0); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:600; color:#fff; flex-shrink:0; font-family:'Google Sans'; }
  .gm-person-info { flex:1; }
  .gm-person-name { font-size:14px; font-weight:500; }
  .gm-person-status { font-size:12px; color:var(--text-muted); }
  .gm-person-icons { display:flex; gap:4px; color:var(--text-muted); }

  /* Invite */
  .gm-invite-label { font-size:13px; color:var(--text-muted); font-family:'Google Sans'; }
  .gm-invite-link { display:flex; align-items:center; gap:8px; background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:10px 12px; }
  .gm-invite-url { flex:1; font-size:13px; color:var(--accent); word-break:break-all; }
  .gm-copy-btn { background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:4px; border-radius:4px; transition:color 0.15s; }
  .gm-copy-btn:hover { color:var(--accent); }
  .gm-copied-badge { font-size:12px; color:var(--green); text-align:center; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  /* Incoming call */
  .gm-incoming-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; animation:fadeIn 0.2s ease; }
  .gm-incoming-card { background:#2d2e31; border-radius:20px; padding:36px 40px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.6); display:flex; flex-direction:column; align-items:center; gap:20px; min-width:300px; animation:popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes popIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
  .gm-incoming-avatar { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#4285f4,#34a853); display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:600; color:#fff; font-family:'Google Sans'; box-shadow:0 0 0 6px rgba(66,133,244,0.25); animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 6px rgba(66,133,244,0.25)} 50%{box-shadow:0 0 0 14px rgba(66,133,244,0.08)} }
  .gm-incoming-name { font-size:20px; font-weight:600; color:#e8eaed; font-family:'Google Sans'; }
  .gm-incoming-sub { font-size:14px; color:#9aa0a6; font-family:'Google Sans'; margin-top:-12px; }
  .gm-incoming-actions { display:flex; gap:24px; margin-top:8px; }
  .gm-incoming-btn { width:64px; height:64px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.15s,filter 0.15s; }
  .gm-incoming-btn:hover { transform:scale(1.1); filter:brightness(1.15); }
  .gm-incoming-btn.accept { background:#34a853; }
  .gm-incoming-btn.decline { background:#ea4335; }
  .gm-incoming-btn-label { font-size:12px; color:#9aa0a6; font-family:'Google Sans'; margin-top:6px; }
  .gm-status-screen { position:fixed; inset:0; z-index:200; background:#202124; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; }
  .gm-status-text { font-size:20px; font-weight:500; color:#e8eaed; font-family:'Google Sans'; }
  .gm-status-sub { font-size:14px; color:#9aa0a6; font-family:'Google Sans'; }
  .gm-status-btn { margin-top:12px; background:#3c3f44; border:none; color:#e8eaed; border-radius:24px; padding:10px 28px; font-size:14px; font-weight:500; cursor:pointer; font-family:'Google Sans'; transition:background 0.15s; }
  .gm-status-btn:hover { background:#44474e; }

  /* Toast */
  .gm-toast { position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#323639; color:#fff; padding:10px 20px; border-radius:8px; font-size:14px; z-index:100; box-shadow:0 4px 16px rgba(0,0,0,0.4); animation:toastIn 0.25s ease,toastOut 0.25s 2.75s ease forwards; font-family:'Google Sans'; }
  @keyframes toastIn { from{opacity:0;top:8px} to{opacity:1;top:20px} }
  @keyframes toastOut { from{opacity:1} to{opacity:0} }
`;

const fmtTime = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
};
const genLink = () => `https://meet.yourdomain.com/${Math.random().toString(36).slice(2,10)}`;

// ── Incoming Call Popup ────────────────────────────────────────────────────────
const IncomingCallPopup = ({ callerName, onAccept, onDecline }) => (
  <div className="gm-incoming-overlay">
    <div className="gm-incoming-card">
      <div className="gm-incoming-avatar">{callerName[0].toUpperCase()}</div>
      <div className="gm-incoming-name">{callerName}</div>
      <div className="gm-incoming-sub">Incoming video call…</div>
      <div className="gm-incoming-actions">
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <button className="gm-incoming-btn decline" onClick={onDecline}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke="#fff" strokeWidth="2.5"/>
            </svg>
          </button>
          <span className="gm-incoming-btn-label">Decline</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <button className="gm-incoming-btn accept" onClick={onAccept}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>
          <span className="gm-incoming-btn-label">Accept</span>
        </div>
      </div>
    </div>
  </div>
);

// ── Main VideoCall Component ───────────────────────────────────────────────────
const VideoCall = ({ socket, userId = "You", targetUserId = "Remote User", targetDisplayName = null, isCaller = false, isGroupCall = false, groupId = null, groupName = "Group Call", groupMembers = [], onClose }) => {
  // Use displayName for UI, targetUserId for socket signaling
  const displayName = targetDisplayName || targetUserId;

  const hasSetRemoteAnswer   = useRef(false);
  const localVideo           = useRef(null);
  const localVideoPip        = useRef(null);
  const remoteVideo          = useRef(null);
  const remoteStreamRef      = useRef(null);
  const pc                   = useRef(null);
  const localStream          = useRef(null);
  const screenStream         = useRef(null);
  const chatEndRef           = useRef(null);
  const pendingCandidates    = useRef([]);
  const sidebarRef           = useRef(null);

  const remoteVideoCallbackRef = useCallback((node) => {
    remoteVideo.current = node;
    if (node && remoteStreamRef.current) {
      node.srcObject = remoteStreamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  const localVideoPipCallbackRef = useCallback((node) => {
    localVideoPip.current = node;
    if (node && localStream.current) {
      node.srcObject = localStream.current;
      node.play().catch(() => {});
    }
  }, []);

  const localVideoCallbackRef = useCallback((node) => {
    localVideo.current = node;
    if (node && localStream.current) node.srcObject = localStream.current;
  }, []);

  // Group calls: skip waiting/ringing — join room directly
  const [callState,       setCallState]       = useState(isGroupCall ? "active" : (isCaller ? "waiting" : "ringing"));
  const [micOn,           setMicOn]           = useState(true);
  const [camOn,           setCamOn]           = useState(true);
  const [sharing,         setSharing]         = useState(false);
  const [sidebar,         setSidebar]         = useState(null);
  const [wbOpen,          setWbOpen]          = useState(false);
  const [messages,        setMessages]        = useState([{ id:1, from:"System", text:"Meeting started. Share the link to invite others.", time:new Date(), system:true }]);
  const [chatInput,       setChatInput]       = useState("");
  const [elapsed,         setElapsed]         = useState(0);
  const [unread,          setUnread]          = useState(0);
  const [copied,          setCopied]          = useState(false);
  const [toast,           setToast]           = useState(null);
  const [meetLink]                            = useState(genLink);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [remoteSharing,   setRemoteSharing]   = useState(false);

  useEffect(() => { sidebarRef.current = sidebar; }, [sidebar]);

  const participants = [
    { id:userId, name:userId, initials:userId[0].toUpperCase(), mic:micOn, cam:camOn },
    ...(hasRemoteStream ? [{ id:targetUserId, name:displayName, initials:displayName[0].toUpperCase(), mic:true, cam:true }] : [])
  ];

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e+1), 1000);
    return () => clearInterval(t);
  }, []);

  // beforeunload cleanup
  useEffect(() => {
    const handleUnload = () => {
      localStream.current?.getTracks().forEach(t => t.stop());
      screenStream.current?.getTracks().forEach(t => t.stop());
      pc.current?.close();
      if (socket) socket.emit("call-ended", { to:targetUserId });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [socket]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // WebRTC init
  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls:"stun:stun.l.google.com:19302" },
        { urls:"turn:openrelay.metered.ca:80", username:"openrelayproject", credential:"openrelayproject" },
        { urls:"turn:openrelay.metered.ca:443", username:"openrelayproject", credential:"openrelayproject" },
      ]
    });
    hasSetRemoteAnswer.current = false;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
        localStream.current = stream;
        if (localVideo.current)    localVideo.current.srcObject    = stream;
        if (localVideoPip.current) { localVideoPip.current.srcObject = stream; localVideoPip.current.play().catch(()=>{}); }
        stream.getTracks().forEach(t => pc.current.addTrack(t, stream));
      } catch { showToast("Camera/microphone access denied"); }
    };
    initMedia();

    pc.current.ontrack = (e) => {
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      remoteStreamRef.current.addTrack(e.track);
      if (remoteVideo.current) { remoteVideo.current.srcObject = remoteStreamRef.current; remoteVideo.current.play().catch(()=>{}); }
      setHasRemoteStream(true);
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate && socket) socket.emit("ice-candidate", { candidate:e.candidate, to:targetUserId });
    };

    return () => {
      localStream.current?.getTracks().forEach(t => t.stop());
      screenStream.current?.getTracks().forEach(t => t.stop());
      pc.current?.close();
      if (socket) socket.emit("call-ended", { to:targetUserId });
    };
  }, []);

  // Attach remote stream after hasRemoteStream flips
  useEffect(() => {
    if (hasRemoteStream && remoteVideo.current && remoteStreamRef.current && !remoteVideo.current.srcObject) {
      remoteVideo.current.srcObject = remoteStreamRef.current;
      remoteVideo.current.play().catch(()=>{});
    }
  }, [hasRemoteStream]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("user-ready", async ({ from }) => {
      if (!isCaller || !pc.current) return;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("video-offer", { offer, to:from });
    });

    socket.on("video-offer", async ({ offer }) => {
      if (!pc.current) return;
      if (!localStream.current) {
        await new Promise(resolve => { const iv = setInterval(() => { if (localStream.current) { clearInterval(iv); resolve(); } }, 100); });
      }
      if (pc.current.signalingState !== "stable") return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      pendingCandidates.current.forEach(async c => { try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); } catch {} });
      pendingCandidates.current = [];
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("video-answer", { answer, to:targetUserId });
    });

    socket.on("video-answer", async ({ answer }) => {
      if (hasSetRemoteAnswer.current) return;
      if (pc.current.signalingState !== "have-local-offer") return;
      try {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
        hasSetRemoteAnswer.current = true;
        pendingCandidates.current.forEach(async c => { try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); } catch {} });
        pendingCandidates.current = [];
      } catch {}
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!candidate || !pc.current) return;
      if (pc.current.remoteDescription) {
        try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on("chat-message", ({ from, text }) => {
      setMessages(prev => [...prev, { id:Date.now(), from, text, time:new Date() }]);
      if (sidebarRef.current !== "chat") setUnread(u => u+1);
    });

    socket.on("call-accepted", () => {
      setCallState("active");
      const startCall = async () => {
        if (!localStream.current) await new Promise(resolve => { const iv = setInterval(() => { if (localStream.current) { clearInterval(iv); resolve(); } }, 100); });
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        socket.emit("video-offer", { offer, to:targetUserId });
      };
      startCall();
    });

    socket.on("call-declined", () => { setCallState("declined"); localStream.current?.getTracks().forEach(t => t.stop()); });

    socket.on("call-ended", () => {
      showToast(`${displayName} has left the call`);
      if (remoteVideo.current) remoteVideo.current.srcObject = null;
      remoteStreamRef.current = null;
      setHasRemoteStream(false);
      setRemoteSharing(false);
    });

    socket.on("screen-share-started", () => setRemoteSharing(true));
    socket.on("screen-share-stopped", () => setRemoteSharing(false));

    socket.on("wb-opened", () => setWbOpen(true));
    socket.on("wb-closed", () => setWbOpen(false));

    return () => {
      ["user-ready","video-offer","video-answer","ice-candidate","chat-message",
       "call-accepted","call-declined","call-ended","screen-share-started",
       "screen-share-stopped","wb-opened","wb-closed"].forEach(e => socket.off(e));
    };
  }, [socket]);

  // Setup
  useEffect(() => { if (!socket) return; socket.emit("setup", { _id:userId, username:userId }); }, []);

  // Join group room on mount (both caller and receiver)
  useEffect(() => {
    if (!socket) return;
    if (isGroupCall) {
      const gId = groupId || targetUserId;
      socket.emit("join-group", { groupId: gId });
      console.log("📞 Joined group call room:", gId);
      // Once joined, create offer to all others already in room
      if (isCaller) {
        socket.emit("group-call-join", { groupId: gId, from: userId });
      }
    } else if (isCaller) {
      socket.emit("call-invite", { to: targetUserId, from: userId, fromName: userId });

    }
  }, [socket]);

  // Listen for others joining the group call room
  useEffect(() => {
    if (!socket || !isGroupCall) return;
    const gId = groupId || targetUserId;

    socket.on("group-call-join", async ({ from }) => {
      if (from === userId) return; // ignore self
      console.log("👤 Someone joined group call:", from);
      // Create offer for the new person
      if (!pc.current) return;
      if (!localStream.current) {
        await new Promise(resolve => { const iv = setInterval(() => { if (localStream.current) { clearInterval(iv); resolve(); } }, 100); });
      }
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("video-offer", { offer, to: from });
    });

    // Also announce yourself when joining
    socket.emit("group-call-join", { groupId: gId, from: userId });

    return () => socket.off("group-call-join");
  }, [socket, isGroupCall]);

  // Receiver emits ready after accepting
  const handleAccept = () => {
    setCallState("active");
    socket.emit("call-accepted", { to:targetUserId });
    socket.emit("user-ready", { to:targetUserId, from:userId });
  };

  const handleDecline = () => {
    socket.emit("call-declined", { to:targetUserId });
    localStream.current?.getTracks().forEach(t => t.stop());
    if (onClose) onClose();
  };

  const toggleMic = () => {
    localStream.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
    showToast(micOn ? "Microphone muted" : "Microphone unmuted");
  };

  const toggleCam = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) track.enabled = !track.enabled;
    setCamOn(v => !v);
  };

  const toggleScreenShare = async () => {
    if (!sharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video:true });
        screenStream.current = stream;
        const track = stream.getVideoTracks()[0];
        const sender = pc.current.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(track);
        if (localVideo.current) localVideo.current.srcObject = stream;
        track.onended = () => stopScreenShare();
        setSharing(true);
        if (socket) socket.emit("screen-share-started", { to:targetUserId });
        showToast("Screen sharing started");
      } catch { showToast("Screen sharing cancelled"); }
    } else { stopScreenShare(); }
  };

  const stopScreenShare = () => {
    screenStream.current?.getTracks().forEach(t => t.stop());
    const track = localStream.current?.getVideoTracks()[0];
    const sender = pc.current.getSenders().find(s => s.track?.kind === "video");
    if (sender && track) sender.replaceTrack(track);
    if (localVideo.current)    localVideo.current.srcObject    = localStream.current;
    if (localVideoPip.current) localVideoPip.current.srcObject = localStream.current;
    setSharing(false);
    if (socket) socket.emit("screen-share-stopped", { to:targetUserId });
    showToast("Screen sharing stopped");
  };

  const toggleWb = () => {
    const next = !wbOpen;
    setWbOpen(next);
    if (socket) socket.emit(next ? "wb-opened" : "wb-closed", { to:targetUserId });
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = { id:Date.now(), from:userId, text:chatInput.trim(), time:new Date(), own:true };
    setMessages(prev => [...prev, msg]);
    if (socket) socket.emit("chat-message", { from:userId, text:chatInput.trim(), to:targetUserId });
    setChatInput("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetLink).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    showToast("Meeting link copied!");
  };

  const endCall = () => {
    if (socket) socket.emit("call-ended", { to:targetUserId });
    localStream.current?.getTracks().forEach(t => t.stop());
    screenStream.current?.getTracks().forEach(t => t.stop());
    pc.current?.close();
    if (onClose) onClose();
  };

  const toggleSidebar = (tab) => setSidebar(prev => prev === tab ? null : tab);

  // ── Render: ringing ──────────────────────────────────────────────────────────
  if (callState === "ringing") return (
    <><style>{styles}</style>
      <IncomingCallPopup callerName={displayName} onAccept={handleAccept} onDecline={handleDecline} />
    </>
  );

  // ── Render: waiting ──────────────────────────────────────────────────────────
  if (callState === "waiting" && !isGroupCall) return (
    <><style>{styles}</style>
      <div className="gm-status-screen">
        <div className="gm-incoming-avatar" style={{ width:80, height:80, fontSize:32 }}>{displayName[0].toUpperCase()}</div>
        <div className="gm-status-text">Calling {displayName}…</div>
        <div className="gm-status-sub">Waiting for them to answer</div>
        <button className="gm-status-btn" onClick={() => { socket.emit("call-ended",{to:targetUserId}); localStream.current?.getTracks().forEach(t=>t.stop()); if(onClose)onClose(); }}>Cancel</button>
      </div>
    </>
  );

  // ── Render: declined ─────────────────────────────────────────────────────────
  if (callState === "declined") return (
    <><style>{styles}</style>
      <div className="gm-status-screen">
        <div style={{ fontSize:56 }}>📵</div>
        <div className="gm-status-text">{displayName} declined the call</div>
        <div className="gm-status-sub">They are unavailable right now</div>
        <button className="gm-status-btn" onClick={onClose}>Go back</button>
      </div>
    </>
  );

  // ── Render: active call ──────────────────────────────────────────────────────
  return (
    <><style>{styles}</style>
      <div className="gm-root">

        {/* Header */}
        <div className="gm-header">
          <div className="gm-header-left">
            <span className="gm-call-time">{fmtTime(elapsed)}</span>
            <span className="gm-meeting-name">{isGroupCall ? groupName : `Call with ${displayName}`}</span>
          </div>
          <div className="gm-header-right">
            <button className="gm-invite-btn" onClick={() => toggleSidebar("invite")}>
              <Icon d={Icons.Users} size={15} /> Add people
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="gm-body">

          {/* ── WHITEBOARD LAYOUT ── */}
          {wbOpen ? (
            <div className="gm-wb-layout">
              {/* Left video strip */}
              <div className="gm-wb-strip">
                <div className="gm-wb-tile">
                  {hasRemoteStream
                    ? <video ref={remoteVideoCallbackRef} autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:"var(--surface)" }}><div className="gm-wb-avatar">{targetUserId[0].toUpperCase()}</div></div>
                  }
                  <div className="gm-wb-tile-label">{displayName}</div>
                </div>
                <div className="gm-wb-tile">
                  {camOn
                    ? <video ref={localVideoPipCallbackRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:"var(--surface)" }}><div className="gm-wb-avatar">{userId[0].toUpperCase()}</div></div>
                  }
                  <div className="gm-wb-tile-label">You</div>
                </div>
              </div>
              {/* Whiteboard */}
              <div className="gm-wb-main">
                <Whiteboard socket={socket} userId={userId} targetUserId={targetUserId} onClose={toggleWb} />
              </div>
            </div>

          ) : (
          /* ── NORMAL VIDEO LAYOUT ── */
            <div className="gm-videos">
              {sharing && (
                <div className="gm-screenshare-badge">
                  <Icon d={Icons.Monitor} size={14} /> You are presenting
                  <button onClick={stopScreenShare} style={{ background:"rgba(0,0,0,0.3)", border:"none", color:"#fff", borderRadius:4, padding:"2px 7px", cursor:"pointer", fontSize:12, marginLeft:4 }}>Stop</button>
                </div>
              )}

              <div className="gm-video-grid layout-1">
                {sharing ? (
                  <div className="gm-tile">
                    <video ref={localVideoCallbackRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"contain", background:"#000" }} />
                    <div className="gm-tile-label">Your screen</div>
                  </div>
                ) : remoteSharing ? (
                  <div className="gm-tile">
                    <video ref={remoteVideoCallbackRef} autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"contain", background:"#000" }} />
                    <div className="gm-tile-label">{displayName}'s screen</div>
                  </div>
                ) : hasRemoteStream ? (
                  <div className="gm-tile">
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, background:"var(--surface)", zIndex:0 }}>
                      <div className="gm-avatar-placeholder" style={{ width:80, height:80, fontSize:32 }}>{targetUserId[0].toUpperCase()}</div>
                      <span style={{ color:"var(--text-muted)", fontSize:14, fontFamily:"Google Sans" }}>{displayName}</span>
                    </div>
                    <video ref={remoteVideoCallbackRef} autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    <div className="gm-tile-label" style={{ zIndex:2 }}>{targetUserId}</div>
                  </div>
                ) : (
                  <div className="gm-tile">
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                      <div className="gm-avatar-placeholder">{targetUserId[0].toUpperCase()}</div>
                      <span style={{ color:"var(--text-muted)", fontSize:14, fontFamily:"Google Sans" }}>Waiting for others to join…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* PiP */}
              <div className="gm-self-pip">
                {sharing ? (
                  hasRemoteStream
                    ? <video ref={remoteVideoCallbackRef} autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:"var(--surface)" }}><div className="gm-avatar-placeholder" style={{ width:40, height:40, fontSize:16 }}>{targetUserId[0].toUpperCase()}</div></div>
                ) : camOn ? (
                  <video ref={localVideoPipCallbackRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:"var(--surface)" }}>
                    <div className="gm-avatar-placeholder" style={{ width:40, height:40, fontSize:16 }}>{userId[0].toUpperCase()}</div>
                  </div>
                )}
                <div className="gm-self-pip-label">{sharing ? displayName : "You"}</div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          {sidebar && (
            <div className="gm-sidebar" style={{ position:"relative" }}>
              <button className="gm-sidebar-close" onClick={() => setSidebar(null)}><Icon d={Icons.X} size={16} /></button>
              {sidebar !== "invite" && (
                <div className="gm-sidebar-tabs">
                  <div className={`gm-tab ${sidebar==="chat"?"active":""}`} onClick={() => setSidebar("chat")}>Chat</div>
                  <div className={`gm-tab ${sidebar==="people"?"active":""}`} onClick={() => setSidebar("people")}>People ({participants.length})</div>
                </div>
              )}
              {sidebar === "chat" && (
                <div className="gm-chat">
                  <div className="gm-chat-messages">
                    {messages.map(m => (
                      <div key={m.id} className={`gm-msg ${m.own?"own":""}`}>
                        {m.system
                          ? <span style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", fontStyle:"italic" }}>{m.text}</span>
                          : <><div className="gm-msg-meta"><span className="gm-msg-name">{m.own?"You":m.from}</span><span className="gm-msg-time">{m.time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></div><div className="gm-msg-text">{m.text}</div></>
                        }
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="gm-chat-input-area">
                    <textarea className="gm-chat-input" placeholder="Send a message to everyone" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} rows={1} />
                    <button className="gm-send-btn" onClick={sendMessage} disabled={!chatInput.trim()}><Icon d={Icons.Send} size={16} /></button>
                  </div>
                </div>
              )}
              {sidebar === "people" && (
                <div className="gm-people">
                  <div style={{ fontSize:12, color:"var(--text-muted)", padding:"4px 0 8px", fontFamily:"Google Sans" }}>In this call ({participants.length})</div>
                  {participants.map(p => (
                    <div key={p.id} className="gm-person">
                      <div className="gm-person-avatar">{p.initials}</div>
                      <div className="gm-person-info">
                        <div className="gm-person-name">{p.id===userId?`${p.name} (You)`:p.name}</div>
                        <div className="gm-person-status">In call</div>
                      </div>
                      <div className="gm-person-icons">
                        <Icon d={p.mic?Icons.Mic:Icons.MicOff} size={16} />
                        <Icon d={p.cam?Icons.Video:Icons.VideoOff} size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sidebar === "invite" && (
                <div style={{ padding:16 }}>
                  <div style={{ fontSize:16, fontWeight:600, marginBottom:14, fontFamily:"Google Sans" }}>Add people</div>
                  <div className="gm-invite-label">Share this meeting link</div>
                  <div className="gm-invite-link" style={{ marginTop:8 }}>
                    <span className="gm-invite-url">{meetLink}</span>
                    <button className="gm-copy-btn" onClick={copyLink}><Icon d={Icons.Copy} size={16} /></button>
                  </div>
                  {copied && <div className="gm-copied-badge" style={{ marginTop:8 }}>✓ Link copied to clipboard</div>}
                </div>
              )}
            </div>
          )}

        </div>{/* end gm-body */}

        {/* Controls */}
        <div className="gm-controls">
          <div className="gm-ctrl-group">
            <button className={`gm-ctrl-btn ${micOn?"active":"off"}`} onClick={toggleMic}><Icon d={micOn?Icons.Mic:Icons.MicOff} size={20} /></button>
            <span className="gm-ctrl-label">{micOn?"Mute":"Unmute"}</span>
          </div>
          <div className="gm-ctrl-group">
            <button className={`gm-ctrl-btn ${camOn?"active":"off"}`} onClick={toggleCam}><Icon d={camOn?Icons.Video:Icons.VideoOff} size={20} /></button>
            <span className="gm-ctrl-label">{camOn?"Stop video":"Start video"}</span>
          </div>
          <div className="gm-ctrl-group">
            <button className={`gm-ctrl-btn ${sharing?"active":""}`} onClick={toggleScreenShare}><Icon d={Icons.Monitor} size={20} /></button>
            <span className="gm-ctrl-label">{sharing?"Stop share":"Present"}</span>
          </div>
          <div className="gm-ctrl-group">
            <button className={`gm-ctrl-btn ${wbOpen?"active":""}`} onClick={toggleWb}><Icon d={Icons.Whiteboard} size={20} /></button>
            <span className="gm-ctrl-label">Board</span>
          </div>
          <div className="gm-ctrl-group" style={{ position:"relative" }}>
            <button className={`gm-ctrl-btn ${sidebar==="chat"?"active":""}`} onClick={() => toggleSidebar("chat")}>
              <Icon d={Icons.MessageSquare} size={20} />
              {unread > 0 && <div className="gm-badge">{unread}</div>}
            </button>
            <span className="gm-ctrl-label">Chat</span>
          </div>
          <div className="gm-ctrl-group">
            <button className={`gm-ctrl-btn ${sidebar==="people"?"active":""}`} onClick={() => toggleSidebar("people")}><Icon d={Icons.Users} size={20} /></button>
            <span className="gm-ctrl-label">People</span>
          </div>
          <button className="gm-end-btn" onClick={endCall}><Icon d={Icons.Phone} size={18} /> Leave call</button>
        </div>

        {toast && <div className="gm-toast">{toast}</div>}

      </div>
    </>
  );
};

export default VideoCall;