import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Star, MapPin, RefreshCw } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { tripsDB, requestsDB } from '../lib/supabase'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user, profile } = useApp()
  const isDriver = profile?.role === 'driver'

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadHistory = async () => {
      try {
        if (isDriver) {
          const { data } = await tripsDB.getByDriver(user.id)
          setHistory(data || [])
        } else {
          const { data } = await requestsDB.getByStudent(user.id)
          setHistory(data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [user, isDriver])

  const totalAmount = history.reduce((sum, item) => {
    const price = isDriver ? item.price : (item.trip?.price || 0)
    return sum + (price || 0)
  }, 0)

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        padding: '52px 20px 28px', borderRadius: '0 0 28px 28px',
      }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Historial de viajes</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
          {isDriver ? 'Tus rutas publicadas' : 'Tus solicitudes y viajes'}
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            { label: 'Viajes', val: history.length },
            { label: isDriver ? 'Generado' : 'Invertido', val: `$${totalAmount.toLocaleString()}` },
            { label: 'Rating', val: '5.0 ⭐' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{s.val}</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>Cargando historial...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Aún no tienes viajes registrados</p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Tus viajes completados aparecerán aquí</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(item => {
              const from = isDriver ? item.origin : (item.trip?.origin || 'Origen')
              const to = isDriver ? item.destination : (item.trip?.destination || 'Destino')
              const price = isDriver ? item.price : (item.trip?.price || 0)
              const name = isDriver ? 'Viaje Conductor' : (item.trip?.driver?.full_name || 'Conductor')
              const status = item.status || 'available'

              return (
                <div key={item.id} style={{
                  background: '#fff', borderRadius: 20, padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <Avatar name={name} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{name}</p>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>
                          ${(price || 0).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{new Date(item.created_at || Date.now()).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                      <div style={{ width: 2, height: 14, background: '#e5e7eb' }} />
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{from}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 5 }}>{to}</p>
                    </div>
                    <Badge color={status === 'accepted' || status === 'completed' || status === 'available' ? 'green' : 'red'}>
                      {status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
