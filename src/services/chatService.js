import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getDocs } from 'firebase/firestore';

export const createChat = async (participants, initialMessage) => {
  const sorted = participants.sort();
  const q = query(collection(db, 'chats'), where('participants', '==', sorted));
  const existing = await getDocs(q);

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const chatRef = await addDoc(collection(db, 'chats'), {
    participants: sorted,
    lastMessage: initialMessage.text,
    lastTimestamp: serverTimestamp(),
  });

  await addMessage(chatRef.id, initialMessage);
  return chatRef.id;
};


export const addMessage = async (chatId, message) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...message,
    timestamp: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: message.text,
    lastTimestamp: serverTimestamp(),
  });
};

export const subscribeToChats = (uid, callback) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid), orderBy('lastTimestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(chats);
  });
};

export const subscribeToMessages = (chatId, callback) => {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
