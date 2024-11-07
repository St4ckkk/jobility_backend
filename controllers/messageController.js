const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

module.exports = {

    getAllMessage: async (req, res) => {
        console.log("getAllMessage called with params:", req.params, "and query:", req.query);
        const pageSize = req.query.pageSize || 12;
        const page = req.query.page || 1;
        const skipMessages = (page - 1) * pageSize;

        try {
            var messages = await Message.find({ chat: req.params.chatId })
                .populate("sender", "name profile email")
                .populate("chat")
                .skip(skipMessages)
                .limit(pageSize)
                .sort({ createdAt: -1 });
            messages = await User.populate(messages, { path: "chat.users", select: "name profile email" });
            console.log("Fetched messages:", messages);
            res.status(200).json(messages);
        } catch (error) {
            console.error("Error in getAllMessage:", error);
            res.status(500).json({ error: error.message });
        }
    },

    sendMessage: async (req, res) => {
        console.log("sendMessage called with body:", req.body);
        const { sender, receiver, content, chatId } = req.body;
        if (!content || !chatId) {
            console.warn("Content or chatId missing in request body");
            return res.status(400).json({ error: "Content and chatId are required" });
        }
        var newMessage = {
            sender: req.user.id,
            receiver: receiver,
            content: content,
            chatId: chatId
        }
        try {
            var message = await Message.create(newMessage);
            message = await message.populate("sender", "name profile email");
            message = await message.populate("chat");
            message = await User.populate(message, { path: "chat.users", select: "name profile email" });
            await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
            console.log("Message sent:", message);
            res.status(201).json(message);
        } catch (error) {
            console.error("Error in sendMessage:", error);
            res.status(500).json({ error: error.message });
        }
    },
}