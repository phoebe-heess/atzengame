import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmnYOMKuEZD60USNRT0z1dP7Iqz2FFfjo",
  authDomain: "atzenwin-ad567.firebaseapp.com",
  projectId: "atzenwin-ad567",
  storageBucket: "atzenwin-ad567.firebasestorage.app",
  messagingSenderId: "1077328127222",
  appId: "1:1077328127222:web:ba4a0160159dbda4af38d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 