import { signup, login, logout } from '../services/authService';
import { updateUser } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleSignup = async (name, email, password, role, field) => {
  const user = await signup(email, password, { name, role, field });
  await AsyncStorage.setItem('userToken', user.uid); // For persistence
  return user;
};

export const handleLogin = async (email, password) => {
  const user = await login(email, password);
  await AsyncStorage.setItem('userToken', user.uid);
  return user;
};

export const handleLogout = async (navigation) => {
  await logout();
  await AsyncStorage.removeItem('userToken');
  navigation.replace('Auth');
};

export const completeProfile = async (uid, role, field) => {
  await updateUser(uid, { role, field });
};
