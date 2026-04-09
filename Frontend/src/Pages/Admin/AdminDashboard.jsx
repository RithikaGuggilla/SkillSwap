// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   AreaChart, Area, BarChart, Bar,
//   XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell, Legend,
// } from "recharts";

// /* ── Stat Card ── */
// const StatCard = ({ label, value, sub, color = "#fff" }) => (
//   <div style={s.statCard}>
//     <div style={{ ...s.statVal, color }}>{value}</div>
//     <div style={s.statLabel}>{label}</div>
//     {sub && <div style={s.statSub}>{sub}</div>}
//   </div>
// );

// /* ── Admin Dashboard ── */
// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [stats, setStats]     = useState(null);
//   const [users, setUsers]     = useState([]);
//   const [reports, setReports] = useState([]);
//   const [tab, setTab]         = useState("overview");
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch]   = useState("");

//   useEffect(() => { fetchAll(); }, []);

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const [st, us, rp] = await Promise.all([
//         axios.get("/admin/stats",   { withCredentials: true }),
//         axios.get("/admin/users",   { withCredentials: true }),
//         axios.get("/admin/reports", { withCredentials: true }),
//       ]);
//       setStats(st.data.data);
//       setUsers(us.data.data);
//       setReports(rp.data.data);
//     } catch (err) {
//       if (err?.response?.status === 401) navigate("/admin/login");
//     } finally { setLoading(false); }
//   };

//   const handleBan = async (userId, isBanned) => {
//     const url = isBanned ? `/admin/users/${userId}/unban` : `/admin/users/${userId}/ban`;
//     await axios.put(url, {}, { withCredentials: true });
//     setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Permanently delete this user?")) return;
//     await axios.delete(`/admin/users/${userId}`, { withCredentials: true });
//     setUsers(prev => prev.filter(u => u._id !== userId));
//   };

//   const handleReport = async (reportId, action) => {
//     await axios.put(`/admin/reports/${reportId}/${action}`, {}, { withCredentials: true });
//     setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: action === "resolve" ? "Resolved" : "Dismissed" } : r));
//   };

//   const handleLogout = async () => {
//     await axios.post("/admin/logout", {}, { withCredentials: true });
//     navigate("/admin/login");
//   };

//   const filteredUsers = users.filter(u =>
//     u.name?.toLowerCase().includes(search.toLowerCase()) ||
//     u.username?.toLowerCase().includes(search.toLowerCase()) ||
//     u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   const pendingReports = reports.filter(r => r.status === "Pending");

//   if (loading) return (
//     <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <div style={{ color: "#555", fontFamily: "DM Mono, monospace", fontSize: "0.75rem" }}>Loading...</div>
//     </div>
//   );

//   return (
//     <div style={s.page}>
//       {/* Sidebar */}
//       <div style={s.sidebar}>
//         <div style={s.sidebarTop}>
//           <div style={s.sidebarLogo}>⚙️ Admin</div>
//           <nav style={s.nav}>
//             {[
//               { key: "overview", label: "Overview" },
//               { key: "users",    label: `Users (${users.length})` },
//               { key: "reports",  label: `Reports ${pendingReports.length > 0 ? `(${pendingReports.length})` : ""}` },
//             ].map(item => (
//               <button
//                 key={item.key}
//                 style={{ ...s.navItem, ...(tab === item.key ? s.navItemActive : {}) }}
//                 onClick={() => setTab(item.key)}
//               >
//                 {item.label}
//                 {item.key === "reports" && pendingReports.length > 0 && (
//                   <span style={s.badge}>{pendingReports.length}</span>
//                 )}
//               </button>
//             ))}
//           </nav>
//         </div>
//         <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
//       </div>

//       {/* Main */}
//       <div style={s.main}>

//         {/* ── OVERVIEW TAB ── */}
//         {tab === "overview" && (
//           <div>
//             <h1 style={s.pageTitle}>Dashboard Overview</h1>
//             <div style={s.statsGrid}>
              
//               <StatCard label="Total Users"      value={stats?.totalUsers}       sub={`+${stats?.newUsersThisWeek} this week`} />
//               <StatCard label="Banned Users"     value={stats?.bannedUsers}      color="#ef4444" />
//               <StatCard label="Total Sessions"   value={stats?.totalSessions} />
//               <StatCard label="Total Connections" value={stats?.totalConnections} />
//               <StatCard label="Total Ratings"    value={stats?.totalRatings} />
//               <StatCard label="Pending Reports"  value={stats?.pendingReports}   color={stats?.pendingReports > 0 ? "#f59e0b" : "#fff"} />
//             </div>
//           <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 30 }}>

//   <div style={s.chartCard}>
//     <div style={s.chartTitle}>User Growth vs Reports</div>

//     <ResponsiveContainer width="100%" height={250}>
//       <AreaChart
//         data={stats?.charts?.users.map((u, i) => ({
//           month: u.month,
//           users: u.count,
//           reports: stats?.charts?.reports[i]?.count || 0,
//         }))}
//       >
//         <CartesianGrid strokeDasharray="3 3" stroke="#222" />
//         <XAxis dataKey="month" stroke="#666" />
//         <YAxis stroke="#666" />
//         <Tooltip />
//         <Area type="monotone" dataKey="users" stroke="#22c55e" fill="#22c55e33" />
//         <Area type="monotone" dataKey="reports" stroke="#ef4444" fill="#ef444433" />
//       </AreaChart>
//     </ResponsiveContainer>
//   </div>

//   <div style={s.chartCard}>
//     <div style={s.chartTitle}>Sessions</div>

//     <ResponsiveContainer width="100%" height={250}>
//       <BarChart data={stats?.charts?.sessions}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#222" />
//         <XAxis dataKey="month" stroke="#666" />
//         <YAxis stroke="#666" />
//         <Tooltip />
//         <Bar dataKey="count" fill="#3b82f6" />
//       </BarChart>
//     </ResponsiveContainer>
//   </div>

// </div>

// <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

//   {/* 📊 Pie Chart */}
//   <div style={s.chartCard}>
//     <div style={s.chartTitle}>Platform Distribution</div>

//     <ResponsiveContainer width="100%" height={260}>
//       <PieChart>
//         <Pie
//           data={[
//             { name: "Users", value: stats?.totalUsers },
//             { name: "Reports", value: stats?.totalReports },
//             { name: "Sessions", value: stats?.totalSessions },
//           ]}
//           dataKey="value"
//           innerRadius={50}
//           outerRadius={90}
//         >
//           <Cell fill="#22c55e" />
//           <Cell fill="#ef4444" />
//           <Cell fill="#3b82f6" />
//         </Pie>
//         <Tooltip />
//         <Legend />
//       </PieChart>
//     </ResponsiveContainer>
//   </div>

//   {/* 📈 Insights Card */}
//   <div style={s.chartCard}>
//     <div style={s.chartTitle}>Quick Insights</div>

//     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

//       <div>
//         <div style={{ color: "#666", fontSize: "0.7rem" }}>User Growth</div>
//         <div style={{ color: "#22c55e", fontSize: "1.4rem", fontWeight: 600 }}>
//           +{stats?.newUsersThisWeek}
//         </div>
//       </div>

//       <div>
//         <div style={{ color: "#666", fontSize: "0.7rem" }}>Pending Reports</div>
//         <div style={{ color: "#f59e0b", fontSize: "1.4rem", fontWeight: 600 }}>
//           {stats?.pendingReports}
//         </div>
//       </div>

//       <div>
//         <div style={{ color: "#666", fontSize: "0.7rem" }}>Connections</div>
//         <div style={{ color: "#3b82f6", fontSize: "1.4rem", fontWeight: 600 }}>
//           {stats?.totalConnections}
//         </div>
//       </div>

//       <div>
//         <div style={{ color: "#666", fontSize: "0.7rem" }}>Avg Rating</div>
//         <div style={{ color: "#f0b429", fontSize: "1.4rem", fontWeight: 600 }}>
//           ⭐ {stats?.totalRatings}
//         </div>
//       </div>

//     </div>
//   </div>

// </div>

//             {/* Recent reports summary */}
//             {pendingReports.length > 0 && (
//               <div style={s.section}>
//                 <h2 style={s.sectionTitle}>Pending Reports</h2>
//                 <div style={s.table}>
//                   <div style={s.tableHead}>
//                     <span>Reported User</span>
//                     <span>Reporter</span>
//                     <span>Issue</span>
//                     <span>Actions</span>
//                   </div>
//                   {pendingReports.slice(0, 5).map(r => (
//                     <div key={r._id} style={s.tableRow}>
//                       <span style={s.userCell}>
//                         <img src={r.reported?.picture} style={s.miniAvatar} alt="" />
//                         @{r.reported?.username}
//                       </span>
//                       <span style={{ color: "#888", fontSize: "0.78rem" }}>@{r.reporter?.username}</span>
//                       <span style={s.natureBadge}>{r.nature}</span>
//                       <div style={{ display: "flex", gap: 8 }}>
//                         <button style={s.resolveBtn} onClick={() => handleReport(r._id, "resolve")}>Resolve</button>
//                         <button style={s.dismissBtn} onClick={() => handleReport(r._id, "dismiss")}>Dismiss</button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── USERS TAB ── */}
//         {tab === "users" && (
//           <div>
//             <h1 style={s.pageTitle}>All Users</h1>
//             <input
//               style={s.searchInput}
//               placeholder="Search by name, username or email..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             <div style={s.table}>
//               <div style={s.tableHead}>
//                 <span>User</span>
//                 <span>Email</span>
//                 <span>Rating</span>
//                 <span>Status</span>
//                 <span>Actions</span>
//               </div>
//               {filteredUsers.map(u => (
//                 <div key={u._id} style={s.tableRow}>
//                   <span style={s.userCell}>
//                     <img src={u.picture} style={s.miniAvatar} alt="" onError={e => e.target.style.display = "none"} />
//                     <div>
//                       <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{u.name}</div>
//                       <div style={{ color: "#555", fontSize: "0.68rem" }}>@{u.username}</div>
//                     </div>
//                   </span>
//                   <span style={{ color: "#888", fontSize: "0.75rem" }}>{u.email}</span>
//                   <span style={{ color: "#f0b429", fontSize: "0.78rem" }}>⭐ {Number(u.rating || 0).toFixed(1)}</span>
//                   <span style={{
//                     ...s.statusBadge,
//                     background: u.isBanned ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
//                     color: u.isBanned ? "#ef4444" : "#22c55e",
//                     border: `1px solid ${u.isBanned ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
//                   }}>
//                     {u.isBanned ? "Banned" : "Active"}
//                   </span>
//                   <div style={{ display: "flex", gap: 8 }}>
//                     <button
//                       style={u.isBanned ? s.unbanBtn : s.banBtn}
//                       onClick={() => handleBan(u._id, u.isBanned)}
//                     >
//                       {u.isBanned ? "Unban" : "Ban"}
//                     </button>
//                     <button style={s.deleteBtn} onClick={() => handleDeleteUser(u._id)}>Delete</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── REPORTS TAB ── */}
//         {tab === "reports" && (
//           <div>
//             <h1 style={s.pageTitle}>All Reports</h1>
//             <div style={s.table}>
//               <div style={s.tableHead}>
//                 <span>Reported</span>
//                 <span>Reporter</span>
//                 <span>Issue</span>
//                 <span>Description</span>
//                 <span>Status</span>
//                 <span>Actions</span>
//               </div>
//               {reports.map(r => (
//                 <div key={r._id} style={s.tableRow}>
//                   <span style={s.userCell}>
//                     <img src={r.reported?.picture} style={s.miniAvatar} alt="" />
//                     <div>
//                       <div style={{ color: "#fff", fontSize: "0.8rem" }}>{r.reported?.name}</div>
//                       <div style={{ color: "#555", fontSize: "0.65rem" }}>@{r.reported?.username}</div>
//                     </div>
//                   </span>
//                   <span style={{ color: "#888", fontSize: "0.75rem" }}>@{r.reporter?.username}</span>
//                   <span style={s.natureBadge}>{r.nature}</span>
//                   <span style={{ color: "#666", fontSize: "0.72rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                     {r.description}
//                   </span>
//                   <span style={{
//                     ...s.statusBadge,
//                     background: r.status === "Pending" ? "rgba(245,158,11,0.1)" : r.status === "Resolved" ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
//                     color: r.status === "Pending" ? "#f59e0b" : r.status === "Resolved" ? "#22c55e" : "#6b7280",
//                     border: `1px solid ${r.status === "Pending" ? "rgba(245,158,11,0.3)" : r.status === "Resolved" ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.3)"}`,
//                   }}>
//                     {r.status}
//                   </span>
//                   {r.status === "Pending" ? (
//                     <div style={{ display: "flex", gap: 8 }}>
//                       <button style={s.resolveBtn} onClick={() => handleReport(r._id, "resolve")}>Resolve</button>
//                       <button style={s.dismissBtn} onClick={() => handleReport(r._id, "dismiss")}>Dismiss</button>
//                     </div>
//                   ) : (
//                     <span style={{ color: "#555", fontSize: "0.7rem" }}>—</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const s = {
//   page: { display: "flex", minHeight: "100vh", background: "#0a0a0a", fontFamily: "Syne, sans-serif" },
  
//   // Sidebar
//   sidebar: {
//     width: 220, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,0.06)",
//     display: "flex", flexDirection: "column", justifyContent: "space-between",
//     padding: "28px 16px", position: "sticky", top: 0, height: "100vh",
//   },
//   sidebarTop: { display: "flex", flexDirection: "column", gap: 32 },
//   sidebarLogo: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.85rem",
//     color: "#fff", letterSpacing: "0.1em", padding: "0 8px",
//   },
//   nav: { display: "flex", flexDirection: "column", gap: 4 },
//   navItem: {
//     background: "transparent", border: "none", color: "#666",
//     fontFamily: "Syne, sans-serif", fontSize: "0.82rem",
//     padding: "10px 12px", borderRadius: 8, cursor: "pointer",
//     textAlign: "left", transition: "all 0.15s",
//     display: "flex", alignItems: "center", justifyContent: "space-between",
//   },
//   navItemActive: { background: "rgba(255,255,255,0.06)", color: "#fff" },
//   badge: {
//     background: "#ef4444", color: "#fff", borderRadius: 10,
//     padding: "1px 7px", fontSize: "0.6rem", fontWeight: 700,
//     fontFamily: "DM Mono, monospace",
//   },
//   logoutBtn: {
//     background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
//     color: "#555", borderRadius: 8, padding: "10px", cursor: "pointer",
//     fontFamily: "DM Mono, monospace", fontSize: "0.62rem",
//     letterSpacing: "0.1em", textTransform: "uppercase",
//   },

//   // Main
//   main: { flex: 1, padding: "40px 40px", overflowY: "auto" },
//   pageTitle: {
//     fontFamily: "Cormorant Garamond, serif", fontSize: "2rem",
//     fontWeight: 700, color: "#fff", marginBottom: 28,
//   },

//   // Stats
//   statsGrid: {
//     display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//     gap: 16, marginBottom: 40,
//   },
//   statCard: {
//     background: "#111", border: "1px solid rgba(255,255,255,0.07)",
//     borderRadius: 12, padding: "20px 22px",
//   },
//   statVal: {
//     fontFamily: "Cormorant Garamond, serif", fontSize: "2rem",
//     fontWeight: 700, lineHeight: 1, marginBottom: 6,
//   },
//   statLabel: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     color: "#555", letterSpacing: "0.1em", textTransform: "uppercase",
//   },
//   statSub: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.58rem",
//     color: "#22c55e", marginTop: 4,
//   },

//   // Section
//   section: { marginBottom: 32 },
//   sectionTitle: {
//     fontFamily: "Syne, sans-serif", fontSize: "0.9rem",
//     fontWeight: 600, color: "#aaa", marginBottom: 16,
//     letterSpacing: "0.04em",
//   },

//   // Search
//   searchInput: {
//     background: "#111", border: "1px solid rgba(255,255,255,0.08)",
//     borderRadius: 10, padding: "12px 16px", color: "#fff",
//     fontFamily: "Syne, sans-serif", fontSize: "0.85rem",
//     outline: "none", width: "100%", maxWidth: 400, marginBottom: 20,
//     display: "block",
//   },

//   // Table
//   table: {
//     background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.06)",
//     borderRadius: 12, overflow: "hidden",
//   },
//   tableHead: {
//     display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
//     padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
//     fontFamily: "DM Mono, monospace", fontSize: "0.58rem",
//     color: "#555", letterSpacing: "0.1em", textTransform: "uppercase",
//     gap: 12,
//   },
//   tableRow: {
//     display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
//     padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
//     alignItems: "center", gap: 12, transition: "background 0.15s",
//   },
//   userCell: { display: "flex", alignItems: "center", gap: 10 },
//   miniAvatar: {
//     width: 32, height: 32, borderRadius: "50%",
//     objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)",
//     flexShrink: 0,
//   },
//   natureBadge: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: 6, padding: "3px 8px", color: "#aaa",
//   },
//   statusBadge: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     borderRadius: 6, padding: "3px 10px", width: "fit-content",
//   },

//   // Charts
//   chartCard: {
//     background: "#0d0d0d",
//     border: "1px solid rgba(255,255,255,0.06)",
//     borderRadius: 12, padding: "20px 20px 10px",
//   },
//   chartTitle: {
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     color: "#555", letterSpacing: "0.1em",
//     textTransform: "uppercase", marginBottom: 16,
//   },

//   // Buttons
//   banBtn: {
//     background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
//     color: "#ef4444", borderRadius: 6, padding: "5px 12px",
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     cursor: "pointer", letterSpacing: "0.06em",
//   },
//   unbanBtn: {
//     background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
//     color: "#22c55e", borderRadius: 6, padding: "5px 12px",
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     cursor: "pointer", letterSpacing: "0.06em",
//   },
//   deleteBtn: {
//     background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
//     color: "#666", borderRadius: 6, padding: "5px 12px",
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     cursor: "pointer",
//   },
//   resolveBtn: {
//     background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
//     color: "#22c55e", borderRadius: 6, padding: "5px 12px",
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     cursor: "pointer",
//   },
//   dismissBtn: {
//     background: "rgba(107,114,128,0.1)", border: "1px solid rgba(107,114,128,0.3)",
//     color: "#9ca3af", borderRadius: 6, padding: "5px 12px",
//     fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
//     cursor: "pointer",
//   },
// };

// export default AdminDashboard;













































































import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const StatCard = ({ label, value, sub, color = "#1a2a4a" }) => (
  <div style={s.statCard}>
    <div style={{ ...s.statVal, color }}>{value}</div>
    <div style={s.statLabel}>{label}</div>
    {sub && <div style={s.statSub}>{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [reports, setReports] = useState([]);
  const [tab, setTab]         = useState("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [st, us, rp] = await Promise.all([
        axios.get("/admin/stats",   { withCredentials: true }),
        axios.get("/admin/users",   { withCredentials: true }),
        axios.get("/admin/reports", { withCredentials: true }),
      ]);
      setStats(st.data.data);
      setUsers(us.data.data);
      setReports(rp.data.data);
    } catch (err) {
      if (err?.response?.status === 401) navigate("/admin/login");
    } finally { setLoading(false); }
  };

  const handleBan = async (userId, isBanned) => {
    const url = isBanned ? `/admin/users/${userId}/unban` : `/admin/users/${userId}/ban`;
    await axios.put(url, {}, { withCredentials: true });
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user?")) return;
    await axios.delete(`/admin/users/${userId}`, { withCredentials: true });
    setUsers(prev => prev.filter(u => u._id !== userId));
  };

  const handleReport = async (reportId, action) => {
    await axios.put(`/admin/reports/${reportId}/${action}`, {}, { withCredentials: true });
    setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: action === "resolve" ? "Resolved" : "Dismissed" } : r));
  };

  const handleLogout = async () => {
    await axios.post("/admin/logout", {}, { withCredentials: true });
    navigate("/admin/login");
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingReports = reports.filter(r => r.status === "Pending");

  if (loading) return (
    <div style={{ background: "#f0f4ff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8899bb", fontFamily: "DM Mono, monospace", fontSize: "0.75rem" }}>Loading...</div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.sidebarLogo}>⚙️ Admin</div>
          <nav style={s.nav}>
            {[
              { key: "overview", label: "Overview" },
              { key: "users",    label: `Users (${users.length})` },
              { key: "reports",  label: `Reports ${pendingReports.length > 0 ? `(${pendingReports.length})` : ""}` },
            ].map(item => (
              <button
                key={item.key}
                style={{ ...s.navItem, ...(tab === item.key ? s.navItemActive : {}) }}
                onClick={() => setTab(item.key)}
              >
                {item.label}
                {item.key === "reports" && pendingReports.length > 0 && (
                  <span style={s.badge}>{pendingReports.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main */}
      <div style={s.main}>

        {tab === "overview" && (
          <div>
            <h1 style={s.pageTitle}>Dashboard Overview</h1>
            <div style={s.statsGrid}>
              <StatCard label="Total Users"       value={stats?.totalUsers}       sub={`+${stats?.newUsersThisWeek} this week`} color="#2563eb" />
              <StatCard label="Banned Users"      value={stats?.bannedUsers}      color="#ef4444" />
              <StatCard label="Total Sessions"    value={stats?.totalSessions}    color="#1a2a4a" />
              <StatCard label="Total Connections" value={stats?.totalConnections} color="#1a2a4a" />
              <StatCard label="Total Ratings"     value={stats?.totalRatings}     color="#1a2a4a" />
              <StatCard label="Pending Reports"   value={stats?.pendingReports}   color={stats?.pendingReports > 0 ? "#f59e0b" : "#1a2a4a"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 30 }}>
              <div style={s.chartCard}>
                <div style={s.chartTitle}>User Growth vs Reports</div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats?.charts?.users.map((u, i) => ({
                    month: u.month,
                    users: u.count,
                    reports: stats?.charts?.reports[i]?.count || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde6f5" />
                    <XAxis dataKey="month" stroke="#8899bb" />
                    <YAxis stroke="#8899bb" />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#2563eb" fill="#2563eb22" />
                    <Area type="monotone" dataKey="reports" stroke="#ef4444" fill="#ef444422" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={s.chartCard}>
                <div style={s.chartTitle}>Sessions</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.charts?.sessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde6f5" />
                    <XAxis dataKey="month" stroke="#8899bb" />
                    <YAxis stroke="#8899bb" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={s.chartCard}>
                <div style={s.chartTitle}>Platform Distribution</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={[
                      { name: "Users",    value: stats?.totalUsers },
                      { name: "Reports",  value: stats?.totalReports },
                      { name: "Sessions", value: stats?.totalSessions },
                    ]} dataKey="value" innerRadius={50} outerRadius={90}>
                      <Cell fill="#2563eb" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#06b6d4" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={s.chartCard}>
                <div style={s.chartTitle}>Quick Insights</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ color: "#8899bb", fontSize: "0.7rem" }}>User Growth</div>
                    <div style={{ color: "#2563eb", fontSize: "1.4rem", fontWeight: 600 }}>+{stats?.newUsersThisWeek}</div>
                  </div>
                  <div>
                    <div style={{ color: "#8899bb", fontSize: "0.7rem" }}>Pending Reports</div>
                    <div style={{ color: "#f59e0b", fontSize: "1.4rem", fontWeight: 600 }}>{stats?.pendingReports}</div>
                  </div>
                  <div>
                    <div style={{ color: "#8899bb", fontSize: "0.7rem" }}>Connections</div>
                    <div style={{ color: "#06b6d4", fontSize: "1.4rem", fontWeight: 600 }}>{stats?.totalConnections}</div>
                  </div>
                  <div>
                    <div style={{ color: "#8899bb", fontSize: "0.7rem" }}>Avg Rating</div>
                    <div style={{ color: "#f0b429", fontSize: "1.4rem", fontWeight: 600 }}>⭐ {stats?.totalRatings}</div>
                  </div>
                </div>
              </div>
            </div>

            {pendingReports.length > 0 && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Pending Reports</h2>
                <div style={s.table}>
                  <div style={s.tableHead}>
                    <span>Reported User</span><span>Reporter</span><span>Issue</span><span>Actions</span>
                  </div>
                  {pendingReports.slice(0, 5).map(r => (
                    <div key={r._id} style={s.tableRow}>
                      <span style={s.userCell}>
                        <img src={r.reported?.picture} style={s.miniAvatar} alt="" />
                        @{r.reported?.username}
                      </span>
                      <span style={{ color: "#8899bb", fontSize: "0.78rem" }}>@{r.reporter?.username}</span>
                      <span style={s.natureBadge}>{r.nature}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={s.resolveBtn} onClick={() => handleReport(r._id, "resolve")}>Resolve</button>
                        <button style={s.dismissBtn} onClick={() => handleReport(r._id, "dismiss")}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div>
            <h1 style={s.pageTitle}>All Users</h1>
            <input
              style={s.searchInput}
              placeholder="Search by name, username or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>User</span><span>Email</span><span>Rating</span><span>Status</span><span>Actions</span>
              </div>
              {filteredUsers.map(u => (
                <div key={u._id} style={s.tableRow}>
                  <span style={s.userCell}>
                    <img src={u.picture} style={s.miniAvatar} alt="" onError={e => e.target.style.display = "none"} />
                    <div>
                      <div style={{ color: "#1a2a4a", fontSize: "0.82rem", fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: "#8899bb", fontSize: "0.68rem" }}>@{u.username}</div>
                    </div>
                  </span>
                  <span style={{ color: "#6677aa", fontSize: "0.75rem" }}>{u.email}</span>
                  <span style={{ color: "#f0b429", fontSize: "0.78rem" }}>⭐ {Number(u.rating || 0).toFixed(1)}</span>
                  <span style={{
                    ...s.statusBadge,
                    background: u.isBanned ? "rgba(239,68,68,0.08)" : "rgba(37,99,235,0.08)",
                    color: u.isBanned ? "#ef4444" : "#2563eb",
                    border: `1px solid ${u.isBanned ? "rgba(239,68,68,0.25)" : "rgba(37,99,235,0.25)"}`,
                  }}>
                    {u.isBanned ? "Banned" : "Active"}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={u.isBanned ? s.unbanBtn : s.banBtn} onClick={() => handleBan(u._id, u.isBanned)}>
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button style={s.deleteBtn} onClick={() => handleDeleteUser(u._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div>
            <h1 style={s.pageTitle}>All Reports</h1>
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>Reported</span><span>Reporter</span><span>Issue</span><span>Description</span><span>Status</span><span>Actions</span>
              </div>
              {reports.map(r => (
                <div key={r._id} style={s.tableRow}>
                  <span style={s.userCell}>
                    <img src={r.reported?.picture} style={s.miniAvatar} alt="" />
                    <div>
                      <div style={{ color: "#1a2a4a", fontSize: "0.8rem" }}>{r.reported?.name}</div>
                      <div style={{ color: "#8899bb", fontSize: "0.65rem" }}>@{r.reported?.username}</div>
                    </div>
                  </span>
                  <span style={{ color: "#6677aa", fontSize: "0.75rem" }}>@{r.reporter?.username}</span>
                  <span style={s.natureBadge}>{r.nature}</span>
                  <span style={{ color: "#8899bb", fontSize: "0.72rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.description}
                  </span>
                  <span style={{
                    ...s.statusBadge,
                    background: r.status === "Pending" ? "rgba(245,158,11,0.08)" : r.status === "Resolved" ? "rgba(37,99,235,0.08)" : "rgba(107,114,128,0.08)",
                    color: r.status === "Pending" ? "#f59e0b" : r.status === "Resolved" ? "#2563eb" : "#6b7280",
                    border: `1px solid ${r.status === "Pending" ? "rgba(245,158,11,0.25)" : r.status === "Resolved" ? "rgba(37,99,235,0.25)" : "rgba(107,114,128,0.25)"}`,
                  }}>
                    {r.status}
                  </span>
                  {r.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={s.resolveBtn} onClick={() => handleReport(r._id, "resolve")}>Resolve</button>
                      <button style={s.dismissBtn} onClick={() => handleReport(r._id, "dismiss")}>Dismiss</button>
                    </div>
                  ) : (
                    <span style={{ color: "#8899bb", fontSize: "0.7rem" }}>—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  page: { display: "flex", minHeight: "100vh", background: "#f0f4ff", fontFamily: "Syne, sans-serif" },

  sidebar: {
    width: 220,
    background: "#ffffff",
    borderRight: "1px solid #dde6f5",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "28px 16px", position: "sticky", top: 0, height: "100vh",
    boxShadow: "2px 0 12px rgba(37,99,235,0.06)",
  },
  sidebarTop: { display: "flex", flexDirection: "column", gap: 32 },
  sidebarLogo: {
    fontFamily: "DM Mono, monospace", fontSize: "0.85rem",
    color: "#1a2a4a", letterSpacing: "0.1em", padding: "0 8px",
  },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navItem: {
    background: "transparent", border: "none", color: "#8899bb",
    fontFamily: "Syne, sans-serif", fontSize: "0.82rem",
    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
    textAlign: "left", transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  navItemActive: { background: "rgba(37,99,235,0.08)", color: "#2563eb" },
  badge: {
    background: "#ef4444", color: "#fff", borderRadius: 10,
    padding: "1px 7px", fontSize: "0.6rem", fontWeight: 700,
    fontFamily: "DM Mono, monospace",
  },
  logoutBtn: {
    background: "transparent", border: "1px solid #dde6f5",
    color: "#8899bb", borderRadius: 8, padding: "10px", cursor: "pointer",
    fontFamily: "DM Mono, monospace", fontSize: "0.62rem",
    letterSpacing: "0.1em", textTransform: "uppercase",
  },

  main: { flex: 1, padding: "40px 40px", overflowY: "auto" },
  pageTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "2rem",
    fontWeight: 700, color: "#1a2a4a", marginBottom: 28,
  },

  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16, marginBottom: 40,
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #dde6f5",
    borderRadius: 12, padding: "20px 22px",
    boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
  },
  statVal: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "2rem",
    fontWeight: 700, lineHeight: 1, marginBottom: 6,
  },
  statLabel: {
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
    color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase",
  },
  statSub: {
    fontFamily: "DM Mono, monospace", fontSize: "0.58rem",
    color: "#2563eb", marginTop: 4,
  },

  section: { marginBottom: 32 },
  sectionTitle: {
    fontFamily: "Syne, sans-serif", fontSize: "0.9rem",
    fontWeight: 600, color: "#6677aa", marginBottom: 16, letterSpacing: "0.04em",
  },

  searchInput: {
    background: "#ffffff", border: "1px solid #dde6f5",
    borderRadius: 10, padding: "12px 16px", color: "#1a2a4a",
    fontFamily: "Syne, sans-serif", fontSize: "0.85rem",
    outline: "none", width: "100%", maxWidth: 400, marginBottom: 20, display: "block",
  },

  table: {
    background: "#ffffff", border: "1px solid #dde6f5",
    borderRadius: 12, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(37,99,235,0.05)",
  },
  tableHead: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
    padding: "12px 20px", borderBottom: "1px solid #dde6f5",
    fontFamily: "DM Mono, monospace", fontSize: "0.58rem",
    color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", gap: 12,
    background: "#f5f8ff",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
    padding: "14px 20px", borderBottom: "1px solid #eef2fb",
    alignItems: "center", gap: 12, transition: "background 0.15s",
  },
  userCell: { display: "flex", alignItems: "center", gap: 10 },
  miniAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    objectFit: "cover", border: "1px solid #dde6f5", flexShrink: 0,
  },
  natureBadge: {
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
    background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)",
    borderRadius: 6, padding: "3px 8px", color: "#2563eb",
  },
  statusBadge: {
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
    borderRadius: 6, padding: "3px 10px", width: "fit-content",
  },

  chartCard: {
    background: "#ffffff", border: "1px solid #dde6f5",
    borderRadius: 12, padding: "20px 20px 10px",
    boxShadow: "0 2px 12px rgba(37,99,235,0.05)",
  },
  chartTitle: {
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem",
    color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
  },

  banBtn: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#ef4444", borderRadius: 6, padding: "5px 12px",
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem", cursor: "pointer", letterSpacing: "0.06em",
  },
  unbanBtn: {
    background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)",
    color: "#2563eb", borderRadius: 6, padding: "5px 12px",
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem", cursor: "pointer", letterSpacing: "0.06em",
  },
  deleteBtn: {
    background: "transparent", border: "1px solid #dde6f5",
    color: "#8899bb", borderRadius: 6, padding: "5px 12px",
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem", cursor: "pointer",
  },
  resolveBtn: {
    background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)",
    color: "#2563eb", borderRadius: 6, padding: "5px 12px",
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem", cursor: "pointer",
  },
  dismissBtn: {
    background: "rgba(107,114,128,0.08)", border: "1px solid rgba(107,114,128,0.25)",
    color: "#9ca3af", borderRadius: 6, padding: "5px 12px",
    fontFamily: "DM Mono, monospace", fontSize: "0.6rem", cursor: "pointer",
  },
};

export default AdminDashboard;