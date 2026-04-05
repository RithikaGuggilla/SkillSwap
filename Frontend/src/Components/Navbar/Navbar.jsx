

// import React, { useEffect, useState, useRef } from "react";
// import Container from "react-bootstrap/Container";
// import Nav from "react-bootstrap/Nav";
// import Navbar from "react-bootstrap/Navbar";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import Offcanvas from "react-bootstrap/Offcanvas";
// import { useUser } from "../../util/UserContext";
// import { Dropdown } from "react-bootstrap";
// import axios from "axios";
// import { ChevronDown, Bell, User, Settings, LogOut, CheckCheck } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";


// /* ── Notification dropdown ─────────────────────────────────────── */
// const NotificationDropdown = ({ unreadCount, onCountChange }) => {
//   const [open, setOpen]               = useState(false);
//   const [notifications, setNotifs]    = useState([]);
//   const [loading, setLoading]         = useState(false);
//   const dropRef                       = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const fetchNotifs = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get("/notifications", { withCredentials: true });
//       setNotifs(data.data.notifications || []);
//       onCountChange(data.data.unreadCount || 0);
//     } catch {}
//     finally { setLoading(false); }
//   };

//   const handleOpen = () => {
//     setOpen(v => !v);
//     if (!open) fetchNotifs();
//   };

//   const markAllRead = async () => {
//     await axios.put("/notifications/read-all", {}, { withCredentials: true });
//     setNotifs(prev => prev.map(n => ({ ...n, read: true })));
//     onCountChange(0);
//   };

//   const markRead = async (id) => {
//     await axios.put(`/notifications/${id}/read`, {}, { withCredentials: true });
//     setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
//     onCountChange(prev => Math.max(0, prev - 1));
//   };

//   const typeIcon = (type) => {
//     if (type === "request_received")  return "📨";
//     if (type === "request_accepted")  return "🤝";
//     if (type === "session_scheduled") return "📅";
//     if (type === "session_reminder")  return "⏰";
//     return "🔔";
//   };

//   return (
//     <div ref={dropRef} style={{ position: "relative" }}>
//       {open && (
//         <div style={s.panel}>
//           <div style={s.panelHead}>
//             <span style={s.panelTitle}>Notifications</span>
//             {notifications.some(n => !n.read) && (
//               <button style={s.markAllBtn} onClick={markAllRead}>
//                 <CheckCheck size={13} /> Mark all read
//               </button>
//             )}
//           </div>
//           <div style={s.notifList}>
//             {loading ? (
//               <div style={s.empty}>Loading…</div>
//             ) : notifications.length === 0 ? (
//               <div style={s.empty}>
//                 <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔔</div>
//                 No notifications yet
//               </div>
//             ) : (
//               notifications.map(n => (
//                 <div key={n._id} style={s.notifItem(n.read)} onClick={() => { markRead(n._id); }}>
//                   <div style={s.notifIcon}>{typeIcon(n.type)}</div>
//                   <div style={{ flex: 1 }}>
//                     <div style={s.notifTitle}>{n.title}</div>
//                     <div style={s.notifMsg}>{n.message}</div>
//                     <div style={s.notifTime}>
//                       {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
//                     </div>
//                   </div>
//                   {!n.read && <div style={s.unreadDot} />}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ── Profile dropdown ─────────────────────────────────────────── */
// const UserProfileDropdown = ({ unreadCount, onCountChange }) => {
//   const { user, setUser } = useUser();
//   const navigate          = useNavigate();
//   const [notifOpen, setNotifOpen]           = useState(false);
//   const [notifications, setNotifs]          = useState([]);
//   const [notifsLoading, setNotifsLoading]   = useState(false);
//   const dropRef                             = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setNotifOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const handleLogout = async () => {
//     localStorage.removeItem("userInfo");
//     setUser(null);
//     try { await axios.get("/auth/logout");window.location.href = "https://skill-swap-five-chi.vercel.app/login";}
//     catch {}
//   };

//   const fetchNotifs = async () => {
//     setNotifsLoading(true);
//     try {
//       const { data } = await axios.get("/notifications", { withCredentials: true });
//       setNotifs(data.data.notifications || []);
//       onCountChange(data.data.unreadCount || 0);
//     } catch {}
//     finally { setNotifsLoading(false); }
//   };

//   const handleDropdownOpen = async () => {
//     await markAllReadSilent();
//   };

//   const markAllReadSilent = async () => {
//     try {
//       await axios.put("/notifications/read-all", {}, { withCredentials: true });
//       setNotifs(prev => prev.map(n => ({ ...n, read: true })));
//       onCountChange(0);
//     } catch {}
//   };

//   const markAllRead = async (e) => {
//     e.stopPropagation();
//     await axios.put("/notifications/read-all", {}, { withCredentials: true });
//     setNotifs(prev => prev.map(n => ({ ...n, read: true })));
//     onCountChange(0);
//   };

//   const markOneRead = async (id) => {
//     await axios.put(`/notifications/${id}/read`, {}, { withCredentials: true });
//     setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
//     onCountChange(c => Math.max(0, c - 1));
//   };

//   const typeIcon = (type) => {
//     const map = { request_received: "📨", request_accepted: "🤝", session_scheduled: "📅", session_reminder: "⏰" };
//     return map[type] || "🔔";
//   };

//   const CustomToggle = React.forwardRef(({ onClick }, ref) => (
//     <div ref={ref} onClick={(e) => { onClick(e); if (!notifOpen) { fetchNotifs(); handleDropdownOpen(); } }} style={s.avatarWrap}>
//       <div style={s.avatar}>
//         <img src={user?.picture} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//       </div>
//       {unreadCount > 0 && (
//         <div style={s.avatarBadge}>{unreadCount > 9 ? "9+" : unreadCount}</div>
//       )}
//       <ChevronDown size={14} color="#aaa" />
//     </div>
//   ));

//   const CustomMenu = React.forwardRef(({ style, className, "aria-labelledby": labeledBy }, ref) => (
//     <div ref={ref} style={{ ...style, ...s.menu, right: 0, left: "auto" }} className={className} aria-labelledby={labeledBy}>
//       <ul className="list-unstyled" style={{ margin: 0 }}>
      
//         <button onClick={toggleTheme}>Toggle</button>

//         <Dropdown.Item onClick={() => navigate(`/profile/${user?.username}`)} state={{ from: "/dashboard" }} style={s.menuItem}>
//           <User size={15} color="#555" />  Profile
//         </Dropdown.Item>

//         <div style={s.menuDivider} />
//         <div style={s.notifSection}>
//           <div style={s.notifSectionHead}>
//             <span style={s.notifSectionTitle}>
//               🔔 Notifications {unreadCount > 0 && <span style={s.notifCount}>{unreadCount}</span>}
//             </span>
//             {notifications.some(n => !n.read) && (
//               <button style={s.markAllBtn} onClick={markAllRead}>
//                 <CheckCheck size={11} /> all read
//               </button>
//             )}
//           </div>

//           <div style={s.notifScrollList}>
//             {notifsLoading ? (
//               <div style={s.notifEmpty}>Loading…</div>
//             ) : notifications.length === 0 ? (
//               <div style={s.notifEmpty}>No notifications yet</div>
//             ) : (
//               notifications.slice(0, 5).map(n => (
//                 <div key={n._id} style={s.notifRow(n.read)} onClick={() => markOneRead(n._id)}>
//                   <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>{typeIcon(n.type)}</span>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={s.notifRowTitle}>{n.title}</div>
//                     <div style={s.notifRowMsg}>{n.message}</div>
//                   </div>
//                   {!n.read && <div style={s.smallDot} />}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         <div style={s.menuDivider} />

//         <Dropdown.Item onClick={() => navigate("/settings")} style={s.menuItem}>
//           <Settings size={15} color="#555" /> Settings
//         </Dropdown.Item>

