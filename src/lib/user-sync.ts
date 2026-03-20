// Sync user activity data between localStorage and server (Supabase)
// On login: upload localStorage → server, then merge server → localStorage
// On subsequent visits: restore from server if localStorage is empty

const SYNC_KEYS = [
  'sajuhae-history',
  'sajuhae-lastInput', 
  'sajuhae-count',
  'sajuhae-theme',
  'sajuhae-fontsize',
] as const

interface UserData {
  history: string | null
  lastInput: string | null
  count: string | null
  theme: string | null
  fontsize: string | null
}

function getLocalData(): UserData {
  if (typeof window === 'undefined') return { history: null, lastInput: null, count: null, theme: null, fontsize: null }
  return {
    history: localStorage.getItem('sajuhae-history'),
    lastInput: localStorage.getItem('sajuhae-lastInput'),
    count: localStorage.getItem('sajuhae-count'),
    theme: localStorage.getItem('sajuhae-theme'),
    fontsize: localStorage.getItem('sajuhae-fontsize'),
  }
}

function setLocalData(data: UserData) {
  if (typeof window === 'undefined') return
  if (data.history) localStorage.setItem('sajuhae-history', data.history)
  if (data.lastInput) localStorage.setItem('sajuhae-lastInput', data.lastInput)
  if (data.count) localStorage.setItem('sajuhae-count', data.count)
  if (data.theme) localStorage.setItem('sajuhae-theme', data.theme)
  if (data.fontsize) localStorage.setItem('sajuhae-fontsize', data.fontsize)
}

// Save to server
export async function syncToServer(userId: string): Promise<boolean> {
  try {
    const data = getLocalData()
    const res = await fetch('/api/user-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, data }),
    })
    return res.ok
  } catch {
    return false
  }
}

// Restore from server
export async function syncFromServer(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/user-sync?userId=${encodeURIComponent(userId)}`)
    if (!res.ok) return false
    const { data } = await res.json() as { data: UserData | null }
    if (data) {
      // Merge: server data fills in missing localStorage data
      const local = getLocalData()
      setLocalData({
        history: local.history || data.history,
        lastInput: local.lastInput || data.lastInput,
        count: local.count || data.count,
        theme: local.theme || data.theme,
        fontsize: local.fontsize || data.fontsize,
      })
      return true
    }
    return false
  } catch {
    return false
  }
}

// Full sync: upload then restore
export async function fullSync(userId: string): Promise<void> {
  await syncToServer(userId)
  await syncFromServer(userId)
}
