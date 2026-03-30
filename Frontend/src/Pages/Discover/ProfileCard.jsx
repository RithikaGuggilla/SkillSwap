
import React from "react";
import "./Card.css";
import { Link } from "react-router-dom";

const ProfileCard = ({ profileImageUrl, bio, name, skills, rating, username }) => {
  return (
    <div className="card-container">

      {/* ── Banner + centered floating avatar ── */}
      <div className="card-banner">
        <img
          className="img-container"
          src={profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
          alt={name}
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
          }}
        />
      </div>

      {/* ── Body ── */}
      <div className="card-body-inner">
        <h3>{name}</h3>
        {username && <div className="card-handle">@{username}</div>}

        <h6>
          <span>Rating</span>
          <span className="card-rating-value">{rating ?? "—"}</span>
          <span>⭐</span>
        </h6>

        <p>{bio || "No bio provided."}</p>

        <div className="card-divider" />

        <div className="prof-buttons">
          <Link to={`/profile/${username}`} style={{ flex: 1, textDecoration: "none" }}>
            <button className="primary ghost" style={{ width: "100%" }}>
              View Profile
            </button>
          </Link>
        </div>
      </div>

      {/* ── Skills footer ── */}
      {skills && skills.length > 0 && (
        <div className="profskills">
          <h6>Skills</h6>
          <div className="profskill-boxes">
            {skills.slice(0, 5).map((skill, index) => (
              <div key={index} className="profskill-box">
                <span className="skill">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileCard;