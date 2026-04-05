





// import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import io from "socket.io-client";
// import { useUser } from "./util/UserContext";

// import Dashboard from "./Pages/Dashboard/Dashboard";
// import Footer from "./Components/Footer/Footer";
// import Discover from "./Pages/Discover/Discover";
// import Login from "./Pages/Login/Login";
// import Header from "./Components/Navbar/Navbar";
// import LandingPage from "./Pages/LandingPage/LandingPage";
// import AboutUs from "./Pages/AboutUs/AboutUs";
// import Chats from "./Pages/Chats/Chats";
// import Report from "./Pages/Report/Report";
// import Profile from "./Pages/Profile/Profile";
// import NotFound from "./Pages/NotFound/NotFound";
// import Register from "./Pages/Register/Register";
// import Rating from "./Pages/Rating/Rating";
// import EditProfile from "./Pages/EditProfile/EditProfile";
// import PrivateRoutes from "./util/PrivateRoutes";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Settings from "./Pages/Settings /Settings";
// import VideoCallWrapper from "./Pages/VideoCallWrapper";
// import LearningPathPage from "./Pages/LearningPath/LearningPathPage";
// import { usePushNotifications } from "./hooks/usePushNotifications";
// import AdminLogin     from "./Pages/Admin/AdminLogin";
// import AdminDashboard from "./Pages/Admin/AdminDashboard";
// import Banned         from "./Pages/Banned/Banned";



// // ── NEW ──
// import Sessions from "./Pages/Sessions/Sessions";

// const ADMIN_ROUTES = ["/admin/login", "/admin/dashboard", "/banned"];

// const App = () => {
//   const { user } = useUser();
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const [incomingCall, setIncomingCall] = useState(null);

//   usePushNotifications(user);

//   const isAdminPage = ADMIN_ROUTES.some(r => location.pathname.startsWith(r));
  

//   useEffect(() => {
//     if (!user) return;
//     const globalSocket = io("https://skillswap-backend-9d4w.onrender.com", {
//       transports: ["websocket"],
//       withCredentials: true,
//     });
//     globalSocket.emit("setup", user);
//     globalSocket.on("incoming-call", (data) => {
//       console.log("📞 Incoming call:", data);
//       setIncomingCall(data);
//     });
//     globalSocket.on("call-invite", (data) => {
//       console.log("📞 Call invite:", data);
//       setIncomingCall({
//         name: data.fromName || data.from,
//         roomId: [data.from, user._id].sort().join("_"),
//       });
//     });
//     return () => globalSocket.disconnect();
//   }, [user]);


//   return (
//     <>
//       {!isAdminPage && <Header />}
//       <ToastContainer position="top-right" />

//       <Routes>
//         {/* ── Admin routes ── */}
//         <Route path="/admin/login"     element={<AdminLogin />} />
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/banned"          element={<Banned />} />

//         {/* ── Regular routes ── */}
//         <Route element={<PrivateRoutes />}>
//           <Route path="/chats" element={<Chats />} />
//         </Route>
//         <Route path="/dashboard"          element={<Dashboard />} />
//         <Route path="/"                   element={<LandingPage />} />
//         <Route path="/login"              element={<Login />} />
//         <Route path="/discover"           element={<Discover />} />
//         <Route path="/register"           element={<Register />} />
//         <Route path="/about_us"           element={<AboutUs />} />
//         <Route path="/edit_profile"       element={<EditProfile />} />
//         <Route path="/report/:username"   element={<Report />} />
//         <Route path="/profile/:username"  element={<Profile />} />
//         <Route path="/rating/:username"   element={<Rating />} />
//         <Route path="*"                   element={<NotFound />} />
//         <Route path="/settings"           element={<Settings />} />
//         <Route path="/video/:roomId"      element={<VideoCallWrapper />} />
//         <Route path="/learningpath"       element={<LearningPathPage />} />

//         {/* ── NEW: Sessions page ── */}
//         <Route path="/sessions"           element={<Sessions />} />
//       </Routes>

//       {!isAdminPage && <Footer />}

//       {/* Global incoming call popup */}
//       {incomingCall && (
//         <div style={popupStyle}>
//           <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Mono, monospace" }}>
//             Incoming call
//           </div>
//           <div style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: 14, fontFamily: "Syne, sans-serif" }}>
//             📞 {incomingCall.name || incomingCall.fromName} is calling…
//           </div>
//           <div style={{ display: "flex", gap: 10 }}>
//             <button style={acceptBtnStyle} onClick={() => {
//               navigate(`/video/${incomingCall.roomId}?receiver=true&callerName=${encodeURIComponent(incomingCall.name || incomingCall.fromName || "")}`);
//               setIncomingCall(null);
//             }}>Accept</button>
//             <button style={declineBtnStyle} onClick={() => setIncomingCall(null)}>Decline</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// const popupStyle = {
//   position: "fixed", bottom: 28, right: 28, zIndex: 9999,
//   background: "#111111", border: "1px solid #2a2a2a",
//   borderRadius: 18, padding: "20px 24px",
//   boxShadow: "0 12px 48px rgba(0,0,0,0.8)",
//   textAlign: "center", minWidth: 240,
//   animation: "slideUp 0.3s ease",
// };
// const acceptBtnStyle = {
//   flex: 1, background: "#34a853", border: "none",
//   color: "#fff", borderRadius: 10, padding: "10px 0",
//   cursor: "pointer", fontWeight: 700, fontSize: "0.8rem",
//   fontFamily: "Syne, sans-serif",
// };
// const declineBtnStyle = {
//   flex: 1, background: "#ea4335", border: "none",
//   color: "#fff", borderRadius: 10, padding: "10px 0",
//   cursor: "pointer", fontSize: "0.8rem", fontFamily: "Syne, sans-serif",
// };