//         <div style={s.menuDivider} />

//         <Dropdown.Item onClick={handleLogout} style={{ ...s.menuItem, color: "#dc2626" }}>
//           <LogOut size={15} color="#dc2626" /> Logout
//         </Dropdown.Item>

//       </ul>
//     </div>
//   ));

//   return (
//     <Dropdown>
//       <Dropdown.Toggle as={CustomToggle} id="dropdown-profile" />
//       <Dropdown.Menu as={CustomMenu} align="end" style={{ right: 0, left: "auto" }} />
//     </Dropdown>
//   );
// };

// /* ── Header ──────────────────────────────────────────────────── */
// const Header = () => {
//   const [navUser, setNavUser]         = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const { user }                      = useUser();
//   const location                      = useLocation();

//   useEffect(() => {
//     setNavUser(JSON.parse(localStorage.getItem("userInfo")));
//   }, [user]);

//   useEffect(() => {
//     if (!navUser) return;
//     const fetch = async () => {
//       try {
//         const { data } = await axios.get("/notifications", { withCredentials: true });
//         setUnreadCount(data.data.unreadCount || 0);
//       } catch {}
//     };
//     fetch();
//     const interval = setInterval(fetch, 30000);
//     return () => clearInterval(interval);
//   }, [navUser]);

//   const isActive = (path) => location.pathname === path;

//   const navLinkStyle = (path) => ({
//     fontFamily: "Montserrat",
//     color: isActive(path) ? "#ffffff" : "#888888",
//     marginLeft: "18px",
//     fontSize: "0.88rem",
//     fontWeight: isActive(path) ? "600" : "400",
//     transition: "color 0.2s",
//     position: "relative",
//     paddingBottom: "4px",
//     letterSpacing: "0.01em",
//   });

//   /* Renders a nav link with a tiny dot underline when active */
//   const NavItem = ({ to, label }) => (
//     <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", marginLeft: "18px" }}>
//       <Nav.Link
//         as={Link}
//         to={to}
//         style={{
//           fontFamily: "Montserrat",
//           color: isActive(to) ? "#ffffff" : "#888888",
//           fontSize: "0.88rem",
//           fontWeight: isActive(to) ? "600" : "400",
//           transition: "color 0.2s",
//           padding: "0",
//           margin: "0",
//           letterSpacing: "0.01em",
//         }}
//         onMouseEnter={e => e.currentTarget.style.color = "#fff"}
//         onMouseLeave={e => e.currentTarget.style.color = isActive(to) ? "#fff" : "#888"}
//       >
//         {label}
//       </Nav.Link>
//       {/* Active dot indicator */}
//       <div style={{
//         width: isActive(to) ? "18px" : "0px",
//         height: "2px",
//         borderRadius: "2px",
//         background: "#ffffff",
//         marginTop: "4px",
//         transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
//         opacity: isActive(to) ? 1 : 0,
//       }} />
//     </div>
//   );

//   return (
//     <Navbar expand="md" style={{ background: "#0a0a0a", padding: "10px 0", marginTop: "20px", zIndex: 998 }}>
//       <Container fluid style={{
//         background: "#111111", border: "1px solid rgba(255,255,255,0.08)",
//         borderRadius: "40px", padding: "12px 40px", width: "96%",
//         margin: "0 auto", display: "flex", alignItems: "center",
//         justifyContent: "space-between", backdropFilter: "blur(12px)",
//         boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
//       }}>

//         {/* Logo */}
//         <Navbar.Brand href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
//           <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
//             <path d="M6 8 L20 8 L20 22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
//             <path d="M6 8 L20 22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
//             <path d="M22 20 L8 20 L8 6" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
//             <path d="M22 20 L8 6" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round"/>
//           </svg>
//           <span style={{ fontFamily: "Georgia, serif", fontWeight: "700", fontSize: "1.15rem", color: "#ffffff", letterSpacing: "-0.01em" }}>
//             Skill<span style={{ color: "#aaaaaa", fontWeight: "400" }}>Swap</span>
//           </span>
//         </Navbar.Brand>

