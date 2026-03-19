import { useState, useEffect, useRef } from 'react'
import { Form, Input, Select, Modal, Checkbox, Row, Col, Button, Space } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { createRCDSClient } from '../../../api/api-client'
import type { ApplicationTypeEnumKeyValueModel, EnvironmentRequestModel } from '../../../api/RCDSAPI/models'

// 环境变量项
interface EnvironmentItem {
  key: string
  value: string
}

// 添加/编辑表单类型
interface AppFormValues {
  applicationType?: number
  name?: string
  path?: string
  mainModule?: string
  isIncrementalUpdating?: boolean
  runParameters?: string
  repositoryUrl?: string
  authToken?: string
  environments?: EnvironmentItem[]
}

interface AppFormModalProps {
  id?: string
  open: boolean
  title: string
  appTypeEnum: ApplicationTypeEnumKeyValueModel[]
  appTypeLoading: boolean
  apiPath: string
  onSuccess: () => void
  onCancel: () => void
}

export function AppFormModal({
  id,
  open,
  title,
  appTypeEnum,
  appTypeLoading,
  apiPath,
  onSuccess,
  onCancel,
}: AppFormModalProps) {
  const [form] = Form.useForm<AppFormValues>()
  const [loading, setLoading] = useState(false)
  const [editingData, setEditingData] = useState<AppFormValues | null>(null)
  const [environments, setEnvironments] = useState<EnvironmentItem[]>([{ key: '', value: '' }])
  const prevIdRef = useRef<string | undefined>(undefined)

  // 获取应用信息
  useEffect(() => {
    // 只有在打开模态框且 id 有值时才获取
    if (!open || !id || !apiPath) {
      if (!open) {
        setEditingData(null)
        prevIdRef.current = undefined
      }
      return
    }

    // 避免重复请求
    if (prevIdRef.current === id) return
    prevIdRef.current = id

    const fetchAppInfo = async () => {
      setLoading(true)
      try {
        const client = createRCDSClient(apiPath)
        const result = await client.deployServerAPI.applicationInfo.getInfo.get({
          queryParameters: { id },
        })
        if (result?.data) {
          const data: AppFormValues = {
            applicationType: result.data.applicationType ?? undefined,
            name: result.data.name ?? undefined,
            path: result.data.rootPath ?? undefined,
            mainModule: result.data.mainModule ?? undefined,
            isIncrementalUpdating: result.data.isIncrementalUpdating ?? undefined,
            runParameters: result.data.runParams ?? undefined,
            repositoryUrl: result.data.repositoryUrl ?? undefined,
            authToken: result.data.authToken ?? undefined,
          }
          // 处理环境变量
          const envs: EnvironmentItem[] = result.data.environments?.map((e: EnvironmentRequestModel) => ({
            key: e.key ?? '',
            value: e.value ?? '',
          })) ?? [{ key: '', value: '' }]
          setEnvironments(envs)
          setEditingData(data)
          // 直接设置表单值
          form.setFieldsValue(data)
        }
      } catch (error) {
        console.error('获取应用信息错误:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppInfo()
  }, [open, id, apiPath, form])

  // 打开时重置表单
  useEffect(() => {
    if (open) {
      if (!id) {
        form.resetFields()
        setEditingData(null)
        setEnvironments([{ key: '', value: '' }])
      }
    }
  }, [open, id, form])

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const client = createRCDSClient(apiPath)

      // 处理环境变量
      const envList: EnvironmentRequestModel[] = environments
        .filter(e => e.key.trim() !== '')
        .map(e => ({ key: e.key, value: e.value }))

      if (id) {
        // 编辑
        await client.deployServerAPI.applicationInfo.edit.put({
          iD: id,
          applicationType: values.applicationType,
          mainModule: values.mainModule,
          isIncrementalUpdating: values.isIncrementalUpdating,
          runParams: values.runParameters,
          repositoryUrl: values.repositoryUrl,
          authToken: values.authToken,
          environments: envList,
        })
      } else {
        // 新增
        await client.deployServerAPI.applicationInfo.add.post({
          applicationType: values.applicationType!,
          name: values.name!,
          rootPath: values.path!,
          mainModule: values.mainModule!,
          isIncrementalUpdating: values.isIncrementalUpdating || false,
          runParams: values.runParameters,
          repositoryUrl: values.repositoryUrl,
          authToken: values.authToken,
          environments: envList,
        })
      }
      onSuccess()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  // 获取应用类型文本
  const getAppTypeText = (type: number | null | undefined) => {
    const item = appTypeEnum.find(e => e.key === type)
    return item?.value || '-'
  }

  // 添加环境变量
  const addEnvironment = () => {
    setEnvironments([...environments, { key: '', value: '' }])
  }

  // 删除环境变量
  const removeEnvironment = (index: number) => {
    if (environments.length > 1) {
      setEnvironments(environments.filter((_, i) => i !== index))
    }
  }

  // 更新环境变量
  const updateEnvironment = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvs = [...environments]
    newEnvs[index][field] = value
    setEnvironments(newEnvs)
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={900}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false} autoComplete="off">
        <Row gutter={16}>
          {/* 第一列：基础信息 */}
          <Col span={8}>
            <Form.Item
              name="applicationType"
              label="应用程序类型"
              rules={[{ required: true, message: '请选择应用程序类型' }]}
            >
              <Select
                placeholder="请选择应用程序类型"
                loading={appTypeLoading}
                options={appTypeEnum.map(item => ({
                  value: item.key!,
                  label: item.value,
                }))}
              />
            </Form.Item>
            {!id && (
              <>
                <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                  <Input placeholder="请输入名称" />
                </Form.Item>
                <Form.Item name="path" label="路径" rules={[{ required: true, message: '请输入路径' }]}>
                  <Input placeholder="请输入路径" />
                </Form.Item>
              </>
            )}
            {id && editingData && (
              <>
                <Form.Item label="名称">
                  <Input value={editingData.name} disabled />
                </Form.Item>
                <Form.Item label="路径">
                  <Input value={editingData.path} disabled />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="mainModule"
              label="主模块"
              rules={[{ required: true, message: '请输入主模块' }]}
            >
              <Input placeholder="请输入主模块" />
            </Form.Item>
            <Form.Item name="isIncrementalUpdating" valuePropName="checked" label=" ">
              <Checkbox>增量更新</Checkbox>
            </Form.Item>
          </Col>

          {/* 第二列：运行参数 */}
          <Col span={8}>
            <Form.Item name="runParameters" label="运行参数">
              <Input.TextArea placeholder="请输入运行参数" rows={5} />
            </Form.Item>
            <Form.Item label="环境变量">
              <Space orientation="vertical" style={{ width: '100%' }} size="small">
                {environments.map((env, index) => (
                  <Space key={index} style={{ width: '100%' }} size="small">
                    <Input
                      placeholder="键"
                      value={env.key}
                      onChange={e => updateEnvironment(index, 'key', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Input
                      placeholder="值"
                      value={env.value}
                      onChange={e => updateEnvironment(index, 'value', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeEnvironment(index)}
                      disabled={environments.length === 1}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addEnvironment}
                  block
                >
                  添加环境变量
                </Button>
              </Space>
            </Form.Item>
          </Col>

          {/* 第三列：Git信息 */}
          <Col span={8}>
            <Form.Item name="repositoryUrl" label="仓库地址">
              <Input placeholder="请输入仓库地址" autoComplete="off" data-form-unique="repo" />
            </Form.Item>
            <Form.Item name="authToken" label="授权Token">
              <Input.Password placeholder="请输入授权Token" autoComplete="new-custom-token" data-form-unique="token" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