// export default App;







































































import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useUser } from "./util/UserContext";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Footer from "./Components/Footer/Footer";
import Discover from "./Pages/Discover/Discover";
import Login from "./Pages/Login/Login";
import Header from "./Components/Navbar/Navbar";
import LandingPage from "./Pages/LandingPage/LandingPage";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Chats from "./Pages/Chats/Chats";
import Report from "./Pages/Report/Report";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/NotFound/NotFound";
import Register from "./Pages/Register/Register";
import Rating from "./Pages/Rating/Rating";
import EditProfile from "./Pages/EditProfile/EditProfile";
import PrivateRoutes from "./util/PrivateRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./Pages/Settings /Settings";
import VideoCallWrapper from "./Pages/VideoCallWrapper";
import LearningPathPage from "./Pages/LearningPath/LearningPathPage";
import { usePushNotifications } from "./hooks/usePushNotifications";
import AdminLogin     from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import Banned         from "./Pages/Banned/Banned";
import { ThemeProvider } from './Pages/context/ThemeContext';
import Sessions from "./Pages/Sessions/Sessions";

const ADMIN_ROUTES = ["/admin/login", "/admin/dashboard", "/banned"];

const App = () => {
  const { user } = useUser();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [incomingCall, setIncomingCall] = useState(null);

  usePushNotifications(user);

  const isAdminPage = ADMIN_ROUTES.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    if (!user) return;
    const globalSocket = io("https://skillswap-backend-9d4w.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });
    globalSocket.emit("setup", user);
    globalSocket.on("incoming-call", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
    });
    globalSocket.on("call-invite", (data) => {
      console.log("📞 Call invite:", data);
      setIncomingCall({
        name: data.fromName || data.from,
        roomId: [data.from, user._id].sort().join("_"),
      });
    });
    return () => globalSocket.disconnect();
  }, [user]);

  return (
    <ThemeProvider>
      {!isAdminPage && <Header />}
      <ToastContainer position="top-right" />

      <Routes>
        {/* ── Admin routes ── */}
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/banned"          element={<Banned />} />

        {/* ── Regular routes ── */}
        <Route element={<PrivateRoutes />}>
          <Route path="/chats" element={<Chats />} />
        </Route>
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/discover"           element={<Discover />} />
        <Route path="/register"           element={<Register />} />
        <Route path="/about_us"           element={<AboutUs />} />
        <Route path="/edit_profile"       element={<EditProfile />} />
        <Route path="/report/:username"   element={<Report />} />
        <Route path="/profile/:username"  element={<Profile />} />
        <Route path="/rating/:username"   element={<Rating />} />
        <Route path="*"                   element={<NotFound />} />
        <Route path="/settings"           element={<Settings />} />
        <Route path="/video/:roomId"      element={<VideoCallWrapper />} />
        <Route path="/learningpath"       element={<LearningPathPage />} />
        <Route path="/sessions"           element={<Sessions />} />
      </Routes>

      {!isAdminPage && <Footer />}

      {/* Global incoming call popup */}
      {incomingCall && (
        <div style={popupStyle}>
          <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Mono, monospace" }}>
            Incoming call
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: 14, fontFamily: "Syne, sans-serif" }}>
            📞 {incomingCall.name || incomingCall.fromName} is calling…
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={acceptBtnStyle} onClick={() => {
              navigate(`/video/${incomingCall.roomId}?receiver=true&callerName=${encodeURIComponent(incomingCall.name || incomingCall.fromName || "")}`);
              setIncomingCall(null);
            }}>Accept</button>
            <button style={declineBtnStyle} onClick={() => setIncomingCall(null)}>Decline</button>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};

const popupStyle = {
  position: "fixed", bottom: 28, right: 28, zIndex: 9999,
  background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 18, padding: "20px 24px",
  boxShadow: "0 12px 48px rgba(0,0,0,0.8)",
  textAlign: "center", minWidth: 240,
  animation: "slideUp 0.3s ease",
};
const acceptBtnStyle = {
  flex: 1, background: "#34a853", border: "none",
  color: "#fff", borderRadius: 10, padding: "10px 0",
  cursor: "pointer", fontWeight: 700, fontSize: "0.8rem",
  fontFamily: "Syne, sans-serif",
};
const declineBtnStyle = {
  flex: 1, background: "#ea4335", border: "none",
  color: "#fff", borderRadius: 10, padding: "10px 0",
  cursor: "pointer", fontSize: "0.8rem", fontFamily: "Syne, sans-serif",
};

export default App;