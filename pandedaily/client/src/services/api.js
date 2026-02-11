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

// Access Management API calls
export const getAccessLevels = async () => {
  return fetchApi('/access')
}

export const getAccess = async () => {
  return fetchApi('/access')
}

export const getAccessById = async (id) => {
  return fetchApi(`/access/${id}`)
}

export const createAccess = async (accessData) => {
  return fetchApi('/access', {
    method: 'POST',
    body: JSON.stringify(accessData),
  })
}

export const updateAccess = async (id, accessData) => {
  return fetchApi(`/access/${id}`, {
    method: 'PUT',
    body: JSON.stringify(accessData),
  })
}

// Customer API calls
export const getCustomers = async () => {
  return fetchApi('/customer')
}

export const getCustomerById = async (id) => {
  return fetchApi(`/customer/${id}`)
}

// Product API calls
export const getProducts = async () => {
  return fetchApi('/product')
}

export const getProductCategories = async () => {
  return fetchApi('/product/category')
}

export const getProductById = async (id) => {
  return fetchApi(`/product/${id}`)
}

export const createProduct = async (productData) => {
  return fetchApi('/product', {
    method: 'POST',
    body: JSON.stringify(productData),
  })
}

export const updateProduct = async (id, productData) => {
  return fetchApi(`/product/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  })
}

export const createProductCategory = async (categoryData) => {
  return fetchApi('/product/category', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  })
}

export const updateProductCategory = async (id, categoryData) => {
  return fetchApi(`/product/category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  })
}

// Inventory API calls
export const getInventory = async () => {
  return fetchApi('/inventory')
}

export const getInventoryHistory = async () => {
  return fetchApi('/inventory/history')
}

export const getInventoryHistoryById = async (id) => {
  return fetchApi(`/inventory/history/${id}`)
}

export const addInventory = async (inventoryData) => {
  return fetchApi('/inventory', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  })
}

export const updateInventory = async (id, inventoryData) => {
  return fetchApi(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryData),
  })
}

// Order API calls
export const getOrders = async () => {
  return fetchApi('/orders')
}

export const getOrderById = async (id) => {
  return fetchApi(`/orders/${id}`)
}

export const getOrderItem = async (orderId) => {
  const id = typeof orderId === 'object' ? orderId?.or_id || orderId?.id || orderId : orderId
  return fetchApi(`/orders/${id}/item`)
}

export const createOrder = async (orderData) => {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

// export const updateOrder = async (id, orderData) => {
//   return fetchApi(`/orders/${id}`, {
//     method: 'PUT',
//     body: JSON.stringify(orderData),
//   })
// }

// export const deleteOrder = async (id) => {
//   return fetchApi(`/orders/${id}`, {
//     method: 'DELETE',
//   })
// }
