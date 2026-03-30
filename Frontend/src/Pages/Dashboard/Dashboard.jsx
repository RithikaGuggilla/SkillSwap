import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import { useUser } from "../../util/UserContext";

/* ─────────────────── Icons ─────────────────── */
const Icon = ({ d, size = 16, stroke = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={stroke ? "none" : "currentColor"}
    stroke={stroke ? "currentColor" : "none"}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ArrowUpRightIcon = () => <Icon d="M7 17L17 7M17 7H7M17 7v10" />;
const ClockIcon        = () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l3 3" />;
const UsersIcon        = () => <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />;
const CheckIcon        = () => <Icon d="M20 6L9 17l-5-5" />;
const CalendarIcon     = () => <Icon d="M3 9h18M3 15h18M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z" />;
const StarIcon         = () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const ZapIcon          = () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const BellIcon         = () => <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />;
const MapIcon          = () => <Icon d="M3 11l19-9-9 19-2-8-8-2z" />;
const TrendingIcon     = () => <Icon d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />;


/* ─────────────────── Sub-components ─────────────────── */
const StatCard = ({ label, value, icon, accent, delta }) => (
  <div className={`db-stat-card ${accent ? "db-stat-card--accent" : ""}`}>
    <div className="db-stat-top">
      <span className="db-stat-icon">{icon}</span>
      {delta !== undefined && (
        <span className={`db-stat-delta ${delta >= 0 ? "pos" : "neg"}`}>
          {delta >= 0 ? "+" : ""}{delta}
        </span>
      )}
    </div>
    <div className="db-stat-value">{value ?? 0}</div>
    <div className="db-stat-label">{label}</div>
    <div className="db-bar"><div className="db-bar-fill" /></div>
  </div>
);

const SectionCard = ({ title, icon, count, children, cta, ctaLink }) => (
  <div className="db-section-card">
    <div className="db-section-head">
      <div className="db-section-head-left">
        <span className="db-section-icon">{icon}</span>
        <h2 className="db-section-title">{title}</h2>
        {count != null && <span className="db-section-badge">{count}</span>}
      </div>
      {cta && ctaLink && (
        <Link to={ctaLink} className="db-section-cta">{cta} →</Link>
      )}
    </div>
    <div className="db-section-body">{children}</div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="db-empty">
    <span className="db-empty-glyph">✦</span>
    <p>{text}</p>
  </div>
);

const SkillPill = ({ name, level }) => {
  const l = (level || "").toLowerCase();
  return (
    <span className={`db-skill-pill db-skill-pill--${l}`}>{name}{level ? ` · ${level}` : ""}</span>
  );
};

/* ─────────────────── Learning Path Preview Card ─────────────────── */
const LearningPathCard = ({ path }) => {
  if (!path || !path.generatedPath || path.generatedPath.length === 0) {
    return (
      <div className="db-empty">
        <span className="db-empty-glyph">✦</span>
        <p>No learning path yet. Generate one during registration.</p>
      </div>
    );
  }

  const phases = path.generatedPath;
  const first = phases[0];

  return (
    <div className="db-lp-preview">

      {/* Phase count + first phase preview */}
      <div className="db-lp-stats-row">
        <div className="db-lp-stat">
          <span className="db-lp-stat-val">{phases.length}</span>
          <span className="db-lp-stat-label">Phases</span>
        </div>
        <div className="db-lp-stat">
          <span className="db-lp-stat-val">
            {phases.reduce((acc, p) => acc + (p.teachers?.length || 0), 0)}
          </span>
          <span className="db-lp-stat-label">Partners</span>
        </div>
        <div className="db-lp-stat">
          <span className="db-lp-stat-val">{phases[phases.length-1]?.duration?.split("-")[1]?.trim() || "—"}</span>
          <span className="db-lp-stat-label">End Week</span>
        </div>
      </div>

      {/* First phase preview */}
      {first && (
        <div className="db-lp-first-phase">
          <span className="db-lp-first-label">Start with</span>
          <span className="db-lp-first-name">
            {first.title.replace(/^Phase \d+\s*[—–-]\s*/i, "")}
          </span>
          <div className="db-lp-first-topics">
            {first.topics.slice(0, 3).map((t, i) => (
              <span key={i} className="db-lp-first-topic">{t}</span>
            ))}
            {first.topics.length > 3 && (
              <span className="db-lp-first-topic" style={{ opacity: 0.5 }}>+{first.topics.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <Link to="/learningpath" className="db-lp-view-btn">
        View Full Roadmap →
      </Link>
    </div>
  );
};

/* ════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    requestsSent: 0, pendingRequests: 0, connections: 0,
    meetingsScheduled: 0, meetingsDone: 0,
  });
  const [pendingRequests,  setPendingRequests]  = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [skillMatches,     setSkillMatches]     = useState([]);
  const [recentActivity,   setRecentActivity]   = useState([]);
  const [learningPath,     setLearningPath]     = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [time,   setTime]   = useState(new Date());
  const [markingDone, setMarkingDone] = useState({});

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get("/dashboard/overview", { withCredentials: true });
        setStats(data.stats);
        setPendingRequests(data.pendingRequests);
        setSkillMatches(data.skillMatches);
        setRecentActivity(data.recentActivity);
        setUpcomingSessions(data.upcomingSessions || []);
      } catch (err) { console.error(err); }
    };

    const fetchLearningPath = async () => {
      try {
        const { data } = await axios.get("/learningpath/get", { withCredentials: true });
        setLearningPath(data.data);
      } catch {
        setLearningPath(null);
      } finally { setLoaded(true); }
    };

    fetchDashboard();
    fetchLearningPath();
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const fmtTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };



const handleMarkDone = async (sessionId) => {
  if (!window.confirm("Mark this session as completed? This will award XP to both participants.")) return;

  // ✅ UPDATE UI FIRST
  setUpcomingSessions(prev =>
    prev.map(s =>
      s._id === sessionId ? { ...s, completed: true } : s
    )
  );

  setMarkingDone(prev => ({ ...prev, [sessionId]: true }));

  try {
    await axios.post(`/meeting/complete/${sessionId}`, {}, { withCredentials: true });

    toast.success("Session marked as completed! XP awarded 🎉");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to mark session as done");
  } finally {
    setMarkingDone(prev => ({ ...prev, [sessionId]: false }));
  }
};
 



const handleNotDone = (sessionId) => {
  setUpcomingSessions(prev =>
    prev.map(s =>
      s._id === sessionId ? { ...s, status: "missed" } : s
    )
  );
};











  const statCards = [
    { key: "requestsSent",      label: "Requests Sent",      icon: <ArrowUpRightIcon /> },
    { key: "pendingRequests",   label: "Pending Requests",   icon: <ClockIcon /> },
    { key: "connections",       label: "Connections",        icon: <UsersIcon />,    accent: true },
    { key: "meetingsScheduled", label: "Sessions Scheduled", icon: <CalendarIcon /> },
    { key: "meetingsDone",      label: "Sessions Completed", icon: <CheckIcon />,    accent: true },
  ];

  return (
    <div className="db-page">
      <div className="db-bg-grid" />
      <div className="db-content">

        <header className="db-header">
          <div className="db-header-left">
            <p className="db-header-eyebrow">
              {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="db-title">
              {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="db-subtitle">Here's what's happening with your skill exchanges.</p>
          </div>
          <div className="db-header-right">
            <span className={`db-live-dot ${loaded ? "db-live-dot--on" : ""}`} />
            <span className="db-live-text">{loaded ? "Live" : "Loading…"}</span>
          </div>
        </header>

        <div className={`db-stats-grid ${loaded ? "db-stats-grid--in" : ""}`}>
          {statCards.map((c, i) => (
            <div key={c.key} style={{ animationDelay: `${i * 0.08}s` }}>
              <StatCard label={c.label} value={stats[c.key]} icon={c.icon} accent={c.accent} />
            </div>
          ))}
        </div>

        <div className="db-main-grid">

          {/* LEFT COLUMN */}
          <div className="db-col">

            <SectionCard title="Pending Requests" icon={<ClockIcon />}
              count={pendingRequests.length || stats.pendingRequests || null}
              cta="View all" ctaLink="/chats">
              {pendingRequests.length === 0 ? (
                <EmptyState text="No pending requests right now." />
              ) : (
                <div className="db-request-list">
                  {pendingRequests.map((req, i) => (
                    <div key={i} className="db-request-item">
                      <img className="db-request-avatar"
                        src={req.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${req.name}`}
                        alt={req.name}
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${req.name}`; }}
                      />
                      <div className="db-request-info">
                        <p className="db-request-name">{req.name}</p>
                        <p className="db-request-sub">@{req.username} · Wants to swap skills</p>
                      </div>
                      <Link to="/chats?tab=requests" className="db-mini-btn">Review →</Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            



            <SectionCard title="Upcoming Sessions" icon={<CalendarIcon />} count={upcomingSessions.length || null}>
  {upcomingSessions.length === 0 ? (
    <EmptyState text="No upcoming sessions scheduled." />
  ) : (
    <div className="db-session-list">
      {upcomingSessions.map((s, i) => {
        const now = new Date();
        const [hours, minutes] = s.time.split(":");
        const sessionDateTime = new Date(s.date);
        sessionDateTime.setHours(hours, minutes, 0);
       const bufferMinutes = 2;

const sessionEndTime = new Date(sessionDateTime);
sessionEndTime.setMinutes(sessionEndTime.getMinutes() + bufferMinutes);

const isPast = sessionEndTime < now;
 
        return (
          <div key={s._id || i} className="db-session-item">
            <div className="db-session-date-block">
              <span className="db-session-day">
                {new Date(s.date).toLocaleDateString("en-US", { day: "numeric" })}
              </span>
              <span className="db-session-mon">
                {new Date(s.date).toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
 
            <div className="db-session-info">
              <p className="db-session-title">Session with {s.name}</p>
              <p className="db-session-meta">
                {fmtDate(s.date)} · {s.time} · Video call
              </p>
            </div>
 
            
           {s.completed === true ? (
  <div className="db-session-final completed">
    Session Completed ✓
  </div>
) : s.status === "missed" ? (
  <div className="db-session-final missed">
    Session Missed ✗
  </div>
) : isPast ? (
  <div style={{ display: "flex", gap: "8px" }}>
    <button
  onClick={() => handleMarkDone(s._id)}
  className="db-session-badge done-btn"
>
  DONE ✓
</button>

<button
  onClick={() => handleNotDone(s._id)}
  className="db-session-badge missed-btn"
>
  NOT DONE ✗
</button>
  </div>
) : (
  <span className="db-session-badge">Upcoming</span>
)}

 </div>
        );
      })}
    </div>
  )}
</SectionCard>



























            {/* ── MY LEARNING PATH (replaces Learning Progress) ── */}
            <SectionCard title="My Learning Path" icon={<MapIcon />}>
              <LearningPathCard path={learningPath} />
            </SectionCard>

          </div>

          {/* RIGHT COLUMN */}
          <div className="db-col">

            <SectionCard title="Skill Matches" icon={<ZapIcon />}
              count={skillMatches.length || null} cta="Browse all" ctaLink="/discover">
              {skillMatches.length === 0 ? (
                <EmptyState text="No skill matches found yet. Add skills to your profile." />
              ) : (
                <div className="db-match-list">
                  {skillMatches.map((m, i) => (
                    <div key={i} className="db-match-item">
                      <img className="db-match-avatar"
                        src={m.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                        alt={m.name}
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`; }}
                      />
                      <div className="db-match-info">
                        <p className="db-match-name">{m.name}</p>
                        <div className="db-match-skills">
                          {(m.skillsToTeach || []).slice(0, 2).map((s, j) => (
                            <SkillPill key={j} name={typeof s === "string" ? s : s.name} level={s.level} />
                          ))}
                        </div>
                      </div>
                      <div className="db-match-score"><StarIcon /><span>{m.rating ?? "—"}</span></div>
                      <Link to={`/profile/${m.username}`} state={{ from: "/dashboard" }} className="db-mini-btn">View →</Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Recent Activity" icon={<BellIcon />}>
              {recentActivity.length === 0 ? (
                <EmptyState text="No recent activity yet." />
              ) : (
                <div className="db-activity-list">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="db-activity-item">
                      <span className="db-activity-dot" />
                      <div className="db-activity-body">
                        <p className="db-activity-text">{a.text}</p>
                        <p className="db-activity-time">{fmtDate(a.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <div className="db-summary-card">
              <p className="db-summary-eyebrow">Your Network</p>
              <div className="db-summary-stats">
                <div className="db-summary-stat">
                  <span className="db-summary-val">{stats.connections}</span>
                  <span className="db-summary-desc">Connections</span>
                </div>
                <div className="db-summary-div" />
                <div className="db-summary-stat">
                  <span className="db-summary-val">{(stats.meetingsDone || 0) + (stats.meetingsScheduled || 0)}</span>
                  <span className="db-summary-desc">Total Sessions</span>
                </div>
                <div className="db-summary-div" />
                <div className="db-summary-stat">
                  <span className="db-summary-val">{stats.requestsSent}</span>
                  <span className="db-summary-desc">Requests Sent</span>
                </div>
              </div>
              <Link to="/discover" className="db-explore-btn">
                <TrendingIcon /> Explore Skill Swaps
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;