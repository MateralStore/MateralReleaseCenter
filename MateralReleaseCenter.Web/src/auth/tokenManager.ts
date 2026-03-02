/**
 * Token管理工具类
 * 负责Token的存储、获取、清除和验证
 */

interface TokenInfo {
  token: string;
  expiredTime: number; // 有效时长（秒）
  loginTime: number; // 登录时间戳
}

const TOKEN_KEY = 'token';
const TOKEN_EXPIRED_TIME_KEY = 'tokenExpiredTime';
const TOKEN_LOGIN_TIME_KEY = 'tokenLoginTime';

export class TokenManager {
  /**
   * 保存Token和有效时长到localStorage
   * @param token Token字符串
   * @param expiredTime 有效时长（秒）
   */
  static setToken(token: string, expiredTime: number): void {
    try {
      const loginTime = Date.now();
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_EXPIRED_TIME_KEY, String(expiredTime));
      localStorage.setItem(TOKEN_LOGIN_TIME_KEY, String(loginTime));
    } catch (error) {
      console.error('保存Token失败:', error);
    }
  }

  /**
   * 获取当前Token
   * @returns Token字符串，如果不存在则返回null
   */
  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('获取Token失败:', error);
      return null;
    }
  }

  /**
   * 获取Token有效时长
   * @returns 有效时长（秒），如果不存在则返回null
   */
  static getTokenExpiredTime(): number | null {
    try {
      const time = localStorage.getItem(TOKEN_EXPIRED_TIME_KEY);
      return time ? parseInt(time, 10) : null;
    } catch (error) {
      console.error('获取Token有效时长失败:', error);
      return null;
    }
  }

  /**
   * 获取Token登录时间
   * @returns 登录时间戳，如果不存在则返回null
   */
  static getTokenLoginTime(): number | null {
    try {
      const time = localStorage.getItem(TOKEN_LOGIN_TIME_KEY);
      return time ? parseInt(time, 10) : null;
    } catch (error) {
      console.error('获取Token登录时间失败:', error);
      return null;
    }
  }

  /**
   * 获取完整的Token信息
   * @returns TokenInfo对象，如果Token不存在则返回null
   */
  static getTokenInfo(): TokenInfo | null {
    const token = this.getToken();
    const expiredTime = this.getTokenExpiredTime();
    const loginTime = this.getTokenLoginTime();

    if (!token || !expiredTime || !loginTime) {
      return null;
    }

    return {
      token,
      expiredTime,
      loginTime,
    };
  }

  /**
   * 检查Token是否存在
   * @returns 如果Token存在返回true，否则返回false
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * 检查Token是否已过期
   * @returns 如果Token已过期或不存在返回true，否则返回false
   */
  static isTokenExpired(): boolean {
    const expiredTime = this.getTokenExpiredTime();
    const loginTime = this.getTokenLoginTime();
    
    if (!expiredTime || !loginTime) {
      return true;
    }

    // 计算过期时间戳 = 登录时间 + 有效时长（毫秒）
    const expiredTimestamp = loginTime + (expiredTime * 1000);
    return Date.now() >= expiredTimestamp;
  }

  /**
   * 检查Token是否有效（存在且未过期）
   * @returns 如果Token有效返回true，否则返回false
   */
  static isTokenValid(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  /**
   * 清除Token、有效时长和登录时间
   */
  static clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRED_TIME_KEY);
      localStorage.removeItem(TOKEN_LOGIN_TIME_KEY);
    } catch (error) {
      console.error('清除Token失败:', error);
    }
  }

  /**
   * 设置Token到请求头
   * @returns 包含Authorization头的对象
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * 刷新Token有效时长
   * @param newExpiredTime 新的有效时长（秒）
   */
  static refreshTokenExpiredTime(newExpiredTime: number): void {
    try {
      const loginTime = Date.now();
      localStorage.setItem(TOKEN_EXPIRED_TIME_KEY, String(newExpiredTime));
      localStorage.setItem(TOKEN_LOGIN_TIME_KEY, String(loginTime));
    } catch (error) {
      console.error('刷新Token有效时长失败:', error);
    }
  }

  /**
   * 获取Token剩余有效时间（秒）
   * @returns 剩余有效时间（秒），如果Token无效返回0
   */
  static getRemainingTime(): number {
    const expiredTime = this.getTokenExpiredTime();
    const loginTime = this.getTokenLoginTime();
    
    if (!expiredTime || !loginTime) {
      return 0;
    }

    const expiredTimestamp = loginTime + (expiredTime * 1000);
    const remaining = Math.max(0, Math.floor((expiredTimestamp - Date.now()) / 1000));
    return remaining;
  }
}

// 导出单例实例，方便使用
export const tokenManager = TokenManager;
