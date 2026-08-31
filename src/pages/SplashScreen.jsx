import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { user, profile, loading } = useApp()

  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      if (user && profile?.role) navigate('/home', { replace: true })
      else if (user)             navigate('/role-select', { replace: true })
      else                       navigate('/welcome', { replace: true })
    }, 2000)
    return () => clearTimeout(t)
  }, [loading, user, profile, navigate])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 45%, #7c3aed 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', top: '30%', left: -100, width: 200, height: 200, borderRadius: '50%', background: 'rgba(236,72,153,0.15)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'fadeInUp 0.7s ease forwards' }}>
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)', fontSize: 52,
          animation: 'pulse 2s ease-in-out infinite',
        }}>🚗</div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Ride<span style={{ color: '#f9a8d4' }}>Now</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 }}>Movilidad universitaria</p>
        </div>
      </div>

      <div style={{ marginTop: 60, animation: 'fadeIn 1s 0.8s ease both' }}>
        <div style={{ width: 48, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent, #fff, transparent)', borderRadius: 99, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
        </div>
      </div>

      <p style={{ position: 'absolute', bottom: 32, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Pereira · Colombia
      </p>
    </div>
  )
}
