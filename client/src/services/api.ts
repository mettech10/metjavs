const base = 'http://localhost:5000/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (!res.ok) throw new Error('Request failed');
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

export default {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
};
