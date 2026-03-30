
import React, { useState } from "react";
import "./Card.css";
import { Link } from "react-router-dom";

const RequestCard = ({ picture, bio, name, skills = [], rating, username }) => {
  const [imgErr, setImgErr] = useState(false);

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const r = Number(rating) || 0;

  return (
    <div className="rc-card">
      {/* ── Header ── */}
      <div className="rc-head">
        <div className="rc-avatar-wrap">
          {picture && !imgErr ? (
            <img
              src={picture}
              alt={name}
              className="rc-avatar"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="rc-avatar rc-avatar--initials">{initials}</div>
          )}
        </div>

        <div className="rc-identity">
          <p className="rc-name">{name}</p>
          {username && <p className="rc-handle">@{username}</p>}
          {/* Star rating */}
          <div className="rc-rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} className={`rc-star ${n <= r ? "rc-star--on" : "rc-star--off"}`}
                width="12" height="12" viewBox="0 0 24 24"
                fill={n <= r ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
            <span className="rc-rating-val">{r}.0</span>
          </div>
        </div>
      </div>

      {/* ── Bio ── */}
      {bio && <p className="rc-bio">{bio}</p>}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <div className="rc-skills-wrap">
          <p className="rc-skills-label">Can teach</p>
          <div className="rc-skills">
            {skills.slice(0, 6).map((skill, i) => (
              <span key={i} className="rc-skill">{skill}</span>
            ))}
            {skills.length > 6 && (
              <span className="rc-skill rc-skill--more">+{skills.length - 6}</span>
            )}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      {/* <Link
  to={`/profile/${username}`}
  state={{ from: "requests" }}
  style={{ textDecoration: "none", color: "inherit",border: "5px solid #ccc"}}
>
  VIEW FULL PROFILE →
</Link> */}
<Link
  to={`/profile/${username}`}
  state={{ from: "requests" }}
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 18px",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "8px",
    color: "#cccccc",
    fontSize: "0.85rem",
    fontWeight: "600",
    textDecoration: "none",
    transition: "border-color 0.2s, color 0.2s",
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.borderColor = "#ffffff";
    e.currentTarget.style.color = "#ffffff";
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
    e.currentTarget.style.color = "#cccccc";
  }}
>
  View Full Profile →
</Link>
    </div>
  );
};

export default RequestCard;











