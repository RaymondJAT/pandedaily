const API_URL = 'http://localhost:3080'

// Helper function for API calls
const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token')

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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

// Auth API calls
export const loginUser = async (username, password) => {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export const logoutUser = async () => {
  return fetchApi('/auth/logout', {
    method: 'POST',
  })
}

export const signupUser = async (userData) => {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

// User Management API calls
export const getUsers = async () => {
  return fetchApi('/user')
}

export const getUserById = async (id) => {
  return fetchApi(`/user/${id}`)
}

export const createUser = async (userData) => {
  return fetchApi('/user', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export const updateUser = async (id, userData) => {
  return fetchApi(`/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })
}

export const deleteUser = async (id) => {
  return fetchApi(`/user/${id}`, {
    method: 'DELETE',
  })
}

export const updateUserStatus = async (id, status) => {
  return fetchApi(`/user/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// Access Management API calls
export const getAccessLevels = async () => {
  return fetchApi('/access')
}
