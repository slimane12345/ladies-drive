import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDKs7QQjax0FcogazrXOeSExrDxlVlfbBE",
    authDomain: "sbah-ece2e.firebaseapp.com",
    projectId: "sbah-ece2e",
    storageBucket: "sbah-ece2e.firebasestorage.app",
    messagingSenderId: "1018203020293",
    appId: "1:1018203020293:web:3adeab254fab74d234906c",
    measurementId: "G-VKZFW5QPN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
