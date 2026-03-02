/**
 * 自定义认证提供者
 * 用于 Kiota 请求适配器，自动添加 Token 到请求头
 */

import { type AuthenticationProvider, RequestInformation } from '@microsoft/kiota-abstractions';
import { TokenManager } from '../auth/tokenManager';

/**
 * 知图认证提供者
 * 自动从 TokenManager 获取 token 并添加到请求头
 */
export class ZhiTuAuthenticationProvider implements AuthenticationProvider  {
  /**
   * 认证请求
   * @param request 请求信息
   */
  public async authenticateRequest(request: RequestInformation): Promise<void> {
    // 从 TokenManager 获取 token
    const token = TokenManager.getToken();
    
    // 如果 token 不存在或已过期，不添加认证头
    if (!token || TokenManager.isTokenExpired()) {
      return;
    }
    
    // 添加 Authorization 头
    request.headers?.add('Authorization', `Bearer ${token}`);
  }
}
