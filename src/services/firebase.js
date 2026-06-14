import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmhbZRsmJEk15BSB1kDQV4ilsBYdpNa88",
  authDomain: "gigs-connect.firebaseapp.com",
  projectId: "gigs-connect",
  storageBucket: "gigs-connect.firebasestorage.app",
  messagingSenderId: "860870913180",
  appId: "1:860870913180:web:0a5999d729acebf63c5159"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

