
import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";
import Box from "./Box";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import CreditBadge from "./CreditBadge";

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);
const StarFilled = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f0b429" stroke="#f0b429" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const StarEmpty = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const Stars = ({ rating, size = 13 }) => {
  const r = Math.round(Number(rating) || 0);
  return (
    <span style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= r ? <StarFilled key={n} size={size} /> : <StarEmpty key={n} size={size} />
      )}
    </span>
  );
};

/* ══════════════════════════════════════════════
   REVIEW CAROUSEL
══════════════════════════════════════════════ */
const ReviewCarousel = ({ reviews, avgRating }) => {
  const trackRef   = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = "grabbing";
  };
  const onMouseLeave = () => { isDragging.current = false; if (trackRef.current) trackRef.current.style.cursor = "grab"; };
  const onMouseUp    = () => { isDragging.current = false; if (trackRef.current) trackRef.current.style.cursor = "grab"; };
  const onMouseMove  = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
          {Number(avgRating).toFixed(1)}
        </span>
        <div>
          <Stars rating={avgRating} size={18} />
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#555", marginTop: 4 }}>
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
      <div
        ref={trackRef}
        style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, cursor: "grab", userSelect: "none", scrollbarWidth: "none" }}
        onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
      >
        {reviews.map((rv, i) => (
          <div key={i} style={{ flexShrink: 0, width: 240, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <img
                src={rv.reviewerPicture || `https://api.dicebear.com/7.x/initials/svg?seed=${rv.reviewerName || rv.raterName}`}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${rv.reviewerName || rv.raterName}`; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#eee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {rv.reviewerName || rv.raterName || "Anonymous"}
                </div>
                <Stars rating={rv.rating} size={10} />
              </div>
            </div>
            {(rv.comment || rv.description) && (
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", color: "#999", lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
                "{rv.comment || rv.description}"
              </p>
            )}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#444", letterSpacing: "0.1em" }}>
        ← drag to explore →
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   SECTION TITLE
══════════════════════════════════════════════ */
const SectionTitle = ({ label, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <div style={{ width: 3, height: 16, background: "#fff", borderRadius: 2 }} />
    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "#fff", margin: 0 }}>
      {label}
    </h2>
    {count != null && (
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2px 8px", color: "#888" }}>
        {count}
      </span>
    )}
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PROFILE
══════════════════════════════════════════════ */
const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();
  const { user, setUser } = useUser();

  const [profileUser, setProfileUser]       = useState(null);
  const [reviews, setReviews]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);

  const from      = location.state?.from || "/discover";
  const backLabel = from.includes("/dashboard") ? "Dashboard"
    : from.includes("/chats") ? "Chats"
    : "Discover";

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/user/registered/getDetails/${username}`, { withCredentials: true });
        setProfileUser(data.data);
        const rv = await axios.get(`/rating/getReviews/${username}`, { withCredentials: true }).catch(() => ({ data: { data: [] } }));
        setReviews(rv.data.data || []);
      } catch (error) {
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          if (error.response.data.message === "Please Login") {
            localStorage.removeItem("userInfo");
            setUser(null);
            await axios.get("/auth/logout");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [username]);

  const fmt = (d) => {
    if (!d) return "Present";
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const connectHandler = async () => {
    try {
      setConnectLoading(true);
      const { data } = await axios.post("/request/create", { receiverID: profileUser._id });
      toast.success(data.message);
      setProfileUser((prev) => ({ ...prev, status: "Pending" }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally { setConnectLoading(false); }
  };

  const disconnectHandler = async () => {
    if (!window.confirm("Disconnect from this user?")) return;
    try {
      const { data } = await axios.delete("/request/disconnect", { data: { username: profileUser.username } });
      toast.success(data.message);
      setProfileUser((prev) => ({ ...prev, status: "Connect" }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to disconnect");
    }
  };

  const rating      = Number(profileUser?.rating ?? 0);
  const teachSkills = profileUser?.skillsProficientAt ?? [];
  const learnSkills = profileUser?.skillsToLearn ?? [];

  const cardStyle = {
    background: "#0f0f0f",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px 26px",
    marginBottom: 14,
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ccc" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Syne:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .pf-fadein { animation: fadeUp 0.35s ease both; }
        .pf-card-hover:hover { border-color: rgba(255,255,255,0.13) !important; }
        .pf-social-btn:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
        .pf-action-btn:hover { opacity: 0.85; }

        /* ── Two-column layout ── */
        .pf-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 20px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          align-items: start;
        }

        /* Sidebar sticks while scrolling */
        .pf-sidebar {
          position: sticky;
          top: 24px;
        }

        /* Collapse to single column on mobile */
        @media (max-width: 768px) {
          .pf-layout {
            grid-template-columns: 1fr;
            padding: 20px 16px 60px;
          }
          .pf-sidebar { position: static; }
        }
      `}</style>

      {/* ── LOADING ── */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #222", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : (
        <div className="pf-fadein">

          {/* Back button — full width above the grid */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0" }}>
            <button
              onClick={() => navigate(from)}
              style={{
                background: "transparent", border: "none", color: "#555",
                fontFamily: "'DM Mono', monospace", fontSize: "0.62rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", padding: 0, transition: "color 0.15s",
              }}
              onMouseEnter={(e) => e.target.style.color = "#fff"}
              onMouseLeave={(e) => e.target.style.color = "#555"}
            >
              ← Back to {backLabel}
            </button>
          </div>

          <div className="pf-layout">

            {/* ══════════════════════════════
                LEFT SIDEBAR
            ══════════════════════════════ */}
            <aside className="pf-sidebar">
              <div style={{ ...cardStyle, padding: "28px 22px", textAlign: "center" }}>

                {/* Avatar */}
                <div style={{
                  width: 90, height: 90, borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.12)",
                  overflow: "hidden", margin: "0 auto 16px",
                  background: "#111",
                }}>
                  <img
                    src={profileUser?.picture}
                    alt={profileUser?.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser?.name}`; }}
                  />
                </div>

                {/* Name & handle */}
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.6rem", fontWeight: 700,
                  color: "#fff", margin: "0 0 4px", lineHeight: 1.1,
                }}>
                  {profileUser?.name}
                </h1>
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "0.65rem",
                  color: "#555", letterSpacing: "0.1em", margin: "0 0 16px",
                }}>
                  @{username}
                </p>

                {/* Stars */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                  <Stars rating={rating} size={13} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "#f0b429" }}>{rating.toFixed(1)}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#555" }}>/ 5.0</span>
                </div>

                {/* Stats row */}
                <div style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, overflow: "hidden", marginBottom: 18,
                }}>
                  {[
                    { val: profileUser?.connectionsCount ?? 0, label: "Connections" },
                    { val: teachSkills.length,                 label: "Skills" },
                  ]
                    .filter((s) => s.val !== 0)
                    .map((s, i, arr) => (
                      <div key={i} style={{
                        flex: 1, padding: "10px 6px", textAlign: "center",
                        borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      }}>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.5rem", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
                      </div>
                    ))}
                </div>

                {/* Socials */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                  {[
                    { url: profileUser?.githubLink,    icon: <GithubIcon /> },
                    { url: profileUser?.linkedinLink,  icon: <LinkedinIcon /> },
                    { url: profileUser?.portfolioLink, icon: <LinkIcon /> },
                  ].filter((s) => s.url).map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      className="pf-social-btn"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 34, height: 34, borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#888", textDecoration: "none", transition: "all 0.15s",
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>

                {/* Edit button (own profile) */}
                {user?.username === username && (
                  <Link to="/edit_profile" style={{ textDecoration: "none", display: "block" }}>
                    <button style={{
                      width: "100%", padding: "9px 0",
                      background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                      color: "#888", borderRadius: 10,
                      fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
                      letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                      transition: "border-color 0.15s, color 0.15s",
                    }}>
                      Edit profile
                    </button>
                  </Link>
                )}

                {/* Action buttons (other user) */}
                {user?.username !== username && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      className="pf-action-btn"
                      onClick={
                        profileUser?.status === "Connect" ? connectHandler
                        : profileUser?.status === "Connected" ? disconnectHandler
                        : undefined
                      }
                      disabled={connectLoading || profileUser?.status === "Pending"}
                      style={{
                        width: "100%", padding: "10px 0",
                        fontFamily: "'DM Mono', monospace", fontSize: "0.62rem",
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        borderRadius: 10, cursor: "pointer", fontWeight: 600,
                        transition: "opacity 0.15s",
                        background: profileUser?.status === "Connect" ? "#fff"
                          : profileUser?.status === "Connected" ? "transparent"
                          : "rgba(255,255,255,0.05)",
                        color: profileUser?.status === "Connect" ? "#000"
                          : profileUser?.status === "Connected" ? "#ef4444"
                          : "#777",
                        border: profileUser?.status === "Connected" ? "1px solid #ef4444" : "1px solid transparent",
                      }}
                    >
                      {connectLoading ? "..." : profileUser?.status === "Connected" ? "Disconnect" : profileUser?.status || "Connect"}
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/rating/${profileUser?.username}`} style={{ textDecoration: "none", flex: 1 }}>
                        <button style={{
                          width: "100%", padding: "9px 0",
                          fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          borderRadius: 10, cursor: "pointer",
                          background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                          color: "#ccc", transition: "opacity 0.15s",
                        }}>Rate</button>
                      </Link>
                      <Link to={`/report/${profileUser?.username}`} style={{ textDecoration: "none", flex: 1 }}>
                        <button style={{
                          width: "100%", padding: "9px 0",
                          fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          borderRadius: 10, cursor: "pointer",
                          background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                          color: "#aaa", transition: "opacity 0.15s",
                        }}>Report</button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Badge in sidebar below profile card */}
              <CreditBadge
                username={profileUser?.username}
                isOwnProfile={profileUser?._id === user?._id}
              />
            </aside>

            {/* ══════════════════════════════
                RIGHT CONTENT COLUMN
            ══════════════════════════════ */}
            <div>

              {/* BIO */}
              {profileUser?.bio && (
                <div style={cardStyle} className="pf-card-hover">
                  <SectionTitle label="About" />
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.88rem", color: "#999", lineHeight: 1.8, margin: 0 }}>
                    {profileUser.bio}
                  </p>
                </div>
              )}

              {/* SKILLS I CAN TEACH */}
              {teachSkills.length > 0 && (
                <div style={cardStyle} className="pf-card-hover">
                  <SectionTitle label="Skills I can teach" count={teachSkills.length} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {teachSkills.map((s, i) => (
                      <span key={i} style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "0.66rem",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, padding: "5px 13px", color: "#ddd",
                      }}>
                        {typeof s === "string" ? s : s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SKILLS I WANT TO LEARN */}
              {learnSkills.length > 0 && (
                <div style={cardStyle} className="pf-card-hover">
                  <SectionTitle label="Skills I want to learn" count={learnSkills.length} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {learnSkills.map((s, i) => (
                      <span key={i} style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "0.66rem",
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 8, padding: "5px 13px", color: "#888",
                      }}>
                        {typeof s === "string" ? s : s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {profileUser?.education?.length > 0 && (
                <div style={cardStyle} className="pf-card-hover">
                  <SectionTitle label="Education" />
                  <div className="pf-boxes">
                    {profileUser.education.map((e, i) => (
                      <Box key={i} head={e?.institution} date={`${fmt(e?.startDate)} – ${fmt(e?.endDate)}`} spec={e?.degree} desc={e?.description} score={e?.score} />
                    ))}
                  </div>
                </div>
              )}

              {/* PROJECTS */}
              {profileUser?.projects?.length > 0 && (
                <div style={cardStyle} className="pf-card-hover">
                  <SectionTitle label="Projects" count={profileUser.projects.length} />
                  <div className="pf-boxes">
                    {profileUser.projects.map((p, i) => (
                      <Box key={i} head={p?.title} date={`${fmt(p?.startDate)} – ${fmt(p?.endDate)}`} desc={p?.description} skills={p?.techStack} />
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS */}
              {reviews.length > 0 && (
                <div style={cardStyle} className="pf-card-hover">
                  <SectionTitle label="Reviews" count={reviews.length} />
                  <ReviewCarousel reviews={reviews} avgRating={rating} />
                </div>
              )}

            </div>
            {/* end right column */}

          </div>
          {/* end grid */}

        </div>
      )}
    </div>
  );
};

export default Profile;