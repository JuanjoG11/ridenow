import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const { updateProfile } = useApp()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await updateProfile({ role: selected })
      setLoading(false)
      navigate(selected === 'driver' ? '/driver-setup' : '/student-setup', { replace: true })
    } catch (err) {
      setLoading(false)
      navigate(selected === 'driver' ? '/driver-setup' : '/student-setup', { replace: true })
    }
  }

  const roles = [
    { key: 'student', emoji: '🎒', title: 'Soy Estudiante', desc: 'Busco viaje a la universidad.', color: '#2563eb', bg: '#eff6ff' },
    { key: 'driver',  emoji: '🚗', title: 'Soy Conductor',  desc: 'Comparto mi ruta con otros.',  color: '#db2777', bg: '#fdf2f8' },
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f9fafb', maxWidth: 430, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 100%)',
        padding: '64px 24px 48px', borderRadius: '0 0 36px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 16px', boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}>🚗</div>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>¿Cómo usas RideNow?</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 8 }}>Elige tu rol para personalizar tu experiencia</p>
      </div>

      <div style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeInUp 0.4s ease' }}>
        {roles.map(r => (
          <button key={r.key} onClick={() => setSelected(r.key)} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '20px',
            background: selected === r.key ? r.bg : '#fff',
            border: `2.5px solid ${selected === r.key ? r.color : '#e5e7eb'}`,
            borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
            boxShadow: selected === r.key ? `0 8px 24px ${r.color}22` : '0 2px 8px rgba(0,0,0,0.05)',
            transform: selected === r.key ? 'scale(1.01)' : 'scale(1)',
            transition: 'all 0.25s ease',
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: selected === r.key ? r.color : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, transition: 'all 0.25s' }}>
              {r.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: selected === r.key ? r.color : '#111827', marginBottom: 4 }}>{r.title}</p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: selected === r.key ? r.color : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s' }}>
              <ChevronRight size={16} color={selected === r.key ? '#fff' : '#9ca3af'} />
            </div>
          </button>
        ))}

        <Button fullWidth size="lg" disabled={!selected} loading={loading} onClick={handleContinue} style={{ marginTop: 8 }}>
          Continuar como {selected === 'driver' ? 'Conductor' : selected === 'student' ? 'Estudiante' : '...'}
        </Button>
      </div>
    </div>
  )
}
