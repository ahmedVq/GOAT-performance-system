import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { LoginPage } from '../features/auth/LoginPage'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage'
import { AdminLayout } from '../layouts/AdminLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { AdminDashboardPage } from '../features/dashboard/AdminDashboardPage'
import { StudentDashboardPage } from '../features/student/StudentDashboardPage'
import { StudentProgressPage } from '../features/student/StudentProgressPage'
import { StudentHistoryPage } from '../features/student/StudentHistoryPage'
import { StudentLeaderboardPage } from '../features/student/StudentLeaderboardPage'
import { StudentProfilePage } from '../features/student/StudentProfilePage'
import { StudentsPage } from '../features/students/StudentsPage'
import { StudentDetailPage } from '../features/students/StudentDetailPage'
import { AssessmentsPage } from '../features/assessments/AssessmentsPage'
import { AssessmentEntryPage } from '../features/assessments/AssessmentEntryPage'
import { AnalyticsPage } from '../features/analytics/AnalyticsPage'
import { LeaderboardPage } from '../features/leaderboard/LeaderboardPage'
import { SettingsPage } from '../features/settings/SettingsPage'

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-coal flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-blood-red text-4xl mb-2">{label}</h1>
        <p className="text-steel-gray text-sm uppercase tracking-widest">Coming soon</p>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/students/:id" element={<StudentDetailPage />} />
              <Route path="/admin/assessments" element={<AssessmentsPage />} />
              <Route path="/admin/assessments/entry" element={<AssessmentEntryPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/leaderboard" element={<LeaderboardPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<StudentDashboardPage />} />
              <Route path="/progress" element={<StudentProgressPage />} />
              <Route path="/history" element={<StudentHistoryPage />} />
              <Route path="/leaderboard" element={<StudentLeaderboardPage />} />
              <Route path="/profile" element={<StudentProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
