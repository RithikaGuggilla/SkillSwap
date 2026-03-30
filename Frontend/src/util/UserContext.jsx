// import React, { useState, useEffect, createContext, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const UserContext = createContext();

// const UserContextProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleUrlChange = () => {
//       // Your logic to run when there is a change in the URL
//       console.log("URL has changed:", window.location.href);
//     };
//     window.addEventListener("popstate", handleUrlChange);
//     const userInfoString = localStorage.getItem("userInfo");
//     if (userInfoString) {
//       try {
//         const userInfo = JSON.parse(userInfoString);
//         setUser(userInfo);
//       } catch (error) {
//         console.error("Error parsing userInfo:", error);
//       }
//     } else {
//       const temp = window.location.href.split("/");
//       const url = temp.pop();
//       console.log("url", url);
//       if (url !== "about_us" && url !== "#why-skill-swap" && url !== "" && url !== "discover" && url !== "register") {
//         navigate("/login");
//       }
//     }
//     return () => {
//       window.removeEventListener("popstate", handleUrlChange);
//     };
//   }, [window.location.href]);

//   return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
// };

// const useUser = () => {
//   return useContext(UserContext);
// };

// export { UserContextProvider, useUser };












import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const UserContext = createContext();

// Pages that don't require login
const PUBLIC_ROUTES = [
  "login", "register", "about_us", "discover", "", 
  "#why-skill-swap", "banned"
];

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ proper React way to track URL

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");

    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        setUser(userInfo);
      } catch (error) {
        console.error("Error parsing userInfo:", error);
        localStorage.removeItem("userInfo"); // ✅ clear corrupted data
      }
    } else {
      // ✅ get last segment of path cleanly
      const urlSegment = location.pathname.split("/").pop();

      const isPublic = PUBLIC_ROUTES.includes(urlSegment);

      if (!isPublic) {
        // ✅ No toast here — let the individual pages handle messaging
        navigate("/login");
      }
    }
  }, [location.pathname]); // ✅ proper dependency

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  return useContext(UserContext);
};

export { UserContextProvider, useUser };
