

import { useEffect, useState } from "react";
import axios from "axios";

const LEVELS = [
  { name: "Legend",   minXP: 6000, badge: "🏆", color: "#FFD700" },
  { name: "Mentor",   minXP: 3500, badge: "🎓", color: "#C084FC" },
  { name: "Pro",      minXP: 2000, badge: "⚡", color: "#60A5FA" },
  { name: "Achiever", minXP: 1000, badge: "🌟", color: "#34D399" },
  { name: "Explorer", minXP: 500,  badge: "🧭", color: "#FB923C" },
  { name: "Learner",  minXP: 200,  badge: "📚", color: "#A78BFA" },
  { name: "Beginner", minXP: 0,    badge: "🌱", color: "#94A3B8" },
];

/* hex "#RRGGBB" → "r, g, b" string for use inside rgba() */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function CreditBadge({ username, isOwnProfile = false }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!username) return;

    const endpoint = isOwnProfile
      ? "/api/v1/credits/me"
      : `/api/v1/credits/user/${username}`;

    axios
      .get(endpoint, { withCredentials: true })
      .then((res) => {
        const d = res.data.data;
        setData({
          xp:                     d.xp                     || 0,
          level:                  d.level                  || "Beginner",
          credits:                d.credits                || 0,
          totalSessionsTaught:    d.totalSessionsTaught    || 0,
          totalSessionsCompleted: d.totalSessionsCompleted || 0,
          averageRating:          d.averageRating          || 0,
          totalRatingsReceived:   d.totalRatingsReceived   || 0,
          progress:               d.progress               || { percentage: 0, current: 0, required: 0 },
        });
      })
      .catch((err) => console.error("CreditBadge fetch error:", err))
      .finally(() => setLoading(false));
  }, [username, isOwnProfile]);

  /* ── Skeleton ── */
  if (loading) return (
    <>
      <style>{`@keyframes cb-pulse { 0%,100%{opacity:.3} 50%{opacity:.6} }`}</style>
      <div style={{
        height: 76, borderRadius: 12, marginBottom: 20,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
        animation: "cb-pulse 1.6s ease infinite",
      }} />
    </>
  );
  if (!data) return null;

  const currentLevel = LEVELS.find((l) => l.name === data.level) || LEVELS[LEVELS.length - 1];
  const nextLevel    = LEVELS[LEVELS.findIndex((l) => l.name === data.level) - 1] || null;
  const pct          = Math.min(data.progress?.percentage || 0, 100);
  const rgb          = hexToRgb(currentLevel.color);

  return (
    <div style={{
      marginBottom: 20,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.025)",
      overflow: "hidden",
      fontFamily: "'DM Mono', monospace",
    }}>

      {/* ══════════════════════════════════
          ROW 1 — badge + level + XP + credits
      ══════════════════════════════════ */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>

        {/* Badge emoji bubble */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
          background: `rgba(${rgb}, 0.1)`,
          border: `1.5px solid rgba(${rgb}, 0.25)`,
          boxShadow: `0 0 18px rgba(${rgb}, 0.15)`,
        }}>
          {currentLevel.badge}
        </div>

        {/* Level name + progress bar + next level */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: "0.62rem", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: currentLevel.color,
            }}>
              {data.level}
            </span>
            <span style={{
              fontSize: "0.58rem", color: "#666",
              letterSpacing: "0.06em",
            }}>
              {data.xp.toLocaleString()} XP
            </span>
          </div>

          {/* Progress track */}
          <div style={{
            height: 3, borderRadius: 3,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden", marginBottom: 5,
          }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${pct}%`,
              background: currentLevel.color,
              transition: "width 0.7s ease",
            }} />
          </div>

          {/* Next level label */}
          <div style={{ fontSize: "0.54rem", color: "#555", letterSpacing: "0.05em" }}>
            {nextLevel
              ? `${data.progress?.current || 0} / ${data.progress?.required || 0} XP to ${nextLevel.name} ${nextLevel.badge}`
              : "👑 Max level reached"}
          </div>
        </div>

        {/* Credits pill */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 2, flexShrink: 0,
          padding: "8px 12px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>💎</span>
          <span style={{
            fontSize: "0.9rem", fontWeight: 700, color: "#fff",
            lineHeight: 1, marginTop: 2,
          }}>
            {data.credits}
          </span>
          <span style={{
            fontSize: "0.48rem", color: "#555",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            credits
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════
          TABS
      ══════════════════════════════════ */}
      <div style={{ display: "flex" }}>
        {[
          { key: "overview", label: "📊 Stats" },
          { key: "levels",   label: "🎖 Levels" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1, padding: "9px 0",
              background: "transparent", border: "none",
              borderBottom: activeTab === t.key
                ? `1.5px solid ${currentLevel.color}`
                : "1.5px solid rgba(255,255,255,0.05)",
              color: activeTab === t.key ? "#ddd" : "#444",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.56rem", letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════
          STATS GRID
      ══════════════════════════════════ */}
      {activeTab === "overview" && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
        }}>
          {[
            { icon: "🎓", label: "Sessions Taught",    value: data.totalSessionsTaught },
            { icon: "📖", label: "Sessions Attended",   value: data.totalSessionsCompleted },
            { icon: "⭐", label: "Avg Rating",          value: data.averageRating > 0 ? data.averageRating.toFixed(1) : "—" },
            { icon: "📝", label: "Ratings Received",    value: data.totalRatingsReceived },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "14px 10px",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              borderRight:  i % 2 === 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              borderBottom: i < 2       ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <span style={{ fontSize: "1rem" }}>{s.icon}</span>
              <span style={{
                fontSize: "1.1rem", fontWeight: 700,
                color: "#fff", lineHeight: 1,
                fontFamily: "'Cormorant Garamond', serif",
              }}>
                {s.value}
              </span>
              <span style={{
                fontSize: "0.5rem", color: "#555",
                letterSpacing: "0.09em", textTransform: "uppercase",
                textAlign: "center", lineHeight: 1.3,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════
          LEVELS LIST
      ══════════════════════════════════ */}
      {activeTab === "levels" && (
        <div>
          {LEVELS.slice().reverse().map((lvl, i, arr) => {
            const unlocked  = data.xp >= lvl.minXP;
            const isCurrent = lvl.name === data.level;
            const lvlRgb    = hexToRgb(lvl.color);
            return (
              <div key={lvl.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 18px",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: isCurrent ? `rgba(${lvlRgb}, 0.05)` : "transparent",
                opacity: unlocked ? 1 : 0.3,
                transition: "opacity 0.15s",
              }}>
                <span style={{ fontSize: "1rem", width: 22, textAlign: "center", lineHeight: 1 }}>
                  {unlocked ? lvl.badge : "🔒"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 600,
                    color: unlocked ? lvl.color : "#444",
                    letterSpacing: "0.05em",
                  }}>
                    {lvl.name}
                  </div>
                  <div style={{ fontSize: "0.54rem", color: "#444", marginTop: 1 }}>
                    {lvl.minXP.toLocaleString()} XP required
                  </div>
                </div>
                {isCurrent && (
                  <span style={{
                    fontSize: "0.48rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: lvl.color,
                    background: `rgba(${lvlRgb}, 0.12)`,
                    border: `1px solid rgba(${lvlRgb}, 0.2)`,
                    borderRadius: 20, padding: "2px 8px",
                  }}>
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}