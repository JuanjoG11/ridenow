import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, MapPin, Star, Car, Shield, ChevronRight, LogOut, GraduationCap, Edit3 } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, vehicle, logout } = useApp()

  const name     = profile?.full_name || user?.user_metadata?.full_name || 'Usuario'
  const isDriver = profile?.role === 'driver'

  const handleLogout = async () => {
    await logout()
    navigate('/welcome', { replace: true })
  }

  const menuItems = [
    ...(isDriver ? [{ icon: Car, label: 'Mi vehículo (' + (vehicle?.brand || 'Registrar') + ')', path: '/driver-setup', color: '#db2777' }] : []),
    { icon: GraduationCap, label: 'Cambiar rol (' + (isDriver ? 'Conductor' : 'Estudiante') + ')', path: '/role-select', color: '#059669' },
    { icon: Star,          label: 'Historial y calificaciones', path: '/history', color: '#f59e0b' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 55%, #7c3aed 100%)',
        padding: '52px 20px 64px', borderRadius: '0 0 40px 40px',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(236,72,153,0.12)' }} />

        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <Avatar name={name} size={84} />
        </div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{user?.email}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <Badge color="blue" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
            {isDriver ? '🚗 Conductor' : '🎒 Estudiante'}
          </Badge>
          <Badge color="blue" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
            <Shield size={10} /> Supabase Auth
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div style={{ margin: '-24px 20px 0', background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', position: 'relative', zIndex: 10 }}>
        {[
          { val: 'Activo', label: 'Estado' },
          { val: '5.0 ⭐', label: 'Rating' },
          { val: profile?.university?.split(' ').slice(-1)[0] || 'UTP', label: 'Universidad' },
        ].map((s, i) => (
          <div key={s.label} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{s.val}</p>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ margin: '20px 20px 0', background: '#fff', borderRadius: 20, padding: '4px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        {[
          { icon: Phone,        label: 'Celular',      val: profile?.phone || 'Sin registrar' },
          { icon: MapPin,       label: 'Barrio / Zona',val: profile?.neighborhood || 'Sin registrar' },
          { icon: GraduationCap,label: 'Universidad',  val: profile?.university || 'Areandina' },
          ...(isDriver && vehicle ? [{ icon: Car, label: 'Vehículo', val: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` }] : []),
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={17} color="#2563eb" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 1 }}>{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Menú */}
      <div style={{ margin: '16px 20px 0', background: '#fff', borderRadius: 20, padding: '4px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        {menuItems.map((item, i) => (
          <button key={item.label} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            borderBottom: i < menuItems.length - 1 ? '1px solid #f9fafb' : 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={17} color={item.color} />
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#374151' }}>{item.label}</span>
            <ChevronRight size={16} color="#d1d5db" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div style={{ margin: '16px 20px 0' }}>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px', borderRadius: 16, background: '#fff5f5', border: '1.5px solid #fee2e2',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#dc2626', transition: 'all 0.2s',
        }}>
          <LogOut size={17} /> Cerrar sesión
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', margin: '16px 0', letterSpacing: '0.05em' }}>
        RideNow · Pereira, Colombia
      </p>

      <BottomNav />
    </div>
  )
}
