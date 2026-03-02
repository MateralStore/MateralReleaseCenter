import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Avatar, Dropdown, type MenuProps } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import './index.css'

const { Header, Content, Footer } = AntLayout

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuthStore()

  // 菜单配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/home',
      label: '首页',
    },
    {
      key: 'deploy',
      label: '发布中心',
      children: [
        { key: '/deploy/app', label: '应用管理' },
        { key: '/deploy/data', label: '默认数据' },
      ],
    },
    {
      key: 'config',
      label: '配置中心',
      children: [
        { key: '/config/project', label: '项目管理' },
        { key: '/config/namespace', label: '命名空间管理' },
        { key: '/config/item', label: '配置项管理' },
        { key: '/config/sync', label: '同步工具' },
      ],
    },
    {
      key: '/user/list',
      label: '用户管理',
    },
    ...(import.meta.env.DEV
      ? [
          {
            key: 'test',
            label: '组件测试',
            children: [
              { key: '/test/color-block', label: '色块测试' },
              { key: '/test/console', label: 'ConsoleViewer' },
              { key: '/test/editor', label: 'ValueEditor' },
            ],
          },
        ]
      : []),
  ]

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
    // 精确匹配首页
    if (path === '/home') return ['/home']
    // 检查是否是子菜单项
    for (const item of menuItems) {
      if (item && 'children' in item) {
        const child = item.children?.find(c => c && 'key' in c && c.key === path)
        if (child) return [child.key as string]
      }
    }
    return [path]
  }

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <AntLayout className="layout">
      <Header className="layout-header">
        <div className="layout-header-left">
          <div className="logo">Materal 发布中心</div>
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={getSelectedKeys()}
            onClick={handleMenuClick}
            className="header-menu"
          />
        </div>
        <div className="layout-header-right">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['hover']}>
            <div className="user-info">
              <Avatar size={32} icon={<UserOutlined />} src={userInfo?.avatar} />
              <span className="username">{userInfo?.name || userInfo?.account || '用户'}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Content className="layout-content">
        <div className="page-container">
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </Content>
      <Footer className="layout-footer">Materal Release Center ©2026 - 版权信息</Footer>
    </AntLayout>
  )
}

export default Layout
