import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const LearningPathPage = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    axios.get("/learningpath/get", { withCredentials: true })
      .then(({ data }) => setPath(data.data))
      .catch(() => setPath(null))
      .finally(() => setLoading(false));
  }, []);

  const stars = (r) => {
    const n = Math.round(r || 0);
    return "★".repeat(n) + "☆".repeat(5 - n);
  };

  if (loading) return (
    <div style={s.loadWrap}>
      <div style={s.spinner} />
      <p style={s.loadText}>Loading your roadmap…</p>
    </div>
  );

  if (!path) return (
    <div style={s.loadWrap}>
      <p style={s.loadText}>No learning path found.</p>
      <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
    </div>
  );

  const phases = path.generatedPath || [];
  const phase = phases[activePhase];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-hover-card:hover { border-color: rgba(255,255,255,0.14) !important; background: rgba(255,255,255,0.04) !important; }
        .lp-connect-btn:hover { background: #e0e0e0 !important; }
        .lp-back-btn:hover { border-color: #555 !important; color: #ccc !important; }
        .lp-side-item:hover { background: rgba(255,255,255,0.03) !important; }
        .lp-view-roadmap::-webkit-scrollbar { height: 0; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={s.page}>
        <div style={s.bgDots} />

        {/* ── Top bar ── */}
        <div style={s.topBar}>
          <button
            className="lp-back-btn"
            style={s.backBtn}
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
          <div style={s.topTags}>
            {[path.goal, path.timeline, path.hoursPerWeek && `${path.hoursPerWeek} / week`, path.currentLevel]
              .filter(Boolean)
              .map((tag, i) => (
                <span key={i} style={s.tag}>{tag}</span>
              ))}
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={s.hero}>
          <p style={s.heroEyebrow}>My Learning Roadmap</p>
          <h1 style={s.heroTitle}>
            {path.specificGoal || "Your Personalized Path"}
          </h1>
          <p style={s.heroSub}>
            {phases.length} phases &nbsp;·&nbsp; AI-generated &nbsp;·&nbsp; Matched with swap partners
          </p>
        </div>

        {/* ── Body ── */}
        <div style={s.body}>

          {/* Sidebar */}
          <div style={s.sidebar}>
            <p style={s.sideLabel}>Phases</p>
            {phases.map((ph, i) => (
              <button
                key={i}
                className="lp-side-item"
                style={s.sideItem(i === activePhase)}
                onClick={() => setActivePhase(i)}
              >
                <div style={s.sideNum(i === activePhase)}>{ph.phase}</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={s.sideName(i === activePhase)}>
                    {ph.title.replace(/^Phase \d+\s*[—–-]\s*/i, "")}
                  </div>
                  <div style={s.sideDur}>{ph.duration}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {phase && (
            <div style={s.detail} key={activePhase}>

              {/* Phase header */}
              <div style={s.phaseHead}>
                <div>
                  <p style={s.phaseEyebrow}>Phase {phase.phase} of {phases.length}</p>
                  <h2 style={s.phaseTitle}>
                    {phase.title.replace(/^Phase \d+\s*[—–-]\s*/i, "")}
                  </h2>
                  <p style={s.phaseReason}>{phase.reason}</p>
                </div>
                <span style={s.durBadge}>{phase.duration}</span>
              </div>

              {/* Topics */}
              <div style={s.block}>
                <p style={s.blockLabel}>What you'll learn</p>
                <div style={s.topicsGrid}>
                  {phase.topics.map((t, i) => (
                    <div key={i} style={s.topicItem}>
                      <span style={s.topicBullet} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Swap partners */}
              <div style={s.block}>
                <p style={s.blockLabel}>
                  Swap partners for <span style={{ color: "#fff", fontWeight: 500 }}>{phase.skillTag}</span>
                </p>
                {phase.teachers && phase.teachers.length > 0 ? (
                  <div style={s.teacherList}>
                    {phase.teachers.map((t, i) => (
                      <div key={i} className="lp-hover-card" style={s.teacherCard}>
                        <img
                          src={t.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`}
                          alt={t.name} style={s.teacherPic}
                          onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`; }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={s.teacherName}>{t.name}</p>
                          <p style={s.teacherRating}>
                            <span style={{ color: "#f0b429", letterSpacing: 1 }}>
                              {"★".repeat(Math.round(t.rating || 0))}
                            </span>
                            <span style={{ color: "#333" }}>
                              {"★".repeat(5 - Math.round(t.rating || 0))}
                            </span>
                            {t.rating > 0 && (
                              <span style={{ color: "#666", marginLeft: 6 }}>({t.rating})</span>
                            )}
                          </p>
                        </div>
                        {t.swapMatch && <span style={s.swapBadge}>⇄ Perfect Swap</span>}
                        <Link
                          to={`/profile/${t.username}`}
                          state={{ from: "/learningpath" }}
                          className="lp-connect-btn"
                          style={s.connectBtn}
                        >
                          Connect →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={s.noTeachers}>
                    No swap partners yet for {phase.skillTag} — check back as more users join!
                  </p>
                )}
              </div>

              {/* Prev / Next */}
              <div style={s.navRow}>
                <button
                  style={s.navBtn(activePhase === 0)}
                  onClick={() => setActivePhase(p => Math.max(0, p - 1))}
                  disabled={activePhase === 0}
                >
                  ← Prev
                </button>
                <div style={s.dots}>
                  {phases.map((_, i) => (
                    <div key={i} style={s.dot(i === activePhase)} onClick={() => setActivePhase(i)} />
                  ))}
                </div>
                <button
                  style={s.navBtn(activePhase === phases.length - 1)}
                  onClick={() => setActivePhase(p => Math.min(phases.length - 1, p + 1))}
                  disabled={activePhase === phases.length - 1}
                >
                  Next →
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

const FONT = "'Syne', sans-serif";
const MONO = "'DM Mono', monospace";

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#c8c8c8",
    fontFamily: FONT,
    position: "relative",
    overflowX: "hidden",
  },
  bgDots: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: "radial-gradient(circle, #161616 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  },
  loadWrap: {
    minHeight: "100vh", background: "#0a0a0a",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16,
  },
  loadText: {
    fontFamily: MONO, fontSize: "0.8rem", color: "#555",
  },
  spinner: {
    width: 24, height: 24, borderRadius: "50%",
    border: "2px solid #222", borderTopColor: "#fff",
    animation: "spin 0.7s linear infinite",
  },

  /* Top bar */
  topBar: {
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    padding: "18px 44px",
    borderBottom: "1px solid #161616",
    background: "rgba(10,10,10,0.95)",
    backdropFilter: "blur(8px)",
  },
  backBtn: {
    fontFamily: MONO, fontSize: "0.65rem",
    letterSpacing: "0.12em", textTransform: "uppercase",
    background: "transparent", border: "1px solid #252525",
    color: "#666", borderRadius: 8, padding: "9px 18px",
    cursor: "pointer", transition: "all 0.15s",
  },
  topTags: { display: "flex", gap: 8, flexWrap: "wrap" },
  tag: {
    fontFamily: MONO, fontSize: "0.6rem",
    letterSpacing: "0.1em", textTransform: "uppercase",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20, padding: "5px 13px", color: "#777",
  },

  /* Hero */
  hero: {
    position: "relative", zIndex: 1,
    padding: "52px 44px 44px",
    borderBottom: "1px solid #131313",
  },
  heroEyebrow: {
    fontFamily: MONO, fontSize: "0.6rem",
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#444", margin: "0 0 14px",
  },
  heroTitle: {
    fontFamily: FONT,
    fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
    fontWeight: 600, color: "#ffffff",
    margin: "0 0 14px", letterSpacing: "-0.01em",
    lineHeight: 1.25, maxWidth: 680,
  },
  heroSub: {
    fontFamily: MONO, fontSize: "0.7rem",
    color: "#444", letterSpacing: "0.06em", margin: 0,
  },

  /* Body */
  body: {
    position: "relative", zIndex: 1,
    display: "flex", minHeight: "calc(100vh - 240px)",
  },

  /* Sidebar */
  sidebar: {
    width: 240, flexShrink: 0,
    borderRight: "1px solid #131313",
    padding: "24px 0 24px",
    overflowY: "auto",
  },
  sideLabel: {
    fontFamily: MONO, fontSize: "0.52rem",
    letterSpacing: "0.22em", textTransform: "uppercase",
    color: "#333", padding: "0 22px 14px", margin: 0,
  },
  sideItem: (active) => ({
    width: "100%", display: "flex", alignItems: "flex-start",
    gap: 12, padding: "13px 22px",
    background: active ? "rgba(255,255,255,0.05)" : "transparent",
    border: "none",
    borderLeft: active ? "2px solid #ffffff" : "2px solid transparent",
    cursor: "pointer", transition: "all 0.15s",
    marginBottom: 1,
  }),
  sideNum: (active) => ({
    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
    border: active ? "1.5px solid #fff" : "1px solid #252525",
    background: active ? "#fff" : "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: MONO, fontSize: "0.58rem",
    color: active ? "#000" : "#555",
    fontWeight: active ? 700 : 400, marginTop: 1,
  }),
  sideName: (active) => ({
    fontFamily: FONT, fontSize: "0.78rem",
    fontWeight: active ? 600 : 400,
    color: active ? "#ffffff" : "#777",
    lineHeight: 1.3, marginBottom: 3,
  }),
  sideDur: {
    fontFamily: MONO, fontSize: "0.56rem",
    color: "#444", letterSpacing: "0.06em",
  },

  /* Detail */
  detail: {
    flex: 1, padding: "36px 48px 52px",
    overflowY: "auto",
    animation: "fadeUp 0.25s ease",
  },
  phaseHead: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", gap: 20,
    marginBottom: 36, paddingBottom: 28,
    borderBottom: "1px solid #161616",
  },
  phaseEyebrow: {
    fontFamily: MONO, fontSize: "0.58rem",
    letterSpacing: "0.16em", textTransform: "uppercase",
    color: "#444", margin: "0 0 10px",
  },
  phaseTitle: {
    fontFamily: FONT, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
    fontWeight: 700, color: "#ffffff",
    margin: "0 0 12px", letterSpacing: "-0.01em", lineHeight: 1.2,
  },
  phaseReason: {
    fontFamily: FONT, fontSize: "0.9rem",
    color: "#777", fontStyle: "italic",
    margin: 0, lineHeight: 1.65, maxWidth: 520, fontWeight: 400,
  },
  durBadge: {
    flexShrink: 0, fontFamily: MONO,
    fontSize: "0.6rem", letterSpacing: "0.1em",
    textTransform: "uppercase",
    border: "1px solid #222", borderRadius: 20,
    padding: "7px 16px", color: "#666",
    background: "rgba(255,255,255,0.02)",
    whiteSpace: "nowrap", marginTop: 4,
  },

  /* Topics */
  block: { marginBottom: 36 },
  blockLabel: {
    fontFamily: MONO, fontSize: "0.58rem",
    letterSpacing: "0.16em", textTransform: "uppercase",
    color: "#555", margin: "0 0 14px",
  },
  topicsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    gap: 8,
  },
  topicItem: {
    display: "flex", alignItems: "center", gap: 10,
    fontFamily: FONT, fontSize: "0.82rem",
    color: "#bbb", fontWeight: 400,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 9, padding: "11px 15px",
    lineHeight: 1.3,
  },
  topicBullet: {
    width: 5, height: 5, borderRadius: "50%",
    background: "#333", flexShrink: 0,
  },

  /* Teachers */
  teacherList: { display: "flex", flexDirection: "column", gap: 10 },
  teacherCard: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "16px 20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, transition: "all 0.15s",
  },
  teacherPic: {
    width: 42, height: 42, borderRadius: "50%",
    objectFit: "cover", flexShrink: 0,
    border: "1px solid #222",
  },
  teacherName: {
    fontFamily: FONT, fontSize: "0.9rem",
    fontWeight: 500, color: "#eee", margin: "0 0 4px",
  },
  teacherRating: {
    fontFamily: MONO, fontSize: "0.7rem", margin: 0,
  },
  swapBadge: {
    fontFamily: MONO, fontSize: "0.58rem",
    letterSpacing: "0.08em", textTransform: "uppercase",
    border: "1px solid rgba(59,180,161,0.35)",
    color: "#3bb4a1", borderRadius: 20,
    padding: "5px 12px", flexShrink: 0,
  },
  connectBtn: {
    fontFamily: MONO, fontSize: "0.62rem",
    letterSpacing: "0.12em", textTransform: "uppercase",
    background: "#ffffff", color: "#000000",
    border: "none", borderRadius: 9,
    padding: "10px 20px", cursor: "pointer",
    textDecoration: "none", flexShrink: 0,
    fontWeight: 600, transition: "background 0.15s",
  },
  noTeachers: {
    fontFamily: FONT, fontSize: "0.82rem",
    color: "#444", fontStyle: "italic", padding: "14px 0",
  },

  /* Nav */
  navRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 28, borderTop: "1px solid #161616", marginTop: 4,
  },
  navBtn: (disabled) => ({
    fontFamily: MONO, fontSize: "0.62rem",
    letterSpacing: "0.12em", textTransform: "uppercase",
    background: "transparent",
    border: "1px solid",
    borderColor: disabled ? "#161616" : "#2a2a2a",
    color: disabled ? "#2a2a2a" : "#777",
    borderRadius: 9, padding: "10px 20px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s",
  }),
  dots: { display: "flex", gap: 7, alignItems: "center" },
  dot: (active) => ({
    width: active ? 22 : 6, height: 6,
    borderRadius: active ? 4 : "50%",
    background: active ? "#fff" : "#252525",
    cursor: "pointer", transition: "all 0.22s",
  }),
};

export default LearningPathPage;