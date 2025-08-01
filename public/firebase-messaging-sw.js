importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDtBjGoSlqEb2Nxn2haDTSiWLvxo723n_M",
  authDomain: "reemo-a8120.firebaseapp.com",
  projectId: "reemo-a8120",
  storageBucket: "reemo-a8120.appspot.com",
  messagingSenderId: "696229093152",
  appId: "1:696229093152:web:95d59952400f0207dcc145"
});

// Initialize Firebase
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido:', payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/apple-icon-180.png'
  });
});