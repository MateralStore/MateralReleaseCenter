import { useState, useRef, useEffect } from 'react'
import { Card, Button } from 'antd'
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { ConsoleViewer } from '../../components/ConsoleViewer'

export default function ConsoleViewerTest() {
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // 组件卸载时清除 interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // 添加测试日志
  const addTestLogs = () => {
    const testLogs = [
      '\x1b[32m[INFO]\x1b[0m \x1b[37mApplication started successfully\x1b[0m',
      '\x1b[33m[WARN]\x1b[0m \x1b[37mConfiguration file not found, using defaults\x1b[0m',
      '\x1b[31m[ERROR]\x1b[0m \x1b[37mFailed to connect to database: Connection refused\x1b[0m',
      '\x1b[36m[DEBUG]\x1b[0m \x1b[37mRetrying connection (attempt 1/3)...\x1b[0m',
      '\x1b[32m[INFO]\x1b[0m \x1b[37mConnection established\x1b[0m',
      '\x1b[34m[INFO]\x1b[0m \x1b[1mLoading modules...\x1b[0m',
      '\x1b[32m  ✓\x1b[0m Module A loaded',
      '\x1b[32m  ✓\x1b[0m Module B loaded',
      '\x1b[32m  ✓\x1b[0m Module C loaded',
      '\x1b[37m[INFO]\x1b[0m All modules loaded in 1.23s',
    ]
    setLogs(prev => [...prev, ...testLogs])
  }

  // 清空日志
  const handleClear = () => {
    setLogs([])
  }

  // 模拟实时日志
  const handleStartStop = () => {
    if (isRunning) {
      // 停止模拟
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsRunning(false)
    } else {
      // 开始模拟
      setIsRunning(true)
      const messages = [
        '[INFO] Processing request...',
        '[DEBUG] Query executed in 12ms',
        '[INFO] Response sent: 200 OK',
        '[WARN] Cache miss for key: user_123',
        '[INFO] Scheduled task started',
        '[ERROR] Failed to send notification',
        '[INFO] User logged in: admin',
        '[DEBUG] Memory usage: 128MB',
      ]

      intervalRef.current = window.setInterval(() => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, `[${timestamp}] ${randomMessage}`])
      }, 1000)
    }
  }

  return (
    <div>
      <Card title="ConsoleViewer 组件测试" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <ConsoleViewer
            logs={logs}
            onClear={handleClear}
            height="400px"
            extra={
              <>
                <Button size="small" type="primary" onClick={addTestLogs}>
                  添加测试日志
                </Button>
                <Button
                  size="small"
                  icon={isRunning ? <StopOutlined /> : <PlayCircleOutlined />}
                  onClick={handleStartStop}
                  danger={isRunning}
                >
                  {isRunning ? '停止模拟' : '开始模拟'}
                </Button>
              </>
            }
          />
        </div>
      </Card>
    </div>
  )
}
