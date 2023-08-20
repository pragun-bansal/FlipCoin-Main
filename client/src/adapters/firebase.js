// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_ID,
//   measurementId: process.env.MEASUREMENT_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyACL36F2uc9XExLMYFx2_OvCa4r5InA7Bc",
  authDomain: "techspark-bc0e3.firebaseapp.com",
  projectId: "techspark-bc0e3",
  storageBucket: "techspark-bc0e3.appspot.com",
  messagingSenderId: "1029170862983",
  appId: "1:1029170862983:web:b21e797fac3e919bee5122",
  measurementId: "G-EYTEFLWKPV"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;