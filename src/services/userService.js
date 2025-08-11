import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const getUser = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const uploadAvatar = async (uid, uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const avatarRef = ref(storage, `avatars/${uid}.jpg`);
  await uploadBytes(avatarRef, blob);
  const url = await getDownloadURL(avatarRef);
  await updateUser(uid, { avatarUrl: url });
  return url;
};

export const checkRole = async (uid) => {
  const user = await getUser(uid);
  return user?.role || null;
};