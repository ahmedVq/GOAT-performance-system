import api from './api'
import type { ApiResponse, Student } from '../types'

export interface CreateStudentPayload {
  full_name: string
  email: string
  password: string
  sport: string
  branch: string
  join_date: string
}

export const studentsService = {
  async list(params?: Record<string, string>): Promise<Student[]> {
    const { data } = await api.get<ApiResponse<Student[]>>('/students/', { params })
    return data.data
  },

  async get(id: string): Promise<Student> {
    const { data } = await api.get<ApiResponse<Student>>(`/students/${id}/`)
    return data.data
  },

  async create(payload: CreateStudentPayload): Promise<Student> {
    const { data } = await api.post<ApiResponse<Student>>('/students/', payload)
    return data.data
  },

  async update(id: string, payload: Partial<Student>): Promise<Student> {
    const { data } = await api.patch<ApiResponse<Student>>(`/students/${id}/`, payload)
    return data.data
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/students/${id}/`)
  },

  async getProgress(id: string): Promise<any> {
    const { data } = await api.get<ApiResponse<any>>(`/students/${id}/progress/`)
    return data.data
  },

  async getBranches(): Promise<any[]> {
    const { data } = await api.get<ApiResponse<any[]>>('/students/branches/')
    return data.data
  },
}

export const assessmentsService = {
  async list(params?: Record<string, any>): Promise<any> {
    const { data } = await api.get('/assessments/', { params })
    return data.data
  },

  async get(id: string): Promise<any> {
    const { data } = await api.get(`/assessments/${id}/`)
    return data.data
  },
}
