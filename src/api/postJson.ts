const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/apix'

type RedirectPayload = {
  payload?: string
  redirectUrl?: string
  url?: string
}

const resolveApiPath = (path: string) => {
  if (path.startsWith('/apix/')) {
    return path
  }

  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`
  }

  return `${API_BASE_URL}/${path}`
}

const extractRedirectUrl = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') {
    return null
  }

  const redirectData = data as RedirectPayload
  return redirectData.payload ?? redirectData.redirectUrl ?? redirectData.url ?? null
}

export async function postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(resolveApiPath(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload ?? {}),
  })

  let responseData: unknown = null
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    responseData = await response.json()
  } else {
    const text = await response.text()
    if (text) {
      try {
        responseData = JSON.parse(text)
      } catch {
        responseData = text
      }
    }
  }

  if (response.status === 401 || response.status === 403) {
    const redirectUrl = extractRedirectUrl(responseData)
    if (redirectUrl && typeof window !== 'undefined') {
      window.location.assign(redirectUrl)
      throw new Error(`Auth redirect triggered (${response.status})`)
    }
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return responseData as TResponse
}
