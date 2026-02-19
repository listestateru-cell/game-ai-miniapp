const API_BASE = '/api' // or full URL

export async function getUser(id) {
  const res = await fetch(`${API_BASE}/user/${id}`)
  return res.json()
}

export async function register(body) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

export async function login(body) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

// Add other functions as needed