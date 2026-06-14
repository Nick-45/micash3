import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, Timestamp, getDocs, query, collection, limit } from 'firebase/firestore';
import { MAX_USERS } from '../constants';
import { loadMockDataForUser, getUserCount } from './mockDataService';

export async function signUp(email, password, name) {
  const userCount = await getUserCount();
  if (userCount >= MAX_USERS) {
    throw new Error(`Maximum ${MAX_USERS} users allowed. Cannot create more accounts.`);
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email: email,
    name: name,
    treasuryBalance: 250000,
    createdAt: Timestamp.now(),
    role: 'admin'
  });
  
  // Load mock data for new user
  await loadMockDataForUser(userCredential.user.uid, email);
  
  return userCredential;
}

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return await signOut(auth);
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}
