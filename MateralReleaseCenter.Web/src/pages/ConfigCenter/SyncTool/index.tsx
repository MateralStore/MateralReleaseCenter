import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Select, Button, Radio, Space, App } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { rcscApiClient, createRCESClient } from '../../../api/api-client'
import type {
  ProjectListDTO,
  NamespaceListDTO,
  EnvironmentServerListDTO,
} from '../../../api/RCSCAPI/models'
import type { SyncConfigRequestModel, SyncModeEnumKeyValueModel } from '../../../api/RCESAPI/models'
import type { Guid } from '@microsoft/kiota-abstractions'

// 表单类型
interface SyncToolFormValues {
  sourceEnvironment: string
  targetEnvironments: string[]
  projectID: string
  namespaceIDs: string[]
  syncMode: number
}

export function SyncToolPage() {
  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm<SyncToolFormValues>()

  // 加载状态
  const [loading, setLoading] = useState(false)
  const [environments, setEnvironments] = useState<EnvironmentServerListDTO[]>([])
  const [projects, setProjects] = useState<ProjectListDTO[]>([])
  const [namespaces, setNamespaces] = useState<NamespaceListDTO[]>([])
  const [syncModes, setSyncModes] = useState<SyncModeEnumKeyValueModel[]>([])

  // 当前选中的源环境
  const [sourceEnvironment, setSourceEnvironment] = useState<string>('')
  const [sourceRCESClient, setSourceRCESClient] = useState<ReturnType<
    typeof createRCESClient
  > | null>(null)

  // 获取环境服务程序列表
  const fetchEnvironments = useCallback(async () => {
    try {
      const result = await rcscApiClient.serverCenterAPI.server.getEnvironmentServerList.get()
      if (result?.resultType === 0 && result.data) {
        setEnvironments(result.data)
        // 默认选中第一个
        if (result.data.length > 0) {
          const firstEnv = result.data[0]
          setSourceEnvironment(firstEnv.name || '')
          setSourceRCESClient(createRCESClient(firstEnv.name || ''))
          form.setFieldsValue({ sourceEnvironment: firstEnv.name || undefined })
        }
      }
    } catch (error) {
      console.error('获取环境列表错误:', error)
    }
  }, [form])

  // 获取项目列表
  const fetchProjects = useCallback(async () => {
    try {
      const result = await rcscApiClient.serverCenterAPI.project.getList.post({
        pageIndex: 1,
        pageSize: 100,
        isAsc: true,
      })
      if (result?.resultType === 0 && result.data) {
        setProjects(result.data)
      }
    } catch (error) {
      console.error('获取项目列表错误:', error)
    }
  }, [])

  // 获取命名空间列表
  const fetchNamespaces = useCallback(async (projectId: Guid) => {
    try {
      const result = await rcscApiClient.serverCenterAPI.namespace.getList.post({
        pageIndex: 1,
        pageSize: 100,
        isAsc: true,
        projectID: projectId,
      })
      if (result?.resultType === 0 && result.data) {
        setNamespaces(result.data)
      }
    } catch (error) {
      console.error('获取命名空间列表错误:', error)
    }
  }, [])

  // 获取同步方式枚举
  const fetchSyncModes = useCallback(async () => {
    if (!sourceEnvironment) return
    try {
      const client = createRCESClient(sourceEnvironment)
      const result = await client.environmentServerAPI.enums.getAllSyncModeEnum.get()
      if (result?.resultType === 0 && result.data) {
        setSyncModes(result.data || [])
      }
    } catch (error) {
      console.error('获取同步方式枚举错误:', error)
    }
  }, [sourceEnvironment])

  // 初始加载
  useEffect(() => {
    fetchEnvironments()
    fetchProjects()
  }, [fetchEnvironments, fetchProjects])

  // 源环境变化时获取同步方式枚举
  useEffect(() => {
    if (sourceEnvironment) {
      fetchSyncModes()
    }
  }, [sourceEnvironment, fetchSyncModes])

  // 源环境切换
  const handleSourceEnvironmentChange = (value: string) => {
    const env = environments.find(e => e.name === value)
    if (env) {
      setSourceEnvironment(value)
      setSourceRCESClient(createRCESClient(value))
      // 清空目标环境选择
      form.setFieldsValue({
        targetEnvironments: [],
      })
    }
  }

  // 项目切换
  const handleProjectChange = (value: string) => {
    if (value) {
      fetchNamespaces(value as unknown as Guid)
      form.setFieldsValue({ namespaceIDs: [] })
      setNamespaces([])
    } else {
      form.setFieldsValue({ namespaceIDs: [] })
      setNamespaces([])
    }
  }

  // 提交同步
  const handleSubmit = async () => {
    if (!sourceRCESClient) return
    try {
      const values = await form.validateFields()
      setLoading(true)

      const syncData: SyncConfigRequestModel = {
        projectID: values.projectID as unknown as Guid,
        namespaceIDs: values.namespaceIDs as unknown as Guid[],
        targetEnvironments: values.targetEnvironments,
        mode: values.syncMode,
      }

      const result =
        await sourceRCESClient.environmentServerAPI.configurationItem.syncConfig.put(syncData)

      if (result?.resultType === 0) {
        messageApi.success('同步成功')
        form.setFieldsValue({ namespaceIDs: [] })
      } else {
        messageApi.error(result?.message || '同步失败')
      }
    } catch (error) {
      console.error('同步配置错误:', error)
      messageApi.error('同步失败')
    } finally {
      setLoading(false)
    }
  }

  // 目标环境选项（排除源环境）
  const targetEnvironmentOptions = environments
    .filter(e => e.name !== sourceEnvironment)
    .map(e => ({
      label: e.name,
      value: e.name || '',
    }))

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 600 }}
        initialValues={{
          sourceEnvironment: sourceEnvironment || undefined,
        }}
      >
        <Form.Item
          name="sourceEnvironment"
          label="源环境"
          rules={[{ required: true, message: '请选择源环境' }]}
        >
          <Select
            placeholder="请选择源环境"
            onChange={handleSourceEnvironmentChange}
            options={environments.map(e => ({
              label: e.name,
              value: e.name || '',
            }))}
          />
        </Form.Item>

        <Form.Item
          name="targetEnvironments"
          label="目标环境"
          rules={[{ required: true, message: '请选择目标环境' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择目标环境（可多选）"
            options={targetEnvironmentOptions}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="projectID"
          label="项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select
            placeholder="请选择项目"
            onChange={handleProjectChange}
            showSearch
            optionFilterProp="label"
            options={projects.map(p => ({
              label: p.name,
              value: p.iD?.toString() || '',
            }))}
          />
        </Form.Item>

        <Form.Item
          name="namespaceIDs"
          label="命名空间"
          rules={[{ required: true, message: '请选择命名空间' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择命名空间（可多选）"
            optionFilterProp="label"
            options={namespaces.map(n => ({
              label: n.name,
              value: n.iD?.toString() || '',
            }))}
          />
        </Form.Item>

        <Form.Item
          name="syncMode"
          label="同步方式"
          rules={[{ required: true, message: '请选择同步方式' }]}
        >
          <Radio.Group>
            {syncModes.map(mode => (
              <Radio key={mode.key} value={mode.key}>
                {mode.value}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={handleSubmit}
              loading={loading}
              disabled={!sourceEnvironment || !sourceRCESClient}
            >
              同步
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default SyncToolPage
