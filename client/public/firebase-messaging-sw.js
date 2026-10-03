importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAUuEuiFrINUYTATW2uhAjH3_U_8gwSuLo",
  authDomain: "garba-event-app-7199c.firebaseapp.com",
  projectId: "garba-event-app-7199c",
  messagingSenderId: "223853069484",
  appId: "1:223853069484:web:11ef9ca58649b541ae4b09",
});

// Messages that carry a `notification` payload are shown by the browser itself,
// and a tap opens the link set on the server.
firebase.messaging();
