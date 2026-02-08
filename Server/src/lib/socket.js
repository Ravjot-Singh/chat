import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from './env.js';
import { socketAuthMiddleware } from '../middlewares/socketauth.middleware.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {

        origin: [ENV.CLIENT_URL],
        credentials: true,

    },

});

io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.user.fullName);

    const userId = socket.userId || socket.user?._id?.toString();
    if (!userId) {
        console.error("❌ User ID not found in socket");
        return;
    }
    
    userSocketMap[userId] = socket.id;
    console.log("📍 User mapped:", { userId, socketId: socket.id });

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("📱 Broadcasting online users:", Object.keys(userSocketMap));

    socket.on("disconnect", () => {

        console.log("❌ A user disconnected:", socket.user.fullName);

        delete userSocketMap[userId];

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("📱 Broadcasting online users after disconnect:", Object.keys(userSocketMap));
    });
});

export { io, app, server };