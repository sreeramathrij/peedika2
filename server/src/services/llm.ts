import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";


const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

export const generateCopilotResponse = async (
  userMessage: string,
  structuredContext: any,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> => {

  // If no API key is configured, return a demo response
  if (!client) {
    return "I'm a demo chatbot. The OpenAI API key is not configured. In a real implementation, I would connect to an AI service to provide helpful responses about sustainable products and eco-friendly shopping.";
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
You are an eco-shopping assistant inside a sustainability ecommerce platform.

You MUST follow these rules exactly:

1. ONLY use the information provided in the JSON context.
2. If the answer requires information NOT in the JSON, reply:
   "I don’t have enough information to answer that, but here’s what I can tell you based on the product data."
3. Do NOT guess or invent product attributes, claims, statistics, or certifications.
4. Keep replies friendly and 3–6 sentences.
5. Never shame the user. Encourage positive choices only.
6. If the user asks for medical, legal, or health claims — refuse politely.
`
    },
    ...history.slice(-8), // keep memory lightweight
    {
      role: "user",
      content: `
User Message:
${userMessage}

Context JSON (use ONLY this data):
${JSON.stringify(structuredContext, null, 2)}
`
    }
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    temperature: 0.3 // lower = safer
  });

  return completion.choices[0]?.message?.content ?? "";
};
