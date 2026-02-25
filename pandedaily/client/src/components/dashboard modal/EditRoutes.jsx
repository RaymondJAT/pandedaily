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
import { SaveOutlined, CloseOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons'
import { getAllRoutes, updateRoutePermission, createRoute } from '../../services/api'

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
      fetchRoutes()
    }
  }, [isOpen, accessData])

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const allRoutesResponse = await getAllRoutes()
      const allRoutes = allRoutesResponse.data || allRoutesResponse || []

      const uniqueRouteNames = [
        ...new Set(allRoutes.map((r) => r.mr_route_name || r.route_name || r.name)),
      ].filter(Boolean)

      const accessRoutes = allRoutes.filter((route) => {
        const routeAccessId = route.mr_access_id || route.access_id
        return routeAccessId === accessData.id
      })

      const permissionMap = new Map()
      const routeIdMap = new Map()

      accessRoutes.forEach((route) => {
        const routeName = route.mr_route_name || route.route_name || route.name
        const routeId = route.mr_id || route.id
        const routeStatus = route.mr_status || route.status

        permissionMap.set(routeName, routeStatus || 'NO-ACCESS')
        routeIdMap.set(routeName, routeId)
      })

      // Create the combined list
      const combinedRoutes = uniqueRouteNames.map((routeName) => {
        const existingId = routeIdMap.get(routeName)
        const existingPermission = permissionMap.get(routeName)

        return {
          key: existingId || `new-${routeName}-${Date.now()}`,
          id: existingId,
          name: routeName,
          permission: existingPermission || 'NO-ACCESS',
          originalPermission: existingPermission || 'NO-ACCESS',
          isNew: !existingId,
        }
      })

      setRoutes(combinedRoutes)
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
      const routesToUpdate = changedRoutes.filter((route) => route.id)
      const routesToCreate = changedRoutes.filter((route) => !route.id)

      const results = []

      // Update existing routes
      for (const route of routesToUpdate) {
        try {
          const result = await updateRoutePermission(route.id, {
            access_id: accessData.id,
            status: route.permission,
          })
          results.push(result)
        } catch (error) {
          console.error(`Failed to update ${route.name}:`, error)
          message.error(`Failed to update ${route.name}: ${error.message}`)
          throw error
        }
      }

      // Create new routes if any
      for (const route of routesToCreate) {
        try {
          const result = await createRoute({
            access_id: accessData.id,
            route_name: route.name,
            status: route.permission,
          })
          results.push(result)
        } catch (error) {
          console.error(`Failed to create ${route.name}:`, error)
          message.error(`Failed to create ${route.name}: ${error.message}`)
          throw error
        }
      }

      // Show success message after all updates/creations are complete
      message.success(`Successfully updated ${changedRoutes.length} routes`)

      setSelectedRowKeys([])

      await fetchRoutes()
      onRoutesUpdated?.()
      onClose()
    } catch (error) {
      console.error('Error saving route permissions:', error)
      message.error('Failed to save changes. Please check console for details.')
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
          {record.isNew && (
            <Tag color="blue" size="small">
              New
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      width: '40%',
      render: (permission, record) => (
        <Space orientation="vertical" size="small">
          <Select
            value={permission}
            onChange={(value) => handlePermissionChange(record.key, value)}
            className="w-32"
            size="middle"
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
          {record.permission !== record.originalPermission && (
            <Tag color="orange" className="ml-2">
              Modified
            </Tag>
          )}
        </Space>
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
            Set access permissions for <strong>{accessData?.accessName}</strong>
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
