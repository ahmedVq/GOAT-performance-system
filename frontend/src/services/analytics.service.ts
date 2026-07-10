import api from './api'
import type { ApiResponse, AnalyticsSummary, LeaderboardEntry } from '../types'

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const { data } = await api.get<ApiResponse<AnalyticsSummary>>('/analytics/summary/')
    return data.data
  },
  async getSportBreakdown(): Promise<any[]> {
    const { data } = await api.get<ApiResponse<any[]>>('/analytics/sport-breakdown/')
    return data.data
  },
  async getPillars(sport?: string): Promise<any[]> {
    const { data } = await api.get<ApiResponse<any[]>>('/analytics/pillars/', { params: sport ? { sport } : {} })
    return data.data
  },
  async getTopPerformers(sport?: string): Promise<any> {
    const { data } = await api.get<ApiResponse<any>>('/analytics/top-performers/', { params: sport ? { sport } : {} })
    return data.data
  },
  async getScoreDistribution(sport?: string): Promise<any[]> {
    const { data } = await api.get<ApiResponse<any[]>>('/analytics/score-distribution/', { params: sport ? { sport } : {} })
    return data.data
  },
}

export const leaderboardService = {
  async get(params?: Record<string, any>): Promise<LeaderboardEntry[]> {
    const { data } = await api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard/', { params })
    return data.data
  },
}

export const syncService = {
  async trigger(spreadsheet_id?: string): Promise<any> {
    const { data } = await api.post<ApiResponse<any>>('/sync/trigger/', { spreadsheet_id })
    return data.data
  },
  async getLogs(): Promise<any[]> {
    const { data } = await api.get<ApiResponse<any[]>>('/sync/logs/')
    return data.data
  },
  async getStatus(): Promise<any> {
    const { data } = await api.get<ApiResponse<any>>('/sync/status/')
    return data.data
  },
}
