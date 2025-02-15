import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBNCtg0O2jphFwEKnYb_ymSGNA2weuH2t8",
    authDomain: "quiz-tracker-app.firebaseapp.com",
    projectId: "quiz-tracker-app",
    storageBucket: "quiz-tracker-app.firebasestorage.app",
    messagingSenderId: "946849480511",
    appId: "1:946849480511:web:ee87933bcf781056b6dd8a"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }; 