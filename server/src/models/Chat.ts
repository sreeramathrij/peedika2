import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ChatDocument extends Document {
  user: Types.ObjectId;
  messages: ChatMessage[];
}

const ChatSchema = new Schema<ChatDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

const Chat: Model<ChatDocument> =
  mongoose.models.Chat || mongoose.model<ChatDocument>("Chat", ChatSchema);

export default Chat;
