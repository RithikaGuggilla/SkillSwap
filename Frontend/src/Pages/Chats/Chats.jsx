
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useUser } from "../../util/UserContext";
// import Spinner from "react-bootstrap/Spinner";
// import { useNavigate } from "react-router-dom";
// import io from "socket.io-client";
// import ScrollableFeed from "react-scrollable-feed";
// import RequestCard from "./RequestCard";
// import "./Chats.css";
// import { Link } from "react-router-dom";
// import { FaVideo } from "react-icons/fa";
// import { useLocation } from "react-router-dom";
// import CreateGroupModal from "./CreateGroupModal";
// import GroupChatView from "./GroupChatView";

// var socket;

// const Chats = () => {
//   const location = useLocation();
//   const params = new URLSearchParams(location.search);
//   const defaultTab = params.get("tab") || "chats";

//   const [activeTab, setActiveTab]                       = useState(defaultTab);
//   const [requests, setRequests]                         = useState([]);
//   const [requestLoading, setRequestLoading]             = useState(false);
//   const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);
//   const [requestModalShow, setRequestModalShow]         = useState(false);
//   const [selectedChat, setSelectedChat]                 = useState(null);
//   const [chatMessages, setChatMessages]                 = useState([]);
//   const [chats, setChats]                               = useState([]);
//   const [chatLoading, setChatLoading]                   = useState(true);
//   const [chatMessageLoading, setChatMessageLoading]     = useState(false);
//   const [message, setMessage]                           = useState("");
//   const [selectedRequest, setSelectedRequest]           = useState(null);
//   const [incomingCall, setIncomingCall]                 = useState(null);
//   const [showSchedule, setShowSchedule]                 = useState(false);
//   const [scheduleDate, setScheduleDate]                 = useState("");
//   const [scheduleTime, setScheduleTime]                 = useState("");

//   // ── Group state ──
//   const [groups, setGroups]                   = useState([]);
//   const [activeGroup, setActiveGroup]         = useState(null);
//   const [showCreateGroup, setShowCreateGroup] = useState(false);

//   // ── Unread + last messages ──
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const [groupUnread, setGroupUnread]   = useState({});
//   const [lastMessages, setLastMessages] = useState({}); // { chatId: "last msg text" }

//   // keep selectedChat in a ref so socket handlers can read current value
//   const selectedChatRef = useRef(null);
//   useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

//   const { user, setUser } = useUser();
//   const navigate = useNavigate();
//   const ME_ID = user?._id || "me";

//   // Fetch groups
//   useEffect(() => {
//     axios.get(`${import.meta.env.VITE_SERVER_URL}/group/my-groups`, {
//   withCredentials: true,
// })
//       .then(({ data }) => setGroups(data.data || []))
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//   if (user) fetchChats();
// }, [user]);

//   useEffect(() => {
//     if (defaultTab === "requests") getRequests();
//   }, []);
  

//   // ── Socket setup — runs ONCE on mount ──
//   useEffect(() => {
//     socket = io(import.meta.env.VITE_SERVER_URL, {
//       transports: ["websocket"],
//       withCredentials: true,
//     });
//     if (user) socket.emit("setup", user);

//     // New message received
//     socket.on("message recieved", (msg) => {
//       const currentChat = selectedChatRef.current;
//       const chatId = msg.chatId?._id || msg.chatId;

//       // Update last message preview always
//       setLastMessages(prev => ({
//         ...prev,
//         [chatId]: msg.content,
//       }));

//       if (currentChat && currentChat.id === chatId) {
//         // Currently viewing this chat — add to messages
//         setChatMessages((prev) => [...prev, msg]);
//       } else {
//         // Not viewing — increment unread badge
//         setUnreadCounts(prev => ({
//           ...prev,
//           [chatId]: (prev[chatId] || 0) + 1,
//         }));
//       }
//     });

//     // Group message unread
//     socket.on("group-message", ({ groupId }) => {
//       setGroupUnread(prev => ({
//         ...prev,
//         [groupId]: (prev[groupId] || 0) + 1,
//       }));
//     });

//     // ── INCOMING CALL — works globally regardless of which page ──
//     socket.on("incoming-call", (data) => {
//       console.log("📞 Incoming call from:", data.name);
//       setIncomingCall(data);
//     });

//     // Also listen for call-invite (some implementations use this)
//     socket.on("call-invite", (data) => {
//       console.log("📞 Call invite from:", data.from);
//       setIncomingCall({
//         name: data.fromName || data.from,
//         roomId: [data.from, user?._id].sort().join("_"),
//         from: data.from,
//       });
//     });

//     socket.on("video-offer", async ({ offer }) => {
//       console.log("Received offer", offer);
//     });

//     return () => {
//       socket.off("message recieved");
//       socket.off("incoming-call");
//       socket.off("call-invite");
//       socket.off("group-message");
//     };
//   }, [user]);

