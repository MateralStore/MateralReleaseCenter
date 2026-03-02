import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, App, Modal } from 'antd'
import { DownloadOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import { createRCDSClient, GATEWAY_BASE_URL } from '../../../api/api-client'
import type { FileInfoDTO } from '../../../api/RCDSAPI/models'

interface AppHistoryModalProps {
  appID: string
  appName: string
  serverID: string
  open: boolean
  onClose: () => void
}

export function AppHistoryModal({ appID, appName, serverID, open, onClose }: AppHistoryModalProps) {
  const { message: messageApi } = App.useApp()

  // 状态
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FileInfoDTO[]>([])
  const [appRunning, setAppRunning] = useState(false)

  // 获取文件列表
  const fetchFileList = useCallback(async () => {
    if (!serverID || !appID) return
    setLoading(true)
    try {
      const client = createRCDSClient(serverID)

      // 获取应用详情来判断状态
      const infoResult = await client.deployServerAPI.applicationInfo.getInfo.get({
        queryParameters: { id: appID },
      })
      if (infoResult?.resultType === 0 && infoResult.data) {
        setAppRunning(infoResult.data.applicationStatus === 1)
      }

      // 获取上传文件列表
      const result = await client.deployServerAPI.applicationInfo.getUploadFiles.get({
        queryParameters: { id: appID },
      })
      if (result?.resultType === 0 && result.data) {
        setData(result.data || [])
      } else {
        messageApi.error(result?.message || '获取文件列表失败')
      }
    } catch (error) {
      console.error('获取文件列表错误:', error)
      messageApi.error('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }, [serverID, appID, messageApi])

  // 初始加载
  useEffect(() => {
    if (serverID && appID && open) {
      fetchFileList()
    }
  }, [serverID, appID, open, fetchFileList])

  // 应用文件
  const handleApply = async (record: FileInfoDTO) => {
    if (!serverID || !appID) return
    try {
      const client = createRCDSClient(serverID)
      const result = await client.deployServerAPI.applicationInfo.applyFile.put({
        queryParameters: {
          id: appID,
          fileName: record.name || undefined,
        },
      })
      if (result?.resultType === 0) {
        messageApi.success('应用文件成功')
        fetchFileList()
      } else {
        messageApi.error(result?.message || '应用文件失败')
      }
    } catch (error) {
      console.error('应用文件错误:', error)
      messageApi.error('应用文件失败')
    }
  }

  // 下载文件
  const handleDownload = (record: FileInfoDTO) => {
    if (!record.downloadUrl) return
    window.open(`${GATEWAY_BASE_URL}/${serverID}${record.downloadUrl}`, '_blank')
  }

  // 删除文件
  const handleDelete = (record: FileInfoDTO) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文件"${record.name}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        if (!serverID || !appID) return
        try {
          const client = createRCDSClient(serverID)
          const result = await client.deployServerAPI.applicationInfo.deleteFile.delete({
            queryParameters: {
              id: appID,
              fileName: record.name || undefined,
            },
          })
          if (result?.resultType === 0) {
            messageApi.success('删除成功')
            fetchFileList()
          } else {
            messageApi.error(result?.message || '删除失败')
          }
        } catch (error) {
          console.error('删除文件错误:', error)
          messageApi.error('删除失败')
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
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '上传时间',
      dataIndex: 'lastWriteTime',
      key: 'lastWriteTime',
      render: (date: Date | string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: FileInfoDTO) => (
        <Space size="small">
          {!appRunning && (
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleApply(record)}
            >
              应用
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Modal
      title={`${appName} - 文件历史`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey={record => record.name || ''}
        loading={loading}
        pagination={false}
        locale={{ emptyText: '暂无文件' }}
      />
    </Modal>
  )
}

export default AppHistoryModal
