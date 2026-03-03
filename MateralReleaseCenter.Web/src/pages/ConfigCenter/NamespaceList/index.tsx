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
  ReloadOutlined,
} from '@ant-design/icons'
import { rcscApiClient } from '../../../api/api-client'
import type {
  ProjectListDTO,
  NamespaceListDTO,
  QueryNamespaceRequestModel,
  PageModel,
  AddNamespaceRequestModel,
} from '../../../api/RCSCAPI/models'
import type { Guid } from '@microsoft/kiota-abstractions'

// 搜索表单类型
interface SearchFormValues {
  projectID?: string
  name?: string
  description?: string
}

// 添加/编辑表单类型
interface NamespaceFormValues {
  name: string
  description?: string
}

export function NamespaceListPage() {
  const { message: messageApi, modal } = App.useApp()
  const [form] = Form.useForm<SearchFormValues>()
  const [namespaceForm] = Form.useForm<NamespaceFormValues>()

  // 项目列表
  const [projects, setProjects] = useState<ProjectListDTO[]>([])

  // 搜索条件
  const [searchParams, setSearchParams] = useState<QueryNamespaceRequestModel>({
    pageIndex: 1,
    pageSize: 10,
    isAsc: true,
  })

  // 使用 ref 保存最新的 searchParams，避免无限循环
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // 数据状态
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<NamespaceListDTO[]>([])
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

  // 模态窗状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingNamespace, setEditingNamespace] = useState<NamespaceListDTO | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [formValues, setFormValues] = useState<{ name?: string; description?: string }>({})

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
        // 默认选中第一个项目
        if (result.data.length > 0 && !searchParams.projectID) {
          const firstProjectId = result.data[0].iD!
          setSearchParams(prev => ({
            ...prev,
            projectID: firstProjectId,
          }))
          // 设置表单默认值
          form.setFieldsValue({ projectID: firstProjectId.toString() })
        }
      }
    } catch (error) {
      console.error('获取项目列表错误:', error)
    }
  }, [])

  // 获取命名空间列表
  const fetchNamespaceList = useCallback(async () => {
    if (!searchParamsRef.current.projectID) {
      setData([])
      return
    }
    setLoading(true)
    try {
      const result = await rcscApiClient.serverCenterAPI.namespace.getList.post(
        searchParamsRef.current
      )
      if (result?.resultType === 0 && result.data) {
        setData(result.data || [])
        if (result.pageModel) {
          setPagination(result.pageModel)
        }
      } else {
        messageApi.error(result?.message || '获取命名空间列表失败')
      }
    } catch (error) {
      console.error('获取命名空间列表错误:', error)
      messageApi.error('获取命名空间列表失败')
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  // 初始加载
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // 项目加载后且 searchParams 变化时获取命名空间列表
  useEffect(() => {
    if (searchParams.projectID) {
      fetchNamespaceList()
    }
  }, [searchParams, fetchNamespaceList])

  // 项目下拉框变化
  const handleProjectChange = (value: string) => {
    setSearchParams({
      pageIndex: 1,
      pageSize: 10,
      isAsc: true,
      projectID: value as unknown as Guid,
    })
  }

  // 搜索
  const handleSearch = (values: SearchFormValues) => {
    setSearchParams({
      ...searchParams,
      name: values.name || undefined,
      description: values.description || undefined,
      pageIndex: 1,
    })
  }

  // 重置
  const handleReset = () => {
    form.setFieldsValue({
      name: undefined,
      description: undefined,
    })
    setSearchParams({
      pageIndex: 1,
      pageSize: 10,
      isAsc: true,
      projectID: searchParams.projectID,
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
    if (!searchParams.projectID) {
      messageApi.warning('请先选择项目')
      return
    }
    setEditingNamespace(null)
    setModalTitle('新增命名空间')
    setFormValues({})
    setModalVisible(true)
  }

  // 打开编辑模态窗
  const handleEdit = async (record: NamespaceListDTO) => {
    setEditingNamespace(record)
    setModalTitle('编辑命名空间')
    setFormValues({})
    setModalVisible(true)
    setInfoLoading(true)
    try {
      const result = await rcscApiClient.serverCenterAPI.namespace.getInfo.get({
        queryParameters: {
          id: record.iD!,
        },
      })
      if (result?.resultType === 0 && result.data) {
        const newFormValues = {
          name: result.data.name || '',
          description: result.data.description || '',
        }
        setFormValues(newFormValues)
        // 异步设置表单值，确保 Form 渲染完成后再设置
        setTimeout(() => {
          namespaceForm.setFieldsValue(newFormValues)
        }, 0)
      } else {
        messageApi.error(result?.message || '获取命名空间信息失败')
        setModalVisible(false)
        return
      }
    } catch (error) {
      console.error('获取命名空间信息错误:', error)
      messageApi.error('获取命名空间信息失败')
      setModalVisible(false)
      return
    } finally {
      setInfoLoading(false)
    }
  }

  // 删除命名空间
  const handleDelete = (record: NamespaceListDTO) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除命名空间"${record.name || ''}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await rcscApiClient.serverCenterAPI.namespace.deletePath.delete({
            queryParameters: {
              id: record.iD!,
            },
          })
          if (result?.resultType === 0) {
            messageApi.success('删除成功')
            fetchNamespaceList()
          } else {
            messageApi.error(result?.message || '删除失败')
          }
        } catch (error) {
          console.error('删除命名空间错误:', error)
          messageApi.error('删除失败')
        }
      },
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await namespaceForm.validateFields()
      setSubmitLoading(true)

      if (editingNamespace) {
        // 编辑命名空间
        const result = await rcscApiClient.serverCenterAPI.namespace.edit.put({
          iD: editingNamespace.iD!,
          description: values.description,
        })
        if (result?.resultType === 0) {
          messageApi.success('编辑成功')
          setModalVisible(false)
          fetchNamespaceList()
        } else {
          messageApi.error(result?.message || '编辑失败')
        }
      } else {
        // 新增命名空间
        const addData: AddNamespaceRequestModel = {
          name: values.name,
          description: values.description,
          projectID: searchParams.projectID as unknown as Guid,
        }
        const result = await rcscApiClient.serverCenterAPI.namespace.add.post(addData)
        if (result?.resultType === 0) {
          messageApi.success('添加成功')
          setModalVisible(false)
          fetchNamespaceList()
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
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (date: Date | string | undefined) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: NamespaceListDTO) => (
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
        }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ flexWrap: 'wrap', gap: 8 }}
        >
          <Form.Item
            name="projectID"
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select
              placeholder="请选择项目"
              style={{ width: 180 }}
              onChange={handleProjectChange}
              options={projects.map(p => ({
                label: p.name,
                value: p.iD?.toString() || '',
              }))}
            />
          </Form.Item>
          <Form.Item name="name" style={{ marginBottom: 8 }}>
            <Input placeholder="请输入名称" style={{ width: 160 }} allowClear />
          </Form.Item>
          <Form.Item name="description" style={{ marginBottom: 8 }}>
            <Input placeholder="请输入描述" style={{ width: 160 }} allowClear />
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
        <Tooltip title="新增命名空间">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={!searchParams.projectID}
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
        width={480}
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
            form={namespaceForm}
            layout="vertical"
            preserve={false}
            key={editingNamespace?.iD?.toString() || 'add'}
            initialValues={infoLoading ? undefined : formValues}
          >
            {editingNamespace ? (
              <Form.Item label="名称">
                <Input value={formValues.name || ''} disabled />
              </Form.Item>
            ) : (
              <Form.Item
                name="name"
                label="名称"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="请输入名称" />
              </Form.Item>
            )}
            <Form.Item name="description" label="描述">
              <Input.TextArea placeholder="请输入描述" rows={3} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default NamespaceListPage
