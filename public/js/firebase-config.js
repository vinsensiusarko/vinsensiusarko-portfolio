/**
 * Firebase Configuration and Initialization
 * Project: vinsensiusarko
 */

const firebaseConfig = {
  apiKey: "AIzaSyBXMcjGa-20keXC67MIwiaG3seex-_DDNw",
  authDomain: "vinsensiusarko.firebaseapp.com",
  projectId: "vinsensiusarko",
  storageBucket: "vinsensiusarko.appspot.com",
  messagingSenderId: "639316523712",
  appId: "1:639316523712:web:2a379691ff732f8c8a0b25",
  measurementId: "G-VV3XL63SER"
};

// Global Firebase instance references
let auth = null;
let db = null;

if (typeof firebase !== 'undefined') {
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  if (firebase.auth) {
    auth = firebase.auth();
  }
  if (firebase.firestore) {
    db = firebase.firestore();
  }
}
