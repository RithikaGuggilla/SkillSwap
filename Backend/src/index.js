
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import { startReminderCron } from "./utils/reminderCron.js";


dotenv.config();

const port = process.env.PORT || 8000;

// ✅ STORE USER ↔ SOCKET MAPPING
const users = {};

connectDB()
  .then(() => {
    console.log("Database connected");
    startReminderCron();
    //console.log("Database connected");

    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: [
          "http://localhost:5173",
          "http://127.0.0.1:5173"
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log("🔌 Connected:", socket.id);



      // ✅ SETUP (REGISTER USER)
      socket.on("setup", (userData) => {
        console.log("👤 Setup:", userData.username);

        users[userData._id] = socket.id; // ⭐ IMPORTANT

        socket.join(userData._id);
        socket.emit("connected");
      });



      socket.on("join-group", ({ groupId }) => {
  socket.join(`group:${groupId}`);
  console.log(`Socket ${socket.id} joined group room: group:${groupId}`);
});
 
socket.on("group-message", ({ groupId, message }) => {
  // Broadcast to all members in this group room (including sender)
  io.to(`group:${groupId}`).emit("group-message", { groupId, message });
});
 
socket.on("leave-group", ({ groupId }) => {
  socket.leave(`group:${groupId}`);
});

      // ✅ JOIN CHAT
      socket.on("join chat", (room) => {
        socket.join(room);
      });

      // ✅ NORMAL CHAT MESSAGE
      socket.on("new message", (newMessage) => {
        const chat = newMessage.chatId;

        if (!chat.users) return;

        chat.users.forEach((user) => {
          if (user._id === newMessage.sender._id) return;

          const targetSocket = users[user._id];
          if (targetSocket) {
            io.to(targetSocket).emit("message recieved", newMessage);
          }
        });
      });

      // ✅ SIMPLE CHAT MESSAGE
      socket.on("chat-message", ({ from, text, to }) => {
        const targetSocket = users[to];

        if (targetSocket) {
          io.to(targetSocket).emit("chat-message", { from, text });
        }
      });

      // ───────── VIDEO CALL EVENTS ───────── //

      // 📞 CALL USER
     socket.on("call-user", ({ to, from, name, fromName, roomId }) => {
  const targetSocketId = users[to]; // however you look up socket by userId
  if (targetSocketId) {
    io.to(targetSocketId).emit("incoming-call", {
      from,
      name: name || fromName,      // ← make sure name is passed
      fromName: name || fromName,  // ← pass both for safety
      roomId,
    });
  }
});
 
// Also handle call-invite (used by VideoCall component):
socket.on("call-invite", ({ to, from, fromName }) => {
  const targetSocketId = users[to];
  if (targetSocketId) {
    io.to(targetSocketId).emit("incoming-call", {
      from,
      name: fromName || from,
      fromName: fromName || from,
      roomId: [from, to].sort().join("_"),
    });
  }
});

      // 👀 USER READY
      socket.on("user-ready", ({ to, from }) => {
        const targetSocket = users[to];

        if (targetSocket) {
          io.to(targetSocket).emit("user-ready", { from });
        }
      });

      // 📩 VIDEO OFFER
      socket.on("video-offer", ({ offer, to }) => {
        console.log("📩 OFFER FORWARDED");

        const targetSocket = users[to];

        if (targetSocket) {
          io.to(targetSocket).emit("video-offer", { offer });
        }
      });

      // ✅ VIDEO ANSWER
      socket.on("video-answer", ({ answer, to }) => {
        console.log("✅ ANSWER FORWARDED");

        const targetSocket = users[to];

        if (targetSocket) {
          io.to(targetSocket).emit("video-answer", { answer });
        }
      });


      // Add these alongside your existing video-offer / video-answer / ice-candidate handlers

socket.on("screen-share-started", ({ to }) => {
  io.to(to).emit("screen-share-started");
});

socket.on("screen-share-stopped", ({ to }) => {
  io.to(to).emit("screen-share-stopped");
});

// Forward call-ended to the other person
socket.on("call-ended", ({ to }) => {
  io.to(to).emit("call-ended");
});



// ── New: call invite / accept / decline ──

 
socket.on("call-accepted", ({ to }) => {
  io.to(to).emit("call-accepted");
});
 
socket.on("call-declined", ({ to }) => {
  io.to(to).emit("call-declined");
});
 

// ── Whiteboard sync ──
socket.on("wb-draw", ({ to, x0, y0, x1, y1, color, width, tool }) => {
  io.to(to).emit("wb-draw", { x0, y0, x1, y1, color, width, tool });
});
 
socket.on("wb-clear", ({ to }) => {
  io.to(to).emit("wb-clear");
});
 
socket.on("wb-cursor", ({ to, x, y, name }) => {
  io.to(to).emit("wb-cursor", { x, y, name });
});
 
socket.on("wb-undo", ({ to, imageDataArr }) => {
  io.to(to).emit("wb-undo", { imageDataArr });
});
 

// Sync whiteboard open/close
socket.on("wb-opened", ({ to }) => { io.to(to).emit("wb-opened"); });
socket.on("wb-closed", ({ to }) => { io.to(to).emit("wb-closed"); });
 

      // 🧊 ICE CANDIDATE
      socket.on("ice-candidate", ({ candidate, to }) => {
        const targetSocket = users[to];

        if (targetSocket) {
          io.to(targetSocket).emit("ice-candidate", { candidate });
        }
      });

      // ❌ DISCONNECT CLEANUP
      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);

        for (const userId in users) {
          if (users[userId] === socket.id) {
            delete users[userId];
            break;
          }
        }
      });
    });

  })
  .catch((err) => {
    console.log("DB Error:", err);
  });



  
 