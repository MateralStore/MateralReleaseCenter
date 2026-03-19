import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Typography, Card, Alert, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { rcscApiClient } from '../../api/api-client'
import { TokenManager } from '../../auth/tokenManager'
import { useAuthStore } from '../../store/authStore'

const { Title } = Typography

interface LoginFormValues {
  account: string
  password: string
}

export function LoginPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(state => state.login)

  // 获取登录成功后的重定向路径，默认为 /home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home'

  const handleSubmit = async (values: LoginFormValues) => {
    setError('')
    setLoading(true)

    try {
      const result = await rcscApiClient.serverCenterAPI.user.login.post({
        account: values.account,
        password: values.password,
      })

      if (result?.resultType === 0 && result.data?.token) {
        // 保存Token
        TokenManager.setToken(result.data.token, result.data.expiredTime ?? 0)
        // 获取用户信息
        try {
          const userResult = await rcscApiClient.serverCenterAPI.user.getLoginUserInfo.get()
          if (userResult?.resultType === 0 && userResult.data) {
            login(result.data.token, result.data.expiredTime ?? 0, {
              id: userResult.data.iD?.toString(),
              account: userResult.data.account ?? undefined,
              name: userResult.data.name ?? undefined,
            })
          }
        } catch (err) {
          console.error('获取用户信息失败:', err)
        }
        message.success('登录成功')
        // 跳转到之前访问的页面或首页
        navigate(from, { replace: true })
      } else {
        // 登录失败，显示错误信息
        setError(result?.message ?? '登录失败，请检查账号和密码')
      }
    } catch (err) {
      setError('登录失败，请检查账号和密码')
      console.error('登录错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          MateralReleaseCenter
        </Title>

        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 24 }} />}

        <Form form={form} name="login" onFinish={handleSubmit} autoComplete="off" layout="vertical">
          <Form.Item name="account" rules={[{ required: true, message: '请输入账号' }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
