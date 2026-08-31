import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Hash, Users, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useApp } from '../context/AppContext'

const BRANDS = ['Chevrolet', 'Renault', 'Mazda', 'Toyota', 'Kia', 'Hyundai', 'Ford', 'Otro']
const COLORS = [
  { name: 'Blanco', hex: '#f9fafb' }, { name: 'Negro', hex: '#1f2937' },
  { name: 'Gris', hex: '#9ca3af' },   { name: 'Rojo', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },   { name: 'Verde', hex: '#22c55e' },
]

export default function DriverSetupPage() {
  const navigate = useNavigate()
  const { vehicle, updateProfile, updateVehicle } = useApp()
  const [form, setForm] = useState({
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    plate: vehicle?.plate || '',
    color: vehicle?.color || 'Blanco',
    seats: vehicle?.seats ? String(vehicle.seats) : '4',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.brand || !form.plate.trim()) {
      setError('Ingresa al menos la marca y la placa del vehículo.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await updateProfile({ role: 'driver' })
      await updateVehicle({
        brand: form.brand,
        model: form.model,
        plate: form.plate.toUpperCase().trim(),
        color: form.color,
        seats: parseInt(form.seats, 10) || 4,
      })
      setLoading(false)
      navigate('/home', { replace: true })
    } catch (err) {
      setLoading(false)
      navigate('/home', { replace: true })
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', padding: '52px 24px 36px', borderRadius: '0 0 28px 28px' }}>
        <button onClick={() => navigate('/role-select')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20, color: '#fff' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>🚗 Tu vehículo</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>Los estudiantes verán esta info antes de solicitar</p>
      </div>

      {error && <div style={{ margin: '16px 24px 0', background: '#fee2e2', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>}

      <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Marca</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BRANDS.map(b => (
              <button key={b} onClick={() => setForm(f => ({ ...f, brand: b }))} style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                border: `2px solid ${form.brand === b ? '#db2777' : '#e5e7eb'}`,
                background: form.brand === b ? '#fdf2f8' : '#f9fafb',
                color: form.brand === b ? '#9d174d' : '#6b7280',
                fontSize: 13, fontWeight: form.brand === b ? 700 : 500, transition: 'all 0.2s',
              }}>{b}</button>
            ))}
          </div>
        </div>

        <Input label="Modelo" placeholder="Ej: Spark GT 2020" icon={Car} value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
        <Input label="Placa" placeholder="Ej: ABC-123" icon={Hash} value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} />

        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Color</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c.name} onClick={() => setForm(f => ({ ...f, color: c.name }))} title={c.name} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.hex, border: `3px solid ${form.color === c.name ? '#db2777' : '#e5e7eb'}`, boxShadow: form.color === c.name ? '0 0 0 2px #db277733' : 'none', transition: 'all 0.2s' }} />
                <span style={{ fontSize: 10, color: form.color === c.name ? '#db2777' : '#9ca3af', fontWeight: form.color === c.name ? 700 : 400 }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            <Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Asientos disponibles
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['1', '2', '3', '4'].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, seats: n }))} style={{
                width: 56, height: 56, borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                border: `2px solid ${form.seats === n ? '#db2777' : '#e5e7eb'}`,
                background: form.seats === n ? '#fdf2f8' : '#f9fafb',
                color: form.seats === n ? '#9d174d' : '#374151',
                fontSize: 18, fontWeight: 700, transition: 'all 0.2s',
              }}>{n}</button>
            ))}
          </div>
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handleSave} style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', boxShadow: '0 4px 14px rgba(219,39,119,0.4)' }}>
          Guardar y continuar
        </Button>
      </div>
    </div>
  )
}
