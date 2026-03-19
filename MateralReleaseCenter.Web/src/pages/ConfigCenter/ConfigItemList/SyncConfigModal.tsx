import { useState } from 'react'
import { Form, Modal, Select, App } from 'antd'
import type { EnvironmentServerListDTO } from '../../../api/RCSCAPI/models'
import type { ConfigurationItemListDTO } from '../../../api/RCESAPI/models'
import { createRCESClient } from '../../../api/api-client'

// 同步表单类型
interface SyncFormValues {
  targetEnvironments: string[]
}

interface SyncConfigModalProps {
  open: boolean
  targetItem: ConfigurationItemListDTO | null
  environments: EnvironmentServerListDTO[]
  currentEnvironment: string
  onSuccess: () => void
  onCancel: () => void
}

export function SyncConfigModal({
  open,
  targetItem,
  environments,
  currentEnvironment,
  onSuccess,
  onCancel,
}: SyncConfigModalProps) {
  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm<SyncFormValues>()
  const [loading, setLoading] = useState(false)

  // 提交同步
  const handleSubmit = async () => {
    if (!targetItem) return

    try {
      const values = await form.validateFields()
      setLoading(true)

      // 创建当前环境的客户端获取配置详情
      const currentClient = createRCESClient(currentEnvironment)
      const infoResult = await currentClient.environmentServerAPI.configurationItem.getInfo.get({
        queryParameters: {
          id: targetItem.iD!,
        },
      })

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
      onSuccess()
    } catch (error) {
      console.error('同步配置项错误:', error)
      messageApi.error('同步失败')
    } finally {
      setLoading(false)
    }
  }

  // 关闭时重置表单
  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="同步配置"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={480}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
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
  )
}
