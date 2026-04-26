const Groq = require('groq-sdk');
const { v4: uuidv4 } = require('uuid');
const ChatHistoryModel = require('../models/ChatHistory');
const logger = require('../utils/logger');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a helpful shopping assistant for an electronics ecommerce store.
You help customers find products, answer questions about specifications, compare items,
and guide them through the purchasing process. Be concise, friendly, and informative.
If asked about products not in your knowledge, suggest the customer use the search feature.
Respond in the same language the customer uses.`;

class ChatService {
  async sendMessage({ user_id, session_id, message }) {
    const sid = session_id || uuidv4();

    const history = session_id
      ? await ChatHistoryModel.getSession(session_id, parseInt(process.env.MAX_CHAT_HISTORY) || 50)
      : [];

    await ChatHistoryModel.create({ user_id, session_id: sid, role: 'user', content: message });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    let assistantReply;
    try {
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages,
        max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || 1024,
        temperature: 0.7,
      });
      assistantReply = completion.choices[0].message.content;
    } catch (err) {
      logger.error('Groq API error:', err.message);
      assistantReply = "I'm having trouble connecting to my AI model right now. Please try again in a moment.";
    }

    await ChatHistoryModel.create({
      user_id,
      session_id: sid,
      role: 'assistant',
      content: assistantReply,
    });

    return { session_id: sid, reply: assistantReply };
  }

  async getHistory(session_id) {
    return ChatHistoryModel.getSession(session_id);
  }

  async getUserSessions(user_id) {
    return ChatHistoryModel.getUserSessions(user_id);
  }

  async deleteSession(session_id, user_id) {
    await ChatHistoryModel.deleteSession(session_id, user_id);
  }
}

module.exports = new ChatService();
