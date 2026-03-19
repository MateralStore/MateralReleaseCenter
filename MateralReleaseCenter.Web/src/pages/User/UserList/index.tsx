import { useState, useEffect, useRef, useCallback } from 'react'
import { Table, Button, Input, Form, Pagination, Space, App, Tooltip } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { rcscApiClient } from '../../../api/api-client'
import type { UserListDTO, QueryUserRequestModel, PageModel } from '../../../api/RCSCAPI/models'
import { UserFormModal } from './UserFormModal'

// 搜索表单类型
interface SearchFormValues {
  account?: string
  name?: string
}

export function UserListPage() {
  const { message: messageApi, modal } = App.useApp()
  const [form] = Form.useForm<SearchFormValues>()

  // 搜索条件
  const [searchParams, setSearchParams] = useState<QueryUserRequestModel>({
    pageIndex: 1,
    pageSize: 10,
    isAsc: true,
  })

  // 使用 ref 保存最新的 searchParams，避免无限循环
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // 数据状态
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<UserListDTO[]>([])
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
  const [editingUser, setEditingUser] = useState<UserListDTO | null>(null)

  // 获取用户列表
  const fetchUserList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await rcscApiClient.serverCenterAPI.user.getList.post(searchParamsRef.current)
      if (result?.resultType === 0 && result.data) {
        setData(result.data || [])
        if (result.pageModel) {
          setPagination(result.pageModel)
        }
      } else {
        messageApi.error(result?.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表错误:', error)
      messageApi.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  // 初始加载和搜索参数变化时获取数据
  useEffect(() => {
    fetchUserList()
  }, [searchParams, fetchUserList])

  // 搜索
  const handleSearch = (values: SearchFormValues) => {
    setSearchParams({
      ...searchParams,
      account: values.account || undefined,
      name: values.name || undefined,
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
    setEditingUser(null)
    setModalTitle('新增用户')
    setModalVisible(true)
  }

  // 打开编辑模态窗
  const handleEdit = (record: UserListDTO) => {
    setEditingUser(record)
    setModalTitle('编辑用户')
    setModalVisible(true)
  }

  // 模态窗成功回调
  const handleModalSuccess = () => {
    setModalVisible(false)
    fetchUserList()
  }

  // 模态窗取消回调
  const handleModalCancel = () => {
    setModalVisible(false)
  }

  // 删除用户
  const handleDelete = (record: UserListDTO) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户"${record.name || ''}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await rcscApiClient.serverCenterAPI.user.deletePath.delete({
            queryParameters: {
              id: record.iD!,
            },
          })
          if (result?.resultType === 0) {
            messageApi.success('删除成功')
            fetchUserList()
          } else {
            messageApi.error(result?.message || '删除失败')
          }
        } catch (error) {
          console.error('删除用户错误:', error)
          messageApi.error('删除失败')
        }
      },
    })
  }

  // 重置密码
  const handleResetPassword = (record: UserListDTO) => {
    modal.confirm({
      title: '确认重置密码',
      content: `确定要重置用户"${record.name || ''}"的密码吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await rcscApiClient.serverCenterAPI.user.resetPassword.put({
            queryParameters: {
              id: record.iD!,
            },
          })
          if (result?.resultType === 0) {
            messageApi.success('密码已重置为123456')
          } else {
            messageApi.error(result?.message || '重置密码失败')
          }
        } catch (error) {
          console.error('重置密码错误:', error)
          messageApi.error('重置密码失败')
        }
      },
    })
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
      title: '账号',
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
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
      width: 140,
      render: (_: unknown, record: UserListDTO) => (
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
          <Tooltip title="重置密码">
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record)}
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
          <Form.Item name="account" style={{ marginBottom: 8 }}>
            <Input placeholder="请输入账号" style={{ width: 160 }} allowClear />
          </Form.Item>
          <Form.Item name="name" style={{ marginBottom: 8 }}>
            <Input placeholder="请输入姓名" style={{ width: 160 }} allowClear />
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
        <Tooltip title="新增用户">
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

      {/* 添加/编辑模态窗 */}
      <UserFormModal
        id={editingUser?.iD}
        open={modalVisible}
        title={modalTitle}
        editingUser={editingUser}
        onSuccess={handleModalSuccess}
        onCancel={handleModalCancel}
      />
    </div>
  )
}

export default UserListPage
