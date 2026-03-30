
import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [googleHovered, setGoogleHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required.";
    if (!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(email))
      return "Enter a valid email address.";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password))
      return "Must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password))
      return "Must contain at least one number.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    if (name === "email")
      setFieldErrors((p) => ({ ...p, email: validateEmail(value) }));
    if (name === "password")
      setFieldErrors((p) => ({ ...p, password: validatePassword(value) }));
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    setFieldErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
      } else {
        window.location.href =
          data.data?.redirect || "http://localhost:5173/discover";
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  /* ─────────────── STYLES ─────────────── */
  const s = {
    container: {
      minHeight: "90.4vh",
      display: "flex",
      flexDirection: "row",
      backgroundColor: "#0a0a0a",
      overflow: "hidden",
    },
    left: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "80px 72px",
      background: "#0a0a0a",
      position: "relative",
    },
    right: {
      width: "500px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#111111",
      borderLeft: "1px solid rgba(255,255,255,0.07)",
      padding: "64px 48px",
      position: "relative",
      overflow: "hidden",
    },
    box: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      position: "relative",
      zIndex: 1,
    },
    eyebrow: {
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: "8px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "100px",
      padding: "6px 14px",
      color: "#888",
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.75rem",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    title: {
      fontSize: "2.8rem",
      fontFamily: "Georgia, serif",
      color: "#fff",
      fontWeight: "700",
      letterSpacing: "-0.02em",
      margin: 0,
    },
    subtitle: {
      fontFamily: "Montserrat, sans-serif",
      color: "#666",
      fontSize: "0.9rem",
      marginTop: "6px",
      lineHeight: "1.6",
    },
    divider: {
      width: "40px",
      height: "2px",
      background: "rgba(255,255,255,0.15)",
      borderRadius: "4px",
    },
    fieldWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#666",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    input: (hasError) => ({
      width: "100%",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: "10px",
      padding: "12px 14px",
      color: "#fff",
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    }),
    pwWrap: { position: "relative" },
    pwInput: (hasError) => ({
      width: "100%",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: "10px",
      padding: "12px 42px 12px 14px",
      color: "#fff",
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    }),
    eyeBtn: {
      position: "absolute",
      right: "13px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#555",
      padding: 0,
      display: "flex",
      alignItems: "center",
    },
    fieldError: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.73rem",
      color: "#f87171",
    },
    errorBox: {
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: "10px",
      padding: "10px 14px",
      color: "#f87171",
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.8rem",
    },
    submitBtn: (hov) => ({
      width: "100%",
      padding: "13px",
      borderRadius: "100px",
      border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      background: hov && !loading ? "#e5e5e5" : "#fff",
      color: "#0a0a0a",
      fontFamily: "Montserrat, sans-serif",
      fontWeight: "700",
      fontSize: "0.92rem",
      letterSpacing: "0.02em",
      transition: "background 0.2s",
      opacity: loading ? 0.7 : 1,
    }),
    orRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    orLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" },
    orText: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: "0.72rem",
      color: "#444",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      flexShrink: 0,
    },
    googleBtn: (hov) => ({
      width: "100%",
      padding: "13px",
      borderRadius: "100px",
      border: "1px solid rgba(255,255,255,0.15)",
      cursor: "pointer",
      background: hov ? "rgba(255,255,255,0.06)" : "transparent",
      color: "#fff",
      fontFamily: "Montserrat, sans-serif",
      fontWeight: "600",
      fontSize: "0.92rem",
      letterSpacing: "0.02em",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "background 0.2s",
    }),
  };

  return (
    <div style={s.container}>
      {/* ── LEFT PANEL ── */}
      <div style={s.left}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "480px" }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "48px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M6 8 L20 8 L20 22"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M6 8 L20 22"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M22 20 L8 20 L8 6"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M22 20 L8 6"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: "700",
                fontSize: "1.1rem",
                color: "#fff",
              }}
            >
              Skill
              <span style={{ color: "#aaa", fontWeight: "400" }}>Swap</span>
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "#fff",
              fontWeight: "700",
              lineHeight: "1.15",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Learn by sharing.
            <br />
            <span style={{ color: "#888" }}>Grow together.</span>
          </h2>

          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#666",
              fontSize: "1rem",
              lineHeight: "1.75",
              marginBottom: "48px",
            }}
          >
            Exchange skills with people around the world — no money needed, just
            your knowledge and curiosity.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "👩‍🏫", text: "Teach what you know" },
              { icon: "🔍", text: "Find your perfect match" },
              { icon: "🌍", text: "Connect with 12K+ members" },
            ].map((item) => (
              <div
                key={item.text}
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#999",
                    fontSize: "0.92rem",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={s.right}>
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.02)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={s.box}>
          {/* Eyebrow */}
          <div style={s.eyebrow}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#fff",
                display: "inline-block",
                opacity: 0.5,
              }}
            />
            Welcome back
          </div>

          {/* Title */}
          <div>
            <h1 style={s.title}>Sign in</h1>
            <p style={s.subtitle}>Access your SkillSwap account.</p>
          </div>

          <div style={s.divider} />

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                style={s.input(!!fieldErrors.email)}
                onFocus={(e) =>
                  (e.target.style.borderColor = fieldErrors.email
                    ? "rgba(239,68,68,0.6)"
                    : "rgba(255,255,255,0.3)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = fieldErrors.email
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.1)")
                }
              />
              {fieldErrors.email && (
                <span style={s.fieldError}>⚠ {fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <div style={s.pwWrap}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  style={s.pwInput(!!fieldErrors.password)}
                  onFocus={(e) =>
                    (e.target.style.borderColor = fieldErrors.password
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(255,255,255,0.3)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = fieldErrors.password
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(255,255,255,0.1)")
                  }
                />
                <button
                  style={s.eyeBtn}
                  onClick={() => setShowPassword((p) => !p)}
                  type="button"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={s.fieldError}>⚠ {fieldErrors.password}</span>
              )}
            </div>

            {/* Global error from server */}
            {error && <div style={s.errorBox}>⚠ {error}</div>}

            {/* Submit */}
            <button
              style={s.submitBtn(submitHovered)}
              onMouseEnter={() => setSubmitHovered(true)}
              onMouseLeave={() => setSubmitHovered(false)}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>

          {/* OR divider */}
          <div style={s.orRow}>
            <div style={s.orLine} />
            <span style={s.orText}>or</span>
            <div style={s.orLine} />
          </div>

          {/* Google */}
          <button
            style={s.googleBtn(googleHovered)}
            onMouseEnter={() => setGoogleHovered(true)}
            onMouseLeave={() => setGoogleHovered(false)}
            onClick={handleGoogleLogin}
          >
            <FaGoogle size={15} /> Continue with Google
          </button>

          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#444",
              fontSize: "0.72rem",
              textAlign: "center",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;