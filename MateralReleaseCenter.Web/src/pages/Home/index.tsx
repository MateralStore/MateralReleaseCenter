import { useState, useEffect, useCallback } from 'react'
import { Typography, Card, List, Spin, Empty, Button, Space } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { rcscApiClient, createRCDSClient } from '../../api/api-client'
import type { ApplicationInfoListDTO } from '../../api/RCDSAPI/models'
import type { QueryApplicationInfoRequestModel } from '../../api/RCDSAPI/models'

const { Title, Paragraph, Text } = Typography

// 按服务分组的Web应用
interface ServerGroup {
  serverName: string
  accessUrl: string
  apps: ApplicationInfoListDTO[]
}

export function HomePage() {
  const [loading, setLoading] = useState(false)
  const [serverGroups, setServerGroups] = useState<ServerGroup[]>([])

  // 等待 rcscApiClient 初始化
  const waitForRcscClient = useCallback(async () => {
    const maxWait = 10000
    const interval = 100
    let waited = 0
    while (!rcscApiClient && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, interval))
      waited += interval
    }
    return !!rcscApiClient
  }, [])

  // 获取所有Web应用
  const fetchWebApps = useCallback(async () => {
    setLoading(true)
    try {
      // 等待 rcscApiClient 初始化
      const isReady = await waitForRcscClient()
      if (!isReady) {
        console.error('获取Web应用列表错误: rcscApiClient 初始化超时')
        setLoading(false)
        return
      }
      // 1. 获取所有发布服务
      const serverResult = await rcscApiClient.serverCenterAPI.server.getDeployList.get({})
      if (serverResult?.resultType !== 0 || !serverResult.data) {
        setLoading(false)
        return
      }

      const servers = serverResult.data
      const groups: ServerGroup[] = []

      // 2. 对每个服务获取应用列表
      const queryParams: QueryApplicationInfoRequestModel = {
        pageIndex: 1,
        pageSize: 100,
        isAsc: true,
        applicationType: 0, // 筛选Web应用
        applicationStatus: 1, // 筛选运行中的应用
      }

      for (const server of servers) {
        if (!server.name) continue

        try {
          const client = createRCDSClient(server.name)
          const appResult = await client.deployServerAPI.applicationInfo.getList.post(queryParams)

          if (appResult?.resultType === 0 && appResult.data) {
            const webApps = appResult.data.filter(app => app.mainModule)
            if (webApps.length > 0) {
              groups.push({
                serverName: server.name || '',
                accessUrl: server.accessUrl || '',
                apps: webApps,
              })
            }
          }
        } catch (error) {
          console.error(`获取服务 ${server.name} 应用列表错误:`, error)
        }
      }

      setServerGroups(groups)
    } catch (error) {
      console.error('获取Web应用列表错误:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebApps()
  }, [fetchWebApps])

  // 生成应用访问链接
  const getAppUrl = (serverGroup: ServerGroup, app: ApplicationInfoListDTO) => {
    return `${serverGroup.accessUrl}/${app.rootPath || ''}/${app.mainModule}`
  }

  return (
    <Typography>
      <Title level={2}>欢迎使用 Materal 发布中心</Title>
      <Paragraph>这是一个配置管理和应用发布平台，您可以通过左侧菜单导航到各个功能模块。</Paragraph>

      <Card
        title={
          <Space>
            <AppstoreOutlined />
            <span>Web应用快速访问</span>
          </Space>
        }
        style={{ marginTop: 24 }}
        extra={
          <Button type="link" onClick={fetchWebApps}>
            刷新
          </Button>
        }
      >
        <Spin spinning={loading}>
          {serverGroups.length === 0 ? (
            <Empty description="暂无可访问的Web应用" />
          ) : (
            serverGroups.map(group => (
              <Card
                key={group.serverName}
                size="small"
                type="inner"
                title={
                  <Space>
                    <Text strong>{group.serverName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({group.apps.length}个应用)
                    </Text>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <List
                  size="small"
                  dataSource={group.apps}
                  renderItem={app => (
                    <List.Item
                      style={{ padding: '8px 12px' }}
                    >
                      <List.Item.Meta
                        title={
                          <a
                            href={getAppUrl(group, app)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {app.name}
                          </a>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {app.rootPath}/{app.mainModule}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ))
          )}
        </Spin>
      </Card>
    </Typography>
  )
}

export default HomePage
