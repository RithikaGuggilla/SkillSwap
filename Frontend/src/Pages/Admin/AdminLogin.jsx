// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const AdminLogin = () => {
//   const [email, setEmail]       = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading]   = useState(false);
//   const [error, setError]       = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true); setError("");
//     try {
//       await axios.post("/admin/login", { email, password }, { withCredentials: true });
//       navigate("/admin/dashboard");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Invalid credentials");
//     } finally { setLoading(false); }
//   };

//   return (
//     <div style={s.page}>
//       <div style={s.card}>
//         <div style={s.logo}>⚙️</div>
//         <h1 style={s.title}>Admin Portal</h1>
//         <p style={s.sub}>SkillSwap Administration</p>

//         {error && <div style={s.error}>{error}</div>}

//         <form onSubmit={handleLogin} style={s.form}>
//           <div style={s.field}>
//             <label style={s.label}>Email</label>
//             <input
//               style={s.input} type="email" value={email}
//               onChange={e => setEmail(e.target.value)}
//               placeholder="admin@skillswap.com" required
//             />
//           </div>
//           <div style={s.field}>
//             <label style={s.label}>Password</label>
//             <input
//               style={s.input} type="password" value={password}
//               onChange={e => setPassword(e.target.value)}
//               placeholder="••••••••" required
//             />
//           </div>
//           <button style={s.btn} type="submit" disabled={loading}>
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const s = {
//   page: {
//     minHeight: "100vh", background: "#0a0a0a",
//     display: "flex", alignItems: "center", justifyContent: "center",
//   },
//   card: {
//     background: "#111", border: "1px solid rgba(255,255,255,0.08)",
//     borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400,
//     textAlign: "center",
//   },
//   logo: { fontSize: "2rem", marginBottom: 16 },
//   title: {
//     fontFamily: "Syne, sans-serif", fontSize: "1.4rem",
//     fontWeight: 700, color: "#fff", margin: "0 0 6px",
//   },
//   sub: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.65rem",
//     color: "#555", letterSpacing: "0.1em", textTransform: "uppercase",
//     marginBottom: 28,
//   },
//   error: {
//     background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
//     color: "#ef4444", borderRadius: 8, padding: "10px 14px",
//     fontSize: "0.8rem", marginBottom: 16, fontFamily: "Syne, sans-serif",
//   },
//   form: { display: "flex", flexDirection: "column", gap: 16, textAlign: "left" },
//   field: { display: "flex", flexDirection: "column", gap: 6 },
//   label: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.62rem",
//     color: "#888", letterSpacing: "0.1em", textTransform: "uppercase",
//   },
//   input: {
//     background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: 10, padding: "12px 14px", color: "#fff",
//     fontFamily: "Syne, sans-serif", fontSize: "0.88rem", outline: "none",
//   },
//   btn: {
//     background: "#fff", color: "#000", border: "none",
//     borderRadius: 10, padding: "13px", fontFamily: "DM Mono, monospace",
//     fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
//     textTransform: "uppercase", cursor: "pointer", marginTop: 8,
//   },
// };

// export default AdminLogin;




















































































import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState ( false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post("/admin/login", { email, password }, { withCredentials: true });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>⚙️</div>
        <h1 style={s.title}>Admin Portal</h1>
        <p style={s.sub}>SkillSwap Administration</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@skillswap.com" required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
            />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e3edf7 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dde6f5",
    borderRadius: 20,
    padding: "44px 40px",
    width: "100%", maxWidth: 420,
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(37,99,235,0.10)",
  },
  logo: { fontSize: "2rem", marginBottom: 16 },
  title: {
    fontFamily: "Syne, sans-serif", fontSize: "1.5rem",
    fontWeight: 700, color: "#1a2a4a", margin: "0 0 6px",
  },
  sub: {
    fontFamily: "DM Mono, monospace", fontSize: "0.65rem",
    color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 28,
  },
  error: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#dc2626", borderRadius: 8, padding: "10px 14px",
    fontSize: "0.8rem", marginBottom: 16, fontFamily: "Syne, sans-serif",
  },
  form: { display: "flex", flexDirection: "column", gap: 16, textAlign: "left" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontFamily: "DM Mono, monospace", fontSize: "0.62rem",
    color: "#6677aa", letterSpacing: "0.1em", textTransform: "uppercase",
  },
  input: {
    background: "#f5f8ff",
    border: "1px solid #c8d8f0",
    borderRadius: 10, padding: "12px 14px", color: "#1a2a4a",
    fontFamily: "Syne, sans-serif", fontSize: "0.88rem", outline: "none",
  },
  btn: {
    background: "#2563eb", color: "#fff", border: "none",
    borderRadius: 10, padding: "13px", fontFamily: "DM Mono, monospace",
    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", cursor: "pointer", marginTop: 8,
  },
};

export default AdminLogin;