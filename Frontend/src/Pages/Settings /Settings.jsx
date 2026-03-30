


import React, { useState } from "react";
import "./Settings.css";
import axios from "axios";
import { useUser } from "../../util/UserContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [name, setName]     = useState(user?.name || "");
  const [email]             = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data } = await axios.patch("/user/updateAccount", { name });
      setUser(data.data);
      localStorage.setItem("userInfo", JSON.stringify(data.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await axios.delete("/user/deleteAccount");

      // Clear everything
      localStorage.removeItem("userInfo");
      setUser(null);

      // ── Redirect to Google with fresh=true so account picker shows ──
      // This prevents auto-login back into registration
      window.location.href = "http://localhost:8000/auth/google?fresh=true";

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="st-page">
      <div className="st-bg-grid" />

      <button className="st-back" onClick={() => navigate(-1)} aria-label="Go back">
        <span className="st-back-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        Back
      </button>

      <div className="st-card">
        <div className="st-header">
          <span className="st-header-label">PROFILE</span>
          <h1 className="st-title">Account Settings</h1>
          <p className="st-subtitle">Manage your personal information and account preferences</p>
        </div>

        <div className="st-body">
          <div className="st-field">
            <label className="st-label">Name</label>
            <input className="st-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>

          <div className="st-field">
            <label className="st-label">Email</label>
            <input className="st-input" value={email} disabled placeholder="your@email.com" />
            <span className="st-input-hint">Email cannot be changed</span>
          </div>

          <button className={`st-save ${saved ? "st-save--done" : ""}`} onClick={handleSave} disabled={loading || saved}>
            {loading ? <span className="st-spinner" /> : saved ? <>✓ Changes Saved</> : "Save Changes"}
          </button>

          <div className="st-divider" />
          <span className="st-danger-zone-label">Danger Zone</span>

          <button className="st-delete" onClick={handleDelete}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;