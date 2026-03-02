# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本项目中工作时提供指导。

## 项目概述

Materal Release Center (MRC) 前端 - 一个基于 React 的管理中心仪表盘，用于发布中心服务，由 Vite、TypeScript 和 Ant Design 构建。

## 常用命令

```bash
# 开发
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器

# 构建与预览
pnpm build            # 生产环境构建
pnpm preview          # 预览生产构建

# 代码质量
pnpm lint             # 运行 ESLint
pnpm format           # 使用 Prettier 格式化代码
pnpm format:check    # 检查代码格式
```

## 架构

### 技术栈
- **React 19** + TypeScript
- **Vite** 构建工具
- **Ant Design 6** UI 组件库
- **React Router 7** 路由管理
- **TanStack Query** 服务端状态管理
- **Zustand** 客户端状态管理
- **Microsoft Kiota** API 客户端生成

### 项目结构

```
src/
├── api/                  # Kiota 生成的 API 客户端
│   ├── RCSCAPI/         # 用户/服务器中心服务
│   ├── RCESAPI/         # 配置中心服务
│   └── RCDSAPI/         # 发布中心服务
├── auth/                # 认证模块 (TokenManager)
├── components/          # 共享组件 (Layout)
├── pages/              # 页面组件 (懒加载)
│   ├── Login/          # 登录页
│   ├── User/           # 用户管理
│   ├── ConfigCenter/   # 配置管理
│   └── DeployCenter/   # 应用部署
├── router/              # React Router 配置
├── store/               # Zustand 状态管理 (auth)
├── styles/              # 主题和全局样式
└── types/               # TypeScript 类型定义
```

### API 服务

通过网关访问三个后端服务：
- **RCSCAPI** (`/MRCSCAPI`) - 用户中心、服务器中心（固定路径）
- **RCESAPI** - 配置中心（每环境动态路径）
- **RCDSAPI** - 发布中心（每应用动态路径）

API 客户端通过 `src/api/api-client.ts` 中的工厂函数创建：
- `rcscApiClient` - 用户/服务器中心的单例
- `createRCESClient(apiPath)` - 配置中心的工厂函数
- `createRCDSClient(apiPath)` - 发布中心的工厂函数

### 认证

- 基于 Token 的认证，JWT 通过 `TokenManager` 存储在 localStorage
- 认证状态由 Zustand store 管理 (`useAuthStore`)
- 路由保护通过 `AuthRouteGuard` 组件实现

### 路由

路由在 `src/router/index.tsx` 中使用 React Router 对象配置定义：
- `/login` - 公开登录页
- `/home` - 仪表盘首页
- `/user/*` - 用户管理
- `/config/*` - 配置中心（项目、命名空间、配置项、同步）
- `/deploy/*` - 发布中心（应用、控制台、历史、默认数据）

## 关键约定

1. **页面组件**：通过 `React.lazy()` + Suspense 懒加载
2. **API 调用**：使用 Kiota 生成的客户端，结合 TanStack Query 使用
3. **样式**：CSS 模块或通过 `ConfigProvider` 自定义 Ant Design
4. **表单**：Ant Design Form 组件
5. **Git Hooks**：Husky + lint-staged 用于提交前 lint/格式化

## 任务实现流程

在实现任何功能任务前，必须先阅读以下文档：

1. **需求分析文档**: `docs/需求分析.md` - 了解功能需求和页面结构
2. **技术选型文档**: `docs/技术选型文档.md` - 确认技术方案和实现方式
3. **页面设计文档**: `docs/PageDesigns/` 目录下对应模块的设计文档
   - 用户模块: `docs/PageDesigns/User/`
   - 配置中心: `docs/PageDesigns/ConfigCenter/`
   - 发布中心: `docs/PageDesigns/DeployCenter/`
   - 组件设计: `docs/PageDesigns/Components/`

设计文档中包含了详细的页面结构、交互流程和组件规范，实现时应严格按照设计文档进行开发。

## 交互原则

- 尽可能使用中文与用户交流