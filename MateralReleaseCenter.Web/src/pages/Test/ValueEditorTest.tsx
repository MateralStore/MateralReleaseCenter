import { useState } from 'react'
import { Card, Space, Radio } from 'antd'
import { ValueEditor } from '../../components/ValueEditor'

export default function ValueEditorTest() {
  const [value, setValue] = useState('')
  const [valueType, setValueType] = useState<'text' | 'json'>('text')

  return (
    <div>
      <Card title="ValueEditor 组件测试" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Radio.Group value={valueType} onChange={e => setValueType(e.target.value)}>
            <Radio value="text">文本模式</Radio>
            <Radio value="json">JSON 模式</Radio>
          </Radio.Group>

          <ValueEditor
            value={value}
            valueType={valueType}
            onChange={setValue}
            onValueTypeChange={setValueType}
            placeholder={valueType === 'json' ? '{"key": "value"}' : '请输入内容...'}
            height="300px"
          />

          <Card size="small" title="当前值">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {value || '(空)'}
            </pre>
          </Card>
        </Space>
      </Card>
    </div>
  )
}