//         <Navbar.Toggle aria-controls="offcanvasNavbar-expand-md" style={{ borderColor: "rgba(255,255,255,0.15)", filter: "invert(1)" }} />

//         <Navbar.Offcanvas id="offcanvasNavbar-expand-md" placement="end">
//           <Offcanvas.Header closeButton style={{ background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
//             <Offcanvas.Title style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontWeight: "700" }}>SKILL SWAP</Offcanvas.Title>
//           </Offcanvas.Header>

//           <Offcanvas.Body style={{ background: "#111111" }}>
//             <Nav className="justify-content-end flex-grow-1 pe-3" style={{ alignItems: "center" }}>

//               {navUser ? (
//                 <>
//                   <NavItem to="/dashboard" label="Dashboard" />
//                   <NavItem to="/discover"  label="Discover"  />
//                   <NavItem to="/chats"     label="Chats"     />
//                   <NavItem to="/sessions"  label="Sessions"  />

//                   {/* Avatar with notification badge + dropdown */}
//                   <div style={{ marginLeft: "18px" }}>
//                     <UserProfileDropdown
//                       unreadCount={unreadCount}
//                       onCountChange={setUnreadCount}
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <Nav.Link as={Link} to="/" style={navLinkStyle("/")}
//                     onMouseEnter={e => e.currentTarget.style.color = "#fff"}
//                     onMouseLeave={e => e.currentTarget.style.color = "#888"}>
//                     Home
//                   </Nav.Link>
//                   <Nav.Link as={Link} to="/about_us" style={navLinkStyle("/about_us")}
//                     onMouseEnter={e => e.currentTarget.style.color = "#fff"}
//                     onMouseLeave={e => e.currentTarget.style.color = "#888"}>
//                     About Us
//                   </Nav.Link>
//                   <Nav.Link as={Link} to="/login" style={{
//                     ...navLinkStyle("/login"), color: "#0a0a0a", background: "#ffffff",
//                     borderRadius: "100px", padding: "6px 20px", fontWeight: "600",
//                   }}
//                     onMouseEnter={e => e.currentTarget.style.background = "#ddd"}
//                     onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
//                     Login/Register
//                   </Nav.Link>
//                 </>
//               )}
//             </Nav>
//           </Offcanvas.Body>
//         </Navbar.Offcanvas>
//       </Container>
//     </Navbar>
//   );
// };

