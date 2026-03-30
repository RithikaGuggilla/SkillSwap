import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Banned = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.get("/auth/logout");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Syne, sans-serif",
    }}>
      <div style={{
        background: "#111", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 16, padding: "48px 40px", maxWidth: 440,
        textAlign: "center",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>🚫</div>
        <h1 style={{
          fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem",
          fontWeight: 700, color: "#fff", marginBottom: 12,
        }}>Account Suspended</h1>
        <p style={{
          color: "#888", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 28,
        }}>
          Your account has been suspended due to a violation of SkillSwap's community guidelines.
          If you believe this is a mistake, please contact us.
        </p>
        <a href="mailto:skillswap@gmail.com" style={{
          display: "block", background: "transparent",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#ccc", borderRadius: 10, padding: "12px 24px",
          fontFamily: "DM Mono, monospace", fontSize: "0.65rem",
          letterSpacing: "0.1em", textTransform: "uppercase",
          textDecoration: "none", marginBottom: 12,
        }}>
          Contact Support
        </a>
        <button onClick={handleLogout} style={{
          background: "transparent", border: "none",
          color: "#555", fontFamily: "DM Mono, monospace",
          fontSize: "0.62rem", cursor: "pointer",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Banned;