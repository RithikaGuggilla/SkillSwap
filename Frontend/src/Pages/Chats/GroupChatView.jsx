


import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const GroupChatView = ({ group, socket, currentUser, onGroupUpdated }) => {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [showInfo, setShowInfo]     = useState(false);
  const [localGroup, setLocalGroup] = useState(group);
  const bottomRef = useRef(null);

  const isAdmin = localGroup?.admins?.some(
    a => (a._id || a)?.toString() === currentUser?._id?.toString()
  );

  useEffect(() => { setLocalGroup(group); }, [group]);

  useEffect(() => {
    if (!localGroup?._id) return;
    axios.get(`/group/${localGroup._id}/messages`, { withCredentials: true })
      .then(({ data }) => setMessages(data.data.messages || []))
      .catch(() => toast.error("Failed to load messages"));
  }, [localGroup?._id]);

  useEffect(() => {
    if (!socket || !localGroup?._id) return;
    socket.emit("join-group", { groupId: localGroup._id });
    socket.on("group-message", ({ groupId, message }) => {
      if (groupId === localGroup._id) setMessages(prev => [...prev, message]);
    });
    return () => {
      socket.off("group-message");
      socket.emit("leave-group", { groupId: localGroup._id });
    };
  }, [socket, localGroup?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    try {
      const { data } = await axios.post(`/group/${localGroup._id}/send`, { text }, { withCredentials: true });
      socket?.emit("group-message", { groupId: localGroup._id, message: data.data });
    } catch (e) { toast.error("Failed to send"); }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the group?`)) return;
    try {
      await axios.delete(`/group/${localGroup._id}/remove/${memberId}`, { withCredentials: true });
      toast.success(`${memberName} removed`);
      const updated = { ...localGroup, members: localGroup.members.filter(m => (m._id || m)?.toString() !== memberId) };
      setLocalGroup(updated);
      onGroupUpdated?.("updated", updated);
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to remove member"); }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await axios.delete(`/group/${localGroup._id}/remove/${currentUser._id}`, { withCredentials: true });
      toast.success("You left the group");
      onGroupUpdated?.("left", localGroup._id);
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to leave group"); }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Delete this group permanently? This cannot be undone.")) return;
    try {
      await axios.delete(`/group/${localGroup._id}`, { withCredentials: true });
      toast.success("Group deleted");
      onGroupUpdated?.("deleted", localGroup._id);
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to delete group"); }
  };

  const isMe = (senderId) => senderId?.toString() === currentUser?._id?.toString();
  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const members = localGroup?.members || [];

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerLeft} onClick={() => setShowInfo(v => !v)}>
          <div style={s.groupAvatar}>
            {localGroup.picture ? (
              <img src={localGroup.picture} alt={localGroup.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              <span style={s.groupAvatarText}>{localGroup.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <div style={s.groupName}>{localGroup.name}</div>
            <div style={s.memberCount}>{members.length} members · click for info</div>
          </div>
        </div>

        <div style={s.headerActions}>
          {!isAdmin && (
            <button style={s.dangerBtn} onClick={handleLeaveGroup} title="Leave Group">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Leave
            </button>
          )}
          {isAdmin && (
            <button style={s.dangerBtn} onClick={handleDeleteGroup} title="Delete Group">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete
            </button>
          )}
          <button style={s.iconBtn} onClick={() => setShowInfo(v => !v)} title="Group Info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.messages}>
          {messages.map((msg, i) => {
            const mine = isMe(msg.sender?._id || msg.sender);
            const prevSender = (messages[i - 1]?.sender?._id || messages[i - 1]?.sender)?.toString();
            const thisSender = (msg.sender?._id || msg.sender)?.toString();
            const showName = !mine && (i === 0 || prevSender !== thisSender);
            return (
              <div key={msg._id || i} style={s.msgRow(mine)}>
                {!mine && (
                  <img src={msg.sender?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.name}`}
                    alt="" style={s.msgAvatar}
                    onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.name}`; }} />
                )}
                <div style={s.msgCol(mine)}>
                  {showName && !mine && <div style={s.senderName}>{msg.sender?.name}</div>}
                  <div style={s.bubble(mine)}>
                    <span style={s.bubbleText}>{msg.text}</span>
                    <span style={s.bubbleTime}>{fmtTime(msg.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {showInfo && (
          <div style={s.infoPanel}>
            <div style={s.infoPanelHeader}>
              <span style={s.infoPanelTitle}>Group Info</span>
              <button style={s.iconBtn} onClick={() => setShowInfo(false)}>✕</button>
            </div>
            <div style={s.memberList}>
              <p style={s.memberListLabel}>{members.length} Members</p>
              {members.map((m, i) => {
                const memberId      = (m._id || m)?.toString();
                const isMeRow       = memberId === currentUser?._id?.toString();
                const isMemberAdmin = localGroup.admins?.some(a => (a._id || a)?.toString() === memberId);
                return (
                  <div key={i} style={s.memberItem}>
                    <img src={m.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                      alt={m.name} style={s.memberAvatar}
                      onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.memberName}>
                        {m.name}
                        {isMemberAdmin && <span style={s.adminBadge}>Admin</span>}
                        {isMeRow && <span style={s.youBadge}>You</span>}
                      </div>
                      <div style={s.memberUser}>@{m.username}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <Link to={`/profile/${m.username}`} state={{ from: "/chats" }} style={s.viewBtn}>View</Link>
                      {isAdmin && !isMeRow && !isMemberAdmin && (
                        <button onClick={() => handleRemoveMember(memberId, m.name)} style={s.removeBtn}>Remove</button>
                      )}
                      {!isAdmin && isMeRow && (
                        <button onClick={handleLeaveGroup} style={s.removeBtn}>Leave</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isAdmin && (
              <div style={{ padding: "12px 14px", borderTop: "1px solid #eef2fb", marginTop: 8 }}>
                <p style={{ ...s.memberListLabel, marginBottom: 8 }}>Danger Zone</p>
                <button onClick={handleDeleteGroup} style={{
                  width: "100%", padding: "9px",
                  fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "transparent", border: "1px solid #ef4444",
                  color: "#ef4444", borderRadius: 8, cursor: "pointer",
                }}>
                  Delete Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={s.inputRow}>
        <label style={s.attachBtn} title="Share file">
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
            style={{ display: "none" }}
            onChange={(e) => { const file = e.target.files[0]; if (!file) return; setInput(`📎 ${file.name}`); e.target.value = ""; }} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </label>
        <input style={s.input} placeholder="Share notes, links, or resources…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
        <button style={s.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const s = {
  wrap: { display: "flex", flexDirection: "column", height: "100%", background: "#f0f4ff" },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: "1px solid #dde6f5", background: "#ffffff",
    boxShadow: "0 2px 8px rgba(37,99,235,0.05)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  groupAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "linear-gradient(135deg, #dde6f5, #c8d8f0)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, overflow: "hidden",
  },
  groupAvatarText: { color: "#2563eb", fontSize: "1rem", fontWeight: 700, fontFamily: "'Syne', sans-serif" },
  groupName: { fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "#1a2a4a" },
  memberCount: { fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#9aaac8" },
  headerActions: { display: "flex", gap: 8, alignItems: "center" },
  iconBtn: {
    background: "transparent", border: "1px solid #dde6f5", color: "#9aaac8",
    borderRadius: 8, padding: "7px 10px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
  },
  dangerBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "transparent", border: "1px solid rgba(239,68,68,0.25)",
    color: "#ef4444", borderRadius: 8, padding: "7px 12px",
    cursor: "pointer", fontFamily: "'DM Mono', monospace",
    fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.15s",
  },
  body: { flex: 1, display: "flex", overflow: "hidden" },
  messages: {
    flex: 1, overflowY: "auto", padding: "20px 20px 12px",
    display: "flex", flexDirection: "column", gap: 4,
    scrollbarWidth: "thin", scrollbarColor: "#dde6f5 transparent",
  },
  msgRow: (mine) => ({
    display: "flex", alignItems: "flex-end", gap: 8,
    justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 2,
  }),
  msgAvatar: { width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0, marginBottom: 2 },
  msgCol: (mine) => ({
    display: "flex", flexDirection: "column",
    alignItems: mine ? "flex-end" : "flex-start", maxWidth: "65%",
  }),
  senderName: { fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#9aaac8", marginBottom: 3, paddingLeft: 4 },
  bubble: (mine) => ({
    background: mine ? "#2563eb" : "#ffffff",
    color: mine ? "#fff" : "#1a2a4a",
    borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    padding: "10px 14px",
    display: "flex", alignItems: "flex-end", gap: 8,
    border: mine ? "none" : "1px solid #dde6f5",
    boxShadow: mine ? "none" : "0 1px 4px rgba(37,99,235,0.06)",
  }),
  bubbleText: { fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", lineHeight: 1.4 },
  bubbleTime: { fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", opacity: 0.5, flexShrink: 0, marginBottom: 1 },
  infoPanel: { width: 280, borderLeft: "1px solid #dde6f5", background: "#ffffff", overflowY: "auto", flexShrink: 0 },
  infoPanelHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 16px 12px", borderBottom: "1px solid #eef2fb",
  },
  infoPanelTitle: { fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#1a2a4a" },
  memberList: { padding: "12px 14px" },
  memberListLabel: { fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9aaac8", margin: "0 0 10px" },
  memberItem: { display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "1px solid #eef2fb" },
  memberAvatar: { width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  memberName: { fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", color: "#1a2a4a", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
  memberUser: { fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#9aaac8", marginTop: 1 },
  adminBadge: { fontSize: "0.52rem", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 10, padding: "1px 6px", color: "#2563eb" },
  youBadge: { fontSize: "0.52rem", background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 10, padding: "1px 6px", color: "#2563eb" },
  viewBtn: { fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6677aa", textDecoration: "none", border: "1px solid #dde6f5", borderRadius: 6, padding: "3px 8px" },
  removeBtn: { fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#ef4444", background: "transparent", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" },
  inputRow: { display: "flex", gap: 10, padding: "12px 16px", borderTop: "1px solid #dde6f5", background: "#ffffff" },
  input: { flex: 1, background: "#f5f8ff", border: "1px solid #dde6f5", borderRadius: 12, color: "#1a2a4a", fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", padding: "11px 16px", outline: "none" },
  sendBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.15s" },
  attachBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", color: "#9aaac8", cursor: "pointer", flexShrink: 0 },
};

export default GroupChatView;