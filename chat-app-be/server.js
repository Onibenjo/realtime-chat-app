const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {v4: uuidv4 } = require( "uuid")

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Storage for messages, rooms, and users
const messages = {}
const rooms = []
const users = {}

// Initialize a default room
if (rooms.length === 0) {
  const generalRoom = {
    id: uuidv4(),
    name: "General",
    createdBy: "system",
  }
  rooms.push(generalRoom)
  messages[generalRoom.id] = []
}

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Invalid username'));
  }
  socket.username = username;
  next();
});

// io.on('connection', (socket) => {
//   console.log(`${socket.username} connected`);

//   // Join a room
//   socket.on('joinRoom', (room) => {
//     socket.join(room);
//     if (!chatRooms[room]) {
//       chatRooms[room] = { messages: [], users: new Set() };
//     }
//     chatRooms[room].users.add(socket.username);

//     // Broadcast the updated list of online users to the room
//     io.to(room).emit('roomUsers', Array.from(chatRooms[room].users));

//     // Send the current chat history to the newly joined user
//     socket.emit('chatHistory', chatRooms[room].messages);
//     console.log(`${socket.username} joined room ${room}`);
//   });

//   // Leave a room
//   socket.on('leaveRoom', (room) => {
//     socket.leave(room);
//     if (chatRooms[room]) {
//       chatRooms[room].users.delete(socket.username);
//       io.to(room).emit('roomUsers', Array.from(chatRooms[room].users));
//       console.log(`${socket.username} left room ${room}`);
//     }
//   });

//   // Handle new chat messages
//   socket.on('chatMessage', ({ room, message }) => {
//     const msgData = {
//       username: socket.username,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     console.log("🚀 ~ socket.on ~ chatRooms:", chatRooms)
//     if (chatRooms[room]) {
//       chatRooms[room].messages.push(msgData);
//       io.to(room).emit('newMessage', msgData);
//     }
//   });

//   // Bonus: Provide a list of active rooms
//   socket.on('getActiveRooms', () => {
//     const activeRooms = Object.keys(chatRooms).filter(
//       (room) => chatRooms[room].users.size > 0
//     );
//     socket.emit('activeRooms', activeRooms);
//   });

//   // When disconnecting, remove the user from all joined rooms
//   socket.on('disconnecting', () => {
//     const rooms = socket.rooms; // Set of room names including socket.id
//     rooms.forEach((room) => {
//       if (room !== socket.id && chatRooms[room]) {
//         chatRooms[room].users.delete(socket.username);
//         io.to(room).emit('roomUsers', Array.from(chatRooms[room].users));
//       }
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log(`${socket.username} disconnected`);
//   });
// });


io.on("connection", (socket) => {
    const { username } = socket.handshake.auth

    if (!username) {
      socket.disconnect()
      return
    }

    console.log(`User connected: ${username}`)

    // Store user information
    users[socket.id] = {
      username,
      roomId: null,
    }

    // Send room list to the user
    socket.emit("roomList", rooms)

    // Handle getting rooms
    socket.on("getRooms", () => {
      socket.emit("roomList", rooms)
    })

    // Handle creating a room
    socket.on("createRoom", (roomName) => {
      const newRoom = {
        id: uuidv4(),
        name: roomName,
        createdBy: username,
      }

      rooms.push(newRoom)
      messages[newRoom.id] = []

      // Broadcast updated room list to all users
      io.emit("roomList", rooms)
    })

    // Handle joining a room
    socket.on("joinRoom", (roomId) => {
      // Leave current room if any
      if (users[socket.id].roomId) {
        socket.leave(users[socket.id].roomId)
      }

      // Join new room
      socket.join(roomId)
      users[socket.id].roomId = roomId

      // Send room history to the user
      socket.emit("roomHistory", {
        roomId,
        history: messages[roomId] || [],
      })

      // Broadcast online users in the room
      const roomUsers = Object.values(users).filter((user) => user.roomId === roomId)
      io.to(roomId).emit("onlineUsers", roomUsers)
    })

    // Handle sending a message
    socket.on("sendMessage", ({ text, roomId }) => {
      if (!roomId || !text) return

      const message = {
        id: uuidv4(),
        username,
        text,
        timestamp: Date.now(),
        roomId,
      }

      // Store message in memory
      if (!messages[roomId]) {
        messages[roomId] = []
      }
      messages[roomId].push(message)

      // Broadcast message to all users in the room
      io.to(roomId).emit("message", message)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${username}`)

      const roomId = users[socket.id]?.roomId

      // Remove user from users list
      delete users[socket.id]

      // Broadcast updated online users if user was in a room
      if (roomId) {
        const roomUsers = Object.values(users).filter((user) => user.roomId === roomId)
        io.to(roomId).emit("onlineUsers", roomUsers)
      }
    })
  })



const PORT = process.env.PORT || 5500;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
