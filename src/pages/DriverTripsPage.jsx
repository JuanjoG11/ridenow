import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Clock, Users, ArrowLeft, Check, X, RefreshCw } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { requestsDB, tripsDB } from '../lib/supabase'

export default function DriverTripsPage() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [requests, setRequests] = useState([])
  const [myTrips, setMyTrips]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDriverData = async () => {
    if (!user) return
    try {
      const [tripsRes, reqsRes] = await Promise.all([
        tripsDB.getByDriver(user.id),
        requestsDB.getByDriver(user.id),
      ])
      setMyTrips(tripsRes.data || [])
      setRequests(reqsRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDriverData()
  }, [user])

  const accept = async (id) => {
    await requestsDB.updateStatus(id, 'accepted')
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r))
  }

  const reject = async (id) => {
    await requestsDB.updateStatus(id, 'rejected')
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
  }

  const pendingReqs = requests.filter(r => r.status === 'pending')
  const acceptedReqs = requests.filter(r => r.status === 'accepted')

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{
        background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
        padding: '52px 20px 24px', borderRadius: '0 0 28px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Panel Conductor</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
            {pendingReqs.length} solicitudes pendientes
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadDriverData() }}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <RefreshCw size={18} color="#fff" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Botón Publicar viaje */}
        <button
          onClick={() => navigate('/trips/new')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%)',
            border: '2px dashed #bfdbfe', borderRadius: 18, padding: '16px 18px',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>Publicar nuevo viaje</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Ofrece tu ruta a otros estudiantes</p>
          </div>
        </button>

        {/* Mis viajes publicados */}
        {myTrips.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              Mis viajes activos ({myTrips.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTrips.map(t => (
                <div key={t.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>📍 {t.origin} → {t.destination}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>${(t.price || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <Badge color="blue"><Clock size={10} /> {t.departure_time}</Badge>
                    <Badge color="gray">👤 {t.available_seats} asientos</Badge>
                    <Badge color={t.status === 'available' ? 'green' : 'gray'}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solicitudes pendientes */}
        {pendingReqs.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              Solicitudes pendientes ({pendingReqs.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingReqs.map(req => {
                const sName = req.student?.full_name || 'Estudiante'
                return (
                  <div key={req.id} style={{ background: '#fff', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <Avatar name={sName} size={48} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{sName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 12, color: '#f59e0b' }}>★ 5.0</span>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>· {req.student?.university || 'Universitario'}</span>
                        </div>
                      </div>
                      <Badge color="blue">{req.payment || 'Efectivo'}</Badge>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                        <div style={{ width: 2, height: 14, background: '#e5e7eb' }} />
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{req.trip?.origin || 'Origen'}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 5 }}>{req.trip?.destination || 'Destino'}</p>
                      </div>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{req.trip?.departure_time}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button onClick={() => reject(req.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '12px', borderRadius: 12, border: '2px solid #fee2e2',
                        background: '#fff5f5', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 13, fontWeight: 700, color: '#dc2626', transition: 'all 0.2s',
                      }}>
                        <X size={16} /> Rechazar
                      </button>
                      <button onClick={() => accept(req.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '12px', borderRadius: 12, border: 'none',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 13, fontWeight: 700, color: '#fff', transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                      }}>
                        <Check size={16} /> Aceptar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Confirmados */}
        {acceptedReqs.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              Pasajeros confirmados ({acceptedReqs.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {acceptedReqs.map(req => {
                const sName = req.student?.full_name || 'Estudiante'
                return (
                  <div key={req.id} style={{
                    background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                    borderRadius: 16, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <Avatar name={sName} size={40} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>{sName}</p>
                      <p style={{ fontSize: 12, color: '#16a34a', marginTop: 1 }}>{req.trip?.origin} → {req.trip?.destination}</p>
                    </div>
                    <Badge color="green">✓ Confirmado</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {myTrips.length === 0 && requests.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Sin actividad aún</p>
            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 6 }}>Publica un viaje para recibir pasajeros</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
