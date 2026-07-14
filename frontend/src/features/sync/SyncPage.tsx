import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService } from '../../services/analytics.service'
import { Badge } from '../../components/ui/Badge'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import { useToast } from '../../components/ui/Toast'
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

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

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle size={14} style={{ color: '#34d399' }} />
  if (status === 'failed')  return <XCircle     size={14} style={{ color: '#E11919' }} />
  return                           <AlertCircle  size={14} style={{ color: '#fbbf24' }} />
}

export function SyncPage() {
  const qc        = useQueryClient()
  const { toast } = useToast()

  const { data: status } = useQuery({
    queryKey: ['sync-status'],
    queryFn: syncService.getStatus,
    refetchInterval: 10_000,
  })

  const { data: logs, isLoading } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: syncService.getLogs,
  })

  const triggerMutation = useMutation({
    mutationFn: syncService.trigger,
    onSuccess: () => {
      toast('Sync started')
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['sync-status'] })
        qc.invalidateQueries({ queryKey: ['sync-logs'] })
      }, 2000)
    },
    onError: () => toast('Sync failed — check Google Sheets config', 'error'),
  })

  const st      = status as any
  const logList = (logs as any[]) ?? []

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p style={{ color: 'rgba(225,25,25,0.6)', fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
          Academy Management
        </p>
        <h1 className="font-display text-off-white" style={{ fontSize: '2.4rem', letterSpacing: '0.1em', lineHeight: 1 }}>
          Google Sheets <span className="text-blood-red">Sync</span>
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-blood-red" />
          <span style={{ color: 'rgba(155,163,167,0.38)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
            Import assessment data from Google Sheets
          </span>
        </div>
      </div>

      {/* Status + trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Last sync status */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Clock size={13} style={{ color: '#E11919' }} />
            <h3 className="font-display text-off-white text-xs uppercase tracking-[0.22em]">Last Sync</h3>
          </div>
          {st?.last_sync ? (
            <div className="space-y-3">
              <p className="font-display text-off-white text-lg">
                {new Date(st.last_sync.completed_at ?? st.last_sync.started_at).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusIcon status={st.last_sync.status} />
                <Badge variant={st.last_sync.status === 'success' ? 'success' : st.last_sync.status === 'failed' ? 'error' : 'warning'}>
                  {st.last_sync.status}
                </Badge>
                <span style={{ color: 'rgba(155,163,167,0.45)', fontSize: '0.68rem' }}>
                  {st.last_sync.records_synced} synced · {st.last_sync.records_failed} failed
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(155,163,167,0.35)', fontSize: '0.8rem' }}>No syncs yet</p>
          )}
        </Card>

        {/* Trigger */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw size={13} style={{ color: '#E11919' }} />
            <h3 className="font-display text-off-white text-xs uppercase tracking-[0.22em]">Manual Sync</h3>
          </div>
          <p style={{ color: 'rgba(155,163,167,0.45)', fontSize: '0.78rem', marginBottom: 20 }}>
            Pull the latest assessment data from Google Sheets now
          </p>
          <button onClick={() => triggerMutation.mutate()} disabled={triggerMutation.isPending}
            className="flex items-center gap-2 text-white font-display text-xs tracking-[0.22em] uppercase px-5 py-3 transition-all duration-200 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#E11919,#B90F16)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', opacity: triggerMutation.isPending ? 0.7 : 1 }}
            onMouseEnter={e => { if (!triggerMutation.isPending) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(225,25,25,0.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
            <RefreshCw size={13} style={{ animation: triggerMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />
            {triggerMutation.isPending ? 'Syncing...' : 'Trigger Sync'}
          </button>
        </Card>
      </div>

      {/* Sync history */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : logList.length === 0 ? (
        <div className="relative overflow-hidden text-center py-20"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
          <RefreshCw size={28} style={{ color: 'rgba(155,163,167,0.2)', margin: '0 auto 12px' }} />
          <p className="font-display text-off-white text-base mb-1">No sync history</p>
          <p className="text-steel-gray/40 text-sm">Trigger a sync to get started</p>
        </div>
      ) : (
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#080808)', border: '1px solid rgba(255,255,255,0.05)', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 50%,transparent)' }} />
          <div className="absolute top-0 left-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,#E11919,transparent 60%)' }} />

          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={13} style={{ color: '#E11919' }} />
              <h3 className="font-display text-off-white text-xs uppercase tracking-[0.22em]">Sync History</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Started', 'Status', 'Synced', 'Failed', 'Duration'].map(h => (
                    <th key={h} className="text-left"
                      style={{ padding: '10px 20px', color: 'rgba(155,163,167,0.4)', fontSize: '0.52rem', letterSpacing: '0.26em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logList.map((log: any) => {
                  const start    = new Date(log.started_at)
                  const end      = log.completed_at ? new Date(log.completed_at) : null
                  const duration = end ? `${Math.round((end.getTime() - start.getTime()) / 1000)}s` : '—'
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                      <td style={{ padding: '13px 20px', color: 'rgba(155,163,167,0.5)', fontSize: '0.72rem' }}>
                        {start.toLocaleString()}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={log.status} />
                          <Badge variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}>
                            {log.status}
                          </Badge>
                        </div>
                      </td>
                      <td style={{ padding: '13px 20px', color: '#34d399', fontSize: '0.8rem' }}>{log.records_synced}</td>
                      <td style={{ padding: '13px 20px', color: log.records_failed > 0 ? '#E11919' : 'rgba(155,163,167,0.4)', fontSize: '0.8rem' }}>{log.records_failed}</td>
                      <td style={{ padding: '13px 20px', color: 'rgba(155,163,167,0.4)', fontSize: '0.72rem' }}>{duration}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
