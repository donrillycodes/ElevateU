import { createChat, addMessage, subscribeToChats, subscribeToMessages } from '../services/chatService';
import { getUser } from '../services/userService'; // For names in chats

export const initiateChat = async (currentUid, otherUid, initialText) => {
  const participants = [currentUid, otherUid].sort();
  // Check if chat exists (query), else create
  // For simplicity, assume create new each time or check in UI
  const chatId = await createChat(participants, { senderId: currentUid, text: initialText });
  return chatId;
};

export const sendMessage = async (chatId, text, senderId) => {
  await addMessage(chatId, { senderId, text });
};

export const listenChats = (uid, setChats) => subscribeToChats(uid, setChats);

export const listenMessages = (chatId, setMessages) => subscribeToMessages(chatId, setMessages);
