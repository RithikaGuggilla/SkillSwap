






import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [visible, setVisible] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observers = {};
    ["steps", "stats", "testimonials", "cta"].forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      observers[id] = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible((v) => ({ ...v, [id]: true }));
        },
        { threshold: 0.15 }
      );
      observers[id].observe(el);
    });
    return () => Object.values(observers).forEach((o) => o.disconnect());
  }, []);

  const fadeIn = (id, delay = 0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? "translateY(0)" : "translateY(36px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  const steps = [
    {
      icon: "👤",
      title: "Create Your Profile",
      desc: "List the skills you can teach and the skills you want to learn. Your profile helps others discover you and connect meaningfully.",
    },
    {
      icon: "🔍",
      title: "Find Your Match",
      desc: "Our smart matching surfaces people who want to learn what you know — and can teach exactly what you want to gain.",
    },
    {
      icon: "🔄",
      title: "Exchange & Grow",
      desc: "Schedule live sessions, collaborate on projects, and track your progress as you both level up together.",
    },
  ];

  const stats = [
    { value: "12K+", label: "Active Members" },
    { value: "340+", label: "Skills Listed" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "50+", label: "Countries" },
  ];

  const testimonials = [
    {
      name: "Aisha K.",
      role: "Graphic Designer",
      avatar: "https://i.pravatar.cc/64?img=47",
      text: "I traded design tutorials for guitar lessons. Best decision ever — SkillSwap made it effortless.",
    },
    {
      name: "Carlos M.",
      role: "Software Engineer",
      avatar: "https://i.pravatar.cc/64?img=12",
      text: "Found a Spanish tutor in exchange for coding help. The community here is genuinely warm and motivated.",
    },
    {
      name: "Priya S.",
      role: "Yoga Instructor",
      avatar: "https://i.pravatar.cc/64?img=32",
      text: "I never thought I could learn photography without paying. SkillSwap changed that completely.",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        fontFamily: "'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── HERO ── */}
      <section
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 80px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {/* decorative blobs — white tinted */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-60px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", filter: "blur(80px)" }} />
        {/* dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* pill badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "100px",
            padding: "8px 20px",
            color: "#aaaaaa",
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "32px",
            backdropFilter: "blur(8px)",
            animation: "fadeDown 0.8s ease both",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff", display: "inline-block" }} />
          Peer-to-Peer Learning Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            color: "#ffffff",
            fontFamily: "'Georgia', serif",
            fontWeight: "700",
            lineHeight: "1.1",
            marginBottom: "24px",
            letterSpacing: "-0.02em",
            animation: "fadeDown 0.9s ease 0.1s both",
          }}
        >
          Skill<span style={{ color: "#cccccc" }}>Swap</span>
        </h1>

        <p
          style={{
            color: "#bbbbbb",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            maxWidth: "560px",
            lineHeight: "1.7",
            marginBottom: "48px",
            animation: "fadeDown 0.9s ease 0.2s both",
          }}
        >
          Learn new skills by exchanging knowledge with people around the world.
          No money needed — just your expertise and curiosity.
        </p>

        {/* feature pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "56px",
            animation: "fadeDown 0.9s ease 0.3s both",
          }}
        >
          {["👩‍🏫 Learn from others", "🤝 Share your skills", "🌍 Build connections", "🚀 Grow together"].map((f) => (
            <span
              key={f}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "100px",
                padding: "10px 20px",
                color: "#dddddd",
                fontSize: "0.9rem",
                backdropFilter: "blur(6px)",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* hero illustration cards */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeUp 1s ease 0.4s both",
          }}
        >
          {[
            { emoji: "🌐", skill: "Learning", user: "Emma → Carlos" },
            { emoji: "💻", skill: "Coding", user: "Ali → Priya" },
            { emoji: "🎨", skill: "Design", user: "Yui → Sam" },
          ].map((card) => (
            <div
              key={card.skill}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "20px 24px",
                minWidth: "140px",
                backdropFilter: "blur(12px)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{card.emoji}</div>
              <div style={{ color: "white", fontWeight: "600", fontSize: "0.95rem" }}>{card.skill}</div>
              <div style={{ color: "#888888", fontSize: "0.75rem", marginTop: "4px" }}>{card.user}</div>
            </div>
          ))}
        </div>

        {/* scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#666666",
            fontSize: "0.75rem",
            gap: "8px",
            animation: "bounce 2s infinite",
          }}
        >
          <span>Scroll to explore</span>
          <span style={{ fontSize: "1.2rem" }}>↓</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        ref={(el) => (sectionRefs.current["stats"] = el)}
        style={{
          width: "100%",
          background: "#111111",
          padding: "64px 24px",
          display: "flex",
          justifyContent: "center",
          boxSizing: "border-box",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: "900px", width: "100%" }}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 180px",
                textAlign: "center",
                padding: "24px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                ...fadeIn("stats", i * 0.1),
              }}
            >
              <div style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "'Georgia', serif", color: "#ffffff", lineHeight: "1", marginBottom: "8px" }}>
                {s.value}
              </div>
              <div style={{ color: "#888888", fontSize: "0.9rem", fontWeight: "500" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        ref={(el) => (sectionRefs.current["steps"] = el)}
        style={{
          width: "100%",
          maxWidth: "1200px",
          padding: "96px 24px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div id="how-it-works" style={{ ...fadeIn("steps", 0) }}>
          <p style={{ color: "#888888", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.82rem", marginBottom: "12px" }}>
            Simple Process
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#ffffff",
              fontFamily: "'Georgia', serif",
              marginBottom: "16px",
              fontWeight: "700",
            }}
          >
            How SkillSwap Works
          </h2>
          <div style={{ width: "48px", height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "8px", margin: "0 auto 20px" }} />
          <p style={{ color: "#888888", fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto 64px", lineHeight: "1.7" }}>
            A simple three-step process to start exchanging skills with people who match your goals.
          </p>
        </div>

        <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              style={{
                background: "#111111",
                borderRadius: "20px",
                padding: "40px 32px",
                maxWidth: "320px",
                width: "100%",
                textAlign: "left",
                boxShadow: "0 4px 40px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
                boxSizing: "border-box",
                ...fadeIn("steps", 0.15 + i * 0.15),
              }}
            >
              {/* step number watermark */}
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "20px",
                  fontSize: "6rem",
                  fontWeight: "900",
                  color: "rgba(255,255,255,0.04)",
                  fontFamily: "'Georgia', serif",
                  lineHeight: "1",
                  userSelect: "none",
                }}
              >
                {i + 1}
              </div>

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  marginBottom: "20px",
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1.25rem",
                  color: "#ffffff",
                  marginBottom: "12px",
                  fontWeight: "700",
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: "#888888", fontSize: "0.93rem", lineHeight: "1.7", margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SKILLS SHOWCASE BAND ── */}
      <section
        style={{
          width: "100%",
          height: "300px",
          background: "#111111",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "56px 24px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ textAlign: "center", color: "#666666", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "32px" }}>
          Popular Skills Being Exchanged
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {["🌐 React", "💻 Python", "🎨 UI Design", "📖 Java", "📕DSA", "👩🏼‍💻 Web Development", "📝 Content Writing", "🎬 Video Editing", "🎮 Game Development", "📊 Excel", "📚Node.js", "🧠 Problem Solving"].map((s) => (
            <span
              key={s}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "100px",
                padding: "10px 20px",
                color: "#cccccc",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        ref={(el) => (sectionRefs.current["testimonials"] = el)}
        style={{
          width: "100%",
          maxWidth: "1200px",
          padding: "96px 24px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ ...fadeIn("testimonials", 0) }}>
          <p style={{ color: "#888888", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.82rem", marginBottom: "12px" }}>
            Real Stories
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#ffffff",
              fontFamily: "'Georgia', serif",
              marginBottom: "16px",
              fontWeight: "700",
            }}
          >
            People Love SkillSwap
          </h2>
          <div style={{ width: "48px", height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "8px", margin: "0 auto 56px" }} />
        </div>

        <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: "#111111",
                borderRadius: "20px",
                padding: "36px",
                maxWidth: "320px",
                width: "100%",
                textAlign: "left",
                boxShadow: "0 4px 40px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxSizing: "border-box",
                ...fadeIn("testimonials", 0.1 + i * 0.15),
              }}
            >
              <div style={{ fontSize: "1.5rem", color: "#ffffff", marginBottom: "16px", opacity: 0.4 }}>❝</div>
              <p style={{ color: "#cccccc", lineHeight: "1.75", fontSize: "0.95rem", marginBottom: "24px" }}>{t.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)" }}
                />
                <div>
                  <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "0.9rem" }}>{t.name}</div>
                  <div style={{ color: "#888888", fontSize: "0.8rem" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={(el) => (sectionRefs.current["cta"] = el)}
        style={{
          width: "100%",
          background: "#111111",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "100px 24px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", filter: "blur(60px)" }} />
        <div style={{ position: "relative", ...fadeIn("cta", 0) }}>
          <p style={{ color: "#666666", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.82rem", marginBottom: "16px" }}>
            Get Started Today
          </p>
          <h2
            style={{
              color: "white",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontFamily: "'Georgia', serif",
              fontWeight: "700",
              marginBottom: "20px",
              lineHeight: "1.2",
            }}
          >
            Ready to start your<br />skill exchange journey?
          </h2>
          <p style={{ color: "#888888", maxWidth: "480px", margin: "0 auto 40px", lineHeight: "1.7", fontSize: "1.05rem" }}>
            Join thousands of learners and teachers already exchanging skills and growing together — for free.
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "white",
              color: "#0a0a0a",
              border: "none",
              padding: "16px 40px",
              borderRadius: "100px",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: "0 8px 32px rgba(255,255,255,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.transform = "scale(1.04)"; e.target.style.boxShadow = "0 12px 40px rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 8px 32px rgba(255,255,255,0.08)"; }}
          >
            Login / Register
          </button>
        </div>
      </section>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;