// /* ── Styles ────────────────────────────────────────────────────── */
// const s = {
//   avatarWrap: {
//     display: "flex", alignItems: "center", gap: 6,
//     cursor: "pointer", position: "relative",
//   },
//   avatar: {
//     width: 32, height: 32, borderRadius: "50%",
//     overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)",
//     position: "relative",
//   },
//   avatarBadge: {
//     position: "absolute", top: -5, right: 14,
//     background: "#ffffff", color: "#000000",
//     borderRadius: "50%", minWidth: 18, height: 18,
//     fontSize: "0.6rem", fontWeight: 700,
//     display: "flex", alignItems: "center", justifyContent: "center",
//     padding: "0 4px", border: "2px solid #111",
//     fontFamily: "DM Mono, monospace",
//     zIndex: 10,
//   },
//   menu: {
//     background: "#0a0a0a",
//     border: "none",
//     borderRadius: 16,
//     padding: "8px",
//     boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
//     minWidth: 260,
//     right: 0, left: "auto",
//   },
//   menuItem: {
//     color: "#ffffff",
//     borderRadius: 10,
//     padding: "10px 14px",
//     fontFamily: "Syne, sans-serif",
//     fontSize: "0.88rem",
//     fontWeight: 500,
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     transition: "background 0.15s",
//   },
//   menuDivider: {
//     borderTop: "1px solid rgba(255,255,255,0.08)",
//     margin: "4px 0",
//   },
//   notifSection: { padding: "4px 0", background: "#111111", borderRadius: 10, margin: "0" },
//   notifSectionHead: {
//     display: "flex", alignItems: "center", justifyContent: "space-between",
//     padding: "10px 14px 6px",
//   },
//   notifSectionTitle: {
//     fontFamily: "Syne, sans-serif", fontSize: "0.75rem",
//     letterSpacing: "0.08em", textTransform: "uppercase",
//     fontWeight: 600, color: "#888",
//     display: "flex", alignItems: "center", gap: 6,
//   },
//   notifCount: {
//     background: "#111111", color: "#ffffff", borderRadius: 10,
//     padding: "1px 6px", fontSize: "0.62rem", fontWeight: 700,
//     fontFamily: "DM Mono, monospace",
//   },
//   markAllBtn: {
//     background: "transparent", border: "none", color: "#999",
//     fontSize: "0.65rem", cursor: "pointer",
//     display: "flex", alignItems: "center", gap: 4,
//     fontFamily: "DM Mono, monospace",
//   },
//   notifScrollList: {
//     maxHeight: 240, overflowY: "auto",
//     scrollbarWidth: "thin", scrollbarColor: "#222 transparent",
//   },
//   notifRow: (read) => ({
//     display: "flex", alignItems: "flex-start", gap: 10,
//     padding: "9px 14px",
//     background: read ? "transparent" : "rgba(0,0,0,0.04)",
//     cursor: "pointer",
//     transition: "background 0.15s",
//     borderRadius: 8,
//   }),
//   notifRowTitle: {
//     fontFamily: "Syne, sans-serif", fontSize: "0.78rem",
//     fontWeight: 600, color: "#ffffff", marginBottom: 2,
//   },
//   notifRowMsg: {
//     fontFamily: "Syne, sans-serif", fontSize: "0.72rem",
//     color: "#aaaaaa", lineHeight: 1.4,
//   },
//   smallDot: {
//     width: 7, height: 7, borderRadius: "50%",
//     background: "#ffffff", flexShrink: 0, marginTop: 4,
//   },
//   notifEmpty: {
//     textAlign: "center", padding: "14px 16px",
//     fontFamily: "Syne, sans-serif", fontSize: "0.75rem", color: "#bbb",
//   },
// };


// export default Header;










































