//   const fetchChats = async () => {
//     try {
//       setChatLoading(true);
//       const tempUser = JSON.parse(localStorage.getItem("userInfo"));
//       const { data } = await axios.get(
//   `${import.meta.env.VITE_SERVER_URL}/chat/getChats`,
//   { withCredentials: true }
// );
//       toast.success(data.message);
//       if (tempUser?._id) {
//         const temp = data.data.map((chat) => {
//           const otherUser = chat.users.find((u) => u._id !== tempUser._id);
//           return {
//             id: chat._id, userId: otherUser._id, name: otherUser.name,
//             picture: otherUser.picture, username: otherUser.username,
//             lastMessage: chat.latestMessage?.content || "",
//             unreadCount: chat.unreadCount || 0,
//           };
//         });
//         setChats(temp);
//         // Init last messages from API data
//         const initLast = {};
//         const initUnread = {};
//         temp.forEach(c => {
//           if (c.lastMessage) initLast[c.id] = c.lastMessage;
//           if (c.unreadCount > 0) initUnread[c.id] = c.unreadCount;
//         });
//         setLastMessages(initLast);
//         setUnreadCounts(initUnread);
//       }
//     } catch (err) {
//       if (err?.response?.data?.message) {
//         toast.error(err.response.data.message);
//         if (err.response.data.message === "Please Login") {
//           localStorage.removeItem("userInfo"); setUser(null);
//           await axios.get("/auth/logout"); navigate("/login");
//         }
//       }
//     } finally { setChatLoading(false); }
//   };

//   const handleChatClick = async (chatId) => {
//   setActiveGroup(null);
//   setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
//   try {
//     setChatMessageLoading(true);
//     const { data } = await axios.get(
//       `${import.meta.env.VITE_SERVER_URL}/message/getMessages/${chatId}`,
//       { withCredentials: true }
//     );
//     setChatMessages(data.data);
//     setMessage("");
//     const chat = chats.find((c) => c.id === chatId);
//     setSelectedChat(chat);
//     socket.emit("join chat", chatId);
//   } catch (err) {
//     if (err?.response?.data?.message) toast.error(err.response.data.message);
//     else toast.error("Something went wrong");
//   } finally { setChatMessageLoading(false); }
// };

//   const handleGroupClick = (group) => {
//     setSelectedChat(null);
//     setActiveGroup(group);
//     setGroupUnread(prev => ({ ...prev, [group._id]: 0 }));
//   };

//   const sendMessage = async () => {
//     if (message.trim() === "") { toast.error("Message is empty"); return; }
//     try {
//       socket.emit("stop typing", selectedChat._id);
//       const { data } = await axios.post(
//   `${import.meta.env.VITE_SERVER_URL}/message/sendMessage`,
//   { chatId: selectedChat.id, content: message },
//   { withCredentials: true }
// );
//       socket.emit("new message", data.data);
//       setChatMessages((prev) => [...prev, data.data]);
//       // Update last message for this chat
//       setLastMessages(prev => ({ ...prev, [selectedChat.id]: message }));
//       setMessage("");
//     } catch (err) {
//       if (err?.response?.data?.message) {
//         toast.error(err.response.data.message);
//         if (err.response.data.message === "Please Login") {
//           await axios.get("/auth/logout"); setUser(null);
//           localStorage.removeItem("userInfo"); navigate("/login");
//         }
//       } else toast.error("Something went wrong");
//     }
//   };

//   const handleVideoCall = () => {
//     if (!selectedChat) return;
//     const roomId = [user._id, selectedChat.userId].sort().join("_");
//     socket.emit("call-user", {
//       to: selectedChat.userId,
//       from: user._id,
//       fromName: user.name,
//       name: user.name,
//       roomId,
//     });
//     navigate(`/video/${roomId}?callerName=${encodeURIComponent(selectedChat.name)}`);
//   };

//   const getRequests = async () => {
//     try {
//       setRequestLoading(true);
//       const { data } = await axios.get("/request/getRequests");
//       setRequests(data.data);
//       toast.success(data.message);
//     } catch (err) {
//       if (err?.response?.data?.message) {
//         toast.error(err.response.data.message);
//         if (err.response.data.message === "Please Login") {
//           await axios.get("/auth/logout"); setUser(null);
//           localStorage.removeItem("userInfo"); navigate("/login");
//         }
//       } else toast.error("Something went wrong");
//     } finally { setRequestLoading(false); }
//   };

//   const handleTabClick = async (tab) => {
//     setActiveTab(tab);
//     if (tab === "requests") await getRequests();
//     else await fetchChats();
//   };

//   const handleRequestClick  = (req) => { setSelectedRequest(req); setRequestModalShow(true); };

//   const handleRequestAccept = async () => {
//     try {
//       setAcceptRequestLoading(true);
//       const { data } = await axios.post("/request/acceptRequest", { requestId: selectedRequest._id });
//       toast.success(data.message);
//       setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Something went wrong");
//     } finally { setAcceptRequestLoading(false); setRequestModalShow(false); }
//   };

//   const handleRequestReject = async () => {
//     try {
//       setAcceptRequestLoading(true);
//       await axios.post("/request/rejectRequest", { requestId: selectedRequest._id });
//       setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Something went wrong");
//     } finally { setAcceptRequestLoading(false); setRequestModalShow(false); }
//   };

//   const fmt = (d) => {
//     if (!d) return "";
//     return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//   };

//   const truncate = (text, max = 28) => {
//     if (!text) return "";
//     return text.length > max ? text.slice(0, max) + "…" : text;
//   };

