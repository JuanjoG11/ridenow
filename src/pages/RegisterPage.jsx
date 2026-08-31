import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useApp } from '../context/AppContext'

const UNIVERSITIES = ['Areandina (Área Andina)', 'Universidad Tecnológica de Pereira (UTP)', 'Universidad Libre', 'Universidad Católica de Pereira (UCP)', 'UNAD', 'Otra']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '', university: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const nextStep = () => {
    if (!form.fullName.trim()) return setError('Ingresa tu nombre completo.')
    if (!form.email.includes('@')) return setError('Correo inválido.')
    if (form.phone.replace(/\D/g, '').length < 7) return setError('Celular inválido.')
    if (form.password.length < 6) return setError('La contraseña debe tener mínimo 6 caracteres.')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    setError(''); setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.university) return setError('Elige tu universidad.')
    setError('')
    setLoading(true)
    
    try {
      const res = await register({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        university: form.university,
      })

      setLoading(false)
      if (res.error) {
        if (res.error.includes('User already registered')) {
          setError('Este correo ya está registrado. Inicia sesión.')
        } else {
          setError(res.error)
        }
        return
      }

      // Registro exitoso, pasar a selección de rol
      navigate('/role-select', { replace: true })
    } catch (err) {
      setLoading(false)
      setError('Error en el registro. Intenta de nuevo.')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #db2777 0%, #ec4899 100%)',
        padding: '52px 24px 36px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <button onClick={() => step === 2 ? setStep(1) : navigate('/welcome')} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', marginBottom: 20, color: '#fff',
        }}><ArrowLeft size={20} /></button>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>🎓 Crear cuenta</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>Paso {step} de 2</p>
        <div style={{ marginTop: 14, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }}>
          <div style={{ width: `${step * 50}%`, height: '100%', borderRadius: 99, background: '#fff', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {error && (
        <div style={{ margin: '16px 24px 0', background: '#fee2e2', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideInRight 0.3s ease' }}>
          <Input label="Nombre completo" placeholder="Ej: María González" icon={User} value={form.fullName} onChange={set('fullName')} />
          <Input label="Correo" type="email" placeholder="tu@correo.com" icon={Mail} value={form.email} onChange={set('email')} />
          <Input label="Celular" type="tel" placeholder="3001234567" icon={Phone} value={form.phone} onChange={set('phone')} />
          <Input label="Contraseña" type={showPass ? 'text' : 'password'} placeholder="Mín. 6 caracteres"
            icon={Lock} rightIcon={showPass ? EyeOff : Eye} onRightIconClick={() => setShowPass(v => !v)}
            value={form.password} onChange={set('password')} />
          <Input label="Confirmar contraseña" type={showPass ? 'text' : 'password'} placeholder="Repite tu contraseña"
            icon={Lock} value={form.confirm} onChange={set('confirm')} />
          <Button fullWidth size="lg" onClick={nextStep}>Continuar</Button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: '#9ca3af' }}>¿Ya tienes cuenta? </span>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Inicia sesión
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleRegister} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'slideInRight 0.3s ease' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Selecciona tu universidad</p>
          {UNIVERSITIES.map(u => (
            <label key={u} onClick={() => setForm(f => ({ ...f, university: u }))} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
              border: `2px solid ${form.university === u ? '#2563eb' : '#e5e7eb'}`,
              background: form.university === u ? '#eff6ff' : '#f9fafb', transition: 'all 0.2s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, transition: 'all 0.2s',
                border: `2px solid ${form.university === u ? '#2563eb' : '#d1d5db'}`,
                background: form.university === u ? '#2563eb' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.university === u && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: 14, fontWeight: form.university === u ? 600 : 400, color: form.university === u ? '#1d4ed8' : '#374151' }}>{u}</span>
            </label>
          ))}
          <Button type="submit" fullWidth size="lg" loading={loading} style={{ marginTop: 8 }}>Crear mi cuenta</Button>
        </form>
      )}
    </div>
  )
}
