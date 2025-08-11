import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const sendRequest = async (menteeId, mentorId, message) => {
  await addDoc(collection(db, 'requests'), {
    menteeId,
    mentorId,
    message,
    status: 'pending',
    timestamp: serverTimestamp(),
  });
};

export const subscribeToRequests = (mentorId, callback) => {
  const q = query(collection(db, 'requests'), where('mentorId', '==', mentorId), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(requests);
  });
};

export const acceptRequest = async (requestId, chatId) => {
  await updateDoc(doc(db, 'requests', requestId), { status: 'accepted', chatId });
};

export const declineRequest = async (requestId) => {
  await updateDoc(doc(db, 'requests', requestId), { status: 'declined' });
};