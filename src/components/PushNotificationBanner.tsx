'use client'

import { useState, useEffect } from 'react'

/**
 * Push notification permission banner.
 * Shows a dismissable banner asking the user to enable push notifications.
 * Only shows if:
 * - Browser supports notifications
 * - Permission is 'default' (not yet asked)
 * - User hasn't dismissed it in this session
 */

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''

export default function PushNotificationBanner() {
  const [show, setShow] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    // Only show if browser supports notifications and permission not yet decided
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (!('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    // Don't show if Firebase not configured
    if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) return
    // Don't show if dismissed in this session
    if (sessionStorage.getItem('push_banner_dismissed')) return

    // Delay showing to not interrupt first interaction
    const timer = setTimeout(() => setShow(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  async function handleEnable() {
    setRequesting(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setShow(false)
        return
      }

      // Dynamically import Firebase
      const { initializeApp } = await import('firebase/app')
      const { getMessaging, getToken } = await import('firebase/messaging')

      const app = initializeApp(FIREBASE_CONFIG)
      const messaging = getMessaging(app)

      // Register the FCM service worker
      const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: sw,
      })

      if (token) {
        // Send token to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'subscribe' }),
        })
      }

      setShow(false)
    } catch (e) {
      console.error('[push] Failed to enable:', e)
    } finally {
      setRequesting(false)
    }
  }

  function handleDismiss() {
    sessionStorage.setItem('push_banner_dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '16px',
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' }}>
            🔔 오늘의 운세 알림
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
            매일 아침 AI 운세를 알림으로 받아보세요.
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: 1,
          }}
          aria-label="닫기"
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={handleEnable}
          disabled={requesting}
          style={{
            flex: 1, padding: '10px', background: '#f59e0b', color: '#1e293b',
            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold',
            cursor: requesting ? 'not-allowed' : 'pointer',
          }}
        >
          {requesting ? '설정 중...' : '알림 받기'}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '10px 16px', background: '#334155', color: '#94a3b8',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          나중에
        </button>
      </div>
    </div>
  )
}
