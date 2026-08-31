import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, DollarSign, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useApp } from '../context/AppContext'
import { tripsDB } from '../lib/supabase'

const DESTINATIONS = ['Areandina', 'UTP', 'UCP', 'Universidad Libre', 'UNAD', 'Otro']

export default function NewTripPage() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [form, setForm] = useState({ from: '', to: 'Areandina', customTo: '', time: '06:30 AM', price: '3000', seats: '3', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePublish = async () => {
    const finalDestination = form.to === 'Otro' ? form.customTo : form.to
    if (!form.from.trim() || !finalDestination.trim() || !form.time || !form.price) {
      setError('Completa origen, destino, hora y precio.')
      return
    }

    if (!user) {
      setError('Debes tener una sesión activa.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: insertErr } = await tripsDB.create({
        driver_id: user.id,
        origin: form.from.trim(),
        destination: finalDestination.trim(),
        departure_time: form.time,
        price: parseInt(form.price, 10) || 3000,
        available_seats: parseInt(form.seats, 10) || 3,
        notes: form.notes.trim() || null,
        status: 'available',
      })

      setLoading(false)
      if (insertErr) {
        setError('Error al publicar el viaje: ' + insertErr.message)
        return
      }

      navigate('/trips', { replace: true })
    } catch (err) {
      setLoading(false)
      setError('Ocurrió un error inesperado. Intenta de nuevo.')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', maxWidth: 430, margin: '0 auto', paddingBottom: 32 }}>
      <div style={{
        background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
        padding: '52px 20px 28px', borderRadius: '0 0 28px 28px',
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', marginBottom: 16,
        }}><ArrowLeft size={20} /></button>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>🚗 Publicar viaje</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Ofrece tu ruta en tiempo real</p>
      </div>

      {error && (
        <div style={{ margin: '16px 20px 0', background: '#fee2e2', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
        <Input label="Punto de salida" placeholder="Ej: Cuba, Álamos, Villa Verde..." icon={MapPin} value={form.from} onChange={set('from')} />

        {/* Destino */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Destino</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DESTINATIONS.map(d => (
              <button key={d} type="button" onClick={() => setForm(f => ({ ...f, to: d }))} style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                border: `2px solid ${form.to === d ? '#db2777' : '#e5e7eb'}`,
                background: form.to === d ? '#fdf2f8' : '#f9fafb',
                color: form.to === d ? '#9d174d' : '#6b7280',
                fontSize: 13, fontWeight: form.to === d ? 700 : 500,
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}>{d}</button>
            ))}
          </div>
          {form.to === 'Otro' && (
            <Input placeholder="Escribe el destino" style={{ marginTop: 10 }} value={form.customTo} onChange={set('customTo')} />
          )}
        </div>

        <Input label="Hora de salida" placeholder="Ej: 06:30 AM" icon={Clock} value={form.time} onChange={set('time')} />

        <Input
          label="Precio por persona (COP)"
          type="number"
          placeholder="Ej: 3000"
          icon={DollarSign}
          value={form.price}
          onChange={set('price')}
          hint="Precio sugerido: $2.500 - $5.000 COP"
        />

        {/* Asientos */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            <Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Asientos disponibles
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['1', '2', '3', '4'].map(n => (
              <button key={n} type="button" onClick={() => setForm(f => ({ ...f, seats: n }))} style={{
                width: 56, height: 56, borderRadius: 14, cursor: 'pointer',
                border: `2px solid ${form.seats === n ? '#db2777' : '#e5e7eb'}`,
                background: form.seats === n ? '#fdf2f8' : '#f9fafb',
                color: form.seats === n ? '#9d174d' : '#374151',
                fontSize: 18, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s',
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Notas opcionales */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Notas (opcional)</p>
          <textarea
            placeholder="Ej: Solo estudiantes UTP, salida puntual, etc."
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            style={{
              width: '100%', border: '2px solid #e5e7eb', borderRadius: 12,
              padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
              color: '#374151', resize: 'none', outline: 'none', background: '#f9fafb',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#db2777'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handlePublish}
          style={{ background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', boxShadow: '0 4px 14px rgba(219,39,119,0.4)' }}
        >
          Publicar viaje en Supabase
        </Button>
      </div>
    </div>
  )
}
