type QueueItem = { endpoint: string; payload: any; createdAt: string }

const QUEUE_KEY = "tf_mock_action_queue"

function isBrowser() {
  return typeof window !== "undefined"
}

export async function fetchWithFallback<T = any>(url: string, fallback: T | null = null, opts?: RequestInit): Promise<{ data: T | null; fromMock: boolean }> {
  try {
    const res = await fetch(url, opts)
    if (!res.ok) throw new Error(`API ${res.status}`)
    const json = await res.json()
    // Try to detect primary payload
    const data = Array.isArray(json) ? json : json?.tickets || json?.ticket || json
    if ((Array.isArray(data) && data.length === 0) || data == null) {
      return { data: fallback, fromMock: true }
    }
    return { data: data as T, fromMock: false }
  } catch (err) {
    // Network or parsing error -> return fallback
    return { data: fallback, fromMock: true }
  }
}

function readQueue(): QueueItem[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeQueue(q: QueueItem[]) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
  } catch {}
}

export async function postAction(endpoint: string, payload: any): Promise<{ ok: boolean; response?: any }> {
  try {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const json = await res.json()
    // After successful POST, try to flush any queued actions
    flushQueue().catch(() => {})
    return { ok: true, response: json }
  } catch (err) {
    // Queue the action for later retry
    if (isBrowser()) {
      const q = readQueue()
      q.push({ endpoint, payload, createdAt: new Date().toISOString() })
      writeQueue(q)
    }
    return { ok: false }
  }
}

export async function flushQueue(): Promise<void> {
  if (!isBrowser()) return
  const q = readQueue()
  if (!q || q.length === 0) return
  const remaining: QueueItem[] = []
  for (const item of q) {
    try {
      const res = await fetch(item.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item.payload) })
      if (!res.ok) throw new Error(`Failed ${res.status}`)
      // success -> continue
    } catch (err) {
      remaining.push(item)
    }
  }
  writeQueue(remaining)
}

// Try flushing periodically when in browser
if (isBrowser()) {
  // attempt flush on load
  flushQueue().catch(() => {})
  // and set interval
  try {
    setInterval(() => flushQueue().catch(() => {}), 30_000)
  } catch {}
}

export default { fetchWithFallback, postAction, flushQueue }
