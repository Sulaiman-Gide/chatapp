import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBdavIfUsHsYLn7VPBG96CmAtDoxutHbYw",
  authDomain: "chatapp-da868.firebaseapp.com",
  projectId: "chatapp-da868",
  storageBucket: "chatapp-da868.appspot.com",
  messagingSenderId: "204035911915",
  appId: "1:204035911915:web:81ed467f3c5923926e0eae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
export const storage = getStorage(app); 