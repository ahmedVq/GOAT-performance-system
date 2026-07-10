import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../../services/auth.service'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { User, Lock, Info } from 'lucide-react'

const pwSchema = z.object({
  old_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type PwForm = z.infer<typeof pwSchema>

const inputStyle = {
  width: '100%', background: '#080808',
  border: '1px solid rgba(255,255,255,0.07)',
  color: '#F5F5F5', padding: '10px 14px', fontSize: 13,
  outline: 'none',
} as const

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

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <Icon size={13} style={{ color: '#E11919' }} />
      <h3 className="font-display text-off-white text-xs uppercase tracking-[0.22em]">{title}</h3>
    </div>
  )
}

export function SettingsPage() {
  const { user }   = useAuth()
  const { toast }  = useToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  })

  const changePwMutation = useMutation({
    mutationFn: ({ old_password, new_password }: { old_password: string; new_password: string }) =>
      authService.changePassword({ current_password: old_password, new_password, new_password_confirm: new_password }),
    onSuccess: () => { reset(); toast('Password updated successfully') },
    onError:   () => toast('Incorrect current password', 'error'),
  })

  return (
    <div className="space-y-8 max-w-xl">

      {/* Header */}
      <div>
        <p style={{ color: 'rgba(225,25,25,0.6)', fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
          Academy Management
        </p>
        <h1 className="font-display text-off-white" style={{ fontSize: '2.4rem', letterSpacing: '0.1em', lineHeight: 1 }}>
          Settings
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-blood-red" />
          <span style={{ color: 'rgba(155,163,167,0.38)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
            Account & system configuration
          </span>
        </div>
      </div>

      {/* Account info */}
      <Card>
        <SectionTitle icon={User} title="Account" />
        <div className="space-y-4">
          {[
            { label: 'Full Name', value: user?.fullName },
            { label: 'Email',     value: user?.email },
            { label: 'Role',      value: user?.role },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(155,163,167,0.4)', fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{label}</span>
              <span className="text-off-white text-sm capitalize">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Change password */}
      <Card>
        <SectionTitle icon={Lock} title="Change Password" />
        <form onSubmit={handleSubmit(d => changePwMutation.mutate({ old_password: d.old_password, new_password: d.new_password }))}
          className="space-y-4">
          {[
            { name: 'old_password' as const, label: 'Current Password' },
            { name: 'new_password' as const, label: 'New Password' },
            { name: 'confirm'      as const, label: 'Confirm New Password' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label style={{ display: 'block', color: 'rgba(155,163,167,0.5)', fontSize: '0.52rem', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
              <input type="password" {...register(name)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(225,25,25,0.4)' }}
                onBlur={e =>  { e.target.style.borderColor = 'rgba(255,255,255,0.07)' }} />
              {errors[name] && <p style={{ color: '#E11919', fontSize: '0.65rem', marginTop: 4 }}>{errors[name]?.message}</p>}
            </div>
          ))}

          <button type="submit" disabled={changePwMutation.isPending}
            className="w-full py-3 text-white font-display text-xs tracking-[0.26em] uppercase mt-2 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#E11919,#B90F16)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', opacity: changePwMutation.isPending ? 0.6 : 1 }}>
            {changePwMutation.isPending ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </Card>

      {/* System info */}
      <Card>
        <SectionTitle icon={Info} title="System" />
        <div className="space-y-0">
          {[
            { label: 'Version',  value: '1.0.0' },
            { label: 'Academy',  value: 'GOAT Main Branch' },
            { label: 'Sports',   value: 'Boxing · Kickboxing' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(155,163,167,0.4)', fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{label}</span>
              <span className="text-off-white text-sm">{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
