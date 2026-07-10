import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { assessmentsService } from '../../services/students.service'
import { Badge } from '../../components/ui/Badge'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import { ClipboardList } from 'lucide-react'
import type { Sport } from '../../types'

const filterStyle = {
  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)',
  color: 'rgba(155,163,167,0.5)', padding: '7px 14px',
  fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  outline: 'none', cursor: 'pointer',
}

export function AssessmentsPage() {
  const [sport, setSport] = useState<Sport | ''>('')
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['assessments', sport],
    queryFn:  () => assessmentsService.list({ martial_art: (sport as Sport) || undefined }),
  })

  const list = (data?.results ?? data ?? []) as any[]
  const now  = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p style={{ color: 'rgba(225,25,25,0.6)', fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
            Academy Management
          </p>
          <h1 className="font-display text-off-white" style={{ fontSize: '2.4rem', letterSpacing: '0.1em', lineHeight: 1 }}>
            Assessments
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-[2px] w-10 bg-blood-red" />
            <span style={{ color: 'rgba(155,163,167,0.38)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
              {list.length} records · {dateStr}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pb-1">
          {(['', 'boxing', 'kickboxing'] as const).map(v => (
            <button key={v} onClick={() => setSport(v as Sport | '')}
              style={{
                ...filterStyle,
                color: sport === v ? '#F5F5F5' : 'rgba(155,163,167,0.5)',
                borderColor: sport === v ? 'rgba(225,25,25,0.4)' : 'rgba(255,255,255,0.07)',
                background: sport === v ? 'rgba(225,25,25,0.08)' : '#0a0a0a',
              }}>
              {v || 'All Sports'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : list.length === 0 ? (
        <div className="relative overflow-hidden text-center py-20"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
          <ClipboardList size={28} style={{ color: 'rgba(155,163,167,0.2)', margin: '0 auto 12px' }} />
          <p className="font-display text-off-white text-base mb-1">No assessments</p>
          <p className="text-steel-gray/40 text-sm">Sync Google Sheets to import assessments</p>
        </div>
      ) : (
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
          <div className="absolute top-0 left-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,#E11919,transparent 60%)' }} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Date', 'Student', 'Sport', 'Score', 'Level'].map(h => (
                    <th key={h} className="text-left"
                      style={{ padding: '14px 20px', color: 'rgba(155,163,167,0.4)', fontSize: '0.52rem', letterSpacing: '0.26em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((a: any) => (
                  <tr key={a.id}
                    onClick={() => navigate(`/admin/students/${a.student}`)}
                    className="cursor-pointer transition-all duration-150"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(225,25,25,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <td style={{ padding: '14px 20px', color: 'rgba(155,163,167,0.5)', fontSize: '0.72rem' }}>
                      {new Date(a.assessment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="text-off-white text-sm">{a.student_name ?? a.student}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={a.martial_art as any}>{a.martial_art}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="font-display text-blood-red text-base">{a.grade_percentage}%</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={a.level_at_assessment as any}>{a.level_at_assessment}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
