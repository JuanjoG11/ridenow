import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, ChevronRight, Bell, Shield, RefreshCw } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { tripsDB, reviewsDB } from '../lib/supabase'

export default function HomePage() {
  const navigate = useNavigate()
  const { profile, user } = useApp()
  const isDriver  = profile?.role === 'driver'
  const name      = profile?.full_name || user?.user_metadata?.full_name || 'Estudiante'
  const firstName = name.split(' ')[0]

  const [trips, setTrips]       = useState([])
  const [stats, setStats]       = useState({ count: 0, avg: '5.0' })
  const [loadingT, setLoadingT] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const { data } = await tripsDB.getAvailable()
      setTrips(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingT(false)
      setRefreshing(false)
    }

    if (user) {
      try {
        const { avg, count } = await reviewsDB.getAvgRating(user.id)
        setStats({ count, avg: avg || '5.0' })
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? '¡Buenos días' : hour < 18 ? '¡Buenas tardes' : '¡Buenas noches'

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 55%, #7c3aed 100%)',
        padding: '52px 20px 64px', borderRadius: '0 0 36px 36px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(236,72,153,0.12)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={name} size={44} online />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>{greeting},</p>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>{firstName} 👋</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRefresh}
              title="Refrescar viajes"
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <RefreshCw size={18} color="#fff" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={20} color="#fff" />
            </button>
          </div>
        </div>

        <div onClick={() => navigate(isDriver ? '/trips' : '/search')} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
        }}>
          <Search size={20} color="rgba(255,255,255,0.7)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {isDriver ? 'Ver solicitudes de viaje...' : '¿A dónde vas hoy?'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '20px 20px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { icon: '🚗', label: 'Viajes',   val: stats.count || '0' },
          { icon: '⭐', label: 'Rating',   val: stats.avg   || '5.0' },
          { icon: '🌿', label: 'CO₂',      val: `${((stats.count || 1) * 1.2).toFixed(1)}kg` },
          { icon: '💰', label: isDriver ? 'Ganado' : 'Ahorrado', val: `$${((stats.count || 1) * 3000).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexShrink: 0, minWidth: 80 }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Quick actions */}
        {!isDriver ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <QuickAction icon="🔍" title="Buscar viaje"  desc="Encuentra tu ruta"     color="#2563eb" bg="#eff6ff" onClick={() => navigate('/search')} />
            <QuickAction icon="👥" title="Compartir"     desc="Viaje grupal"          color="#db2777" bg="#fdf2f8" onClick={() => navigate('/search?shared=true')} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <QuickAction icon="🚦" title="Publicar viaje" desc="Ofrece tu ruta"       color="#2563eb" bg="#eff6ff" onClick={() => navigate('/trips/new')} />
            <QuickAction icon="📋" title="Solicitudes"    desc="Ver peticiones"       color="#db2777" bg="#fdf2f8" onClick={() => navigate('/trips')} />
          </div>
        )}

        {/* Viajes disponibles (solo estudiante) */}
        {!isDriver && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Viajes disponibles</h3>
              <button onClick={() => navigate('/search')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontFamily: 'inherit' }}>
                Ver todos <ChevronRight size={14} />
              </button>
            </div>

            {loadingT ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>Cargando viajes en tiempo real...
              </div>
            ) : trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>😴</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No hay viajes disponibles aún</p>
                <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Los conductores publicarán pronto</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trips.slice(0, 4).map(t => (
                  <TripCard key={t.id} trip={t} onClick={() => navigate(`/trip/${t.id}`, { state: { trip: t } })} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Banner seguridad */}
        <div style={{ marginTop: 20, background: 'linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%)', borderRadius: 20, padding: '18px 20px', border: '1px solid #e0e7ff', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', marginBottom: 3 }}>Red universitaria verificada</p>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Todos los viajes están respaldados por Supabase en la nube.</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function QuickAction({ icon, title, desc, color, bg, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: bg, borderRadius: 18, padding: '18px 16px',
      border: `1.5px solid ${color}22`, display: 'flex', flexDirection: 'column', gap: 8,
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s ease',
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{title}</p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{desc}</p>
      </div>
    </button>
  )
}

function TripCard({ trip, onClick }) {
  const driverName = trip.profiles?.full_name || 'Conductor'
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 18, padding: '16px 18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer',
      border: '1px solid #f3f4f6', transition: 'transform 0.15s ease', display: 'flex', alignItems: 'center', gap: 14,
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Avatar name={driverName} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{driverName}</p>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>${(trip.price || 0).toLocaleString()}</span>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>📍 {trip.origin} → {trip.destination}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <Badge color="blue"><Clock size={10} /> {trip.departure_time}</Badge>
          <Badge color="gray">👤 {trip.available_seats || 3} asientos</Badge>
        </div>
      </div>
    </div>
  )
}
