importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyAUuEuiFrINUYTATW2uhAjH3_U_8gwSuLo",
  authDomain: "garba-event-app-7199c.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID",
});


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUuEuiFrINUYTATW2uhAjH3_U_8gwSuLo",
  authDomain: "garba-event-app-7199c.firebaseapp.com",
  projectId: "garba-event-app-7199c",
  storageBucket: "garba-event-app-7199c.firebasestorage.app",
  messagingSenderId: "223853069484",
  appId: "1:223853069484:web:11ef9ca58649b541ae4b09",
  measurementId: "G-67P8J1806T"
};

// Messages that carry a `notification` payload are shown by the browser itself,
// and a tap opens the link set on the server.
firebase.messaging();