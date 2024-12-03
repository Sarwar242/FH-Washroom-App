import { initializeApp } from 'firebase/app';
import '@react-native-firebase/app';  // Ensure this import is included

const firebaseConfig = {
    apiKey: "AIzaSyCKjirPdzzfyGff77Sx9yTPybKcrNE4JPA",
    authDomain: "https://accounts.google.com/o/oauth2/auth",
    projectId: "fh-washroom-firebase",
    storageBucket: "fh-washroom-firebase.firebasestorage.app",
    messagingSenderId: "1002631591352",
    appId: "1:1002631591352:android:4134720f44d779ce8d4b4d",
  };
const app = initializeApp(firebaseConfig);

export default app;