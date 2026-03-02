import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TokenManager } from '../auth/tokenManager'

export interface UserInfo {
  id?: string
  account?: string
  name?: string
  avatar?: string
}

interface AuthState {
  isAuthenticated: boolean
  userInfo: UserInfo | null
  login: (token: string, expiredTime: number, userInfo: UserInfo) => void
  logout: () => void
  setUserInfo: (userInfo: UserInfo) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: TokenManager.isTokenValid(),
      userInfo: null,

      login: (token: string, expiredTime: number, userInfo: UserInfo) => {
        TokenManager.setToken(token, expiredTime)
        set({
          isAuthenticated: true,
          userInfo,
        })
      },

      logout: () => {
        TokenManager.clearToken()
        set({
          isAuthenticated: false,
          userInfo: null,
        })
      },

      setUserInfo: (userInfo: UserInfo) => {
        set({ userInfo })
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        userInfo: state.userInfo,
      }),
    }
  )
)
