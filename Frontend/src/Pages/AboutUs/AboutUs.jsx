import React from "react";
import "./AboutUs.css";

const contentContainerStyle = {
  maxWidth: "50vw",
  margin: "60px",
  justifyContent: "center",
};

const titleStyle = {
  fontFamily: "Georgia, serif",
  color: "#ffffff",
  fontSize: "3rem",
  fontWeight: "bold",
  marginBottom: "20px",
  textAlign: "left",
  letterSpacing: "-0.02em",
};

const descriptionStyle = {
  fontFamily: "Montserrat, sans-serif",
  color: "#e0e0e0",
  fontSize: "1rem",
  lineHeight: "1.8",
  textAlign: "left",
  maxHeight: "100vh",
};

const AboutUs = () => {
  return (
    <div className="content1-container">
      <div style={contentContainerStyle}>

        {/* eyebrow label */}
        <div className="about-eyebrow">Our Story</div>

        <h2 style={titleStyle}>About Us</h2>

        {/* decorative divider */}
        <div className="about-divider" />

        <p style={descriptionStyle}>
          <i>
            As students, we have looked for upskilling everywhere. Mostly, we end up paying big amounts to gain
            certifications and learn relevant skills. We thought of SkillSwap to resolve that. Learning new skills and
            gaining more knowledge all while networking with talented people!
          </i>
        </p>
        <p style={descriptionStyle}>
          <br />
          At SkillSwap, we believe in the power of learning and sharing knowledge. Our platform connects individuals
          from diverse backgrounds to exchange practical skills and expertise. Whether you're a seasoned professional
          looking to mentor others or a beginner eager to learn, SkillSwap provides a supportive environment for growth
          and collaboration.
          <br />
          <br />
          Our mission is to empower individuals to unlock their full potential through skill sharing. By facilitating
          meaningful interactions and fostering a culture of lifelong learning, we aim to create a community where
          everyone has the opportunity to thrive.
        </p>

        {/* stat pills */}
        <div className="about-stats">
          <div className="about-stat">
            <span className="about-stat-value">12K+</span>
            <span className="about-stat-label">Members</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-value">340+</span>
            <span className="about-stat-label">Skills</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-value">50+</span>
            <span className="about-stat-label">Countries</span>
          </div>
        </div>

      </div>

      {/* replaced image with illustrated card */}
      <div className="about-visual">
        <div className="about-visual-inner">
          <div className="about-blob blob1" />
          <div className="about-blob blob2" />
          <div className="about-icon-grid">
            {[
              { emoji: "🎸", label: "Guitar" },
              { emoji: "💻", label: "Coding" },
              { emoji: "🎨", label: "Design" },
              { emoji: "📷", label: "Photography" },
              { emoji: "🌍", label: "Languages" },
              { emoji: "🍳", label: "Cooking" },
            ].map((item) => (
              <div key={item.label} className="about-skill-card">
                <span className="about-skill-emoji">{item.emoji}</span>
                <span className="about-skill-label">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="about-visual-tagline">
            Share what you know.<br />Learn what you love.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;















