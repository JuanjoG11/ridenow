import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useApp } from '../context/AppContext'
import { profilesDB } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      const res = await login({ email: form.email.trim(), password: form.password })
      if (res.error) {
        if (res.error.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos.')
        } else if (res.error.includes('Email not confirmed')) {
          setError('Por favor confirma tu correo electrónico.')
        } else {
          setError(res.error)
        }
        setLoading(false)
        return
      }

      // Consultar perfil para redirigir correctamente
      const { data: prof } = await profilesDB.get(res.user?.id)
      setLoading(false)
      if (prof?.role) {
        navigate('/home', { replace: true })
      } else {
        navigate('/role-select', { replace: true })
      }
    } catch (err) {
      setLoading(false)
      setError('Error al iniciar sesión. Intenta de nuevo.')
    }
  }

  const quickLoginAs = async (userData) => {
    setLoading(true)
    setError('')
    try {
      const res = await login({ email: userData.email, password: 'any' })
      const { data: prof } = await profilesDB.get(res.user?.id)
      setLoading(false)
      if (prof?.role) {
        navigate('/home', { replace: true })
      } else {
        navigate('/role-select', { replace: true })
      }
    } catch (err) {
      setLoading(false)
      setError('Error al iniciar sesión.')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', maxWidth: 430, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 100%)',
        padding: '52px 24px 48px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <button onClick={() => navigate('/welcome')} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', marginBottom: 24, color: '#fff',
        }}><ArrowLeft size={20} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>👋</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>¡Hola de nuevo!</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 }}>Inicia sesión con tu cuenta</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleLogin} style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeInUp 0.4s ease' }}>
        <Input label="Correo electrónico" type="email" placeholder="tu@correo.com" icon={Mail} value={form.email} onChange={set('email')} />
        <Input label="Contraseña" type={showPass ? 'text' : 'password'} placeholder="••••••••"
          icon={Lock} rightIcon={showPass ? EyeOff : Eye} onRightIconClick={() => setShowPass(v => !v)}
          value={form.password} onChange={set('password')} />

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>Iniciar sesión</Button>

        {/* Separador de Acceso Directo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 2px' }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚡ Acceso Rápido Directo
          </span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={() => quickLoginAs({ email: 'manuelaarangoosorio28@gmail.com' })}
          style={{
            padding: '12px 14px', borderRadius: 14, border: '1.5px solid #bfdbfe', background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            textAlign: 'left', transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>🚗 Entrar como Manuela Arango</div>
            <div style={{ fontSize: 12, color: '#3b82f6' }}>Conductora • Areandina</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '4px 10px', borderRadius: 99 }}>Entrar ya →</span>
        </button>

        <button
          type="button"
          onClick={() => quickLoginAs({ email: 'juan@utp.edu.co' })}
          style={{
            padding: '12px 14px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            textAlign: 'left', transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>🎓 Entrar como Juan Gutiérrez</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Estudiante • UTP</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', background: '#e2e8f0', padding: '4px 10px', borderRadius: 99 }}>Entrar ya →</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 14, color: '#9ca3af' }}>¿No tienes cuenta? </span>
          <button type="button" onClick={() => navigate('/register')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Regístrate
          </button>
        </div>
      </form>
    </div>
  )
}
