import { createChat, addMessage, subscribeToChats, subscribeToMessages, } from '../services/chatService';
import { getUser } from '../services/userService';

/**
 * Create (or let the service reuse) a 1:1 chat.
 * - Adds a stable participantsKey (sorted join of UIDs)
 * - Hydrates participantsMeta { [uid]: { displayName, avatarUrl } } for the chat list
 * NOTE: If your chatService ignores extra fields, this won’t break anything.
 *       If it supports passing chat-level fields, it should persist them on the chat doc.
 */
export const initiateChat = async (currentUid, otherUid, initialText) => {
  const participants = [currentUid, otherUid].sort();
  const participantsKey = participants.join('_');

  // Best-effort fetch of public names/avatars (non-blocking if a fetch fails)
  let me, other;
  try { me = await getUser(currentUid); } catch {}
  try { other = await getUser(otherUid); } catch {}

  const participantsMeta = {
    [currentUid]: {
      displayName: me?.displayName || me?.name || 'You',
      avatarUrl: me?.avatarUrl || '',
    },
    [otherUid]: {
      displayName: other?.displayName || other?.name || 'User',
      avatarUrl: other?.avatarUrl || '',
    },
  };

  // Pass extra fields along; your chatService can persist them on the chat doc
  const chatId = await createChat(participants, {
    senderId: currentUid,
    text: initialText || '',
    // --- optional chat-level fields (store if your service supports it) ---
    participantsKey,
    participantsMeta,
    lastMessage: initialText || '',
    createdAt: Date.now(),   // if your service swaps to serverTimestamp(), even better
    updatedAt: Date.now(),
  });

  return chatId;
};

export const sendMessage = async (chatId, text, senderId) => {
  // Add any local timestamp if your service doesn’t
  return addMessage(chatId, { senderId, text, createdAt: Date.now() });
};

// Re-export listeners; you can decorate results here if you want
export const listenChats = (uid, setChats) =>
  subscribeToChats(uid, (chats) => {
    // If participantsMeta exists, your ChatList can render instantly.
    // Otherwise, you can fetch per-peer profile in the UI as a fallback.
    setChats(chats);
  });

export const listenMessages = (chatId, setMessages) =>
  subscribeToMessages(chatId, setMessages);

// chat controller