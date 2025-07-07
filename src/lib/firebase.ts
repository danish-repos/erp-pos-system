import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// }

const firebaseConfig = {
    apiKey: "AIzaSyCkzOCwlZ_6rYg_cLtgHwh4HfCotL1_Xq4",
    authDomain: "clothing-erp.firebaseapp.com",
    databaseURL: "https://clothing-erp-default-rtdb.firebaseio.com",
    projectId: "clothing-erp",
    storageBucket: "clothing-erp.firebasestorage.app",
    messagingSenderId: "499901517786",
    appId: "1:499901517786:web:86fcce6d6a78d950c97ae3",
    measurementId: "G-H59MHBJRK9"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app)

export default app
