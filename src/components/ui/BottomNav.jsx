import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Clock, User } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const studentItems = [
  { icon: Home,   label: 'Inicio',    path: '/home' },
  { icon: Search, label: 'Buscar',    path: '/search' },
  { icon: Clock,  label: 'Historial', path: '/history' },
  { icon: User,   label: 'Perfil',    path: '/profile' },
]

const driverItems = [
  { icon: Home,   label: 'Inicio',    path: '/home' },
  { icon: Search, label: 'Viajes',    path: '/trips' },
  { icon: Clock,  label: 'Historial', path: '/history' },
  { icon: User,   label: 'Perfil',    path: '/profile' },
]

export default function BottomNav() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const items = profile?.role === 'driver' ? driverItems : studentItems

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#fff',
      borderTop: '1px solid #f3f4f6',
      display: 'flex',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '10px 0 8px',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10,
              background: active ? '#eff6ff' : 'transparent',
              transition: 'all 0.2s ease',
            }}>
              <Icon size={20} color={active ? '#2563eb' : '#9ca3af'} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? '#2563eb' : '#9ca3af',
              transition: 'color 0.2s',
              letterSpacing: '-0.01em'
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
