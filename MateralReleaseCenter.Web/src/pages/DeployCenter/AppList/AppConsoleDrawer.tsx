import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, App, Drawer } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import * as signalR from '@microsoft/signalr'
import { ConsoleViewer } from '../../../components/ConsoleViewer'
import { createRCDSClient, GATEWAY_BASE_URL } from '../../../api/api-client'

interface AppConsoleDrawerProps {
  appID: string
  appName: string
  serverID: string
  open: boolean
  onClose: () => void
}

export function AppConsoleDrawer({
  appID,
  appName,
  serverID,
  open,
  onClose,
}: AppConsoleDrawerProps) {
  const { message: messageApi } = App.useApp()

  // 控制台日志
  const [logs, setLogs] = useState<string[]>([])

  const connectionRef = useRef<signalR.HubConnection | null>(null)

  // 获取控制台日志
  const fetchConsoleMessages = useCallback(async () => {
    if (!serverID || !appID) return
    try {
      const client = createRCDSClient(serverID)
      const result = await client.deployServerAPI.applicationInfo.getConsoleMessages.get({
        queryParameters: {
          id: appID,
        },
      })
      if (result?.resultType === 0 && result.data) {
        setLogs(result.data || [])
      }
    } catch (error) {
      console.error('获取控制台日志错误:', error)
    }
  }, [serverID, appID])

  // 初始加载日志
  useEffect(() => {
    if (!open || !serverID || !appID) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConsoleMessages()
  }, [open, serverID, appID, fetchConsoleMessages])

  // SignalR 连接
  useEffect(() => {
    if (!open || !serverID || !appID) return

    // 构建 SignalR Hub URL
    const hubUrl = `${GATEWAY_BASE_URL}/${serverID}/DeployHubs/ConsoleMessage`

    // 创建连接
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    connectionRef.current = connection

    // 监听控制台消息事件
    connection.on('NewConsoleMessageEvent', (receivedAppID: string, message: string) => {
      // 只处理当前打开的应用程序的消息
      if (receivedAppID === appID) {
        setLogs(prevLogs => [...prevLogs, message])
      }
    })

    // 启动连接
    connection
      .start()
      .then(() => {
        console.log('SignalR 连接已建立')
      })
      .catch(err => {
        console.error('SignalR 连接失败:', err)
      })

    // 清理连接
    return () => {
      connection
        .stop()
        .then(() => {
          console.log('SignalR 连接已断开')
        })
        .catch(err => {
          console.error('断开 SignalR 连接失败:', err)
        })
    }
  }, [open, serverID, appID])

  // 刷新日志
  const handleRefresh = useCallback(() => {
    fetchConsoleMessages()
  }, [fetchConsoleMessages])

  // 清空日志
  const handleClear = async () => {
    if (!serverID || !appID) return
    try {
      const client = createRCDSClient(serverID)
      const result = await client.deployServerAPI.applicationInfo.clearConsoleMessages.delete({
        queryParameters: {
          id: appID,
        },
      })
      if (result?.resultType === 0) {
        messageApi.success('清空成功')
        setLogs([])
      } else {
        messageApi.error(result?.message || '清空失败')
      }
    } catch (error) {
      console.error('清空控制台日志错误:', error)
      messageApi.error('清空失败')
    }
  }

  return (
    <Drawer
      title={`${appName} - 控制台`}
      placement="right"
      size="large"
      open={open}
      onClose={onClose}
    >
      <ConsoleViewer
        logs={logs}
        onClear={handleClear}
        height="100%"
        extra={
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
            刷新
          </Button>
        }
      />
    </Drawer>
  )
}

export default AppConsoleDrawer
