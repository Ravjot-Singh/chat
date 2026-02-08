import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

const getAllContacts = async (req, res) => {

    try {
        const loggedUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedUserId } }).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {

        console.log("Error in getAllContacts:", error);
        res.status(500).json({ message: "Server error" });

    }

}

const getMessagesByUserId = async (req, res) => {

    try {

        const myId = req.user._id;
        const { id: otherId } = req.params;

        if (!otherId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId },

            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

}

const sendMessage = async (req, res) => {

    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required." });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
        }
        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        let imageUrl = null;
        if (image) {
            try {
                // upload base64 image to cloudinary
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse?.secure_url || null;
            } catch (uploadError) {
                console.log("Error uploading image to Cloudinary:", uploadError);
                return res.status(400).json({ message: "Failed to upload image" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const ReceiverSocketId = getReceiverSocketId(receiverId);
        if (ReceiverSocketId && io) {
            io.to(ReceiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

}

const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        if (!loggedInUserId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const messages = await Message.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password") || [];

        res.status(200).json(chatPartners);
    } catch (error) {
        console.error("Error in getChatPartners: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export {
    getAllContacts,
    getMessagesByUserId,
    sendMessage,
    getChatPartners

}