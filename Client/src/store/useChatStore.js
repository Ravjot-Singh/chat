import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({

    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
    isSocketConnected: false,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    setSelectedUser: (selectedUser) => set({ selectedUser: selectedUser }),

    getAllContacts: async () => {

        set({ isUsersLoading: true });

        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data || [] });
        } catch (error) {

            toast.error(error?.response?.data?.message || "Unable to get contacts");

        } finally {
            set({ isUsersLoading: false });
        }

    },

    getMyChatPartners: async () => {

        set({ isUsersLoading: true });

        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {

            toast.error(error?.response?.data?.message || "Unable to get chat partners");

        } finally {
            set({ isUsersLoading: false });
        }

    },

    getMessagesByUserId: async (userId) => {

        set({ isMessagesLoading: true });

        try {
            const res = await axiosInstance.get(`/messages/${userId}`);

            set({ messages: res.data });
        } catch (error) {

            toast.error(error?.response?.data?.message || "Unable to get the chat");

        } finally {
            set({ isMessagesLoading: false });
        }

    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        const { authUser } = useAuthStore.getState();
        
        if (!selectedUser || !authUser) {
            toast.error("User information is missing");
            return;
        }
        
        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        }

        const messagesWithOptimistic = [...messages, optimisticMessage];
        set({ messages: messagesWithOptimistic });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            if (res.data) {
                // Replace optimistic message with real message
                const updatedMessages = messagesWithOptimistic.map((msg) =>
                    msg._id === tempId ? res.data : msg
                );
                set({ messages: updatedMessages });
            }
        } catch (error) {

            set({ messages: messages });

            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Remove any existing listener before adding a new one to prevent duplicates
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            if (!newMessage) return;
            
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

            if (!isMessageSentFromSelectedUser) return;

            const currentMessages = get().messages;
            
            // Check if this message already exists to avoid duplicates
            const messageExists = currentMessages.some((msg) => msg._id === newMessage._id);
            if (messageExists) return;

            set({ messages: [...currentMessages, newMessage] });

            if (isSoundEnabled) {

                const notificationSound = new Audio("/sounds/notification.mp3");

                notificationSound.currentTime = 0;

                notificationSound.play().catch((e) => console.log("Audio play failed:", e));
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    },



}))