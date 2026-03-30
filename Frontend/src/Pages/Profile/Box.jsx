


import React from "react";
import "./Box.css";

const GithubSmIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const LiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const Box = ({ head, date, spec, desc, skills, score, githubLink, liveLink }) => {
  return (
    <div className="bx">
      {/* ── Top row: title + date ── */}
      <div className="bx-top">
        <div className="bx-top-left">
          <h5 className="bx-head">{head}</h5>
          {spec && <span className="bx-spec">{spec}</span>}
        </div>
        {date && <span className="bx-date">{date}</span>}
      </div>

      {/* ── Description ── */}
      {desc && <p className="bx-desc">{desc}</p>}

      {/* ── GitHub / Live links ── */}
      {(githubLink || liveLink) && (
        <div className="bx-links">
          {githubLink && (
            <a href={githubLink} target="_blank" rel="noreferrer" className="bx-link">
              <GithubSmIcon /> GitHub
            </a>
          )}
          {liveLink && (
            <a href={liveLink} target="_blank" rel="noreferrer" className="bx-link">
              <LiveIcon /> Live Demo
            </a>
          )}
        </div>
      )}

      {/* ── Tech stack pills ── */}
      {skills && skills.length > 0 && (
        <div className="bx-footer">
          <span className="bx-footer-label">Stack</span>
          <div className="bx-skills">
            {skills.map((skill, i) => (
              <span key={i} className="bx-skill">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Score / Grade ── */}
      {score && (
        <div className="bx-score">
          <span className="bx-score-label">Grade / Score</span>
          <span className="bx-score-val">{score}</span>
        </div>
      )}
    </div>
  );
};

export default Box;