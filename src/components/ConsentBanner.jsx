import React, { useEffect, useState } from 'react'
import { hasConsent, setConsent, ensureAnonId, sendPageView } from '../lib/tracker'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const cookieExists = /(^|; )analytics_consent=/.test(document.cookie)
    if (!cookieExists) setVisible(true)
  }, [])

  function accept() {
    ensureAnonId()
    setConsent(true)
    sendPageView()
    setVisible(false)
  }

  function decline() {
    setConsent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
      <div style={{ background: '#fff', color: '#111', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', maxWidth: 320 }}>
        <div style={{ marginBottom: 8, fontSize: 13 }}>This site uses minimal anonymous analytics to improve UX. Accept?</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={decline} style={{ padding: '6px 10px' }}>Decline</button>
          <button onClick={accept} style={{ padding: '6px 10px' }}>Accept</button>
        </div>
      </div>
    </div>
  )
}
