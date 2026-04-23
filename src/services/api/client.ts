const API_BASE_URL = 'http://127.0.0.1:3001'

type ApiOptions = RequestInit & {
  body?: any
}

async function request<T>(path: string, options?: ApiOptions): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    method: options?.method || 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

export const apiGet = <T>(path: string) =>
  request<T>(path)

export const apiPost = <T>(path: string, body: any) =>
  request<T>(path, { method: 'POST', body })

export const apiPatch = <T>(path: string, body?: any) =>
  request<T>(path, { method: 'PATCH', body })

export const apiDelete = (path: string) =>
  request(path, { method: 'DELETE' })