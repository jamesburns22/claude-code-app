const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  members: {
    list: () => req('GET', '/members'),
    add: (name) => req('POST', '/members', { name }),
    remove: (id) => req('DELETE', `/members/${id}`),
  },
  chores: {
    list: () => req('GET', '/chores'),
    create: (data) => req('POST', '/chores', data),
    update: (id, data) => req('PUT', `/chores/${id}`, data),
    remove: (id) => req('DELETE', `/chores/${id}`),
  },
  occurrences: {
    list: (start, end) => req('GET', `/occurrences?start=${start}&end=${end}`),
  },
  completions: {
    add: (data) => req('POST', '/completions', data),
    remove: (id) => req('DELETE', `/completions/${id}`),
  },
};
