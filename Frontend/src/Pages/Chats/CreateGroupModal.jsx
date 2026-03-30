import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [name, setName]       = useState("");
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use existing chats to get contacts — same endpoint as Chats.jsx
    axios.get("http://localhost:8000/chat", { withCredentials: true })
      .then(({ data }) => {
        const tempUser = JSON.parse(localStorage.getItem("userInfo"));
        if (!tempUser?._id) return;
        const contacts = data.data.map((chat) => {
          const other = chat.users.find((u) => u._id !== tempUser._id);
          return other;
        }).filter(Boolean);
        setContacts(contacts);
      })
      .catch(() => toast.error("Failed to load contacts"));
  }, []);

  const toggle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Enter a group name"); return; }
    if (selected.length < 1) { toast.error("Select at least 1 member"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post("/group/create", { name, memberIds: selected }, { withCredentials: true });
      toast.success(`Group "${name}" created!`);
      onCreated(data.data);
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create group");
    } finally { setLoading(false); }
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <h3 style={s.title}>New Group</h3>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Group name */}
        <div style={s.field}>
          <label style={s.label}>Group Name</label>
          <input
            style={s.input}
            placeholder="e.g. React Study Group"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
          />
        </div>

        {/* Search contacts */}
        <div style={s.field}>
          <label style={s.label}>Add Members ({selected.length} selected)</label>
          <input
            style={s.input}
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Contact list */}
        <div style={s.contactList}>
          {filtered.length === 0 ? (
            <p style={s.empty}>No contacts found</p>
          ) : (
            filtered.map(c => (
              <div
                key={c._id}
                style={s.contactItem(selected.includes(c._id))}
                onClick={() => toggle(c._id)}
              >
                <img
                  src={c.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`}
                  alt={c.name} style={s.avatar}
                  onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={s.contactName}>{c.name}</div>
                  <div style={s.contactUser}>@{c.username}</div>
                </div>
                <div style={s.checkbox(selected.includes(c._id))}>
                  {selected.includes(c._id) && <span style={{ color: "#000", fontSize: "0.7rem" }}>✓</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.createBtn} onClick={handleCreate} disabled={loading}>
            {loading ? "Creating…" : `Create Group`}
          </button>
        </div>

      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modal: {
    width: 440, maxWidth: "95vw", maxHeight: "85vh",
    background: "#111", border: "1px solid #222",
    borderRadius: 16, display: "flex", flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 22px 16px",
    borderBottom: "1px solid #1e1e1e",
  },
  title: {
    fontFamily: "'Syne', sans-serif", fontSize: "1.1rem",
    fontWeight: 600, color: "#fff", margin: 0,
  },
  closeBtn: {
    background: "transparent", border: "none",
    color: "#666", fontSize: "1rem", cursor: "pointer",
    padding: 4, borderRadius: 6,
  },
  field: { padding: "12px 22px 0" },
  label: {
    display: "block", fontFamily: "'DM Mono', monospace",
    fontSize: "0.6rem", letterSpacing: "0.14em",
    textTransform: "uppercase", color: "#888", marginBottom: 7,
  },
  input: {
    width: "100%", background: "#181818",
    border: "1px solid #2a2a2a", borderRadius: 10,
    color: "#eee", fontFamily: "'DM Mono', monospace",
    fontSize: "0.82rem", padding: "11px 14px",
    outline: "none",
  },
  contactList: {
    flex: 1, overflowY: "auto", padding: "10px 22px",
    marginTop: 8,
    scrollbarWidth: "thin", scrollbarColor: "#222 transparent",
  },
  empty: {
    textAlign: "center", color: "#555",
    fontFamily: "'DM Mono', monospace", fontSize: "0.75rem",
    padding: "24px 0",
  },
  contactItem: (selected) => ({
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px", borderRadius: 10, marginBottom: 4,
    background: selected ? "rgba(255,255,255,0.06)" : "transparent",
    border: `1px solid ${selected ? "rgba(255,255,255,0.12)" : "transparent"}`,
    cursor: "pointer", transition: "all 0.15s",
  }),
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    objectFit: "cover", flexShrink: 0,
  },
  contactName: {
    fontFamily: "'Syne', sans-serif", fontSize: "0.85rem",
    color: "#eee", fontWeight: 500, marginBottom: 1,
  },
  contactUser: {
    fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#666",
  },
  checkbox: (checked) => ({
    width: 20, height: 20, borderRadius: "50%",
    border: `1.5px solid ${checked ? "#fff" : "#333"}`,
    background: checked ? "#fff" : "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.15s",
  }),
  footer: {
    display: "flex", gap: 10, padding: "14px 22px",
    borderTop: "1px solid #1e1e1e",
  },
  cancelBtn: {
    flex: 1, fontFamily: "'DM Mono', monospace",
    fontSize: "0.65rem", letterSpacing: "0.12em",
    textTransform: "uppercase", padding: "12px",
    background: "transparent", border: "1px solid #2a2a2a",
    color: "#888", borderRadius: 10, cursor: "pointer",
  },
  createBtn: {
    flex: 2, fontFamily: "'DM Mono', monospace",
    fontSize: "0.65rem", letterSpacing: "0.12em",
    textTransform: "uppercase", padding: "12px",
    background: "#fff", color: "#000",
    border: "none", borderRadius: 10,
    cursor: "pointer", fontWeight: 700,
  },
};

export default CreateGroupModal;