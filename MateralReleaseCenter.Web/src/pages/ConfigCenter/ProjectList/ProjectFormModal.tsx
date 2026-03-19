import { useState, useEffect, useRef } from 'react'
import { Form, Input, Modal, Spin, App } from 'antd'
import type { ProjectListDTO, AddProjectRequestModel } from '../../../api/RCSCAPI/models'
import { rcscApiClient } from '../../../api/api-client'

// 添加/编辑表单类型
interface ProjectFormValues {
  name: string
  description?: string
}

interface ProjectFormModalProps {
  id?: string | null
  open: boolean
  title: string
  editingProject: ProjectListDTO | null
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectFormModal({
  id,
  open,
  title,
  editingProject,
  onSuccess,
  onCancel,
}: ProjectFormModalProps) {
  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm<ProjectFormValues>()
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [formValues, setFormValues] = useState<{ name?: string; description?: string }>({})
  const prevIdRef = useRef<string | undefined>(undefined)

  // 获取项目信息
  useEffect(() => {
    if (!open || !id) {
      if (!open) {
        prevIdRef.current = undefined
      }
      return
    }

    if (prevIdRef.current === id) return
    prevIdRef.current = id

    const fetchProjectInfo = async () => {
      setInfoLoading(true)
      try {
        const result = await rcscApiClient.serverCenterAPI.project.getInfo.get({
          queryParameters: { id },
        })
        if (result?.resultType === 0 && result.data) {
          const newFormValues = {
            name: result.data.name || '',
            description: result.data.description || '',
          }
          setFormValues(newFormValues)
          setTimeout(() => {
            form.setFieldsValue(newFormValues)
          }, 0)
        } else {
          messageApi.error(result?.message || '获取项目信息失败')
        }
      } catch (error) {
        console.error('获取项目信息错误:', error)
      } finally {
        setInfoLoading(false)
      }
    }

    fetchProjectInfo()
  }, [open, id, form, messageApi])

  // 打开时重置表单
  useEffect(() => {
    if (open) {
      if (!id) {
        form.resetFields()
        setFormValues({})
      }
    }
  }, [open, id, form])

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (id) {
        // 编辑项目
        const result = await rcscApiClient.serverCenterAPI.project.edit.put({
          iD: id,
          description: values.description,
        })
        if (result?.resultType === 0) {
          messageApi.success('编辑成功')
          onSuccess()
        } else {
          messageApi.error(result?.message || '编辑失败')
        }
      } else {
        // 新增项目
        const addData: AddProjectRequestModel = {
          name: values.name,
          description: values.description,
        }
        const result = await rcscApiClient.serverCenterAPI.project.add.post(addData)
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
  )
}
