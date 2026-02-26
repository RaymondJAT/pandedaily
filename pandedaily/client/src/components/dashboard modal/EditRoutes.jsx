import { useState, useEffect, useMemo } from 'react'
import {
  Modal,
  Table,
  Select,
  Input,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Typography,
  Divider,
  Badge,
} from 'antd'
import { SaveOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { getAllRoutes, getAccessPermissions, updateAccessRoutePermission } from '../../services/api'

const { Option } = Select
const { Title, Text } = Typography

const EditRoutes = ({ isOpen, onClose, accessData, onRoutesUpdated }) => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const permissionOptions = [
    { value: 'FULL', label: 'Full Access', color: 'green' },
    { value: 'NO-ACCESS', label: 'No Access', color: 'red' },
  ]

  useEffect(() => {
    if (isOpen && accessData?.id) {
      fetchRoutesWithPermissions()
    }
  }, [isOpen, accessData])

  const fetchRoutesWithPermissions = async () => {
    setLoading(true)
    try {
      // Get all routes
      const allRoutesResponse = await getAllRoutes()
      const allRoutes = allRoutesResponse.data || allRoutesResponse || []

      // Get permissions for this access level
      let accessPermissions = []
      try {
        const permissionsResponse = await getAccessPermissions(accessData.id)
        accessPermissions = permissionsResponse.data || permissionsResponse || []
      } catch (error) {
        // No permissions found for this access level, using defaults
      }

      // Create a map of permissions for this access level
      const permissionMap = new Map()
      accessPermissions.forEach((perm) => {
        permissionMap.set(perm.route_id, perm.permission)
      })

      // Combine all routes with their permissions for this access level
      const routesWithPermissions = allRoutes.map((route) => {
        const routeId = route.mr_id || route.id
        const routeName = route.mr_route_name || route.route_name || route.name
        const defaultStatus = route.mr_status || route.status || 'NO-ACCESS'

        // Get the permission for this access level, or use the default
        const permission = permissionMap.has(routeId) ? permissionMap.get(routeId) : defaultStatus

        return {
          key: routeId,
          id: routeId,
          name: routeName,
          permission: permission,
          originalPermission: permission,
        }
      })

      setRoutes(routesWithPermissions)
    } catch (error) {
      console.error('Error fetching routes:', error)
      message.error('Failed to load routes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => route.name?.toLowerCase().includes(searchText.toLowerCase()))
  }, [routes, searchText])

  const handlePermissionChange = (routeId, newPermission) => {
    setRoutes((prevRoutes) =>
      prevRoutes.map((route) =>
        route.key === routeId ? { ...route, permission: newPermission } : route,
      ),
    )
  }

  const handleBulkPermissionChange = (permission) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select routes first')
      return
    }

    setRoutes((prevRoutes) =>
      prevRoutes.map((route) =>
        selectedRowKeys.includes(route.key) ? { ...route, permission } : route,
      ),
    )
  }

  const hasUnsavedChanges = useMemo(() => {
    return routes.some((route) => route.permission !== route.originalPermission)
  }, [routes])

  const changedCount = useMemo(() => {
    return routes.filter((route) => route.permission !== route.originalPermission).length
  }, [routes])

  const handleSave = async () => {
    const changedRoutes = routes.filter((route) => route.permission !== route.originalPermission)

    if (changedRoutes.length === 0) {
      onClose()
      return
    }

    setSaving(true)
    try {
      // Update permissions for each changed route
      const updatePromises = changedRoutes.map(async (route) => {
        try {
          return await updateAccessRoutePermission(accessData.id, route.id, {
            status: route.permission,
          })
        } catch (error) {
          console.error(`Failed to update permission for ${route.name}:`, error)
          throw new Error(`Failed to update ${route.name}: ${error.message}`)
        }
      })

      await Promise.all(updatePromises)

      message.success(`Successfully updated permissions for ${changedRoutes.length} routes`)

      setSelectedRowKeys([])
      await fetchRoutesWithPermissions()
      onRoutesUpdated?.()
      onClose()
    } catch (error) {
      console.error('Error saving route permissions:', error)
      // message.error('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'Route',
      dataIndex: 'name',
      key: 'name',
      width: '60%',
      render: (text, record) => (
        <Space>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{text}</code>
          {record.permission !== record.originalPermission && (
            <Tag color="orange" size="small">
              Modified
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Access Level Permission',
      dataIndex: 'permission',
      key: 'permission',
      width: '40%',
      render: (permission, record) => (
        <Select
          value={permission}
          onChange={(value) => handlePermissionChange(record.key, value)}
          className="w-32"
          size="middle"
          style={{
            borderColor: permission !== record.originalPermission ? '#fa8c16' : undefined,
          }}
        >
          {permissionOptions.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              <Space>
                <Badge color={opt.color} />
                <span>{opt.label}</span>
              </Space>
            </Option>
          ))}
        </Select>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }

  return (
    <Modal
      title={
        <Space orientation="vertical" size={0} className="w-full">
          <Title level={4} style={{ margin: 0, color: '#9C4A15' }}>
            Configure Route Permissions
          </Title>
          <Text type="secondary">
            Set permissions for <strong>{accessData?.accessName}</strong>
          </Text>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          disabled={!hasUnsavedChanges}
          onClick={handleSave}
          style={{
            backgroundColor: '#9C4A15',
            borderColor: '#9C4A15',
          }}
        >
          {saving ? 'Saving...' : `Save Changes (${changedCount})`}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div className="space-y-4">
          {/* Search and Bulk Actions */}
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search routes..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
              allowClear
            />

            <Select
              placeholder="Bulk set"
              className="w-32"
              onChange={handleBulkPermissionChange}
              disabled={selectedRowKeys.length === 0}
              value={null}
            >
              <Option value="" disabled>
                Bulk Set
              </Option>
              {permissionOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <Space>
                    <Badge color={opt.color} />
                    <span>{opt.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <Divider className="my-2" />

          {/* Table */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="border rounded">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredRoutes}
              pagination={false}
              size="middle"
              rowClassName={(record) =>
                record.permission !== record.originalPermission ? 'bg-orange-50' : ''
              }
              scroll={{ y: 350 }}
              locale={{
                emptyText: 'No routes found. Please create routes in the Routes page first.',
              }}
            />
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center">
            <Text type="secondary">
              Showing {filteredRoutes.length} of {routes.length} routes
              {selectedRowKeys.length > 0 && ` • ${selectedRowKeys.length} selected`}
            </Text>
            {hasUnsavedChanges && (
              <Tag color="orange">
                {changedCount} unsaved change{changedCount > 1 ? 's' : ''}
              </Tag>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  )
}

export default EditRoutes
