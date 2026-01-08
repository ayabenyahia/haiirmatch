const API_URL = "http://localhost:3000";

export async function apiRequest(path, method = "GET", body) {
  const res = await fetch(API_URL + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

