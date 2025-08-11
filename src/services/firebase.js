import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBCrowEYEnMJoQC6qKC_5Fl6AV5rEOfH9w",
  authDomain: "elevateu-ff555.firebaseapp.com",
  projectId: "elevateu-ff555",
  storageBucket: "elevateu-ff555.firebasestorage.app",
  messagingSenderId: "888680391548",
  appId: "1:888680391548:web:0e7878c327f2b44ec87af9",
  measurementId: "G-KKJZ1E5GXF",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);