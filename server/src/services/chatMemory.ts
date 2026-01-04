import Chat from "../models/Chat";
import type { ChatMessage } from "../models/Chat"
import { Types } from "mongoose";

const MAX_HISTORY = 12; // keep last 12 messages

export const getChatHistory = async (
  userId: string
): Promise<ChatMessage[]> => {
  const chat = await Chat.findOne({ user: new Types.ObjectId(userId) });
  return chat?.messages || [];
};

export const appendToChatHistory = async (
  userId: string,
  role: "user" | "assistant",
  content: string
) => {
  let chat = await Chat.findOne({ user: userId });

  if (!chat) chat = await Chat.create({ user: userId, messages: [] });

  chat.messages.push({ role, content, createdAt: new Date() });

  if (chat.messages.length > MAX_HISTORY)
    chat.messages = chat.messages.slice(-MAX_HISTORY);

  await chat.save();
};