//   return (
//     <div className="ch-root">

//       {/* ══════════ SIDEBAR ══════════ */}
//       <aside className="ch-sidebar">
//         <div className="ch-sidebar-head">
//           <div className="ch-sidebar-top-row">
//             <span className="ch-sidebar-title">Messages</span>
//             <button className="ch-new-group-btn" onClick={() => setShowCreateGroup(true)} title="Create new group">
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
//               </svg>
//               New Group
//             </button>
//           </div>

//           <div className="ch-tabs">
//             <button className={`ch-tab ${activeTab === "chats" ? "ch-tab--active" : ""}`} onClick={() => handleTabClick("chats")}>Chats</button>
//             <button className={`ch-tab ${activeTab === "requests" ? "ch-tab--active" : ""}`} onClick={() => handleTabClick("requests")}>
//               Requests
//               {requests.length > 0 && <span className="ch-tab-badge">{requests.length}</span>}
//             </button>
//           </div>

//           <label className="ch-search">
//             <SearchIcon />
//             <input type="text" placeholder="Search…" />
//           </label>
//         </div>

//         <div className="ch-list">
//           {activeTab === "chats" && (
//             <>
//               {chatLoading ? <CenteredSpinner /> : (
//                 <>
//                   {chats.length > 0 && (
//                     <>
//                       <div className="ch-list-section-label">Direct</div>
//                       {chats.map((chat) => (
//                         <button
//                           key={chat.id}
//                           className={`ch-item ${selectedChat?.id === chat.id ? "ch-item--active" : ""}`}
//                           onClick={() => handleChatClick(chat.id)}
//                         >
//                           <Avatar src={chat.picture} name={chat.name} size={40} />
//                           <div className="ch-item-info">
//                             <div className="ch-item-name-row">
//                               <span className="ch-item-name">{chat.name}</span>
//                               {unreadCounts[chat.id] > 0 && (
//                                 <span className="ch-unread-badge">{unreadCounts[chat.id]}</span>
//                               )}
//                             </div>
//                             <span className={`ch-item-sub ${unreadCounts[chat.id] > 0 ? "ch-item-sub--unread" : ""}`}>
//                               {lastMessages[chat.id]
//                                 ? truncate(lastMessages[chat.id])
//                                 : `@${chat.username}`}
//                             </span>
//                           </div>
//                         </button>
//                       ))}
//                     </>
//                   )}

//                   {groups.length > 0 && (
//                     <>
//                       <div className="ch-list-section-label">Groups</div>
//                       {groups.map((grp) => (
//                         <button
//                           key={grp._id}
//                           className={`ch-item ${activeGroup?._id === grp._id ? "ch-item--active" : ""}`}
//                           onClick={() => handleGroupClick(grp)}
//                         >
//                           <div className="ch-group-avatar">
//                             {grp.picture
//                               ? <img src={grp.picture} alt={grp.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
//                               : <span className="ch-group-avatar-letter">{grp.name?.[0]?.toUpperCase()}</span>
//                             }
//                           </div>
//                           <div className="ch-item-info">
//                             <div className="ch-item-name-row">
//                               <span className="ch-item-name">{grp.name}</span>
//                               {groupUnread[grp._id] > 0 && (
//                                 <span className="ch-unread-badge">{groupUnread[grp._id]}</span>
//                               )}
//                             </div>
//                             <span className={`ch-item-sub ${groupUnread[grp._id] > 0 ? "ch-item-sub--unread" : ""}`}>
//                               {grp.members?.length} members
//                             </span>
//                           </div>
//                         </button>
//                       ))}
//                     </>
//                   )}

//                   {chats.length === 0 && groups.length === 0 && (
//                     <EmptyState icon="💬" text="No conversations yet" />
//                   )}
//                 </>
//               )}
//             </>
//           )}

//           {activeTab === "requests" && (
//             requestLoading ? <CenteredSpinner /> :
//             requests.length === 0 ? <EmptyState icon="📨" text="No pending requests" /> :
//             requests.map((req) => (
//               <button key={req._id} className="ch-item" onClick={() => handleRequestClick(req)}>
//                 <Avatar src={req.picture} name={req.name} size={40} />
//                 <div className="ch-item-info">
//                   <span className="ch-item-name">{req.name}</span>
//                   <span className="ch-item-sub ch-item-sub--req">Skill swap request</span>
//                 </div>
//                 <span className="ch-req-dot" />
//               </button>
//             ))
//           )}
//         </div>
//       </aside>

//       {/* ══════════ MAIN ══════════ */}
//       <main className="ch-main">
//         {activeGroup ? (
         
