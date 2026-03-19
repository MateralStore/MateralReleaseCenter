import { useEffect, useMemo, useRef, useState } from 'react'
import { App, Form, Input, Modal, Spin } from 'antd'
import type { Guid } from '@microsoft/kiota-abstractions'
import { createRCESClient } from '../../../api/api-client'
import { ValueEditor } from '../../../components/ValueEditor'
import type {
  AddConfigurationItemRequestModel,
  ConfigurationItemListDTO,
} from '../../../api/RCESAPI/models'

interface ConfigItemFormValues {
  description: string
  key: string
  value: string
}

interface ConfigItemEditModalProps {
  open: boolean
  environmentName?: string | null
  namespaceID?: Guid | null
  editingConfigItem: ConfigurationItemListDTO | null
  onSuccess: () => void
  onCancel: () => void
}

export function ConfigItemEditModal({
  open,
  environmentName,
  namespaceID,
  editingConfigItem,
  onSuccess,
  onCancel,
}: ConfigItemEditModalProps) {
  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm<ConfigItemFormValues>()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [formValues, setFormValues] = useState<ConfigItemFormValues>({
    description: '',
    key: '',
    value: '',
  })
  const [valueType, setValueType] = useState<'text' | 'json'>('text')
  const prevIdRef = useRef<string | undefined>(undefined)

  const client = useMemo(() => {
    if (!environmentName) return null
    return createRCESClient(environmentName)
  }, [environmentName])

  const modalTitle = editingConfigItem ? '编辑配置项' : '新增配置项'
  const id = editingConfigItem?.iD?.toString()

  useEffect(() => {
    if (!open || !id || !client) {
      if (!open) {
        prevIdRef.current = undefined
      }
      return
    }

    if (prevIdRef.current === id) return
    prevIdRef.current = id

    const fetchConfigItemInfo = async () => {
      setInfoLoading(true)
      try {
        if (!editingConfigItem?.iD) {
          return
        }
        const result = await client.environmentServerAPI.configurationItem.getInfo.get({
          queryParameters: {
            id: editingConfigItem.iD,
          },
        })
        if (result?.resultType === 0 && result.data) {
          const data = result.data
          let currentValueType: 'text' | 'json' = 'text'
          if (data.value) {
            try {
              JSON.parse(data.value)
              currentValueType = 'json'
            } catch {
              currentValueType = 'text'
            }
          }
          const newFormValues = {
            description: data.description || '',
            key: data.key || '',
            value: data.value || '',
          }
          setValueType(currentValueType)
          setFormValues(newFormValues)
          setTimeout(() => {
            form.setFieldsValue(newFormValues)
          }, 0)
        } else {
          messageApi.error(result?.message || '获取配置项信息失败')
          onCancel()
        }
      } catch (error) {
        console.error('获取配置项信息错误:', error)
        messageApi.error('获取配置项信息失败')
        onCancel()
      } finally {
        setInfoLoading(false)
      }
    }

    fetchConfigItemInfo()
  }, [open, id, client, editingConfigItem, form, messageApi, onCancel])

  useEffect(() => {
    if (open && !id) {
      form.resetFields()
      setFormValues({ description: '', key: '', value: '' })
      setValueType('text')
    }
  }, [open, id, form])

  const handleSubmit = async () => {
    if (!client) return
    try {
      const values = await form.validateFields()
      if (!formValues.value || formValues.value.trim() === '') {
        messageApi.error('请输入值')
        return
      }

      setSubmitLoading(true)
      const submitValue = formValues.value

      if (id && editingConfigItem) {
        const result = await client.environmentServerAPI.configurationItem.edit.put({
          iD: editingConfigItem.iD!,
          description: values.description,
          key: formValues.key,
          value: submitValue,
        })
        if (result?.resultType === 0) {
          messageApi.success('编辑成功')
          onSuccess()
        } else {
          messageApi.error(result?.message || '编辑失败')
        }
        return
      }

      if (!namespaceID) {
        messageApi.error('未选择命名空间')
        return
      }

      const addData: AddConfigurationItemRequestModel = {
        description: values.description,
        key: values.key,
        value: submitValue,
        namespaceID,
      }
      const result = await client.environmentServerAPI.configurationItem.add.post(addData)
      if (result?.resultType === 0) {
        messageApi.success('添加成功')
        onSuccess()
      } else {
        messageApi.error(result?.message || '添加失败')
      }
    } catch (error) {
      console.error('提交表单错误:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitLoading}
      width={640}
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
              onValueTypeChange={setValueType}
              height="200px"
            />
            <input type="hidden" name="value" value={formValues.value || ''} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
