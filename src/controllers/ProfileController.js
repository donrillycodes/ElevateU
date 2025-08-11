import { getUser, updateUser, uploadAvatar } from '../services/userService';
import { mapUser } from '../models/User';

export const fetchProfile = async (uid) => {
  const data = await getUser(uid);
  return mapUser({ uid, ...data });
};

export const saveProfile = async (uid, updates) => {
  await updateUser(uid, updates);
};

export const handleUploadAvatar = async (uid, imageUri) => {
  return await uploadAvatar(uid, imageUri);
};