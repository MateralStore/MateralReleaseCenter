import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Table,
  Button,
  Input,
  Form,
  Modal,
  Pagination,
  Space,
  App,
  Spin,
  Select,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { rcscApiClient, createRCESClient } from '../../../api/api-client'
import { ValueEditor } from '../../../components/ValueEditor'
import type {
  ProjectListDTO,
  NamespaceListDTO,
  EnvironmentServerListDTO,
  PageModel,
} from '../../../api/RCSCAPI/models'
import type {
  AddConfigurationItemRequestModel,
  QueryConfigurationItemRequestModel,
  ConfigurationItemListDTO as RCESConfigurationItemListDTO,
} from '../../../api/RCESAPI/models'
import type { Guid } from '@microsoft/kiota-abstractions'

// 搜索表单类型
interface SearchFormValues {
  environmentServer?: string
  projectID?: string
  namespaceID?: string
  key?: string
}

// 同步表单类型
interface SyncFormValues {
  targetEnvironments: string[]
  syncMode: number
}

// 添加/编辑表单类型
interface ConfigItemFormValues {
  description: string
  key: string
  value: string
}

export function ConfigItemListPage() {
  const { message: messageApi, modal } = App.useApp()
  const [form] = Form.useForm<SearchFormValues>()

  // 环境列表
  const [environments, setEnvironments] = useState<EnvironmentServerListDTO[]>([])
  // 项目列表
  const [projects, setProjects] = useState<ProjectListDTO[]>([])
  // 命名空间列表
  const [namespaces, setNamespaces] = useState<NamespaceListDTO[]>([])

  // 当前选中的环境
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('')
  const [currentEnvHostPort, setCurrentEnvHostPort] = useState<string>('')
  const [currentRCESClient, setCurrentRCESClient] = useState<ReturnType<
    typeof createRCESClient
  > | null>(null)
  // 标记是否已初始化（首次加载完成后设置为 true）
  const [isInitialized, setIsInitialized] = useState(false)

  // 搜索条件
  const [searchParams, setSearchParams] = useState<QueryConfigurationItemRequestModel>({
    pageIndex: 1,
    pageSize: 10,
    isAsc: true,
  })

  // 使用 ref 保存最新的 searchParams，避免无限循环
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // 数据状态
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RCESConfigurationItemListDTO[]>([])
  const [pagination, setPagination] = useState<PageModel>({
    pageIndex: 1,
    pageSize: 10,
    dataCount: 0,
    pageCount: 0,
    isAsc: true,
    skip: 0,
    take: 0,
    startIndex: 0,
    sortPropertyName: '',
  })

  // 同步模态窗状态
  const [syncModalVisible, setSyncModalVisible] = useState(false)
  const [syncTargetItem, setSyncTargetItem] = useState<RCESConfigurationItemListDTO | null>(null)
  const [syncForm] = Form.useForm<SyncFormValues>()
  const [syncLoading, setSyncLoading] = useState(false)

  // 添加/编辑模态窗状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editModalTitle, setEditModalTitle] = useState('')
  const [editingConfigItem, setEditingConfigItem] = useState<RCESConfigurationItemListDTO | null>(
    null
  )
  const [editForm] = Form.useForm<ConfigItemFormValues>()
  const [editSubmitLoading, setEditSubmitLoading] = useState(false)
  const [editInfoLoading, setEditInfoLoading] = useState(false)
  const [formValues, setFormValues] = useState<ConfigItemFormValues>({
    description: '',
    key: '',
    value: '',
  })
  const [valueType, setValueType] = useState<'text' | 'json'>('text')

  // 获取环境服务程序列表
  const fetchEnvironments = useCallback(async () => {
    try {
      const result = await rcscApiClient.serverCenterAPI.server.getEnvironmentServerList.get()
      if (result?.resultType === 0 && result.data) {
        setEnvironments(result.data)
        // 默认选中第一个
        if (result.data.length > 0 && !currentEnvironment) {
          const firstEnv = result.data[0]
          setCurrentEnvironment(firstEnv.name || '')
          setCurrentEnvHostPort(`${firstEnv.host}:${firstEnv.port}`)
          // 设置表单默认值
          form.setFieldsValue({ environmentServer: firstEnv.name || undefined })
          // 创建 RCES Client（使用环境名作为 API 路径的一部分）
          setCurrentRCESClient(createRCESClient(firstEnv.name || ''))
        }
      }
    } catch (error) {
      console.error('获取环境列表错误:', error)
    }
  }, [currentEnvironment])

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
  const fetchNamespaces = useCallback(async (projectId: Guid, autoSelect = true) => {
    try {
      const result = await rcscApiClient.serverCenterAPI.namespace.getList.post({
        pageIndex: 1,
        pageSize: 100,
        isAsc: true,
        projectID: projectId,
      })
      if (result?.resultType === 0 && result.data) {
        setNamespaces(result.data)
        // 默认选中第一个命名空间
        if (autoSelect && result.data.length > 0) {
          const firstNamespace = result.data[0]
          form.setFieldsValue({ namespaceID: firstNamespace.iD?.toString() })
          setSearchParams(prev => ({
            ...prev,
            projectID: projectId,
            namespaceID: firstNamespace.iD,
          }))
        }
      }
    } catch (error) {
      console.error('获取命名空间列表错误:', error)
    }
  }, [])

  // 获取配置项列表
  const fetchConfigItemList = useCallback(async () => {
    if (!currentRCESClient || !searchParamsRef.current.namespaceID) {
      setData([])
      return
    }
    setLoading(true)
    try {
      const result = await currentRCESClient.environmentServerAPI.configurationItem.getList.post(
        searchParamsRef.current
      )
      if (result?.resultType === 0 && result.data) {
        setData(result.data || [])
        if (result.pageModel) {
          setPagination(result.pageModel)
        }
      } else {
        messageApi.error(result?.message || '获取配置项列表失败')
      }
    } catch (error) {
      console.error('获取配置项列表错误:', error)
      messageApi.error('获取配置项列表失败')
    } finally {
      setLoading(false)
    }
  }, [currentRCESClient, messageApi])

  // 初始加载
  useEffect(() => {
    fetchEnvironments()
    fetchProjects()
  }, [])

  // 首次加载完成后自动选择第一个项目（仅执行一次）
  useEffect(() => {
    if (environments.length > 0 && projects.length > 0 && !isInitialized) {
      const firstProject = projects[0]
      const projectId = firstProject.iD?.toString() || ''
      form.setFieldsValue({ projectID: projectId })
      fetchNamespaces(firstProject.iD!)
      setIsInitialized(true)
    }
  }, [environments, projects, isInitialized, form, fetchNamespaces])

  // 环境或命名空间变化时刷新列表
  useEffect(() => {
    if (currentRCESClient && searchParams.namespaceID) {
      fetchConfigItemList()
    }
  }, [currentRCESClient, searchParams, fetchConfigItemList])

  // 环境切换
  const handleEnvironmentChange = (value: string) => {
    const env = environments.find(e => e.name === value)
    if (env) {
      setCurrentEnvHostPort(`${env.host}:${env.port}`)
    }
    setCurrentEnvironment(value)
    setCurrentRCESClient(createRCESClient(value))
    // 重置分页参数，保留其他搜索条件
    setSearchParams(prev => ({
      ...prev,
      pageIndex: 1,
      pageSize: 10,
      isAsc: true,
    }))
  }

  // 项目切换
  const handleProjectChange = (value: string) => {
    if (value) {
      fetchNamespaces(value as unknown as Guid)
      setSearchParams({
        pageIndex: 1,
        pageSize: 10,
        isAsc: true,
        projectID: value as unknown as Guid,
      })
      form.setFieldsValue({ namespaceID: undefined, key: undefined })
      setNamespaces([])
    } else {
      setSearchParams({
        pageIndex: 1,
        pageSize: 10,
        isAsc: true,
      })
      form.setFieldsValue({ namespaceID: undefined, key: undefined })
      setNamespaces([])
      setData([])
    }
  }

  // 命名空间切换
  const handleNamespaceChange = (value: string) => {
    if (value) {
      setSearchParams(prev => ({
        ...prev,
        pageIndex: 1,
        namespaceID: value as unknown as Guid,
      }))
    } else {
      setSearchParams(prev => ({
        ...prev,
        pageIndex: 1,
        namespaceID: undefined,
      }))
      setData([])
    }
  }

  // 复制 IP+端口
  const handleCopyHostPort = () => {
    if (currentEnvHostPort) {
      navigator.clipboard.writeText(currentEnvHostPort)
      messageApi.success('已复制')
    }
  }

  // 搜索
  const handleSearch = (values: SearchFormValues) => {
    setSearchParams(prev => ({
      ...prev,
      key: values.key || undefined,
      pageIndex: 1,
    }))
  }

  // 重置
  const handleReset = () => {
    form.setFieldsValue({
      key: undefined,
    })
    setSearchParams(prev => ({
      ...prev,
      key: undefined,
      pageIndex: 1,
    }))
  }

  // 分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams(prev => ({
      ...prev,
      pageIndex: page,
      pageSize: pageSize,
    }))
  }

  // 删除配置项
  const handleDelete = (record: RCESConfigurationItemListDTO) => {
    if (!currentRCESClient) return
    modal.confirm({
      title: '确认删除',
      content: `确定要删除配置项"${record.key || ''}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result =
            await currentRCESClient.environmentServerAPI.configurationItem.deletePath.delete({
              queryParameters: {
                id: record.iD!,
              },
            })
          if (result?.resultType === 0) {
            messageApi.success('删除成功')
            fetchConfigItemList()
          } else {
            messageApi.error(result?.message || '删除失败')
          }
        } catch (error) {
          console.error('删除配置项错误:', error)
          messageApi.error('删除失败')
        }
      },
    })
  }

  // 打开同步模态窗
  const handleSync = (record: RCESConfigurationItemListDTO) => {
    setSyncTargetItem(record)
    setSyncModalVisible(true)
  }

  // 提交同步
  const handleSyncSubmit = async () => {
    if (!currentRCESClient || !syncTargetItem) return
    try {
      const values = await syncForm.validateFields()
      setSyncLoading(true)

      // 先获取当前配置项的详细信息
      const infoResult = await currentRCESClient.environmentServerAPI.configurationItem.getInfo.get(
        {
          queryParameters: {
            id: syncTargetItem.iD!,
          },
        }
      )

      if (infoResult?.resultType !== 0 || !infoResult.data) {
        messageApi.error('获取配置项信息失败')
        return
      }

      const configItem = infoResult.data
      const targetEnvironments = values.targetEnvironments as string[]

      // 循环调用 Add 接口将配置项添加到每个目标环境
      for (const envName of targetEnvironments) {
        const targetClient = createRCESClient(envName)
        await targetClient.environmentServerAPI.configurationItem.add.post({
          description: configItem.description,
          key: configItem.key,
          value: configItem.value,
          namespaceID: configItem.namespaceID,
        })
      }

      messageApi.success('同步成功')
      setSyncModalVisible(false)
      syncForm.resetFields()
    } catch (error) {
      console.error('同步配置项错误:', error)
      messageApi.error('同步失败')
    } finally {
      setSyncLoading(false)
    }
  }

  // 截断显示值
  const truncateValue = (value: string | null | undefined, maxLength = 50) => {
    if (!value) return '-'
    if (value.length <= maxLength) return value
    return value.substring(0, maxLength) + '...'
  }

  // 打开新增模态窗
  const handleAdd = () => {
    setEditingConfigItem(null)
    setEditModalTitle('新增配置项')
    setFormValues({ description: '', key: '', value: '' })
    setValueType('text')
    setEditModalVisible(true)
  }

  // 打开编辑模态窗
  const handleEdit = async (record: RCESConfigurationItemListDTO) => {
    if (!currentRCESClient) return
    setEditingConfigItem(record)
    setEditModalTitle('编辑配置项')
    setEditInfoLoading(true)
    try {
      const result = await currentRCESClient.environmentServerAPI.configurationItem.getInfo.get({
        queryParameters: {
          id: record.iD!,
        },
      })
      if (result?.resultType === 0 && result.data) {
        const data = result.data
        // 判断值类型
        let currentValueType: 'text' | 'json' = 'text'
        if (data.value) {
          try {
            JSON.parse(data.value)
            currentValueType = 'json'
          } catch {
            currentValueType = 'text'
          }
        }
        setValueType(currentValueType)
        setFormValues({
          description: data.description || '',
          key: data.key || '',
          value: data.value || '',
        })
      } else {
        messageApi.error(result?.message || '获取配置项信息失败')
        return
      }
    } catch (error) {
      console.error('获取配置项信息错误:', error)
      messageApi.error('获取配置项信息失败')
      return
    } finally {
      setEditInfoLoading(false)
    }
    setEditModalVisible(true)
  }

  // 提交表单
  const handleEditSubmit = async () => {
    if (!currentRCESClient) return
    try {
      const values = await editForm.validateFields()

      // 验证值不能为空
      if (!formValues.value || formValues.value.trim() === '') {
        messageApi.error('请输入值')
        return
      }

      setEditSubmitLoading(true)

      // 获取值（从 formValues 而非表单验证结果）
      const submitValue = formValues.value

      if (editingConfigItem) {
        // 编辑
        const result = await currentRCESClient.environmentServerAPI.configurationItem.edit.put({
          iD: editingConfigItem.iD!,
          description: values.description,
          key: formValues.key,
          value: submitValue,
        })
        if (result?.resultType === 0) {
          messageApi.success('编辑成功')
          setEditModalVisible(false)
          fetchConfigItemList()
        } else {
          messageApi.error(result?.message || '编辑失败')
        }
      } else {
        // 新增
        const addData: AddConfigurationItemRequestModel = {
          description: values.description,
          key: values.key,
          value: submitValue,
          namespaceID: searchParams.namespaceID!,
        }
        const result =
          await currentRCESClient.environmentServerAPI.configurationItem.add.post(addData)
        if (result?.resultType === 0) {
          messageApi.success('添加成功')
          setEditModalVisible(false)
          fetchConfigItemList()
        } else {
          messageApi.error(result?.message || '添加失败')
        }
      }
    } catch (error) {
      console.error('提交表单错误:', error)
    } finally {
      setEditSubmitLoading(false)
    }
  }

  // 值类型变化
  const handleValueTypeChange = (type: 'text' | 'json') => {
    setValueType(type)
  }

  // 表格列定义
  const columns = [
    {
      title: '键',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (value: string | null | undefined) => (
        <Tooltip title={value}>{truncateValue(value)}</Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: RCESConfigurationItemListDTO) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
          <Tooltip title="同步">
            <Button
              type="link"
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleSync(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 搜索栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ flexWrap: 'wrap', gap: 8 }}
        >
          <Form.Item
            name="environmentServer"
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: '请选择环境' }]}
          >
            <Space>
              <Select
                placeholder="请选择环境"
                style={{ width: 160 }}
                value={currentEnvironment || undefined}
                onChange={handleEnvironmentChange}
                optionLabelProp="label"
                options={environments.map(e => ({
                  label: e.name,
                  value: e.name || '',
                  description: `${e.host}:${e.port}`,
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
                  disabled={!currentEnvHostPort}
                />
              </Tooltip>
            </Space>
          </Form.Item>
          <Form.Item
            name="projectID"
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select
              placeholder="请选择项目"
              style={{ width: 150 }}
              onChange={handleProjectChange}
              options={projects.map(p => ({
                label: p.name,
                value: p.iD?.toString() || '',
              }))}
            />
          </Form.Item>
          <Form.Item
            name="namespaceID"
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: '请选择命名空间' }]}
          >
            <Select
              placeholder="请选择命名空间"
              style={{ width: 180 }}
              onChange={handleNamespaceChange}
              options={namespaces.map(n => ({
                label: n.name,
                value: n.iD?.toString() || '',
              }))}
            />
          </Form.Item>
          <Form.Item name="key" style={{ marginBottom: 8 }}>
            <Input placeholder="请输入键" style={{ width: 140 }} allowClear />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Space>
              <Tooltip title="搜索">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} />
              </Tooltip>
              <Tooltip title="重置">
                <Button icon={<ReloadOutlined />} onClick={handleReset} />
              </Tooltip>
            </Space>
          </Form.Item>
        </Form>
        <Tooltip title="新增配置项">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ marginBottom: 8 }}
          />
        </Tooltip>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey={record => record.iD?.toString() || ''}
        loading={loading}
        pagination={false}
      />

      {/* 分页 */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={pagination.pageIndex || 1}
          pageSize={pagination.pageSize || 10}
          total={pagination.dataCount || 0}
          onChange={handlePageChange}
          showSizeChanger
          showQuickJumper
          showTotal={total => `共 ${total} 条`}
        />
      </div>

      {/* 同步模态窗 */}
      <Modal
        title="同步配置"
        open={syncModalVisible}
        onCancel={() => setSyncModalVisible(false)}
        onOk={handleSyncSubmit}
        confirmLoading={syncLoading}
        width={480}
        destroyOnHidden
      >
        <Form form={syncForm} layout="vertical">
          <Form.Item
            name="targetEnvironments"
            label="目标环境"
            rules={[{ required: true, message: '请选择目标环境' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择目标环境"
              options={environments
                .filter(e => e.name !== currentEnvironment)
                .map(e => ({
                  label: e.name,
                  value: e.name || '',
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加/编辑模态窗 */}
      <Modal
        title={editModalTitle}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        confirmLoading={editSubmitLoading}
        width={640}
        destroyOnHidden
        closable={!editInfoLoading}
        mask={{ closable: !editInfoLoading }}
      >
        {editInfoLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : (
          <Form
            form={editForm}
            layout="vertical"
            preserve={false}
            key={editingConfigItem?.iD?.toString() || 'add'}
            initialValues={formValues}
          >
            {editingConfigItem ? (
              <Form.Item label="键">
                <Input value={formValues.key} disabled />
              </Form.Item>
            ) : (
              <Form.Item name="key" label="键" rules={[{ required: true, message: '请输入键' }]}>
                <Input placeholder="请输入键" />
              </Form.Item>
            )}
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <Input.TextArea placeholder="请输入描述" rows={3} />
            </Form.Item>
            <Form.Item label="值" required>
              <ValueEditor
                value={formValues.value}
                valueType={valueType}
                onChange={val => setFormValues(prev => ({ ...prev, value: val }))}
                onValueTypeChange={handleValueTypeChange}
                height="200px"
              />
              <input type="hidden" name="value" value={formValues.value || ''} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default ConfigItemListPage
