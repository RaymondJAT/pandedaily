const API_URL = 'http://localhost:3080'

// Login API call
export const loginUser = async (username, password) => {
  try {
    console.log(`Attempting to fetch: ${API_URL}/auth/login`)

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', [...response.headers.entries()])

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (jsonError) {
        console.log('Could not parse error JSON')
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Response data:', data)
    return data
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      type: error.constructor.name,
      url: `${API_URL}/auth/login`,
    })
    throw new Error(`Cannot connect to server: ${error.message}`)
  }
}

// Signup API call
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Signup failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Signup error:', error.message)
    throw error
  }
}
