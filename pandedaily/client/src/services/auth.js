export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getUserAccessId = () => {
  const user = getCurrentUser()
  return user?.access_id || user?.mu_access_id || null
}
