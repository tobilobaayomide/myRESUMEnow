import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0pfcCK-59dBcVgPIbnPlbTNNSiX4YWdE",
  authDomain: "myresumenow-b48b0.firebaseapp.com",
  projectId: "myresumenow-b48b0",
  storageBucket: "myresumenow-b48b0.firebasestorage.app",
  messagingSenderId: "73995608467",
  appId: "1:73995608467:web:bd672f5257df164a218866",
  measurementId: "G-5KQP4QVHPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Analytics (optional - won't block if it fails)
let analytics = null;
try {
  analytics = getAnalytics(app);
  console.log('✅ Firebase Analytics initialized');
} catch (error) {
  console.warn('⚠️ Firebase Analytics failed to initialize:', error.message);
}
export { analytics };

export default app;
