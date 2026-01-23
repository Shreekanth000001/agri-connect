// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByu-BMZAMo0k_FH97Gar8_kJZ5LO01pPc",
  authDomain: "agri-connect-e1378.firebaseapp.com",
  projectId: "agri-connect-e1378",
  storageBucket: "agri-connect-e1378.firebasestorage.app",
  messagingSenderId: "771396517070",
  appId: "1:771396517070:web:f4bce2dc9d85988a59a49f",
  measurementId: "G-6SPHJKXM5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app };
export { storage };