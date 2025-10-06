// Import Firebase SDK compat versions via importScripts (avoids ES module errors)

importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js");


// Your Firebase configuration (from firebaseConfig.ts)
const firebaseConfig = {
    apiKey: "AIzaSyAnogX6LGcnK8IHuBf8-9OfMhl7hAr-SsE",
    authDomain: "mech-moto.firebaseapp.com",
    projectId: "mech-moto",
    storageBucket: "mech-moto.firebasestorage.app",
    messagingSenderId: "380050304675",
    appId: "1:380050304675:web:48c804ca54654206805916",
    measurementId: "G-QLVMS1BDRE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages (e.g., when app is closed)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    // Customize notification (pull from payload.data or notification)
    const notificationTitle = payload.notification?.title || 'Default Title';
    const notificationOptions = {
        body: payload.notification?.body || 'Default Body',
        icon: payload.data?.icon || '/firebase-logo.png', // Add a fallback icon to public/
        image: payload.data?.image, // Optional large image
        data: payload.data, // Pass custom data for click handling
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks (e.g., open a URL)
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    event.notification.close(); // Close the notification

    const urlToOpen = event.notification.data?.link || '/'; // Use data.link from payload if sent
    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});