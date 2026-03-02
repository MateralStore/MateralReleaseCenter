import { useState, useEffect } from 'react'
import { Segmented, Typography } from 'antd'
import Editor from '@monaco-editor/react'
import './index.css'

const { Text } = Typography

export interface ValueEditorProps {
  value: string
  valueType: 'text' | 'json'
  onChange: (value: string) => void
  onValueTypeChange?: (type: 'text' | 'json') => void
  placeholder?: string
  readOnly?: boolean
  height?: string
}

export function ValueEditor({
  value,
  valueType,
  onChange,
  onValueTypeChange,
  readOnly = false,
  height = '200px',
}: ValueEditorProps) {
  const [localValue, setLocalValue] = useState(value)
  const [error, setError] = useState<string | null>(null)

  // 当外部 value 变化时同步
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // 切换类型时验证
  const handleTypeChange = (newType: 'text' | 'json') => {
    if (newType === 'json' && localValue) {
      try {
        JSON.parse(localValue)
        setError(null)
      } catch {
        setError('JSON 格式错误')
      }
    } else {
      setError(null)
    }
    onValueTypeChange?.(newType)
  }

  // 编辑器变化
  const handleEditorChange = (newValue: string | undefined) => {
    const val = newValue || ''
    setLocalValue(val)
    onChange(val)

    // JSON 格式校验
    if (valueType === 'json' && val) {
      try {
        JSON.parse(val)
        setError(null)
      } catch {
        setError('JSON 格式错误')
      }
    } else {
      setError(null)
    }
  }

  // 获取语言
  const language = valueType === 'json' ? 'json' : 'plaintext'

  return (
    <div className="value-editor">
      <div className="value-editor-header">
        <Segmented
          options={[
            { label: '文本', value: 'text' },
            { label: 'JSON', value: 'json' },
          ]}
          value={valueType}
          onChange={val => handleTypeChange(val as 'text' | 'json')}
          disabled={readOnly}
        />
        {error && valueType === 'json' && (
          <Text type="danger" className="value-editor-error">
            {error}
          </Text>
        )}
      </div>
      <div className="value-editor-content" style={{ height }}>
        <Editor
          language={language}
          value={localValue}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            readOnly,
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            folding: valueType === 'json',
            formatOnPaste: valueType === 'json',
          }}
          theme="vs-dark"
        />
      </div>
    </div>
  )
}

export default ValueEditor
