import { useState, useEffect, useCallback, useRef } from 'react'
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
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { rcscApiClient, createRCDSClient } from '../../../api/api-client'
import { ValueEditor } from '../../../components/ValueEditor'
import type { DeployListDTO } from '../../../api/RCSCAPI/models'
import type {
  GlobalEnvironmentListDTO,
  QueryGlobalEnvironmentRequestModel,
  PageModel,
  ApplicationTypeEnumKeyValueModel,
  AddGlobalEnvironmentRequestModel,
  EditGlobalEnvironmentRequestModel,
} from '../../../api/RCDSAPI/models'

// 搜索表单类型
interface SearchFormValues {
  serverID?: string
  applicationType?: number
  key?: string
}

// 表单类型
interface GlobalEnvironmentFormValues {
  applicationType: number
  key: string
  value: string
  description?: string
}

export function GlobalEnvironmentListPage() {
  const { message: messageApi, modal } = App.useApp()
  const [form] = Form.useForm<SearchFormValues>()
  const [dataForm] = Form.useForm<GlobalEnvironmentFormValues>()

  // 发布服务列表
  const [serverList, setServerList] = useState<DeployListDTO[]>([])
  const [selectedServerInfo, setSelectedServerInfo] = useState<DeployListDTO | null>(null)
  const [currentServerHostPort, setCurrentServerHostPort] = useState<string>('')

  // 应用程序类型枚举
  const [appTypeEnum, setAppTypeEnum] = useState<ApplicationTypeEnumKeyValueModel[]>([])

  // 搜索条件
  const [searchParams, setSearchParams] = useState<QueryGlobalEnvironmentRequestModel>({
    pageIndex: 1,
    pageSize: 10,
    isAsc: true,
  })

  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // 数据状态
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<GlobalEnvironmentListDTO[]>([])
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
  const [serverLoading, setServerLoading] = useState(false)
  const [appTypeLoading, setAppTypeLoading] = useState(false)

  // 模态窗状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingData, setEditingData] = useState<GlobalEnvironmentListDTO | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [formValues, setFormValues] = useState<{
    applicationType?: number
    key?: string
    value?: string
    description?: string
  }>({})

  // 获取 API 路径
  const getApiPath = () => {
    return selectedServerInfo?.name ?? ''
  }

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

  // 获取全局环境变量列表
  const fetchGlobalEnvironmentList = useCallback(async () => {
    if (!selectedServerInfo) return
    setLoading(true)
    try {
      const client = createRCDSClient(selectedServerInfo.name ?? '')
      const result = await client.deployServerAPI.globalEnvironment.getList.post(searchParamsRef.current)
      if (result?.resultType === 0 && result.data) {
        setData(result.data || [])
        if (result.pageModel) {
          setPagination(result.pageModel)
        }
      } else {
        messageApi.error(result?.message || '获取全局环境变量列表失败')
      }
    } catch (error) {
      console.error('获取全局环境变量列表错误:', error)
      messageApi.error('获取全局环境变量列表失败')
    } finally {
      setLoading(false)
    }
  }, [selectedServerInfo, messageApi])

  // 初始加载
  useEffect(() => {
    fetchServerList()
  }, [fetchServerList])

  // 发布服务变化时获取应用类型和列表
  useEffect(() => {
    if (selectedServerInfo) {
      fetchAppTypeEnum()
      fetchGlobalEnvironmentList()
    }
  }, [selectedServerInfo, fetchAppTypeEnum, fetchGlobalEnvironmentList])

  // 搜索参数变化时刷新列表
  useEffect(() => {
    if (selectedServerInfo && searchParams.pageIndex) {
      fetchGlobalEnvironmentList()
    }
  }, [searchParams, selectedServerInfo, fetchGlobalEnvironmentList])

  // 处理服务器选择
  const handleServerChange = (value: string) => {
    const server = serverList.find(s => s.name === value)
    if (server) {
      setSelectedServerInfo(server)
      setCurrentServerHostPort(`${server.host}:${server.port}`)
    }
  }

  // 复制 IP+端口
  const handleCopyHostPort = () => {
    if (currentServerHostPort) {
      navigator.clipboard.writeText(currentServerHostPort)
      messageApi.success('已复制')
    }
  }

  // 搜索
  const handleSearch = (values: SearchFormValues) => {
    setSearchParams({
      ...searchParams,
      applicationType: values.applicationType,
      key: values.key || undefined,
      pageIndex: 1,
    })
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    setSearchParams({
      pageIndex: 1,
      pageSize: 10,
      isAsc: true,
    })
  }

  // 分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pageIndex: page,
      pageSize: pageSize,
    })
  }

  // 打开新增模态窗
  const handleAdd = () => {
    if (!selectedServerInfo) {
      messageApi.warning('请先选择发布服务')
      return
    }
    setEditingData(null)
    setModalTitle('新增全局环境变量')
    setFormValues({})
    setModalVisible(true)
  }

  // 打开编辑模态窗
  const handleEdit = async (record: GlobalEnvironmentListDTO) => {
    setEditingData(record)
    setModalTitle('编辑全局环境变量')
    setFormValues({})
    setModalVisible(true)
    setInfoLoading(true)
    try {
      const client = createRCDSClient(getApiPath())
      const result = await client.deployServerAPI.globalEnvironment.getInfo.get({
        queryParameters: {
          id: record.iD!,
        },
      })
      if (result?.resultType === 0 && result.data) {
        const info = result.data
        const newFormValues = {
          applicationType: info.applicationType ?? undefined,
          key: info.key ?? undefined,
          value: info.value ?? '',
          description: info.description ?? undefined,
        }
        setFormValues(newFormValues)
        // 异步设置表单值，确保 Form 渲染完成后再设置
        setTimeout(() => {
          dataForm.setFieldsValue(newFormValues)
        }, 0)
      } else {
        messageApi.error(result?.message || '获取全局环境变量信息失败')
        setModalVisible(false)
        return
      }
    } catch (error) {
      console.error('获取全局环境变量信息错误:', error)
      messageApi.error('获取全局环境变量信息失败')
      setModalVisible(false)
      return
    } finally {
      setInfoLoading(false)
    }
  }

  // 删除全局环境变量
  const handleDelete = (record: GlobalEnvironmentListDTO) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除全局环境变量"${record.key || ''}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const client = createRCDSClient(getApiPath())
          const result = await client.deployServerAPI.globalEnvironment.deletePath.delete({
            queryParameters: {
              id: record.iD!,
            },
          })
          if (result?.resultType === 0) {
            messageApi.success('删除成功')
            fetchGlobalEnvironmentList()
          } else {
            messageApi.error(result?.message || '删除失败')
          }
        } catch (error) {
          console.error('删除全局环境变量错误:', error)
          messageApi.error('删除失败')
        }
      },
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await dataForm.validateFields()
      setSubmitLoading(true)

      const client = createRCDSClient(getApiPath())

      if (editingData) {
        // 编辑
        const editData: EditGlobalEnvironmentRequestModel = {
          iD: editingData.iD!,
          applicationType: values.applicationType,
          key: values.key,
          value: values.value,
          description: values.description,
        }
        const result = await client.deployServerAPI.globalEnvironment.edit.put(editData)
        if (result?.resultType === 0) {
          messageApi.success('编辑成功')
          setModalVisible(false)
          fetchGlobalEnvironmentList()
        } else {
          messageApi.error(result?.message || '编辑失败')
        }
      } else {
        // 新增
        const addData: AddGlobalEnvironmentRequestModel = {
          applicationType: values.applicationType,
          key: values.key,
          value: values.value,
          description: values.description,
        }
        const result = await client.deployServerAPI.globalEnvironment.add.post(addData)
        if (result?.resultType === 0) {
          messageApi.success('添加成功')
          setModalVisible(false)
          fetchGlobalEnvironmentList()
        } else {
          messageApi.error(result?.message || '添加失败')
        }
      }
    } catch (error) {
      console.error('提交表单错误:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 表格列定义
  const columns = [
    {
      title: '应用程序类型',
      dataIndex: 'applicationTypeText',
      key: 'applicationTypeText',
      width: 150,
    },
    {
      title: '键',
      dataIndex: 'key',
      key: 'key',
      width: 200,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (date: Date | string | undefined) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: GlobalEnvironmentListDTO) => (
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
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ flexWrap: 'wrap', gap: 8 }}
        >
          <Form.Item name="serverID" style={{ marginBottom: 8 }}>
            <Space>
              <Select
                placeholder="请选择发布服务"
                style={{ width: 160 }}
                loading={serverLoading}
                onChange={handleServerChange}
                value={selectedServerInfo?.name ?? ''}
                optionLabelProp="label"
                options={serverList.map(server => ({
                  value: server.name ?? '',
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
          <Form.Item name="applicationType" style={{ marginBottom: 8 }}>
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
          <Form.Item name="key" style={{ marginBottom: 8 }}>
            <Input placeholder="请输入键" style={{ width: 160 }} allowClear />
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
        <Tooltip title="新增全局环境变量">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={!selectedServerInfo}
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

      {/* 添加/编辑模态窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={720}
        destroyOnHidden
        closable={!infoLoading}
        mask={{ closable: !infoLoading }}
      >
        {infoLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : (
          <Form
            form={dataForm}
            layout="vertical"
            preserve={false}
            key={editingData?.iD?.toString() || 'add'}
            initialValues={infoLoading ? undefined : formValues}
          >
            <Form.Item
              name="applicationType"
              label="应用程序类型"
              rules={[{ required: true, message: '请选择应用程序类型' }]}
            >
              <Select
                placeholder="请选择应用程序类型"
                options={appTypeEnum.map(item => ({
                  value: item.key!,
                  label: item.value,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="key"
              label="键"
              rules={[{ required: true, message: '请输入键' }]}
            >
              <Input placeholder="请输入键" />
            </Form.Item>
            <Form.Item
              name="value"
              label="值"
              rules={[{ required: true, message: '请输入值' }]}
            >
              <ValueEditor
                value={formValues.value || ''}
                valueType="text"
                onChange={value => setFormValues(prev => ({ ...prev, value }))}
                onValueTypeChange={() => {}}
                height="200px"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea placeholder="请输入描述" rows={3} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default GlobalEnvironmentListPage
