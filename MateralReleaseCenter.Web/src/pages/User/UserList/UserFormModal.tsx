import { useState, useEffect, useRef } from 'react'
import { Form, Input, Modal, Spin, App } from 'antd'
import type { UserListDTO, AddUserRequestModel } from '../../../api/RCSCAPI/models'
import { rcscApiClient } from '../../../api/api-client'

// 添加/编辑表单类型
interface UserFormValues {
  account?: string
  password?: string
  name: string
}

interface UserFormModalProps {
  id?: string | null
  open: boolean
  title: string
  editingUser: UserListDTO | null
  onSuccess: () => void
  onCancel: () => void
}

export function UserFormModal({
  id,
  open,
  title,
  editingUser,
  onSuccess,
  onCancel,
}: UserFormModalProps) {
  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm<UserFormValues>()
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [formValues, setFormValues] = useState<UserFormValues>({ account: '', name: '' })
  const prevIdRef = useRef<string | undefined>(undefined)

  // 获取用户信息
  useEffect(() => {
    if (!open || !id) {
      if (!open) {
        prevIdRef.current = undefined
      }
      return
    }

    if (prevIdRef.current === id) return
    prevIdRef.current = id

    const fetchUserInfo = async () => {
      setInfoLoading(true)
      try {
        const result = await rcscApiClient.serverCenterAPI.user.getInfo.get({
          queryParameters: { id },
        })
        if (result?.resultType === 0 && result.data) {
          const newFormValues = {
            account: result.data.account || '',
            name: result.data.name || '',
          }
          setFormValues(newFormValues)
          setTimeout(() => {
            form.setFieldsValue(newFormValues)
          }, 0)
        }
      } catch (error) {
        console.error('获取用户信息错误:', error)
      } finally {
        setInfoLoading(false)
      }
    }

    fetchUserInfo()
  }, [open, id, form])

  // 打开时重置表单
  useEffect(() => {
    if (open) {
      if (!id) {
        form.resetFields()
        setFormValues({ account: '', name: '' })
      }
    }
  }, [open, id, form])

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (id) {
        // 编辑用户
        const result = await rcscApiClient.serverCenterAPI.user.edit.put({
          iD: id,
          name: values.name,
        })
        if (result?.resultType === 0) {
          messageApi.success('编辑成功')
          onSuccess()
        } else {
          messageApi.error(result?.message || '编辑失败')
        }
      } else {
        // 新增用户
        const addData: AddUserRequestModel = {
          account: values.account!,
          name: values.name,
        }
        const result = await rcscApiClient.serverCenterAPI.user.add.post(addData)
        if (result?.resultType === 0) {
          messageApi.success('添加成功')
          onSuccess()
        } else {
          messageApi.error(result?.message || '添加失败')
        }
      }
    } catch (error) {
      console.error('提交表单错误:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
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
          form={form}
          layout="vertical"
          preserve={false}
          key={id || 'add'}
          initialValues={formValues}
        >
          {id ? (
            <Form.Item label="账号">
              <Input value={formValues.account || ''} disabled />
            </Form.Item>
          ) : (
            <Form.Item
              name="account"
              label="账号"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input placeholder="请输入账号" />
            </Form.Item>
          )}
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