// <GroupChatView
//   group={activeGroup}
//   socket={socket}
//   currentUser={user}
//   onGroupUpdated={(action, data) => {
//     if (action === "left" || action === "deleted") {
//       // Remove from sidebar and clear the active view
//       setGroups(prev => prev.filter(g => g._id !== (typeof data === "string" ? data : data?._id)));
//       setActiveGroup(null);
//     } else if (action === "updated") {
//       // Update the group in the sidebar list
//       setGroups(prev => prev.map(g => g._id === data._id ? data : g));
//       setActiveGroup(data);
//     }
//   }}
// />
 
          
//         ) : (
//           <>
//             <div className="ch-topbar">
//               {selectedChat ? (
//                 <>
//                   <div className="ch-topbar-left">
//                     <Avatar src={selectedChat.picture} name={selectedChat.name} size={36} />
//                     <div>
//                       <p className="ch-topbar-name">{selectedChat.name}</p>
//                       <p className="ch-topbar-handle">@{selectedChat.username}</p>
//                     </div>
//                   </div>
//                   <div className="ch-topbar-right">
//                     <button className="ch-icon-btn" onClick={handleVideoCall} title="Video call"><FaVideo size={15} /></button>
//                     <button className="ch-profile-btn" onClick={() => setShowSchedule(true)}>Schedule</button>
//                     <Link to={`/profile/${selectedChat.username}`} state={{ from: "/chats" }}  className="ch-profile-btn">View profile →</Link>
//                   </div>
//                 </>
//               ) : (
//                 <span className="ch-topbar-placeholder">Select a conversation to start messaging</span>
//               )}
//             </div>

//             {selectedChat ? (
//               chatMessageLoading ? <CenteredSpinner flex /> : (
//                 <div className="ch-messages">
//                   <div className="ch-date-divider">
//                     <span className="ch-date-line" />
//                     <span className="ch-date-label">Today</span>
//                     <span className="ch-date-line" />
//                   </div>
//                   <ScrollableFeed forceScroll={true}>
//                     {chatMessages.map((msg, i) => {
//                       const isMe = msg.sender._id === ME_ID || msg.sender._id === "me";
//                       return (
//                         <div key={i} className={`ch-msg-row ${isMe ? "ch-msg-row--me" : "ch-msg-row--them"}`}>
//                           {!isMe && <Avatar src={selectedChat.picture} name={selectedChat.name} size={28} cls="ch-msg-avatar" />}
//                           <div className="ch-msg-wrap">
//                             <div className={`ch-bubble ${isMe ? "ch-bubble--me" : "ch-bubble--them"}`}>{msg.content}</div>
//                             {msg.createdAt && <span className={`ch-msg-time ${isMe ? "ch-msg-time--me" : ""}`}>{fmt(msg.createdAt)}</span>}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </ScrollableFeed>
//                 </div>
//               )
//             ) : (
//               <div className="ch-empty">
//                 <div className="ch-empty-glyph">✦</div>
//                 <p className="ch-empty-heading">No conversation selected</p>
//                 <p className="ch-empty-sub">Choose a chat or group from the sidebar</p>
//               </div>
//             )}

//             {selectedChat && (
//               <div className="ch-input-bar">
//                 <label className="ch-attach-btn" title="Share file, photo or document">
//                   <input
//                     type="file"
//                     accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
//                     style={{ display: "none" }}
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (!file) return;
//                       setMessage(`📎 ${file.name}`);
//                       toast.info(`${file.name} selected — press send to share`);
//                       e.target.value = "";
//                     }}
//                   />
//                   <AttachIcon />
//                 </label>
//                 <input
//                   className="ch-input"
//                   type="text"
//                   placeholder={`Message ${selectedChat.name}…`}
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
//                 />
//                 <button className="ch-send-btn" onClick={sendMessage} title="Send"><SendIcon /></button>
//               </div>
//             )}
//           </>
//         )}
//       </main>

//       {/* ══════════ CREATE GROUP MODAL ══════════ */}
//       {showCreateGroup && (
//         <CreateGroupModal
//           onClose={() => setShowCreateGroup(false)}
//           onCreated={(newGroup) => {
//             setGroups(prev => [newGroup, ...prev]);
//             setActiveGroup(newGroup);
//             setSelectedChat(null);
//           }}
//         />
//       )}

