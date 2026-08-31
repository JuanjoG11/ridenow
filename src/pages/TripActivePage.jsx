import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, Star, ChevronDown } from 'lucide-react'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { reviewsDB } from '../lib/supabase'

const STEPS = [
  { id: 'searching', label: 'Buscando conductor...', icon: '🔍', color: '#f59e0b' },
  { id: 'confirmed', label: 'Conductor en camino', icon: '🚗', color: '#3b82f6' },
  { id: 'arrived', label: 'Conductor llegó al punto', icon: '📍', color: '#8b5cf6' },
  { id: 'inprogress', label: 'En camino al destino', icon: '🛣️', color: '#2563eb' },
  { id: 'finished', label: '¡Llegaste a tu destino!', icon: '🎉', color: '#22c55e' },
]

export default function TripActivePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useApp()
  const trip = location.state?.trip || {
    driver: 'Carlos M.',
    from: 'Cuba',
    to: 'UTP',
    time: '06:30 AM',
    price: 3000,
    rating: 5.0,
    vehicle: 'Chevrolet Spark GT 2021',
    plate: 'ABC-123',
  }

  const [stepIdx, setStepIdx] = useState(0)
  const [eta, setEta] = useState(6)

  // Simula el progreso del viaje en vivo
  useEffect(() => {
    if (stepIdx >= STEPS.length - 1) return
    const timer = setTimeout(() => {
      setStepIdx(i => i + 1)
      if (stepIdx < 2) setEta(e => Math.max(0, e - 2))
    }, 3500)
    return () => clearTimeout(timer)
  }, [stepIdx])

  useEffect(() => {
    if (eta > 0 && stepIdx === 1) {
      const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 5000)
      return () => clearInterval(t)
    }
  }, [stepIdx, eta])

  const currentStep = STEPS[stepIdx]
  const isFinished = stepIdx === STEPS.length - 1

  if (isFinished) {
    return <RatingScreen trip={trip} user={user} onDone={() => navigate('/home')} />
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {/* Mapa simulado */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #dbeafe 0%, #e0e7ff 50%, #fce7f3 100%)',
        minHeight: 320,
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          {[...Array(8)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="100%" y2={i * 50} stroke="#94a3b8" strokeWidth="1" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="100%" stroke="#94a3b8" strokeWidth="1" />
          ))}
          <path d="M 60 300 Q 200 180 350 80" stroke="#2563eb" strokeWidth="4" fill="none" strokeDasharray="12,6" strokeLinecap="round" />
        </svg>

        {/* Marcador destino */}
        <div style={{ position: 'absolute', top: 60, right: 80, animation: 'bounce 1s ease-in-out infinite' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#2563eb', borderRadius: '50% 50% 50% 0', width: 36, height: 36, transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
              <MapPin size={18} color="#fff" style={{ transform: 'rotate(45deg)' }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginTop: 4, background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: 8 }}>{trip.to}</div>
          </div>
        </div>

        {/* Marcador conductor */}
        <div style={{
          position: 'absolute',
          left: stepIdx >= 2 ? '45%' : stepIdx === 1 ? '30%' : '15%',
          bottom: stepIdx >= 2 ? '55%' : stepIdx === 1 ? '40%' : '20%',
          transition: 'all 2s ease',
          animation: stepIdx > 0 ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            border: '3px solid #2563eb',
          }}>🚗</div>
        </div>

        {/* Status overlay top */}
        <div style={{
          position: 'absolute', top: 20, left: 20, right: 20,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          borderRadius: 16, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: 24 }}>{currentStep.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: currentStep.color }}>{currentStep.label}</p>
            {stepIdx < 3 && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>ETA: {eta} min</p>}
          </div>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: currentStep.color, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{
        background: '#fff', borderRadius: '28px 28px 0 0',
        padding: '20px 20px 32px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: '#e5e7eb', margin: '0 auto 20px' }} />

        {/* Conductor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar name={trip.driver} size={52} online />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{trip.driver}</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{trip.vehicle} · {trip.plate}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>5.0</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#eff6ff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Phone size={18} color="#2563eb" />
            </button>
            <button style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#fdf2f8', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageCircle size={18} color="#db2777" />
            </button>
          </div>
        </div>

        {/* Ruta */}
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ width: 2, height: 16, background: '#e5e7eb' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{trip.from}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 8 }}>{trip.to}</p>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>${(trip.price || 0).toLocaleString()}</span>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 2 ? 1 : 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= stepIdx ? s.color : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, transition: 'all 0.4s ease',
                boxShadow: i <= stepIdx ? `0 0 0 3px ${s.color}33` : 'none',
                flexShrink: 0,
              }}>
                {i < stepIdx ? '✓' : s.icon}
              </div>
              {i < STEPS.length - 2 && (
                <div style={{ flex: 1, height: 2, background: i < stepIdx ? '#2563eb' : '#e5e7eb', transition: 'background 0.4s ease', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </div>

        <Button fullWidth variant="danger" size="md" onClick={() => navigate('/home')}>
          Cancelar viaje
        </Button>
      </div>
    </div>
  )
}

function RatingScreen({ trip, user, onDone }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (trip?.id && user?.id && trip?.driver_id) {
        await reviewsDB.create({
          trip_id: trip.id,
          reviewer_id: user.id,
          reviewed_id: trip.driver_id,
          rating: rating,
          comment: comment || null,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setSubmitted(true)
      setTimeout(onDone, 1800)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 100%)', padding: 32 }}>
        <div style={{ fontSize: 80, animation: 'bounce 0.6s ease', marginBottom: 20 }}>🎉</div>
        <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>¡Gracias por tu calificación!</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center' }}>Guardado en Supabase</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', padding: '52px 24px 36px', borderRadius: '0 0 32px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>¡Llegaste!</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>Viaje completado exitosamente</p>
      </div>

      <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center' }}>
          <Avatar name={trip.driver} size={64} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{trip.driver}</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{trip.from} → {trip.to}</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#2563eb', marginTop: 8 }}>${(trip.price || 0).toLocaleString()} COP</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>¿Cómo fue tu experiencia?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.15s',
                transform: rating >= s ? 'scale(1.15)' : 'scale(1)',
              }}>
                <Star size={36} fill={rating >= s ? '#f59e0b' : 'none'} color={rating >= s ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', height: 20 }}>
            {rating === 5 ? '¡Excelente! 🌟' : rating >= 4 ? '¡Muy bueno!' : rating >= 3 ? 'Regular' : 'Malo'}
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Comentario (opcional)</p>
          <textarea
            placeholder="¿Algo que quieras comentar sobre el viaje?"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            style={{
              width: '100%', border: '2px solid #e5e7eb', borderRadius: 12,
              padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
              color: '#374151', resize: 'none', outline: 'none',
              background: '#f9fafb', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
          Enviar calificación
        </Button>
        <button type="button" onClick={onDone} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Omitir
        </button>
      </div>
    </div>
  )
}
