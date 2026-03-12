/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications when the app is not in focus.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Firebase config is injected at runtime via the main app
// For background messages, we need minimal config
firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG__?.apiKey || '',
  projectId: self.__FIREBASE_CONFIG__?.projectId || '',
  messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId || '',
  appId: self.__FIREBASE_CONFIG__?.appId || '',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || '사주해'
  const notificationOptions = {
    body: payload.notification?.body || '새로운 알림이 있습니다.',
    icon: '/app_icon_128.png',
    badge: '/app_icon_128.png',
    data: {
      url: payload.data?.url || 'https://sajuhae.vercel.app',
    },
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || 'https://sajuhae.vercel.app'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('sajuhae') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url)
    })
  )
})