//       {/* ══════════ REQUEST MODAL ══════════ */}
//       {requestModalShow && (
//         <div className="ch-modal-overlay" onClick={() => setRequestModalShow(false)}>
//           <div className="ch-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="ch-modal-head">
//               <h3 className="ch-modal-title">Skill Exchange Request</h3>
//               <p className="ch-modal-sub">Review and decide whether to accept</p>
//             </div>
//             {selectedRequest && (
//               <RequestCard name={selectedRequest.name} skills={selectedRequest.skillsProficientAt} rating="4" picture={selectedRequest.picture} username={selectedRequest.username} />
//             )}
//             <div className="ch-modal-actions">
//               <button className="ch-btn ch-btn--accept" onClick={handleRequestAccept}>
//                 {acceptRequestLoading ? <Spinner animation="border" size="sm" /> : <><CheckIcon /> Accept</>}
//               </button>
//               <button className="ch-btn ch-btn--decline" onClick={handleRequestReject}>
//                 {acceptRequestLoading ? <Spinner animation="border" size="sm" /> : <><CrossIcon /> Decline</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══════════ INCOMING CALL POPUP — shows on ANY page ══════════ */}
//       {incomingCall && (
//         <div className="ch-call-popup">
//           <div className="ch-call-ring" />
//           <p className="ch-call-name">{incomingCall.name || incomingCall.fromName}</p>
//           <p className="ch-call-sub">Incoming video call…</p>
//           <div className="ch-call-actions">
//             <button
//               className="ch-call-btn ch-call-btn--accept"
//               onClick={() => {
//                 const roomId = incomingCall.roomId;
//                 setIncomingCall(null);
//                 navigate(`/video/${roomId}?receiver=true`);
//               }}
//             >
//               <PhoneIcon /> Accept
//             </button>
//             <button className="ch-call-btn ch-call-btn--reject" onClick={() => setIncomingCall(null)}>
//               <EndCallIcon /> Decline
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ══════════ SCHEDULE MODAL ══════════ */}
//       {showSchedule && selectedChat && (
//         <div className="ch-modal-overlay" onClick={() => setShowSchedule(false)}>
//           <div className="ch-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="ch-modal-head">
//               <h3 className="ch-modal-title">Schedule Session with {selectedChat.name}</h3>
//             </div>
//             <label>Date</label>
//             <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
//             <label>Time</label>
//             <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
//             <div className="ch-modal-actions">
//               <button className="ch-btn ch-btn--decline" onClick={() => setShowSchedule(false)}>Cancel</button>
//               <button className="ch-btn ch-btn--accept" onClick={async () => {
//                 try {
//                   await axios.post(`${import.meta.env.VITE_SERVER_URL}/meeting/schedule`, {
//                     participantId: selectedChat.userId, date: scheduleDate, time: scheduleTime,
//                   }, { withCredentials: true });
//                   toast.success("Session scheduled successfully");
//                   setShowSchedule(false); setScheduleDate(""); setScheduleTime("");
//                 } catch { toast.error("Failed to schedule session"); }
//               }}>Schedule</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ── Sub-components ── */
// const Avatar = ({ src, name, size, cls = "" }) => {
//   const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
//   const [errored, setErrored] = React.useState(false);
//   if (src && !errored) {
//     return <img src={src} alt={name} className={`ch-avatar ${cls}`} style={{ width: size, height: size }} onError={() => setErrored(true)} />;
//   }
//   return <div className={`ch-avatar ch-avatar--initials ${cls}`} style={{ width: size, height: size, fontSize: size * 0.35 }}>{initials}</div>;
// };

// const CenteredSpinner = ({ flex }) => (
//   <div className={flex ? "ch-spinner-flex" : "ch-spinner-center"}><div className="ch-spinner" /></div>
// );
// const EmptyState = ({ icon, text }) => (
//   <div className="ch-list-empty"><span className="ch-list-empty-icon">{icon}</span><span>{text}</span></div>
// );

// const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
// const AttachIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
// const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
// const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
// const CrossIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
// const PhoneIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.46 8.81 19.79 19.79 0 01.4 4.18 2 2 0 012.39 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
// const EndCallIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// export default Chats;













































import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import RequestCard from "./RequestCard";
import "./Chats.css";
import { Link } from "react-router-dom";
import { FaVideo } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import CreateGroupModal from "./CreateGroupModal";
import GroupChatView from "./GroupChatView";

var socket;

