// Minimal first-party tracker utility (consent-aware)
const COOKIE_CONSENT = 'analytics_consent'
const COOKIE_ANON = 'anon_id'
const ONE_YEAR = 60 * 60 * 24 * 365

function _getCookie(name) {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}

function _setCookie(name, value, maxAge = ONE_YEAR) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
}

export function setConsent(val) {
  _setCookie(COOKIE_CONSENT, val ? '1' : '0')
}

export function hasConsent() {
  return _getCookie(COOKIE_CONSENT) === '1'
}

export function getAnonId() {
  return _getCookie(COOKIE_ANON)
}

export function ensureAnonId() {
  let id = getAnonId()
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID()
    } else {
      id = 'anon-' + Math.random().toString(36).slice(2, 12)
    }
    _setCookie(COOKIE_ANON, id)
  }
  return id
}

function buildPayload(path) {
  return {
    path: path || (typeof location !== 'undefined' ? location.pathname : '/'),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    timestamp: new Date().toISOString(),
    anon_id: getAnonId() || undefined,
    consent: hasConsent(),
  }
}

export function sendPageView(path) {
  if (!hasConsent()) return
  const payload = buildPayload(path)
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/tracking/collect/', blob)
      return
    }
  } catch (e) {
    // fallthrough to fetch
  }

  if (typeof fetch !== 'undefined') {
    fetch('/api/tracking/collect/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }
}

export default { setConsent, hasConsent, ensureAnonId, getAnonId, sendPageView }
