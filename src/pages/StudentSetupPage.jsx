import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useApp } from '../context/AppContext'

const SCHEDULES = ['Mañana (6am-12pm)', 'Tarde (12pm-6pm)', 'Noche (6pm-10pm)', 'Variable']

export default function StudentSetupPage() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useApp()
  const [form, setForm] = useState({
    address: profile?.home_address || '',
    neighborhood: profile?.neighborhood || '',
    schedule: profile?.schedule || 'Mañana (6am-12pm)',
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile({
        role: 'student',
        home_address: form.address,
        neighborhood: form.neighborhood,
        schedule: form.schedule,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      navigate('/home', { replace: true })
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', padding: '52px 24px 36px', borderRadius: '0 0 28px 28px' }}>
        <button onClick={() => navigate('/role-select')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20, color: '#fff' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>🎒 Tu perfil</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>Cuéntanos de tu ruta para encontrarte compañeros</p>
      </div>

      <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
        <Input label="Dirección de casa" placeholder="Ej: Calle 15 #20-30" icon={MapPin} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} hint="Punto de recogida habitual" />
        <Input label="Barrio" placeholder="Ej: Cuba, Álamos, Kennedy, Villa Verde..." icon={MapPin} value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} />

        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            <Clock size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Horario habitual
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {SCHEDULES.map(s => (
              <button key={s} onClick={() => setForm(f => ({ ...f, schedule: s }))} style={{
                padding: '14px 12px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                border: `2px solid ${form.schedule === s ? '#2563eb' : '#e5e7eb'}`,
                background: form.schedule === s ? '#eff6ff' : '#f9fafb',
                color: form.schedule === s ? '#1d4ed8' : '#374151',
                fontSize: 13, fontWeight: form.schedule === s ? 700 : 500, transition: 'all 0.2s',
              }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <Button fullWidth size="lg" loading={loading} onClick={handleSave}>¡Listo, empezar!</Button>
          <button onClick={() => { updateProfile({ role: 'student' }); navigate('/home', { replace: true }) }} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 8 }}>
            Completar después
          </button>
        </div>
      </div>
    </div>
  )
}
