import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const slides = [
  {
    emoji: '🎓',
    title: 'Solo para\nestudiantes',
    desc: 'Una red cerrada y verificada para universitarios de Pereira.',
    bg: 'linear-gradient(160deg, #1e40af 0%, #2563eb 100%)',
    accent: '#93c5fd',
  },
  {
    emoji: '🛣️',
    title: 'Comparte\ntu ruta',
    desc: 'Encuentra compañeros con horarios similares y divide los costos del viaje.',
    bg: 'linear-gradient(160deg, #7c3aed 0%, #2563eb 100%)',
    accent: '#c4b5fd',
  },
  {
    emoji: '🔒',
    title: 'Viaja\nseguro',
    desc: 'Conductores verificados, seguimiento en tiempo real y calificaciones.',
    bg: 'linear-gradient(160deg, #db2777 0%, #9d174d 100%)',
    accent: '#fbcfe8',
  },
]

export default function WelcomePage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const slide = slides[current]

  const next = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1)
    else navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: slide.bg,
      display: 'flex', flexDirection: 'column',
      transition: 'background 0.5s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decoraciones */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 350, height: 350, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 200, left: -80,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />

      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '52px 24px 0' }}>
        {current < slides.length - 1 && (
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', borderRadius: 20, padding: '6px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Saltar
          </button>
        )}
      </div>

      {/* Contenido principal */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', textAlign: 'center',
        gap: 24,
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: 36,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72,
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 0.4s ease forwards',
          key: current,
        }}>
          {slide.emoji}
        </div>

        <div style={{ animation: 'fadeInUp 0.5s 0.1s ease both' }}>
          <h2 style={{
            fontSize: 38, fontWeight: 900, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            whiteSpace: 'pre-line', marginBottom: 12,
          }}>
            {slide.title}
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.6, maxWidth: 280, margin: '0 auto',
          }}>
            {slide.desc}
          </p>
        </div>
      </div>

      {/* Bottom card */}
      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '32px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 20,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === current ? '#2563eb' : '#e5e7eb',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <Button fullWidth size="lg" onClick={next}>
          {current < slides.length - 1 ? 'Siguiente' : 'Empezar'}
        </Button>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#9ca3af' }}>¿Ya tienes cuenta?{' '}</span>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', color: '#2563eb',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  )
}
