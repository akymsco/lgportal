// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// ==============================
// ⚡ OFFLINE CACHE
// ==============================
const CACHE_NAME = 'lgportal-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/news/index.html',
  '/projects/index.html',
  '/assets/css/global.css',
  '/assets/js/main.js',
  '/assets/js/admin.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ==============================
// 🔔 BACKGROUND PUSH NOTIFICATIONS
// ==============================
messaging.onBackgroundMessage(payload => {
  console.log('[service-worker.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || 'LG Portal';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/assets/img/icons/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Redirect user to homepage
  );
});