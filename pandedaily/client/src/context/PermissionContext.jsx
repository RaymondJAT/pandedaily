import { createContext, useContext, useState, useEffect } from 'react'
import { getAccessPermissions } from '../services/api'
import { getCurrentUser } from '../services/auth'

const PermissionContext = createContext()

export const usePermissions = () => useContext(PermissionContext)

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [userAccess, setUserAccess] = useState(null)

  useEffect(() => {
    fetchUserPermissions()
  }, [])

  const fetchUserPermissions = async () => {
    try {
      const user = getCurrentUser()
      if (!user || !user.access_id) {
        setLoading(false)
        return
      }

      setUserAccess(user.access_id)

      const response = await getAccessPermissions(user.access_id)
      const permissionsData = response.data || response || []

      const permissionMap = {}
      permissionsData.forEach((perm) => {
        permissionMap[perm.route_name || perm.route] = perm.permission
      })

      setPermissions(permissionMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (routeName) => {
    return permissions[routeName] === 'FULL'
  }

  const refreshPermissions = () => {
    fetchUserPermissions()
  }

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission,
        loading,
        userAccess,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}
