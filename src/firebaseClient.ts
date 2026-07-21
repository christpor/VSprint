import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIKdsMwjUOuT-KnXn6cBsX4Eb01vmpJwA",
  authDomain: "vsprint-app.firebaseapp.com",
  projectId: "vsprint-app",
  storageBucket: "vsprint-app.firebasestorage.app",
  messagingSenderId: "305778193794",
  appId: "1:305778193794:web:55aaea5a87cbe9f4a10b9b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
