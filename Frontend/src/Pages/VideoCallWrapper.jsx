import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import VideoCall from "./Chats/VideoCall";
import io from "socket.io-client";

const VideoCallWrapper = () => {
  const { roomId }  = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("userInfo"));

  const params     = new URLSearchParams(location.search);
  const isReceiver = params.get("receiver") === "true";

  // Get the other person's name from URL param (passed by Chats.jsx when calling)
  const callerName = params.get("callerName") || "Unknown";

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit("setup", currentUser);
    }
  }, [socket]);

  if (!socket) return null;

  // My display name — use actual name, not _id
  const myName = currentUser.name || currentUser.username || "You";

  // ── Group call: roomId = "group_<groupId>" ──
  const isGroupCall = roomId.startsWith("group_");

  if (isGroupCall) {
    const groupId = roomId.replace("group_", "");
    const groupName = params.get("groupName") || "Group Call";
    return (
      <VideoCall
        socket={socket}
        userId={myName}
        targetUserId={groupName}
        isCaller={!isReceiver}
        isGroupCall={true}
        groupId={groupId}
        groupName={groupName}
        onClose={() => navigate("/chats")}
      />
    );
  }

  
  const parts = roomId.split("_");
  const targetSocketId = currentUser._id === parts[0] ? parts[1] : parts[0];

  return (
    <VideoCall
      socket={socket}
      userId={myName}
      targetUserId={targetSocketId}   // used for socket emit("to") — must stay as _id
      targetDisplayName={callerName}  // used only for display in UI
      isCaller={!isReceiver}
      isGroupCall={false}
      onClose={() => navigate("/chats")}
    />
  );
};

export default VideoCallWrapper;