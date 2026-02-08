import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000" : "/";

export const useAuthStore = create((set, get) => ({

    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {

            const res = await axiosInstance.get('/auth/check');

            set({ authUser: res.data });

            get().connectSocket();

        } catch (error) {
            console.log("Error in authcheck : ", error);
            set({ authUser: null });

        } finally {

            set({ isCheckingAuth: false });
        }

    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {

            const res = await axiosInstance.post("/auth/signup", data);

            set({ authUser: res.data });

            get().connectSocket();

            toast.success("Account created successfully!");

        } catch (error) {

            toast.error(error?.response?.data?.message || "Signup failed");

        } finally {

            set({ isSigningUp: false });

        }

    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {

            const res = await axiosInstance.post("/auth/login", data);

            set({ authUser: res.data });

            toast.success("Logged in successfully!");
            get().connectSocket();

        } catch (error) {

            toast.error(error?.response?.data?.message || "Login failed");

        } finally {

            set({ isLoggingIn: false });

        }

    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully!");

            get().disconnectSocket();
        } catch (error) {
            console.log("Logout error:", error);
            toast.error(error.response?.data?.message || "Error logging out");
        }
    },

    updateProfile: async (data) => {

        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully!");
        } catch (error) {

            console.log("Error in update profile : ", error);
            toast.error(error?.response?.data?.message || "Failed to update profile");

        }

    },

    connectSocket: () => {

        const { authUser, socket } = get();
        if (!authUser || socket) return;


        try {
            const socket = io(BASE_URL, {
                withCredentials: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            socket.on("connect", () => {
                console.log("✅ Socket connected successfully");
            });

            socket.on("connect_error", (error) => {
                console.error("❌ Socket connection error:", error.message);
            });

            socket.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
            });

            socket.on("getOnlineUsers", (userIds) => {
                console.log("📱 Online users updated:", userIds);
                set({ onlineUsers: userIds });
            });

            set({ socket: socket });
        } catch (error) {
            console.log("Failed to connect socket:", error);
        }
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.off();
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },

}));