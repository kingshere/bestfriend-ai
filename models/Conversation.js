import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // "user" or "model"
  parts: [{ text: { type: String, required: true } }],
});

const conversationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Short title of the conversation
  messages: [messageSchema], // Array of messages
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;