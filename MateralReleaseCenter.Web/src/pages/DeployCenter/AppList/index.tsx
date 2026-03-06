import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Input, Form, Select, Space, App, Spin, Tooltip } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  PoweroffOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { rcscApiClient, createRCDSClient } from '../../../api/api-client'
import { AppFormModal } from './AppFormModal'
import { AppConsoleDrawer } from './AppConsoleDrawer'
import { AppCard } from './AppCard'
import type { DeployListDTO } from '../../../api/RCSCAPI/models'
import type {
  ApplicationInfoListDTO,
  ApplicationTypeEnumKeyValueModel,
} from '../../../api/RCDSAPI/models'
import type { QueryApplicationInfoRequestModel } from '../../../api/RCDSAPI/models'

// 搜索表单类型
interface SearchFormValues {
  serverID?: string
  applicationType?: number
  name?: string
  path?: string
  module?: string
}

export function AppListPage() {
  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm<SearchFormValues>()

  // 发布服务列表
  const [serverList, setServerList] = useState<DeployListDTO[]>([])
  const [selectedServerInfo, setSelectedServerInfo] = useState<DeployListDTO | null>(null)
  const [currentServerHostPort, setCurrentServerHostPort] = useState<string>('')

  // 应用程序类型枚举
  const [appTypeEnum, setAppTypeEnum] = useState<ApplicationTypeEnumKeyValueModel[]>([])

  // 搜索条件
  const [searchParams, setSearchParams] = useState<QueryApplicationInfoRequestModel>({
    pageIndex: 1,
    pageSize: 100,
    isAsc: true,
  })

  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // 数据状态
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApplicationInfoListDTO[]>([])
  const [serverLoading, setServerLoading] = useState(false)
  const [appTypeLoading, setAppTypeLoading] = useState(false)

  // 模态窗状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingApp, setEditingApp] = useState<ApplicationInfoListDTO | null>(null)

  // 控制台抽屉状态
  const [consoleDrawerOpen, setConsoleDrawerOpen] = useState(false)
  const [consoleAppID, setConsoleAppID] = useState('')
  const [consoleAppName, setConsoleAppName] = useState('')

  // 获取发布服务列表
  const fetchServerList = useCallback(async () => {
    setServerLoading(true)
    try {
      const result = await rcscApiClient.serverCenterAPI.server.getDeployList.get({})
      if (result?.resultType === 0 && result.data) {
        setServerList(result.data || [])
        // 默认选中第一个服务
        if (result.data.length > 0) {
          const firstServer = result.data[0]
          setSelectedServerInfo(firstServer)
          setCurrentServerHostPort(`${firstServer.host}:${firstServer.port}`)
        }
      }
    } catch (error) {
      console.error('获取发布服务列表错误:', error)
    } finally {
      setServerLoading(false)
    }
  }, [])

  // 获取 API 路径
  const getApiPath = () => {
    return selectedServerInfo?.name ?? ''
  }

  // 获取应用程序类型枚举
  const fetchAppTypeEnum = useCallback(async () => {
    if (!selectedServerInfo) return
    setAppTypeLoading(true)
    try {
      const client = createRCDSClient(selectedServerInfo.name ?? '')
      const result = await client.deployServerAPI.enums.getAllApplicationTypeEnum.get({})
      if (result?.resultType === 0 && result.data) {
        setAppTypeEnum(result.data || [])
      }
    } catch (error) {
      console.error('获取应用程序类型枚举错误:', error)
    } finally {
      setAppTypeLoading(false)
    }
  }, [selectedServerInfo])

  // 获取应用列表
  const fetchAppList = useCallback(async () => {
    if (!selectedServerInfo) return
    setLoading(true)
    try {
      const client = createRCDSClient(selectedServerInfo.name ?? '')
      const result = await client.deployServerAPI.applicationInfo.getList.post(
        searchParamsRef.current
      )
      if (result?.resultType === 0 && result.data) {
        setData(result.data || [])
      } else {
        messageApi.error(result?.message || '获取应用列表失败')
      }
    } catch (error) {
      console.error('获取应用列表错误:', error)
      messageApi.error('获取应用列表失败')
    } finally {
      setLoading(false)
    }
  }, [selectedServerInfo, messageApi])

  // 初始加载
  useEffect(() => {
    fetchServerList()
  }, [fetchServerList])

  // 发布服务变化时获取应用类型和应用列表
  useEffect(() => {
    if (selectedServerInfo) {
      fetchAppTypeEnum()
      fetchAppList()
    }
  }, [selectedServerInfo, fetchAppTypeEnum, fetchAppList])

  // 搜索参数变化时刷新列表
  useEffect(() => {
    if (selectedServerInfo) {
      fetchAppList()
    }
  }, [searchParams, selectedServerInfo, fetchAppList])

  // 处理服务器选择
  const handleServerChange = (value: string) => {
    const server = serverList.find(s => s.name === value)
    if (server) {
      setSelectedServerInfo(server)
      setCurrentServerHostPort(`${server.host}:${server.port}`)
    }
  }

  // 搜索
  const handleSearch = () => {
    const values = form.getFieldsValue()
    setSearchParams({
      ...searchParams,
      applicationType: values.applicationType,
      name: values.name || undefined,
      rootPath: values.path || undefined,
      mainModule: values.module || undefined,
      pageIndex: 1,
    })
  }

  // 复制 IP+端口
  const handleCopyHostPort = () => {
    if (currentServerHostPort) {
      navigator.clipboard.writeText(currentServerHostPort)
      messageApi.success('已复制')
    }
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    setSearchParams({
      pageIndex: 1,
      pageSize: 100,
      isAsc: true,
    })
  }

  // 打开新增模态窗
  const handleAdd = () => {
    setEditingApp(null)
    setModalTitle('新增应用')
    setModalVisible(true)
  }

  // 全部启动
  const handleStartAll = async () => {
    if (!selectedServerInfo) return
    try {
      const client = createRCDSClient(getApiPath())
      const result = await client.deployServerAPI.applicationInfo.startAll.post({})
      if (result?.resultType === 0) {
        messageApi.success('全部启动成功')
        fetchAppList()
      } else {
        messageApi.error(result?.message || '全部启动失败')
      }
    } catch (error) {
      console.error('全部启动错误:', error)
      messageApi.error('全部启动失败')
    }
  }

  // 全部停止
  const handleStopAll = async () => {
    if (!selectedServerInfo) return
    try {
      const client = createRCDSClient(getApiPath())
      const result = await client.deployServerAPI.applicationInfo.stopAll.post({})
      if (result?.resultType === 0) {
        messageApi.success('全部停止成功')
        fetchAppList()
      } else {
        messageApi.error(result?.message || '全部停止失败')
      }
    } catch (error) {
      console.error('全部停止错误:', error)
      messageApi.error('全部停止失败')
    }
  }

  // 构建服务器选项 key
  const getServerKey = (server: DeployListDTO) => {
    return server.name || ''
  }

  return (
    <div>
      {/* 搜索栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Form form={form} layout="inline" onFinish={handleSearch} style={{ flex: 1, minWidth: 0 }}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Select
                placeholder="请选择发布服务"
                style={{ width: 160 }}
                loading={serverLoading}
                onChange={handleServerChange}
                value={selectedServerInfo?.name ?? ''}
                optionLabelProp="label"
                options={serverList.map(server => ({
                  value: getServerKey(server),
                  label: server.name,
                  description: `${server.host}:${server.port}`,
                }))}
                optionRender={option => (
                  <>
                    <div>{option.label as string}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{option.data?.description}</div>
                  </>
                )}
              />
              <Tooltip title="复制 IP+端口">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyHostPort}
                  disabled={!currentServerHostPort}
                />
              </Tooltip>
            </Space>
          </Form.Item>
          <Form.Item name="applicationType" style={{ marginBottom: 0 }}>
            <Select
              placeholder="应用程序类型"
              style={{ width: 150 }}
              loading={appTypeLoading}
              allowClear
              options={appTypeEnum.map(item => ({
                value: item.key!,
                label: item.value,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" style={{ marginBottom: 0 }}>
            <Input placeholder="请输入名称" style={{ width: 120 }} allowClear />
          </Form.Item>
          <Form.Item name="path" style={{ marginBottom: 0 }}>
            <Input placeholder="请输入路径" style={{ width: 120 }} allowClear />
          </Form.Item>
          <Form.Item name="module" style={{ marginBottom: 0 }}>
            <Input placeholder="请输入模块" style={{ width: 120 }} allowClear />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button icon={<ReloadOutlined />} onClick={handleReset} title="重置" />
          </Form.Item>
        </Form>
        <Space>
          <Button
            onClick={handleStartAll}
            disabled={!selectedServerInfo}
            icon={<PoweroffOutlined />}
            title="全部启动"
          />
          <Button
            onClick={handleStopAll}
            disabled={!selectedServerInfo}
            icon={<PoweroffOutlined />}
            danger={true}
            title="全部停止"
          />
          <Button
            type="primary"
            onClick={handleAdd}
            disabled={!selectedServerInfo}
            icon={<PlusOutlined />}
            title="新增应用"
          />
        </Space>
      </div>

      {/* 卡片列表 */}
      <Spin spinning={loading}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 16,
          }}
        >
          {data.map(record => (
            <AppCard
              key={record.iD?.toString()}
              record={record}
              appTypeEnum={appTypeEnum}
              apiPath={getApiPath()}
              accessUrl={selectedServerInfo?.accessUrl}
              onRefresh={fetchAppList}
              onEdit={() => {
                setEditingApp(record)
                setModalTitle('编辑应用')
                setModalVisible(true)
              }}
              onViewConsole={(appID, appName) => {
                setConsoleAppID(appID)
                setConsoleAppName(appName)
                setConsoleDrawerOpen(true)
              }}
            />
          ))}
        </div>
        {data.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>暂无数据</div>
        )}
      </Spin>

      {/* 添加/编辑模态窗 */}
      <AppFormModal
        id={editingApp?.iD?.toString()}
        open={modalVisible}
        title={modalTitle}
        appTypeEnum={appTypeEnum}
        appTypeLoading={appTypeLoading}
        apiPath={getApiPath()}
        onSuccess={() => {
          setModalVisible(false)
          fetchAppList()
        }}
        onCancel={() => setModalVisible(false)}
      />

      {/* 控制台抽屉 */}
      <AppConsoleDrawer
        appID={consoleAppID}
        appName={consoleAppName}
        serverID={getApiPath()}
        open={consoleDrawerOpen}
        onClose={() => setConsoleDrawerOpen(false)}
      />
    </div>
  )
}

export default AppListPage
