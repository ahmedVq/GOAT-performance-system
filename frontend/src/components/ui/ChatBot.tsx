import { useState, useEffect, useRef } from 'react'
import { X, Send, RotateCcw } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import api from '../../services/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  from: 'bot' | 'user'
  text: string
  time: number
}

interface GroqMessage {
  role: 'user' | 'assistant'
  content: string
}

function uid() { return Math.random().toString(36).slice(2) }
function botMsg(text: string): Message { return { id: uid(), from: 'bot', text, time: Date.now() } }
function userMsg(text: string): Message { return { id: uid(), from: 'user', text, time: Date.now() } }

const STORAGE_MSGS = 'goat_chat_msgs_v3'
const STORAGE_HIST = 'goat_chat_hist_v3'

function loadMessages(): Message[] {
  try { const r = localStorage.getItem(STORAGE_MSGS); return r ? JSON.parse(r) : [] } catch { return [] }
}
function loadHistory(): GroqMessage[] {
  try { const r = localStorage.getItem(STORAGE_HIST); return r ? JSON.parse(r) : [] } catch { return [] }
}
function save(msgs: Message[], hist: GroqMessage[]) {
  localStorage.setItem(STORAGE_MSGS, JSON.stringify(msgs.slice(-60)))
  localStorage.setItem(STORAGE_HIST, JSON.stringify(hist.slice(-40)))
}

// ── API call ──────────────────────────────────────────────────────────────────

async function askGroq(history: GroqMessage[]): Promise<string> {
  try {
    const res = await api.post('/chat/', { messages: history })
    return res.data?.data?.reply ?? 'Sorry, I could not get a response. Try again.'
  } catch {
    return 'Connection error. Make sure the backend is running.'
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChatBot() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => loadMessages())
  const [history, setHistory] = useState<GroqMessage[]>(() => loadHistory())
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])
  useEffect(() => { if (messages.length) save(messages, history) }, [messages, history])

  useEffect(() => {
    if (open) {
      if (messages.length === 0) {
        const name = user?.fullName?.split(' ')[0] ?? 'there'
        setMessages([botMsg(`Hey ${name}! 👋 I'm your GOAT Academy AI assistant powered by Llama 3.\n\nAsk me anything — boxing technique, kickboxing tips, how to improve your grade, nutrition, mental game, or anything else!`)])
      }
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || typing) return
    setInput('')

    const newUserMsg = userMsg(text)
    const newGroqMsg: GroqMessage = { role: 'user', content: text }

    setMessages(prev => [...prev, newUserMsg])
    setHistory(prev => [...prev, newGroqMsg])
    setTyping(true)

    const updatedHistory = [...history, newGroqMsg]
    const reply = await askGroq(updatedHistory)

    const newBotMsg = botMsg(reply)
    const newAssistantMsg: GroqMessage = { role: 'assistant', content: reply }

    setTyping(false)
    setMessages(prev => [...prev, newBotMsg])
    setHistory(prev => [...prev, newAssistantMsg])
  }

  function reset() {
    setMessages([])
    setHistory([])
    localStorage.removeItem(STORAGE_MSGS)
    localStorage.removeItem(STORAGE_HIST)
    const name = user?.fullName?.split(' ')[0] ?? 'there'
    setTimeout(() => setMessages([botMsg(`Chat cleared! Hey ${name}, what would you like to know?`)]), 100)
  }

  if (!user) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          width: 56, height: 56, borderRadius: '50%',
          border: 'none', padding: 0, cursor: 'pointer', background: 'none',
          boxShadow: open
            ? '0 0 0 3px rgba(225,25,25,0.6), 0 8px 32px rgba(0,0,0,0.7)'
            : '0 0 0 2px rgba(225,25,25,0.3), 0 8px 24px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      >
        <img src="/logo-badge.png" alt="GOAT Chat"
          style={{ width: 56, height: 56, borderRadius: '50%', display: 'block', filter: 'drop-shadow(0 0 8px rgba(225,25,25,0.6))' }} />
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 998,
          width: 370, height: 530,
          background: '#0a0a0a',
          border: '1px solid rgba(225,25,25,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column',
          clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)',
          animation: 'chatSlideUp 0.2s ease',
        }}>

          {/* Header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#0f0f0f',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{ position: 'relative' }}>
              <img src="/logo-badge.png" alt="GOAT" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <span style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 9, height: 9, borderRadius: '50%',
                background: '#34d399', border: '2px solid #0f0f0f',
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#F5F5F5', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>GOAT Assistant</p>
              <p style={{ color: 'rgba(155,163,167,0.45)', fontSize: '0.58rem', margin: 0 }}>Powered by Llama 3 · Martial Arts AI</p>
            </div>
            <button onClick={reset} title="Clear chat"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(155,163,167,0.35)', padding: 4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fbbf24' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(155,163,167,0.35)' }}>
              <RotateCcw size={13} />
            </button>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(155,163,167,0.35)', padding: 4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E11919' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(155,163,167,0.35)' }}>
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: 8,
              }}>
                {msg.from === 'bot' && (
                  <img src="/logo-badge.png" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg,#E11919,#B90F16)'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  color: '#F5F5F5',
                  fontSize: '0.74rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  clipPath: msg.from === 'user'
                    ? 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)'
                    : 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <img src="/logo-badge.png" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#E11919',
                      animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
            background: '#0a0a0a',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything about boxing, kickboxing, your grade..."
              disabled={typing}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F5F5F5', fontSize: '0.74rem',
                padding: '9px 12px', outline: 'none',
                clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,0 100%)',
                opacity: typing ? 0.5 : 1,
              }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(225,25,25,0.45)' }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
            <button onClick={send} disabled={!input.trim() || typing}
              style={{
                background: input.trim() && !typing ? 'linear-gradient(135deg,#E11919,#B90F16)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: input.trim() && !typing ? 'pointer' : 'default',
                color: input.trim() && !typing ? '#fff' : 'rgba(155,163,167,0.3)',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0,
                clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,0 100%)',
              }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  )
}
