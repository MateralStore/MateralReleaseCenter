import { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { Layout } from '../components/Layout'
import { AuthRouteGuard } from './AuthRouteGuard'
import LoginPage from '../pages/Login'
import HomePage from '../pages/Home'

// 懒加载页面组件
const UserListPage = lazy(() => import('../pages/User/UserList'))
const ProfilePage = lazy(() => import('../pages/User/Profile'))

const ProjectListPage = lazy(() => import('../pages/ConfigCenter/ProjectList'))
const NamespaceListPage = lazy(() => import('../pages/ConfigCenter/NamespaceList'))
const ConfigItemListPage = lazy(() => import('../pages/ConfigCenter/ConfigItemList'))
const SyncToolPage = lazy(() => import('../pages/ConfigCenter/SyncTool'))

const AppListPage = lazy(() => import('../pages/DeployCenter/AppList'))

const GlobalParameterListPage = lazy(() => import('../pages/DeployCenter/GlobalParameterList'))
const GlobalEnvironmentListPage = lazy(() => import('../pages/DeployCenter/GlobalEnvironmentList'))

// 测试页面
const ConsoleViewerTestPage = lazy(() => import('../pages/Test/ConsoleViewerTest'))
const ValueEditorTestPage = lazy(() => import('../pages/Test/ValueEditorTest'))
const ColorBlockTestPage = lazy(() => import('../pages/Test/ColorBlockTest'))

// 加载中的占位组件
// eslint-disable-next-line react-refresh/only-export-components
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <Spin size="large" />
    </div>
  )
}

// 路由配置
const router = createBrowserRouter([
  // 登录页（无需认证）
  {
    path: '/login',
    element: <LoginPage />,
  },
  // 主应用（需要认证）
  {
    path: '/',
    element: (
      <AuthRouteGuard>
        <Layout />
      </AuthRouteGuard>
    ),
    children: [
      // 首页
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      // 用户管理模块
      {
        path: 'user',
        children: [
          {
            path: 'list',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <UserListPage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
      // 配置中心模块
      {
        path: 'config',
        children: [
          {
            path: 'project',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProjectListPage />
              </Suspense>
            ),
          },
          {
            path: 'namespace',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NamespaceListPage />
              </Suspense>
            ),
          },
          {
            path: 'item',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ConfigItemListPage />
              </Suspense>
            ),
          },
          {
            path: 'sync',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SyncToolPage />
              </Suspense>
            ),
          },
        ],
      },
      // 发布中心模块
      {
        path: 'deploy',
        children: [
          {
            path: 'app',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <AppListPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'global-parameters',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <GlobalParameterListPage />
              </Suspense>
            ),
          },
          {
            path: 'global-environments',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <GlobalEnvironmentListPage />
              </Suspense>
            ),
          },
        ],
      },
      // 测试模块
      {
        path: 'test',
        children: [
          {
            path: 'console',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ConsoleViewerTestPage />
              </Suspense>
            ),
          },
          {
            path: 'editor',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ValueEditorTestPage />
              </Suspense>
            ),
          },
          {
            path: 'color-block',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ColorBlockTestPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // 404 重定向
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
])

export default router