import React, { useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useUser } from "../../util/UserContext";
import { Dropdown } from "react-bootstrap";
import axios from "axios";
import { ChevronDown, Bell, User, Settings, LogOut, CheckCheck, Sun, Moon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from '../../Pages/context/ThemeContext';

/* ── Notification dropdown ─────────────────────────────────────── */
const NotificationDropdown = ({ unreadCount, onCountChange }) => {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState([]);
  const [loading, setLoading]         = useState(false);
  const dropRef                       = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/notifications", { withCredentials: true });
      setNotifs(data.data.notifications || []);
      onCountChange(data.data.unreadCount || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifs();
  };

  const markAllRead = async () => {
    await axios.put("/notifications/read-all", {}, { withCredentials: true });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    onCountChange(0);
  };

  const markRead = async (id) => {
    await axios.put(`/notifications/${id}/read`, {}, { withCredentials: true });
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    onCountChange(prev => Math.max(0, prev - 1));
  };

  const typeIcon = (type) => {
    if (type === "request_received")  return "📨";
    if (type === "request_accepted")  return "🤝";
    if (type === "session_scheduled") return "📅";
    if (type === "session_reminder")  return "⏰";
    return "🔔";
  };

  return (
    <div ref={dropRef} style={{ position: "relative" }}>
      {open && (
        <div style={s.panel}>
          <div style={s.panelHead}>
            <span style={s.panelTitle}>Notifications</span>
            {notifications.some(n => !n.read) && (
              <button style={s.markAllBtn} onClick={markAllRead}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div style={s.notifList}>
            {loading ? (
              <div style={s.empty}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} style={s.notifItem(n.read)} onClick={() => { markRead(n._id); }}>
                  <div style={s.notifIcon}>{typeIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.notifTitle}>{n.title}</div>
                    <div style={s.notifMsg}>{n.message}</div>
                    <div style={s.notifTime}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read && <div style={s.unreadDot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Profile dropdown ─────────────────────────────────────────── */
const UserProfileDropdown = ({ unreadCount, onCountChange }) => {
  const { user, setUser } = useUser();
  const navigate          = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen]           = useState(false);
  const [notifications, setNotifs]          = useState([]);
  const [notifsLoading, setNotifsLoading]   = useState(false);
  const dropRef                             = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    try { await axios.get("/auth/logout"); window.location.href = "https://skill-swap-five-chi.vercel.app/login"; }
    catch {}
  };

  const fetchNotifs = async () => {
    setNotifsLoading(true);
    try {
      const { data } = await axios.get("/notifications", { withCredentials: true });
      setNotifs(data.data.notifications || []);
      onCountChange(data.data.unreadCount || 0);
    } catch {}
    finally { setNotifsLoading(false); }
  };

  const handleDropdownOpen = async () => {
    await markAllReadSilent();
  };

  const markAllReadSilent = async () => {
    try {
      await axios.put("/notifications/read-all", {}, { withCredentials: true });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      onCountChange(0);
    } catch {}
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    await axios.put("/notifications/read-all", {}, { withCredentials: true });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    onCountChange(0);
  };

  const markOneRead = async (id) => {
    await axios.put(`/notifications/${id}/read`, {}, { withCredentials: true });
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    onCountChange(c => Math.max(0, c - 1));
  };

  const typeIcon = (type) => {
    const map = { request_received: "📨", request_accepted: "🤝", session_scheduled: "📅", session_reminder: "⏰" };
    return map[type] || "🔔";
  };

  const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    <div ref={ref} onClick={(e) => { onClick(e); if (!notifOpen) { fetchNotifs(); handleDropdownOpen(); } }} style={s.avatarWrap}>
      <div style={s.avatar}>
        <img src={user?.picture} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {unreadCount > 0 && (
        <div style={s.avatarBadge}>{unreadCount > 9 ? "9+" : unreadCount}</div>
      )}
      <ChevronDown size={14} color="#aaa" />
    </div>
  ));

  const CustomMenu = React.forwardRef(({ style, className, "aria-labelledby": labeledBy }, ref) => (
    <div ref={ref} style={{ ...style, ...s.menu, right: 0, left: "auto" }} className={className} aria-labelledby={labeledBy}>
      <ul className="list-unstyled" style={{ margin: 0 }}>

        {/* Theme Toggle */}
        <li>
          <div
            onClick={toggleTheme}
            style={{ ...s.menuItem, cursor: "pointer" }}
          >
            {theme === 'dark'
              ? <><Sun size={15} color="#aaa" /> Light Mode</>
              : <><Moon size={15} color="#555" /> Dark Mode</>
            }
          </div>
        </li>

        <div style={s.menuDivider} />

        <Dropdown.Item
          onClick={() => navigate(`/profile/${user?.username}`)}
          state={{ from: "/dashboard" }}
          style={s.menuItem}
        >
          <User size={15} color="#555" /> Profile
        </Dropdown.Item>

        <div style={s.menuDivider} />

        <div style={s.notifSection}>
          <div style={s.notifSectionHead}>
            <span style={s.notifSectionTitle}>
              🔔 Notifications {unreadCount > 0 && <span style={s.notifCount}>{unreadCount}</span>}
            </span>
            {notifications.some(n => !n.read) && (
              <button style={s.markAllBtn} onClick={markAllRead}>
                <CheckCheck size={11} /> all read
              </button>
            )}
          </div>

          <div style={s.notifScrollList}>
            {notifsLoading ? (
              <div style={s.notifEmpty}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div style={s.notifEmpty}>No notifications yet</div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div key={n._id} style={s.notifRow(n.read)} onClick={() => markOneRead(n._id)}>
                  <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.notifRowTitle}>{n.title}</div>
                    <div style={s.notifRowMsg}>{n.message}</div>
                  </div>
                  {!n.read && <div style={s.smallDot} />}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={s.menuDivider} />

        <Dropdown.Item onClick={() => navigate("/settings")} style={s.menuItem}>
          <Settings size={15} color="#555" /> Settings
        </Dropdown.Item>

        <div style={s.menuDivider} />

        <Dropdown.Item onClick={handleLogout} style={{ ...s.menuItem, color: "#dc2626" }}>
          <LogOut size={15} color="#dc2626" /> Logout
        </Dropdown.Item>

      </ul>
    </div>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-profile" />
      <Dropdown.Menu as={CustomMenu} align="end" style={{ right: 0, left: "auto" }} />
    </Dropdown>
  );
};

/* ── Header ──────────────────────────────────────────────────── */
const Header = () => {
  const [navUser, setNavUser]         = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user }                      = useUser();
  const location                      = useLocation();
  const { theme, toggleTheme }        = useTheme();

  useEffect(() => {
    setNavUser(JSON.parse(localStorage.getItem("userInfo")));
  }, [user]);

  useEffect(() => {
    if (!navUser) return;
    const fetchCount = async () => {
      try {
        const { data } = await axios.get("/notifications", { withCredentials: true });
        setUnreadCount(data.data.unreadCount || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [navUser]);

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    fontFamily: "Montserrat",
    color: isActive(path) ? "#ffffff" : "#888888",
    marginLeft: "18px",
    fontSize: "0.88rem",
    fontWeight: isActive(path) ? "600" : "400",
    transition: "color 0.2s",
    position: "relative",
    paddingBottom: "4px",
    letterSpacing: "0.01em",
  });

  const NavItem = ({ to, label }) => (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", marginLeft: "18px" }}>
      <Nav.Link
        as={Link}
        to={to}
        style={{
          fontFamily: "Montserrat",
          color: isActive(to) ? "#ffffff" : "#888888",
          fontSize: "0.88rem",
          fontWeight: isActive(to) ? "600" : "400",
          transition: "color 0.2s",
          padding: "0",
          margin: "0",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = isActive(to) ? "#fff" : "#888"}
      >
        {label}
      </Nav.Link>
      <div style={{
        width: isActive(to) ? "18px" : "0px",
        height: "2px",
        borderRadius: "2px",
        background: "#ffffff",
        marginTop: "4px",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        opacity: isActive(to) ? 1 : 0,
      }} />
    </div>
  );

  return (
    <Navbar expand="md" style={{ background: "var(--bg)", padding: "10px 0", marginTop: "20px", zIndex: 998 }}>
      <Container fluid style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "40px", padding: "12px 40px", width: "96%",
        margin: "0 auto", display: "flex", alignItems: "center",
        justifyContent: "space-between", backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>

        {/* Logo */}
        <Navbar.Brand href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 8 L20 8 L20 22" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M6 8 L20 22" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M22 20 L8 20 L8 6" stroke="var(--light-grey)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M22 20 L8 6" stroke="var(--light-grey)" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: "700", fontSize: "1.15rem", color: "var(--text)", letterSpacing: "-0.01em" }}>
            Skill<span style={{ color: "var(--light-grey)", fontWeight: "400" }}>Swap</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-md" style={{ borderColor: "var(--border)", filter: theme === 'dark' ? "invert(1)" : "none" }} />

        <Navbar.Offcanvas id="offcanvasNavbar-expand-md" placement="end">
          <Offcanvas.Header closeButton style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
            <Offcanvas.Title style={{ fontFamily: "Georgia, serif", color: "var(--text)", fontWeight: "700" }}>SKILL SWAP</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body style={{ background: "var(--card)" }}>
            <Nav className="justify-content-end flex-grow-1 pe-3" style={{ alignItems: "center" }}>

              {navUser ? (
                <>
                  <NavItem to="/dashboard" label="Dashboard" />
                  <NavItem to="/discover"  label="Discover"  />
                  <NavItem to="/chats"     label="Chats"     />
                  <NavItem to="/sessions"  label="Sessions"  />

                  <div style={{ marginLeft: "18px" }}>
                    <UserProfileDropdown
                      unreadCount={unreadCount}
                      onCountChange={setUnreadCount}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/" style={navLinkStyle("/")}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#888"}>
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to="/about_us" style={navLinkStyle("/about_us")}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#888"}>
                    About Us
                  </Nav.Link>

                  {/* Theme toggle for logged-out users */}
                  <button
                    onClick={toggleTheme}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: "50%",
                      width: 34, height: 34,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      marginLeft: "14px",
                      color: "var(--text)",
                    }}
                  >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  </button>

                  <Nav.Link as={Link} to="/login" style={{
                    ...navLinkStyle("/login"), color: "var(--bg)", background: "var(--text)",
                    borderRadius: "100px", padding: "6px 20px", fontWeight: "600",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    Login/Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

/* ── Styles ────────────────────────────────────────────────────── */
const s = {
  avatarWrap: {
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer", position: "relative",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    overflow: "hidden", border: "2px solid var(--border)",
    position: "relative",
  },
  avatarBadge: {
    position: "absolute", top: -5, right: 14,
    background: "var(--text)", color: "var(--bg)",
    borderRadius: "50%", minWidth: 18, height: 18,
    fontSize: "0.6rem", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 4px", border: "2px solid var(--card)",
    fontFamily: "DM Mono, monospace",
    zIndex: 10,
  },
  menu: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "8px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
    minWidth: 260,
    right: 0, left: "auto",
  },
  menuItem: {
    color: "var(--text)",
    borderRadius: 10,
    padding: "10px 14px",
    fontFamily: "Syne, sans-serif",
    fontSize: "0.88rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "background 0.15s",
  },
  menuDivider: {
    borderTop: "1px solid var(--border)",
    margin: "4px 0",
  },
  notifSection: { padding: "4px 0", background: "var(--bg)", borderRadius: 10, margin: "0" },
  notifSectionHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 14px 6px",
  },
  notifSectionTitle: {
    fontFamily: "Syne, sans-serif", fontSize: "0.75rem",
    letterSpacing: "0.08em", textTransform: "uppercase",
    fontWeight: 600, color: "var(--light-grey)",
    display: "flex", alignItems: "center", gap: 6,
  },
  notifCount: {
    background: "var(--text)", color: "var(--bg)", borderRadius: 10,
    padding: "1px 6px", fontSize: "0.62rem", fontWeight: 700,
    fontFamily: "DM Mono, monospace",
  },
  markAllBtn: {
    background: "transparent", border: "none", color: "var(--light-grey)",
    fontSize: "0.65rem", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 4,
    fontFamily: "DM Mono, monospace",
  },
  notifScrollList: {
    maxHeight: 240, overflowY: "auto",
    scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent",
  },
  notifRow: (read) => ({
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "9px 14px",
    background: read ? "transparent" : "rgba(108,93,211,0.08)",
    cursor: "pointer",
    transition: "background 0.15s",
    borderRadius: 8,
  }),
  notifRowTitle: {
    fontFamily: "Syne, sans-serif", fontSize: "0.78rem",
    fontWeight: 600, color: "var(--text)", marginBottom: 2,
  },
  notifRowMsg: {
    fontFamily: "Syne, sans-serif", fontSize: "0.72rem",
    color: "var(--light-grey)", lineHeight: 1.4,
  },
  smallDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "var(--primary)", flexShrink: 0, marginTop: 4,
  },
  notifEmpty: {
    textAlign: "center", padding: "14px 16px",
    fontFamily: "Syne, sans-serif", fontSize: "0.75rem", color: "var(--light-grey)",
  },
};

export default Header;