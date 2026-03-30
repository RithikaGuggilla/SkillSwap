import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import "./Sessions.css";

/* ─── Icons ─── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const CalIcon  = () => <Icon d="M3 9h18M3 15h18M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z" />;
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" />;
const XIcon    = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const ClockIcon = () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l3 3" />;

/* ─── Helpers ─── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const getSessionStatus = (session) => {
  if (session.status === "Completed") return "completed";
  if (session.status === "Missed")    return "missed";

  const now = new Date();
  const [hours, minutes] = (session.time || "00:00").split(":");
  const dt = new Date(session.date);
  dt.setHours(parseInt(hours), parseInt(minutes), 0);
  const buffer = new Date(dt);
  buffer.setMinutes(buffer.getMinutes() + 30);

  if (buffer < now) return "action_needed";
  return "upcoming";
};

/* ─── Session Card ─── */
const SessionCard = ({ session, onMarkDone, onMarkMissed, marking }) => {
  const status = getSessionStatus(session);

  const avatarSrc =
    session.picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${session.name}`;

  return (
    <div className={`sc-card sc-card--${status}`}>
      {/* Left: date block */}
      <div className="sc-date-block">
        <span className="sc-day">
          {new Date(session.date).toLocaleDateString("en-US", { day: "numeric" })}
        </span>
        <span className="sc-mon">
          {new Date(session.date).toLocaleDateString("en-US", { month: "short" })}
        </span>
      </div>

      {/* Avatar */}
      <img
        className="sc-avatar"
        src={avatarSrc}
        alt={session.name}
        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${session.name}`; }}
      />

      {/* Info */}
      <div className="sc-info">
        <p className="sc-name">Session with {session.name}</p>
        <p className="sc-meta">
          <CalIcon /> {fmtDate(session.date)} &nbsp;·&nbsp; {fmtTime(session.time)}
        </p>
        {session.username && (
          <p className="sc-username">@{session.username}</p>
        )}
      </div>

      {/* Action / Status */}
      <div className="sc-action">
        {status === "completed" && (
          <span className="sc-badge sc-badge--completed">
            <CheckIcon /> Completed
          </span>
        )}

        {status === "missed" && (
          <span className="sc-badge sc-badge--missed">
            <XIcon /> Missed
          </span>
        )}

        {status === "upcoming" && (
          <span className="sc-badge sc-badge--upcoming">
            <ClockIcon /> Upcoming
          </span>
        )}

        {status === "action_needed" && (
          <div className="sc-btn-group">
            <button
              className="sc-btn sc-btn--done"
              onClick={() => onMarkDone(session._id)}
              disabled={marking[session._id]}
            >
              {marking[session._id] ? "Saving…" : <><CheckIcon /> Done</>}
            </button>
            <button
              className="sc-btn sc-btn--missed"
              onClick={() => onMarkMissed(session._id)}
              disabled={marking[session._id]}
            >
              <XIcon /> Missed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Empty State ─── */
const Empty = ({ icon, text }) => (
  <div className="ss-empty">
    <div className="ss-empty-icon">{icon}</div>
    <p>{text}</p>
  </div>
);

/* ════════════════════════════
   SESSIONS PAGE
════════════════════════════ */
const Sessions = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("upcoming"); // upcoming | completed | missed
  const [marking, setMarking]   = useState({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/meeting/all", { withCredentials: true });
      if (data.success) {
        // Normalize: attach a display `name` field from populated host/participant
        const userId = user?._id?.toString();
        const normalized = (data.data || []).map((s) => {
          const other =
            s.host?._id?.toString() === userId ? s.participant : s.host;
          return {
            _id:      s._id,
            name:     other?.name     || "Unknown",
            username: other?.username || "",
            picture:  other?.picture  || "",
            date:     s.date,
            time:     s.time,
            status:   s.status,
          };
        });
        setSessions(normalized);
      }
    } catch (err) {
      // Fallback: try the dashboard endpoint which already returns formatted sessions
      try {
        const { data } = await axios.get("/dashboard/overview", { withCredentials: true });
        setSessions(data.upcomingSessions || []);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (id) => {
    if (!window.confirm("Mark this session as completed? XP will be awarded to both participants.")) return;
    setMarking((p) => ({ ...p, [id]: true }));
    // Optimistic update
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: "Completed" } : s))
    );
    try {
      await axios.post(`/meeting/complete/${id}`, {}, { withCredentials: true });
      toast.success("Session completed! XP awarded 🎉");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark as done");
      // Rollback
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: "Scheduled" } : s))
      );
    } finally {
      setMarking((p) => ({ ...p, [id]: false }));
    }
  };

  const handleMarkMissed = async (id) => {
    setMarking((p) => ({ ...p, [id]: true }));
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: "Missed" } : s))
    );
    try {
      // Call your backend to mark as missed if you have the endpoint
      // await axios.post(`/meeting/missed/${id}`, {}, { withCredentials: true });
      toast.info("Session marked as missed.");
    } catch {
      toast.error("Failed to update session.");
    } finally {
      setMarking((p) => ({ ...p, [id]: false }));
    }
  };

  /* Categorise */
  const categorise = (s) => {
    const st = getSessionStatus(s);
    if (st === "completed")                      return "completed";
    if (st === "missed")                         return "missed";
    if (st === "upcoming" || st === "action_needed") return "upcoming";
    return "upcoming";
  };

  const upcoming   = sessions.filter((s) => categorise(s) === "upcoming");
  const completed  = sessions.filter((s) => categorise(s) === "completed");
  const missed     = sessions.filter((s) => categorise(s) === "missed");

  const tabData = {
    upcoming:  { label: "Upcoming",  count: upcoming.length,  list: upcoming,  emptyIcon: "📅", emptyText: "No upcoming sessions. Schedule one from Chats!" },
    completed: { label: "Completed", count: completed.length, list: completed, emptyIcon: "✅", emptyText: "No completed sessions yet. Keep swapping skills!" },
    missed:    { label: "Missed",    count: missed.length,    list: missed,    emptyIcon: "⏰", emptyText: "No missed sessions — great consistency!" },
  };

  return (
    <div className="ss-page">
      <div className="ss-bg-grid" />

      <div className="ss-content">

        {/* ── Header ── */}
        <header className="ss-header">
          <div>
            <p className="ss-eyebrow">Your History</p>
            <h1 className="ss-title">Sessions</h1>
            <p className="ss-subtitle">
              Track all your skill swap sessions — upcoming, completed, and missed.
            </p>
          </div>

          {/* Summary pills */}
          <div className="ss-summary-pills">
            <div className="ss-pill ss-pill--upcoming">
              <span className="ss-pill-val">{upcoming.length}</span>
              <span className="ss-pill-label">Upcoming</span>
            </div>
            <div className="ss-pill ss-pill--completed">
              <span className="ss-pill-val">{completed.length}</span>
              <span className="ss-pill-label">Completed</span>
            </div>
            <div className="ss-pill ss-pill--missed">
              <span className="ss-pill-val">{missed.length}</span>
              <span className="ss-pill-label">Missed</span>
            </div>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="ss-tabs">
          {Object.entries(tabData).map(([key, val]) => (
            <button
              key={key}
              className={`ss-tab ${tab === key ? "ss-tab--active" : ""}`}
              onClick={() => setTab(key)}
            >
              {val.label}
              {val.count > 0 && (
                <span className={`ss-tab-badge ss-tab-badge--${key}`}>{val.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        <div className="ss-list-wrap">
          {loading ? (
            <div className="ss-loading">
              <div className="ss-spinner" />
              <p>Loading sessions…</p>
            </div>
          ) : tabData[tab].list.length === 0 ? (
            <Empty icon={tabData[tab].emptyIcon} text={tabData[tab].emptyText} />
          ) : (
            <div className="ss-list">
              {tabData[tab].list.map((s) => (
                <SessionCard
                  key={s._id}
                  session={s}
                  onMarkDone={handleMarkDone}
                  onMarkMissed={handleMarkMissed}
                  marking={marking}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Sessions;