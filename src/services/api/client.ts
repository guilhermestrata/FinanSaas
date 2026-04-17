export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function apiPost<TResponse>(url: string, body: unknown): Promise<ApiResult<TResponse>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, error: text || `HTTP ${res.status}` }
    }

    const data = (await res.json()) as TResponse
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
  }
}
