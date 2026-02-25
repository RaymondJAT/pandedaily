const API_URL = 'http://192.168.40.101:3080'

const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token')

    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // Only add token if it exists (for authenticated users)
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

export const createCheckoutSession = async (lineItems, successUrl, cancelUrl, metadata) => {
  const response = await fetchApi('/paymongo/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ lineItems, successUrl, cancelUrl, metadata }),
  })
  return response.data
}

export const getCheckoutSession = async (sessionId) => {
  const response = await fetchApi(`/paymongo/checkout-session/${sessionId}`)
  return response.data
}
