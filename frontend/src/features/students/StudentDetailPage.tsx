import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { studentsService } from '../../services/students.service'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import { useToast } from '../../components/ui/Toast'
import { ArrowLeft, UserX, ClipboardList, Award, TrendingUp } from 'lucide-react'

const C = {
  tooltip: { background: '#0D0D0D', border: '1px solid rgba(225,25,25,0.2)', borderRadius: 0, fontSize: 12 },
  label:   { color: '#9BA3A7', fontSize: 11 },
  item:    { color: '#E11919' },
  tick:    { fill: '#9BA3A7', fontSize: 10 },
  grid:    'rgba(255,255,255,0.04)',
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
      <div className="absolute top-0 left-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,#E11919,transparent 60%)' }} />
      <div className="p-6">{children}</div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-[3px] h-4 bg-blood-red" />
      <h3 className="font-display text-off-white text-xs uppercase tracking-[0.22em]">{title}</h3>
    </div>
  )
}

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const { toast } = useToast()

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn:  () => studentsService.get(id!),
  })
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['student-progress', id],
    queryFn:  () => studentsService.getProgress(id!),
    enabled:  !!id,
  })

  const deactivateMutation = useMutation({
    mutationFn: () => studentsService.deactivate(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] })
      qc.invalidateQueries({ queryKey: ['students'] })
      toast('Student deactivated')
    },
    onError: () => toast('Failed to deactivate', 'error'),
  })

  if (loadingStudent) return <LoadingSkeleton rows={8} />

  const s       = student as any
  const prog    = progress as any
  const sessions = prog?.sessions ?? []

  const trendData = [...sessions].reverse().map((sess: any) => ({
    date:  new Date(sess.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: sess.grade_percentage,
  }))

  const latestPillar = sessions[0]?.pillar_scores ?? []
  const radarData = latestPillar.map((p: any) => ({
    pillar: p.pillar_name?.replace('Physical ', '').replace(' Skills', '') ?? 'Unknown',
    score:  p.score ?? 0,
  }))

  const initial = (s?.user?.full_name ?? s?.full_name ?? '?')[0].toUpperCase()

  return (
    <div className="space-y-8">

      {/* Back */}
      <button onClick={() => navigate('/admin/students')}
        className="flex items-center gap-2 transition-colors duration-200"
        style={{ color: 'rgba(155,163,167,0.5)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F5F5' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(155,163,167,0.5)' }}>
        <ArrowLeft size={12} /> All Students
      </button>

      {/* Hero card */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(105deg,#0f0606 0%,#0a0303 60%,rgba(225,25,25,0.04) 100%)', border: '1px solid rgba(225,25,25,0.15)', clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))' }}>
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'linear-gradient(to bottom,#E11919,rgba(225,25,25,0.2))' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.3) 50%,transparent)' }} />

        <div className="p-6 flex flex-wrap items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 flex items-center justify-center font-display text-3xl shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(225,25,25,0.15),rgba(225,25,25,0.08))', border: '1px solid rgba(225,25,25,0.3)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))', color: '#E11919' }}>
            {initial}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="font-display text-off-white text-2xl">{s?.user?.full_name ?? s?.full_name}</h2>
              <span className="font-display text-blood-red text-sm">{s?.student_id}</span>
            </div>
            <p style={{ color: 'rgba(155,163,167,0.45)', fontSize: '0.72rem', marginBottom: 10 }}>{s?.user?.email}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={s?.sport}>{s?.sport}</Badge>
              <Badge variant={s?.level}>{s?.level}</Badge>
              <Badge variant={s?.is_active ? 'success' : 'error'}>{s?.is_active ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>

          {/* Score highlights */}
          <div className="flex gap-8 shrink-0">
            <div className="text-right">
              <p style={{ color: 'rgba(155,163,167,0.45)', fontSize: '0.52rem', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 4 }}>Latest Score</p>
              <p className="font-display text-blood-red" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                {prog?.current_score != null ? `${prog.current_score}%` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p style={{ color: 'rgba(155,163,167,0.45)', fontSize: '0.52rem', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 4 }}>Improvement</p>
              <p className="font-display" style={{ fontSize: '2rem', lineHeight: 1, color: (prog?.improvement ?? 0) >= 0 ? '#34d399' : '#E11919' }}>
                {prog?.improvement != null ? `${prog.improvement > 0 ? '+' : ''}${prog.improvement}%` : '—'}
              </p>
            </div>
          </div>

          {/* Deactivate */}
          {s?.is_active && (
            <button onClick={() => { if (confirm('Deactivate this student?')) deactivateMutation.mutate() }}
              className="self-start flex items-center gap-1.5 transition-colors duration-200"
              style={{ color: 'rgba(155,163,167,0.35)', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E11919' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(155,163,167,0.35)' }}>
              <UserX size={12} /> Deactivate
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Sessions" value={prog?.total_sessions ?? 0}                                   icon={ClipboardList} />
        <StatCard label="Best Score"     value={prog?.best_score != null ? `${prog.best_score}%` : '—'}      icon={Award}         accent />
        <StatCard label="Improvement"    value={prog?.improvement != null ? `${prog.improvement > 0 ? '+' : ''}${prog.improvement}%` : '—'} icon={TrendingUp} />
      </div>

      {/* Charts */}
      {sessions.length > 1 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <SectionTitle title="Score History" />
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
                <XAxis dataKey="date" tick={C.tick} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={C.tick} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={C.tooltip} itemStyle={C.item} labelStyle={C.label}
                  cursor={{ stroke: 'rgba(225,25,25,0.2)', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="score" stroke="#E11919" strokeWidth={2}
                  dot={{ fill: '#E11919', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#E11919', stroke: 'rgba(225,25,25,0.3)', strokeWidth: 4 }}
                  name="Score %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {radarData.length > 0 && (
            <Card>
              <SectionTitle title="Latest Pillar Scores" />
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#9BA3A7', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9BA3A7', fontSize: 8 }} />
                  <Radar name="Score" dataKey="score" stroke="#E11919" fill="#E11919" fillOpacity={0.18} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Assessment history */}
      {loadingProgress ? (
        <LoadingSkeleton rows={4} />
      ) : sessions.length === 0 ? (
        <div className="relative overflow-hidden text-center py-14"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
          <p className="text-steel-gray/40 text-sm">No assessments yet</p>
        </div>
      ) : (
        <Card>
          <SectionTitle title="Assessment History" />
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Date', 'Score', 'Level', 'Coach Notes'].map(h => (
                  <th key={h} className="text-left"
                    style={{ padding: '6px 16px 6px 0', color: 'rgba(155,163,167,0.4)', fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess: any) => (
                <tr key={sess.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px 12px 0', color: 'rgba(155,163,167,0.5)', fontSize: '0.72rem' }}>
                    {new Date(sess.assessment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px 12px 0' }}>
                    <span className="font-display text-blood-red text-base">{sess.grade_percentage}%</span>
                  </td>
                  <td style={{ padding: '12px 16px 12px 0' }}>
                    <Badge variant={sess.level_at_assessment as any}>{sess.level_at_assessment}</Badge>
                  </td>
                  <td style={{ padding: '12px 0', color: 'rgba(155,163,167,0.5)', fontSize: '0.72rem', maxWidth: 220 }}>
                    <span className="truncate block">{sess.coach_notes || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