const Chats = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get("tab") || "chats";

  const [activeTab, setActiveTab]                       = useState(defaultTab);
  const [requests, setRequests]                         = useState([]);
  const [requestLoading, setRequestLoading]             = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);
  const [requestModalShow, setRequestModalShow]         = useState(false);
  const [selectedChat, setSelectedChat]                 = useState(null);
  const [chatMessages, setChatMessages]                 = useState([]);
  const [chats, setChats]                               = useState([]);
  const [chatLoading, setChatLoading]                   = useState(true);
  const [chatMessageLoading, setChatMessageLoading]     = useState(false);
  const [message, setMessage]                           = useState("");
  const [selectedRequest, setSelectedRequest]           = useState(null);
  const [incomingCall, setIncomingCall]                 = useState(null);
  const [showSchedule, setShowSchedule]                 = useState(false);
  const [scheduleDate, setScheduleDate]                 = useState("");
  const [scheduleTime, setScheduleTime]                 = useState("");

  // ── Group state ──
  const [groups, setGroups]                   = useState([]);
  const [activeGroup, setActiveGroup]         = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // ── Unread + last messages ──
  const [unreadCounts, setUnreadCounts] = useState({});
  const [groupUnread, setGroupUnread]   = useState({});
  const [lastMessages, setLastMessages] = useState({});

  // keep selectedChat in a ref so socket handlers can read current value
  const selectedChatRef = useRef(null);
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const ME_ID = user?._id || "me";

  // Fetch groups
  useEffect(() => {
    if (!user) return;
    axios.get(`${import.meta.env.VITE_SERVER_URL}/group/my-groups`, { withCredentials: true })
      .then(({ data }) => setGroups(data.data || []))
      .catch(() => {});
  }, [user]);

  // Fetch chats when user is ready
  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    if (defaultTab === "requests") getRequests();
  }, []);

  // ── Socket setup ──
  useEffect(() => {
    if (!user) return;

    socket = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.emit("setup", user);

    // New message received
    socket.on("message recieved", (msg) => {
      const currentChat = selectedChatRef.current;
      const chatId = msg.chatId?._id || msg.chatId;

      setLastMessages(prev => ({ ...prev, [chatId]: msg.content }));

      if (currentChat && currentChat.id === chatId) {
        setChatMessages((prev) => [...prev, msg]);
      } else {
        setUnreadCounts(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }));
      }
    });

    // Group message unread
    socket.on("group-message", ({ groupId }) => {
      setGroupUnread(prev => ({ ...prev, [groupId]: (prev[groupId] || 0) + 1 }));
    });

    // Incoming call
    socket.on("incoming-call", (data) => {
      console.log("📞 Incoming call from:", data.name);
      setIncomingCall(data);
    });

    socket.on("call-invite", (data) => {
      console.log("📞 Call invite from:", data.from);
      setIncomingCall({
        name: data.fromName || data.from,
        roomId: [data.from, user?._id].sort().join("_"),
        from: data.from,
      });
    });

    socket.on("video-offer", async ({ offer }) => {
      console.log("Received offer", offer);
    });

    return () => {
      socket.off("message recieved");
      socket.off("incoming-call");
      socket.off("call-invite");
      socket.off("group-message");
      socket.disconnect();
    };
  }, [user]);

  // ── Fetch chats ──
  const fetchChats = async () => {
    if (!user || !user._id) return;
    try {
      setChatLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/chat/getChats`,
        { withCredentials: true }
      );

      const temp = data.data.map((chat) => {
        const otherUser = chat.users.find((u) => u._id !== user._id);
        return {
          id: chat._id,
          userId: otherUser._id,
          name: otherUser.name,
          picture: otherUser.picture,
          username: otherUser.username,
          lastMessage: chat.latestMessage?.content || "",
          unreadCount: chat.unreadCount || 0,
        };
      });

      setChats(temp);

      const initLast = {};
      const initUnread = {};
      temp.forEach(c => {
        if (c.lastMessage) initLast[c.id] = c.lastMessage;
        if (c.unreadCount > 0) initUnread[c.id] = c.unreadCount;
      });
      setLastMessages(initLast);
      setUnreadCounts(initUnread);

    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/logout`);
          navigate("/login");
        }
      } else {
        toast.error("Failed to load chats");
      }
    } finally {
      setChatLoading(false);
    }
  };

  // ── Open a chat and load its messages ──
  const handleChatClick = async (chatId) => {
    setActiveGroup(null);
    setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
    try {
      setChatMessageLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/message/getMessages/${chatId}`,
        { withCredentials: true }
      );
      setChatMessages(data.data);
      setMessage("");
      const chat = chats.find((c) => c.id === chatId);
      setSelectedChat(chat);
      socket.emit("join chat", chatId);
    } catch (err) {
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error("Something went wrong");
    } finally {
      setChatMessageLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    setSelectedChat(null);
    setActiveGroup(group);
    setGroupUnread(prev => ({ ...prev, [group._id]: 0 }));
  };

  // ── Send a message ──
  const sendMessage = async () => {
    if (message.trim() === "") { toast.error("Message is empty"); return; }
    try {
      socket.emit("stop typing", selectedChat.id);
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/message/sendMessage`,
        { chatId: selectedChat.id, content: message },
        { withCredentials: true }
      );
      socket.emit("new message", data.data);
      setChatMessages((prev) => [...prev, data.data]);
      setLastMessages(prev => ({ ...prev, [selectedChat.id]: message }));
      setMessage("");
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/logout`);
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else toast.error("Something went wrong");
    }
  };

  const handleVideoCall = () => {
    if (!selectedChat) return;
    const roomId = [user._id, selectedChat.userId].sort().join("_");
    socket.emit("call-user", {
      to: selectedChat.userId,
      from: user._id,
      fromName: user.name,
      name: user.name,
      roomId,
    });
    navigate(`/video/${roomId}?callerName=${encodeURIComponent(selectedChat.name)}`);
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/request/getRequests`,
        { withCredentials: true }
      );
      setRequests(data.data);
      toast.success(data.message);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/logout`);
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else toast.error("Something went wrong");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    if (tab === "requests") await getRequests();
    else await fetchChats();
  };

  const handleRequestClick  = (req) => { setSelectedRequest(req); setRequestModalShow(true); };

  const handleRequestAccept = async () => {
    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/request/acceptRequest`,
        { requestId: selectedRequest._id },
        { withCredentials: true }
      );
      toast.success(data.message);
      setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const handleRequestReject = async () => {
    try {
      setAcceptRequestLoading(true);
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/request/rejectRequest`,
        { requestId: selectedRequest._id },
        { withCredentials: true }
      );
      setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const fmt = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const truncate = (text, max = 28) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  return (
    <div className="ch-root">

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="ch-sidebar">
        <div className="ch-sidebar-head">
          <div className="ch-sidebar-top-row">
            <span className="ch-sidebar-title">Messages</span>
            <button className="ch-new-group-btn" onClick={() => setShowCreateGroup(true)} title="Create new group">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Group
            </button>
          </div>

          <div className="ch-tabs">
            <button className={`ch-tab ${activeTab === "chats" ? "ch-tab--active" : ""}`} onClick={() => handleTabClick("chats")}>Chats</button>
            <button className={`ch-tab ${activeTab === "requests" ? "ch-tab--active" : ""}`} onClick={() => handleTabClick("requests")}>
              Requests
              {requests.length > 0 && <span className="ch-tab-badge">{requests.length}</span>}
            </button>
          </div>

          <label className="ch-search">
            <SearchIcon />
            <input type="text" placeholder="Search…" />
          </label>
        </div>

        <div className="ch-list">
          {activeTab === "chats" && (
            <>
              {chatLoading ? <CenteredSpinner /> : (
                <>
                  {chats.length > 0 && (
                    <>
                      <div className="ch-list-section-label">Direct</div>
                      {chats.map((chat) => (
                        <button
                          key={chat.id}
                          className={`ch-item ${selectedChat?.id === chat.id ? "ch-item--active" : ""}`}
                          onClick={() => handleChatClick(chat.id)}
                        >
                          <Avatar src={chat.picture} name={chat.name} size={40} />
                          <div className="ch-item-info">
                            <div className="ch-item-name-row">
                              <span className="ch-item-name">{chat.name}</span>
                              {unreadCounts[chat.id] > 0 && (
                                <span className="ch-unread-badge">{unreadCounts[chat.id]}</span>
                              )}
                            </div>
                            <span className={`ch-item-sub ${unreadCounts[chat.id] > 0 ? "ch-item-sub--unread" : ""}`}>
                              {lastMessages[chat.id]
                                ? truncate(lastMessages[chat.id])
                                : `@${chat.username}`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {groups.length > 0 && (
                    <>
                      <div className="ch-list-section-label">Groups</div>
                      {groups.map((grp) => (
                        <button
                          key={grp._id}
                          className={`ch-item ${activeGroup?._id === grp._id ? "ch-item--active" : ""}`}
                          onClick={() => handleGroupClick(grp)}
                        >
                          <div className="ch-group-avatar">
                            {grp.picture
                              ? <img src={grp.picture} alt={grp.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                              : <span className="ch-group-avatar-letter">{grp.name?.[0]?.toUpperCase()}</span>
                            }
                          </div>
                          <div className="ch-item-info">
                            <div className="ch-item-name-row">
                              <span className="ch-item-name">{grp.name}</span>
                              {groupUnread[grp._id] > 0 && (
                                <span className="ch-unread-badge">{groupUnread[grp._id]}</span>
                              )}
                            </div>
                            <span className={`ch-item-sub ${groupUnread[grp._id] > 0 ? "ch-item-sub--unread" : ""}`}>
                              {grp.members?.length} members
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {chats.length === 0 && groups.length === 0 && (
                    <EmptyState icon="💬" text="No conversations yet" />
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "requests" && (
            requestLoading ? <CenteredSpinner /> :
            requests.length === 0 ? <EmptyState icon="📨" text="No pending requests" /> :
            requests.map((req) => (
              <button key={req._id} className="ch-item" onClick={() => handleRequestClick(req)}>
                <Avatar src={req.picture} name={req.name} size={40} />
                <div className="ch-item-info">
                  <span className="ch-item-name">{req.name}</span>
                  <span className="ch-item-sub ch-item-sub--req">Skill swap request</span>
                </div>
                <span className="ch-req-dot" />
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main className="ch-main">
        {activeGroup ? (
          <GroupChatView
            group={activeGroup}
            socket={socket}
            currentUser={user}
            onGroupUpdated={(action, data) => {
              if (action === "left" || action === "deleted") {
                setGroups(prev => prev.filter(g => g._id !== (typeof data === "string" ? data : data?._id)));
                setActiveGroup(null);
              } else if (action === "updated") {
                setGroups(prev => prev.map(g => g._id === data._id ? data : g));
                setActiveGroup(data);
              }
            }}
          />
        ) : (
          <>
            <div className="ch-topbar">
              {selectedChat ? (
                <>
                  <div className="ch-topbar-left">
                    <Avatar src={selectedChat.picture} name={selectedChat.name} size={36} />
                    <div>
                      <p className="ch-topbar-name">{selectedChat.name}</p>
                      <p className="ch-topbar-handle">@{selectedChat.username}</p>
                    </div>
                  </div>
                  <div className="ch-topbar-right">
                    <button className="ch-icon-btn" onClick={handleVideoCall} title="Video call"><FaVideo size={15} /></button>
                    <button className="ch-profile-btn" onClick={() => setShowSchedule(true)}>Schedule</button>
                    <Link to={`/profile/${selectedChat.username}`} state={{ from: "/chats" }} className="ch-profile-btn">View profile →</Link>
                  </div>
                </>
              ) : (
                <span className="ch-topbar-placeholder">Select a conversation to start messaging</span>
              )}
            </div>

            {selectedChat ? (
              chatMessageLoading ? <CenteredSpinner flex /> : (
                <div className="ch-messages">
                  <div className="ch-date-divider">
                    <span className="ch-date-line" />
                    <span className="ch-date-label">Today</span>
                    <span className="ch-date-line" />
                  </div>
                  <ScrollableFeed forceScroll={true}>
                    {chatMessages.map((msg, i) => {
                      const isMe = msg.sender._id === ME_ID || msg.sender._id === "me";
                      return (
                        <div key={i} className={`ch-msg-row ${isMe ? "ch-msg-row--me" : "ch-msg-row--them"}`}>
                          {!isMe && <Avatar src={selectedChat.picture} name={selectedChat.name} size={28} cls="ch-msg-avatar" />}
                          <div className="ch-msg-wrap">
                            <div className={`ch-bubble ${isMe ? "ch-bubble--me" : "ch-bubble--them"}`}>{msg.content}</div>
                            {msg.createdAt && <span className={`ch-msg-time ${isMe ? "ch-msg-time--me" : ""}`}>{fmt(msg.createdAt)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </ScrollableFeed>
                </div>
              )
            ) : (
              <div className="ch-empty">
                <div className="ch-empty-glyph">✦</div>
                <p className="ch-empty-heading">No conversation selected</p>
                <p className="ch-empty-sub">Choose a chat or group from the sidebar</p>
              </div>
            )}

            {selectedChat && (
              <div className="ch-input-bar">
                <label className="ch-attach-btn" title="Share file, photo or document">
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setMessage(`📎 ${file.name}`);
                      toast.info(`${file.name} selected — press send to share`);
                      e.target.value = "";
                    }}
                  />
                  <AttachIcon />
                </label>
                <input
                  className="ch-input"
                  type="text"
                  placeholder={`Message ${selectedChat.name}…`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                />
                <button className="ch-send-btn" onClick={sendMessage} title="Send"><SendIcon /></button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ══════════ CREATE GROUP MODAL ══════════ */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(newGroup) => {
            setGroups(prev => [newGroup, ...prev]);
            setActiveGroup(newGroup);
            setSelectedChat(null);
          }}
        />
      )}

      {/* ══════════ REQUEST MODAL ══════════ */}
      {requestModalShow && (
        <div className="ch-modal-overlay" onClick={() => setRequestModalShow(false)}>
          <div className="ch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal-head">
              <h3 className="ch-modal-title">Skill Exchange Request</h3>
              <p className="ch-modal-sub">Review and decide whether to accept</p>
            </div>
            {selectedRequest && (
              <RequestCard
                name={selectedRequest.name}
                skills={selectedRequest.skillsProficientAt}
                rating="4"
                picture={selectedRequest.picture}
                username={selectedRequest.username}
              />
            )}
            <div className="ch-modal-actions">
              <button className="ch-btn ch-btn--accept" onClick={handleRequestAccept}>
                {acceptRequestLoading ? <Spinner animation="border" size="sm" /> : <><CheckIcon /> Accept</>}
              </button>
              <button className="ch-btn ch-btn--decline" onClick={handleRequestReject}>
                {acceptRequestLoading ? <Spinner animation="border" size="sm" /> : <><CrossIcon /> Decline</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ INCOMING CALL POPUP ══════════ */}
      {incomingCall && (
        <div className="ch-call-popup">
          <div className="ch-call-ring" />
          <p className="ch-call-name">{incomingCall.name || incomingCall.fromName}</p>
          <p className="ch-call-sub">Incoming video call…</p>
          <div className="ch-call-actions">
            <button
              className="ch-call-btn ch-call-btn--accept"
              onClick={() => {
                const roomId = incomingCall.roomId;
                setIncomingCall(null);
                navigate(`/video/${roomId}?receiver=true`);
              }}
            >
              <PhoneIcon /> Accept
            </button>
            <button className="ch-call-btn ch-call-btn--reject" onClick={() => setIncomingCall(null)}>
              <EndCallIcon /> Decline
            </button>
          </div>
        </div>
      )}

      {/* ══════════ SCHEDULE MODAL ══════════ */}
      {showSchedule && selectedChat && (
        <div className="ch-modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="ch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal-head">
              <h3 className="ch-modal-title">Schedule Session with {selectedChat.name}</h3>
            </div>
            <label>Date</label>
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <label>Time</label>
            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            <div className="ch-modal-actions">
              <button className="ch-btn ch-btn--decline" onClick={() => setShowSchedule(false)}>Cancel</button>
              <button className="ch-btn ch-btn--accept" onClick={async () => {
                try {
                  await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/meeting/schedule`,
                    { participantId: selectedChat.userId, date: scheduleDate, time: scheduleTime },
                    { withCredentials: true }
                  );
                  toast.success("Session scheduled successfully");
                  setShowSchedule(false);
                  setScheduleDate("");
                  setScheduleTime("");
                } catch {
                  toast.error("Failed to schedule session");
                }
              }}>Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Sub-components ── */
const Avatar = ({ src, name, size, cls = "" }) => {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const [errored, setErrored] = React.useState(false);
  if (src && !errored) {
    return <img src={src} alt={name} className={`ch-avatar ${cls}`} style={{ width: size, height: size }} onError={() => setErrored(true)} />;
  }
  return <div className={`ch-avatar ch-avatar--initials ${cls}`} style={{ width: size, height: size, fontSize: size * 0.35 }}>{initials}</div>;
};

const CenteredSpinner = ({ flex }) => (
  <div className={flex ? "ch-spinner-flex" : "ch-spinner-center"}><div className="ch-spinner" /></div>
);
const EmptyState = ({ icon, text }) => (
  <div className="ch-list-empty"><span className="ch-list-empty-icon">{icon}</span><span>{text}</span></div>
);

const SearchIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const AttachIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
const SendIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CheckIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CrossIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PhoneIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.46 8.81 19.79 19.79 0 01.4 4.18 2 2 0 012.39 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const EndCallIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default Chats;