import api from './api'
import type { ApiResponse, User } from '../types'

interface LoginPayload { email: string; password: string }
interface LoginData { access: string; refresh: string; user: User }
interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginData> {
    const { data } = await api.post<ApiResponse<LoginData>>('/auth/login/', payload)
    return data.data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout/', { refresh: refreshToken })
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me/')
    return data.data
  },

  async updateMe(payload: Partial<Pick<User, 'fullName'>>): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>('/auth/me/', {
      full_name: payload.fullName,
    })
    return data.data
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post('/auth/change-password/', payload)
  },

  async refreshToken(refresh: string): Promise<string> {
    const { data } = await api.post<{ access: string }>('/auth/token/refresh/', { refresh })
    return data.access
  },
}
