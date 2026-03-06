import { useState } from 'react'
import { Card, Button, Space, Tag, App, Upload, Dropdown } from 'antd'
import {
  FileOutlined,
  HistoryOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  MoreOutlined,
  CopyOutlined,
  ApiOutlined,
  CreditCardOutlined,
  PoweroffOutlined,
  LinkOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons'
import { createRCDSClient } from '../../../api/api-client'
import type {
  ApplicationInfoListDTO,
  ApplicationTypeEnumKeyValueModel,
} from '../../../api/RCDSAPI/models'
import { MultipartBody } from '@microsoft/kiota-abstractions'
import { AppHistoryModal } from './AppHistoryModal'

interface AppCardProps {
  record: ApplicationInfoListDTO
  appTypeEnum: ApplicationTypeEnumKeyValueModel[]
  apiPath: string
  accessUrl?: string | null
  onRefresh: () => void
  onEdit: (id: string) => void
  onViewConsole?: (appID: string, appName: string) => void
}

export function AppCard({
  record,
  appTypeEnum,
  apiPath,
  accessUrl,
  onRefresh,
  onEdit,
  onViewConsole,
}: AppCardProps) {
  const { message: messageApi, modal } = App.useApp()

  // 上传状态
  const [uploadLoading, setUploadLoading] = useState(false)

  // 历史模态窗状态
  const [historyModalOpen, setHistoryModalOpen] = useState(false)

  // 获取应用类型文本
  const getAppTypeText = (type: number | null | undefined) => {
    const item = appTypeEnum.find(e => e.key === type)
    return item?.value || '-'
  }

  // 获取状态标签颜色
  const getStatusColor = (status: number | null | undefined) => {
    if (status === 1) return 'green'
    return 'default'
  }

  // 查看控制台
  const handleViewConsole = () => {
    onViewConsole?.(record.iD?.toString() || '', record.name || '')
  }

  // 查看历史
  const handleViewHistory = () => {
    setHistoryModalOpen(true)
  }

  // 启动应用
  const handleStart = async () => {
    try {
      const client = createRCDSClient(apiPath)
      const result = await client.deployServerAPI.applicationInfo.start.post({
        queryParameters: { id: record.iD! },
      })
      if (result?.resultType === 0) {
        messageApi.success('启动成功')
        onRefresh()
      } else {
        messageApi.error(result?.message || '启动失败')
      }
    } catch (error) {
      console.error('启动应用错误:', error)
      messageApi.error('启动失败')
    }
  }

  // 停止应用
  const handleStop = async () => {
    try {
      const client = createRCDSClient(apiPath)
      const result = await client.deployServerAPI.applicationInfo.stop.post({
        queryParameters: { id: record.iD! },
      })
      if (result?.resultType === 0) {
        messageApi.success('停止成功')
        onRefresh()
      } else {
        messageApi.error(result?.message || '停止失败')
      }
    } catch (error) {
      console.error('停止应用错误:', error)
      messageApi.error('停止失败')
    }
  }

  // 强制终止
  const handleKill = () => {
    modal.confirm({
      title: '确认强制终止',
      content: '确定要强制终止该应用吗？',
      onOk: async () => {
        try {
          const client = createRCDSClient(apiPath)
          const result = await client.deployServerAPI.applicationInfo.kill.post({
            queryParameters: { id: record.iD! },
          })
          if (result?.resultType === 0) {
            messageApi.success('强制终止成功')
            onRefresh()
          } else {
            messageApi.error(result?.message || '强制终止失败')
          }
        } catch (error) {
          console.error('强制终止应用错误:', error)
          messageApi.error('强制终止失败')
        }
      },
    })
  }

  // 编辑
  const handleEdit = () => {
    onEdit(record.iD?.toString() || '')
  }

  // 删除
  const handleDelete = () => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除应用"${record.name || ''}"吗？`,
      onOk: async () => {
        try {
          const client = createRCDSClient(apiPath)
          const result = await client.deployServerAPI.applicationInfo.deletePath.delete({
            queryParameters: { id: record.iD! },
          })
          if (result?.resultType === 0) {
            messageApi.success('删除成功')
            onRefresh()
          } else {
            messageApi.error(result?.message || '删除失败')
          }
        } catch (error) {
          console.error('删除应用错误:', error)
          messageApi.error('删除失败')
        }
      },
    })
  }

  // 上传文件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadRequest = (options: any) => {
    const { file, onSuccess, onError } = options
    if (!(file instanceof File)) {
      onError(new Error('无效的文件'))
      return
    }
    setUploadLoading(true)

    // 将 File 转换为 ArrayBuffer
    file
      .arrayBuffer()
      .then(buffer => {
        const client = createRCDSClient(apiPath)
        const multipartBody = new MultipartBody()
        multipartBody.addOrReplacePart(
          'file',
          'application/octet-stream',
          buffer,
          undefined,
          file.name
        )

        client.deployServerAPI.applicationInfo.uploadNewFile
          .put(multipartBody, {
            queryParameters: { id: record.iD! },
          })
          .then(result => {
            if (result?.resultType === 0) {
              messageApi.success('上传成功')
              onRefresh()
              onSuccess(result)
            } else {
              const error = new Error(result?.message || '上传失败')
              messageApi.error(result?.message || '上传失败')
              onError(error)
            }
          })
          .catch(error => {
            console.error('上传文件错误:', error)
            messageApi.error('上传失败')
            onError(error as Error)
          })
          .finally(() => {
            setUploadLoading(false)
          })
      })
      .catch(error => {
        console.error('读取文件错误:', error)
        messageApi.error('读取文件失败')
        onError(error as Error)
      })
  }

  // 应用文件
  const handleApply = async () => {
    try {
      const client = createRCDSClient(apiPath)
      const result = await client.deployServerAPI.applicationInfo.applyLasetFile.put({
        queryParameters: { id: record.iD! },
      })
      if (result?.resultType === 0) {
        messageApi.success('应用文件成功')
        onRefresh()
      } else {
        messageApi.error(result?.message || '应用文件失败')
      }
    } catch (error) {
      console.error('应用文件错误:', error)
      messageApi.error('应用文件失败')
    }
  }

  // 应用最新Releases
  const handleApplyReleases = async () => {
    try {
      const client = createRCDSClient(apiPath)
      const result = await client.deployServerAPI.applicationInfo.applyLasetReleases.put({
        queryParameters: { id: record.iD! },
      })
      if (result?.resultType === 0) {
        messageApi.success('应用最新Releases成功')
        onRefresh()
      } else {
        messageApi.error(result?.message || '应用最新Releases失败')
      }
    } catch (error) {
      console.error('应用最新Releases错误:', error)
      messageApi.error('应用最新Releases失败')
    }
  }

  return (
    <>
      <Card
        title={
          <Space>
            <FileOutlined />
            <span>{record.name}</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="link"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={handleViewConsole}
              title="控制台"
            />
            {record.applicationStatus === 1 ? (
              <Button
                type="link"
                size="small"
                danger={true}
                icon={<PoweroffOutlined />}
                onClick={handleStop}
                title="停止"
              />
            ) : null}
            {record.applicationStatus === 3 ? (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<PoweroffOutlined />}
                  onClick={handleStart}
                  title="启动"
                />
                <Upload
                  customRequest={uploadRequest}
                  showUploadList={false}
                  accept=".zip,.tar.gz"
                  disabled={uploadLoading}
                >
                  <Button
                    type="link"
                    size="small"
                    icon={<UploadOutlined />}
                    title="上传"
                    loading={uploadLoading}
                  />
                </Upload>
              </>
            ) : null}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'history',
                    icon: <HistoryOutlined />,
                    label: '文件历史',
                    onClick: handleViewHistory,
                  },
                  ...(record.applicationStatus === 1
                    ? [
                        {
                          key: 'kill',
                          icon: <ApiOutlined />,
                          label: '强制终止',
                          danger: true,
                          onClick: handleKill,
                        },
                      ]
                    : []),
                  ...(record.applicationStatus === 3
                    ? [
                        {
                          key: 'apply',
                          icon: <CopyOutlined />,
                          label: '应用最新',
                          onClick: handleApply,
                        },
                        {
                          key: 'applyReleases',
                          icon: <CloudDownloadOutlined />,
                          label: '应用Releases',
                          onClick: handleApplyReleases,
                        },
                        {
                          key: 'edit',
                          icon: <EditOutlined />,
                          label: '编辑',
                          onClick: handleEdit,
                        },
                      ]
                    : []),
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: '删除',
                    danger: true,
                    onClick: handleDelete,
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ color: '#999', fontSize: 12 }}>类型</div>
            <div>{getAppTypeText(record.applicationType)}</div>
          </div>
          <div>
            <div style={{ color: '#999', fontSize: 12 }}>状态</div>
            <div>
              <Tag color={getStatusColor(record.applicationStatus)}>
                {record.applicationStatusTxt || '未知'}
              </Tag>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: '#999', fontSize: 12 }}>路径</div>
            <div style={{ wordBreak: 'break-all' }}>{record.rootPath || '-'}</div>
          </div>
          <div>
            <div style={{ color: '#999', fontSize: 12 }}>模块</div>
            <div>
              {record.applicationType === 0 && record.mainModule ? (
                <a
                  href={`${accessUrl || ''}/${record.rootPath || ''}/${record.mainModule}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  <LinkOutlined style={{ marginRight: 4 }} />
                  {record.mainModule}
                </a>
              ) : (
                record.mainModule || '-'
              )}
            </div>
          </div>
          <div>
            <div style={{ color: '#999', fontSize: 12 }}>增量更新</div>
            <div>{record.isIncrementalUpdating ? '是' : '否'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: '#999', fontSize: 12 }}>运行参数</div>
            <div style={{ wordBreak: 'break-all' }}>{record.runParams || '-'}</div>
          </div>
        </div>
      </Card>

      <AppHistoryModal
        appID={record.iD?.toString() || ''}
        appName={record.name || ''}
        serverID={apiPath}
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />
    </>
  )
}
