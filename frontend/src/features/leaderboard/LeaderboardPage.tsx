import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { leaderboardService } from '../../services/analytics.service'
import { Badge } from '../../components/ui/Badge'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import { Trophy } from 'lucide-react'
import type { Sport, Level } from '../../types'

const MEDAL = [
  { icon: '#fbbf24', border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.06)', text: '#fbbf24' },
  { icon: '#9BA3A7', border: 'rgba(155,163,167,0.25)', bg: 'rgba(155,163,167,0.05)', text: '#9BA3A7' },
  { icon: '#cd7c2f', border: 'rgba(205,124,47,0.3)',  bg: 'rgba(205,124,47,0.05)',  text: '#cd7c2f' },
]

const filterStyle = {
  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)',
  color: 'rgba(155,163,167,0.5)', padding: '7px 14px',
  fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  outline: 'none', cursor: 'pointer',
}

export function LeaderboardPage() {
  const [sport, setSport] = useState<Sport | ''>('')
  const [level, setLevel] = useState<Level | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', sport, level],
    queryFn:  () => leaderboardService.get({ sport: (sport as Sport) || undefined, level: (level as Level) || undefined }),
  })

  const entries = (data as any[]) ?? []

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p style={{ color: 'rgba(225,25,25,0.6)', fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
            Management
          </p>
          <h1 className="font-display text-off-white" style={{ fontSize: '2.4rem', letterSpacing: '0.1em', lineHeight: 1 }}>
            Leader<span className="text-blood-red">board</span>
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-[2px] w-10 bg-blood-red" />
            <span style={{ color: 'rgba(155,163,167,0.38)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
              Ranked by biggest improvement · {entries.length} athletes
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap pb-1">
          {(['', 'boxing', 'kickboxing'] as const).map(v => (
            <button key={v} onClick={() => setSport(v as Sport | '')}
              style={{ ...filterStyle, color: sport===v ? '#F5F5F5' : 'rgba(155,163,167,0.5)', borderColor: sport===v ? 'rgba(225,25,25,0.4)' : 'rgba(255,255,255,0.07)', background: sport===v ? 'rgba(225,25,25,0.08)' : '#0a0a0a' }}>
              {v || 'All Sports'}
            </button>
          ))}
          {(['', 'beginner', 'intermediate', 'advanced'] as const).map(v => (
            <button key={v} onClick={() => setLevel(v as Level | '')}
              style={{ ...filterStyle, color: level===v ? '#F5F5F5' : 'rgba(155,163,167,0.5)', borderColor: level===v ? 'rgba(225,25,25,0.4)' : 'rgba(255,255,255,0.07)', background: level===v ? 'rgba(225,25,25,0.08)' : '#0a0a0a' }}>
              {v || 'All Levels'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : entries.length === 0 ? (
        <div className="relative overflow-hidden text-center py-20"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
          <Trophy size={28} style={{ color: 'rgba(155,163,167,0.2)', margin: '0 auto 12px' }} />
          <p className="font-display text-off-white text-base mb-1">No rankings yet</p>
          <p className="text-steel-gray/40 text-sm">Assessments must be synced before the leaderboard populates</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry: any, i: number) => {
            const rank   = i + 1
            const medal  = rank <= 3 ? MEDAL[rank - 1] : null

            return (
              <div key={entry.student_id}
                className="relative overflow-hidden flex items-center gap-4 px-5 py-4 transition-all duration-150"
                style={{
                  background: medal ? 'linear-gradient(145deg,#0d0d0d,#080808)' : 'linear-gradient(145deg,#0c0c0c,#080808)',
                  border: medal ? `1px solid ${medal.border}` : '1px solid rgba(255,255,255,0.04)',
                  clipPath: rank === 1 ? 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))' : undefined,
                }}
                onMouseEnter={e => { if (!medal) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)' }}
                onMouseLeave={e => { if (!medal) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)' }}>

                {medal && rank === 1 && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: `linear-gradient(to bottom,${medal.icon},transparent)` }} />
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,${medal.icon},transparent 60%)` }} />
                  </>
                )}

                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  {medal
                    ? <Trophy size={16} style={{ color: medal.icon, margin: '0 auto' }} />
                    : <span className="font-display text-sm" style={{ color: 'rgba(155,163,167,0.25)' }}>{rank}</span>
                  }
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 flex items-center justify-center border font-display text-sm shrink-0"
                  style={medal
                    ? { background: medal.bg, border: `1px solid ${medal.border}`, color: medal.text }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9BA3A7' }
                  }>
                  {entry.student_name?.[0] ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: medal ? medal.text : '#F5F5F5' }}>{entry.student_name}</p>
                  <p style={{ color: 'rgba(155,163,167,0.35)', fontSize: '0.55rem', letterSpacing: '0.18em' }}>{entry.student_id}</p>
                </div>

                <div className="hidden sm:flex gap-2 shrink-0">
                  <Badge variant={entry.sport as any}>{entry.sport}</Badge>
                  <Badge variant={entry.level as any}>{entry.level}</Badge>
                </div>

                <div className="text-right shrink-0 min-w-14">
                  <p style={{ color: 'rgba(155,163,167,0.4)', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Score</p>
                  <p className="font-display text-off-white text-sm">{entry.current_score ?? '—'}%</p>
                </div>

                <div className="text-right shrink-0 min-w-20">
                  <p style={{ color: 'rgba(155,163,167,0.4)', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Improvement</p>
                  <p className="font-display text-lg" style={{ color: (entry.improvement ?? 0) >= 0 ? '#34d399' : '#E11919' }}>
                    {entry.improvement != null ? `${entry.improvement > 0 ? '+' : ''}${entry.improvement}%` : '—'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
