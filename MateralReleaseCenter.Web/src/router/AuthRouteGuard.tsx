import { Navigate, useLocation } from 'react-router-dom'
import { TokenManager } from '../auth/tokenManager'

interface AuthRouteGuardProps {
  children: React.ReactNode
}

export function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const location = useLocation()

  // 检查 token 是否有效
  let tokenValid = false
  try {
    tokenValid = TokenManager.isTokenValid()
  } catch (e) {
    console.error('Token validation error:', e)
  }

  // 如果没有 token，重定向到登录页
  if (!tokenValid) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
