import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Star, ArrowLeft, Users } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { tripsDB } from '../lib/supabase'

export default function SearchPage() {
  const navigate = useNavigate()
  const [trips, setTrips]       = useState([])
  const [query, setQuery]       = useState('')
  const [sortBy, setSortBy]     = useState('time')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    tripsDB.getAvailable().then(({ data }) => {
      setTrips(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = trips.filter(t => {
    const q = query.toLowerCase()
    return !q || t.origin?.toLowerCase().includes(q) || t.destination?.toLowerCase().includes(q) || t.profiles?.full_name?.toLowerCase().includes(q)
  }).sort((a, b) => {
    if (sortBy === 'price')  return a.price - b.price
    if (sortBy === 'seats')  return b.available_seats - a.available_seats
    return (a.departure_time || '').localeCompare(b.departure_time || '')
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', padding: '52px 20px 24px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/home')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Buscar viaje</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 14, padding: '0 16px', height: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <Search size={18} color="#9ca3af" />
          <input
            placeholder="Origen, destino o conductor..."
            value={query} onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#111827', fontFamily: 'inherit', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { label: '🕐 Horario', val: 'time'  },
          { label: '💰 Precio',  val: 'price' },
          { label: '👤 Asientos',val: 'seats' },
        ].map(f => (
          <button key={f.val} onClick={() => setSortBy(f.val)} style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: 20,
            border: `2px solid ${sortBy === f.val ? '#2563eb' : '#e5e7eb'}`,
            background: sortBy === f.val ? '#2563eb' : '#fff',
            color: sortBy === f.val ? '#fff' : '#6b7280',
            fontSize: 13, fontWeight: sortBy === f.val ? 700 : 500,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Resultados */}
      <div style={{ padding: '16px 20px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
            <p>Buscando viajes...</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 12, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {filtered.length} viaje{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(trip => (
                <TripCard key={trip.id} trip={trip} onClick={() => navigate(`/trip/${trip.id}`, { state: { trip } })} />
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Sin resultados</p>
                  <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 6 }}>Intenta con otro origen o destino</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

function TripCard({ trip, onClick }) {
  const driverName = trip.profiles?.full_name || 'Conductor'
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 20, padding: '18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer',
      border: '1px solid #f3f4f6', transition: 'transform 0.15s ease',
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={driverName} size={48} online />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{driverName}</p>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>${(trip.price || 0).toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 10, background: '#f8fafc', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <div style={{ width: 2, height: 18, background: '#e5e7eb' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{trip.origin}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 6 }}>{trip.destination}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge color="blue"><Clock size={10} /> {trip.departure_time}</Badge>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>{trip.available_seats} asientos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
