import { useState, useEffect, useRef } from 'react'
import { Button, Space, Switch } from 'antd'
import { ClearOutlined, CopyOutlined } from '@ant-design/icons'
import './index.css'

export interface ConsoleViewerProps {
  logs: string[]
  autoScroll?: boolean
  onClear?: () => void
  height?: string
  maxHeight?: string
  extra?: React.ReactNode
}

interface ParsedLine {
  text: string
  style?: React.CSSProperties
}

// ANSI 颜色转义序列映射
const ANSI_COLORS: Record<string, string> = {
  '30': '#000000', // 黑色
  '31': '#ff0000', // 红色
  '32': '#00ff00', // 绿色
  '33': '#ffff00', // 黄色
  '34': '#0000ff', // 蓝色
  '35': '#ff00ff', // 洋红
  '36': '#00ffff', // 青色
  '37': '#ffffff', // 白色
  '90': '#808080', // 亮黑色
  '91': '#ff8080', // 亮红色
  '92': '#80ff80', // 亮绿色
  '93': '#ffff80', // 亮黄色
  '94': '#8080ff', // 亮蓝色
  '95': '#ff80ff', // 亮洋红
  '96': '#80ffff', // 亮青色
  '97': '#ffffff', // 亮白色
}

// 解析 ANSI 转义序列
function parseAnsiLine(line: string): ParsedLine[] {
  const result: ParsedLine[] = []
  let currentStyle: React.CSSProperties = { color: '#00ff00' } // 默认绿色

  // 正则匹配 ANSI 转义序列
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[(\d+(?:;\d+)*)m/g
  let lastIndex = 0
  let match

  while ((match = ansiRegex.exec(line)) !== null) {
    // 添加转义序列之前的文本
    if (match.index > lastIndex) {
      result.push({
        text: line.slice(lastIndex, match.index),
        style: { ...currentStyle },
      })
    }

    const codes = match[1].split(';')
    for (const code of codes) {
      if (code === '0') {
        currentStyle = { color: '#00ff00' } // 重置为默认绿色
      } else if (code.startsWith('3') && ANSI_COLORS[code]) {
        currentStyle = { ...currentStyle, color: ANSI_COLORS[code] }
      } else if (code === '1') {
        currentStyle = { ...currentStyle, fontWeight: 'bold' }
      } else if (code === '3') {
        currentStyle = { ...currentStyle, fontStyle: 'italic' }
      } else if (code === '4') {
        currentStyle = { ...currentStyle, textDecoration: 'underline' }
      }
    }

    lastIndex = match.index + match[0].length
  }

  // 添加剩余文本
  if (lastIndex < line.length) {
    result.push({
      text: line.slice(lastIndex),
      style: { ...currentStyle },
    })
  }

  // 如果没有 ANSI 序列，返回默认样式
  if (result.length === 0) {
    result.push({
      text: line,
      style: { color: '#00ff00' },
    })
  }

  return result
}

export function ConsoleViewer({
  logs,
  autoScroll: initialAutoScroll = true,
  onClear,
  height,
  maxHeight,
  extra,
}: ConsoleViewerProps) {
  const [autoScroll, setAutoScroll] = useState(initialAutoScroll)
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // 复制日志
  const handleCopy = () => {
    const text = logs.join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="console-viewer" style={{ display: 'flex', flexDirection: 'column', height }}>
      <div className="console-viewer-toolbar">
        <Space style={{ marginRight: 'auto' }}>{extra}</Space>
        <Space>
          <span style={{ color: '#999', fontSize: 12 }}>自动滚动</span>
          <Switch size="small" checked={autoScroll} onChange={setAutoScroll} />
          {onClear && (
            <Button size="small" icon={<ClearOutlined />} onClick={onClear}>
              清空
            </Button>
          )}
          <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
            复制
          </Button>
        </Space>
      </div>
      <div
        ref={containerRef}
        className="console-viewer-content"
        style={{ flex: 1, minHeight: 0, maxHeight }}
      >
        {logs.map((log, index) => (
          <div key={index} className="console-viewer-line">
            {parseAnsiLine(log).map((parsed, i) => (
              <span key={i} style={parsed.style}>
                {parsed.text}
              </span>
            ))}
          </div>
        ))}
        {logs.length === 0 && <div className="console-viewer-empty">暂无日志</div>}
      </div>
    </div>
  )
}

export default ConsoleViewer
