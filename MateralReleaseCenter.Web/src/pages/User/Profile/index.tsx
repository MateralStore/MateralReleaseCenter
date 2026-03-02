import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Descriptions, App, Typography, Spin } from 'antd'
import dayjs from 'dayjs'
import { rcscApiClient } from '../../../api/api-client'
import type { UserDTO } from '../../../api/RCSCAPI/models/index'

const { Title } = Typography

interface ChangePasswordFormValues {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export function ProfilePage() {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const [userInfo, setUserInfo] = useState<UserDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(true)

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const result = await rcscApiClient.serverCenterAPI.user.getLoginUserInfo.get()
        if (result?.resultType === 0 && result.data) {
          setUserInfo(result.data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setFetchingUser(false)
      }
    }

    fetchUserInfo()
  }, [])

  if (fetchingUser) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  // 提交修改密码
  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setLoading(true)
    try {
      const result = await rcscApiClient.serverCenterAPI.user.changePassword.post({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })

      if (result?.resultType === 0) {
        message.success('密码修改成功')
        form.resetFields()
      } else {
        message.error(result?.message ?? '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      message.error('密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={4}>个人中心</Title>

      {/* 用户信息展示区 */}
      <Card title="用户信息" style={{ marginBottom: 24 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="账号">{userInfo?.account ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="姓名">{userInfo?.name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {userInfo?.createTime ? dayjs(userInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 修改密码表单 */}
      <Card title="修改密码">
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: '请输入旧密码' }]}
          >
            <Input.Password placeholder="请输入旧密码" autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ProfilePage
