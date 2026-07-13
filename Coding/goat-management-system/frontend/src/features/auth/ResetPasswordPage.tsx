import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'
import api from '../../services/api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const uid = params.get('uid') ?? ''
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const invalid = !uid || !token

  const handleSubmit = async () => {
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setState('loading')
    try {
      await api.post('/auth/reset-password/', { uid, token, new_password: password })
      setState('done')
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Reset link is invalid or has expired.'
      setError(msg)
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center px-4" style={{
      backgroundImage: 'repeating-linear-gradient(135deg,rgba(225,25,25,0.025) 0px,rgba(225,25,25,0.025) 1px,transparent 1px,transparent 42px)',
    }}>
      <div className="w-full" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-badge.png" alt="GOAT" style={{ width: 80, height: 80, borderRadius: '50%', filter: 'drop-shadow(0 0 18px rgba(225,25,25,0.5))' }} />
          <img src="/logo-wordmark.png" alt="Goat" style={{ height: 44, marginTop: 8, filter: 'invert(1) hue-rotate(180deg)', opacity: 0.9 }} />
        </div>

        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#0d0d0d,#070707)', border: '1px solid rgba(225,25,25,0.2)', clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,#E11919,rgba(225,25,25,0.2) 55%,transparent)' }} />
          <div className="absolute top-0 left-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,#E11919,rgba(225,25,25,0.08) 45%,transparent)' }} />

          <div className="p-7 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 flex items-center justify-center"
                style={{ background: 'rgba(225,25,25,0.1)', border: '1px solid rgba(225,25,25,0.25)' }}>
                {state === 'done' ? <CheckCircle size={16} className="text-emerald-400" /> : <KeyRound size={16} className="text-blood-red" />}
              </div>
              <div>
                <p style={{ color: 'rgba(225,25,25,0.58)', fontSize: '0.52rem', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Academy Portal</p>
                <h2 className="font-display text-off-white" style={{ fontSize: '1.4rem', letterSpacing: '0.1em', lineHeight: 1.1 }}>
                  {state === 'done' ? 'Password Updated' : 'New Password'}
                </h2>
              </div>
            </div>
            <div className="h-px w-10 bg-blood-red" />

            {invalid ? (
              <div className="space-y-4">
                <div className="px-4 py-3" style={{ border: '1px solid rgba(225,25,25,0.3)', background: 'rgba(225,25,25,0.06)' }}>
                  <p className="text-blood-red text-sm">This reset link is invalid or missing required parameters.</p>
                </div>
                <button onClick={() => navigate('/login')}
                  className="w-full py-3 text-white font-display text-xs tracking-widest uppercase transition-all"
                  style={{ background: 'linear-gradient(135deg,#E11919,#B90F16)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}>
                  Back to Sign In
                </button>
              </div>
            ) : state === 'done' ? (
              <div className="space-y-4">
                <p className="text-steel-gray text-xs leading-relaxed">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <button onClick={() => navigate('/login')}
                  className="w-full py-3 text-white font-display text-xs tracking-widest uppercase transition-all"
                  style={{ background: 'linear-gradient(135deg,#E11919,#B90F16)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(225,25,25,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                  Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-steel-gray text-xs leading-relaxed">
                  Enter your new password below. It must be at least 8 characters.
                </p>

                {/* New password */}
                <div className="space-y-1.5">
                  <label style={{ display: 'block', color: 'rgba(155,163,167,0.5)', fontSize: '0.57rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="••••••••"
                      className="w-full text-off-white text-sm px-4 py-2.5 pr-10 outline-none placeholder:text-white/10 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderBottomColor = '#E11919'; e.currentTarget.style.background = 'rgba(225,25,25,0.04)' }}
                      onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'rgba(155,163,167,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F5F5' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(155,163,167,0.35)' }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label style={{ display: 'block', color: 'rgba(155,163,167,0.5)', fontSize: '0.57rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError('') }}
                      placeholder="••••••••"
                      className="w-full text-off-white text-sm px-4 py-2.5 pr-10 outline-none placeholder:text-white/10 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderBottomColor = '#E11919'; e.currentTarget.style.background = 'rgba(225,25,25,0.04)' }}
                      onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                      onKeyDown={e => e.key === 'Enter' && state !== 'loading' && handleSubmit()}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'rgba(155,163,167,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F5F5' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(155,163,167,0.35)' }}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 px-4 py-2.5" style={{ border: '1px solid rgba(225,25,25,0.3)', background: 'rgba(225,25,25,0.06)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blood-red flex-shrink-0" />
                    <p className="text-blood-red text-xs">{error}</p>
                  </div>
                )}

                <button onClick={handleSubmit} disabled={state === 'loading'}
                  className="w-full py-3 text-white font-display text-xs tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#E11919,#B90F16)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}
                  onMouseEnter={e => { if (state !== 'loading') (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(225,25,25,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                  {state === 'loading' ? <><Loader2 size={13} className="animate-spin" /> Updating…</> : 'Set New Password'}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.08)', fontSize: '0.57rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          GOAT © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
