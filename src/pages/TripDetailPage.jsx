import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Star, Shield, Car, Phone, Users, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { tripsDB, requestsDB, profilesDB, vehiclesDB } from '../lib/supabase'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo', icon: '💵', desc: 'Pagas al llegar al destino' },
  { id: 'nequi', label: 'Nequi', icon: '📱', desc: 'Transferencia digital directa' },
  { id: 'bancolombia', label: 'Bancolombia', icon: '🏦', desc: 'Ahorro a la mano / QR' },
]

export default function TripDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useApp()

  const [trip, setTrip] = useState(location.state?.trip || null)
  const [driver, setDriver] = useState(location.state?.trip?.profiles || null)
  const [vehicle, setVehicle] = useState(location.state?.trip?.vehicle || null)
  const [payment, setPayment] = useState('cash')
  const [travelType, setTravelType] = useState('solo')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!trip && id) {
      tripsDB.getById(id).then(async ({ data }) => {
        if (data) {
          setTrip(data)
          const [profRes, vehRes] = await Promise.all([
            profilesDB.get(data.driver_id),
            vehiclesDB.getByDriver(data.driver_id),
          ])
          setDriver(profRes.data || { full_name: 'Conductor' })
          setVehicle(vehRes.data || null)
        }
      })
    }
  }, [id, trip])

  const driverName = driver?.full_name || trip?.profiles?.full_name || 'Conductor'
  const vehicleText = vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.color}` : 'Vehículo particular'
  const vehiclePlate = vehicle?.plate || 'PART-001'
  const origin = trip?.origin || 'Origen'
  const destination = trip?.destination || 'Destino'
  const depTime = trip?.departure_time || '07:00 AM'
  const price = trip?.price || 3000
  const seats = trip?.available_seats || 3

  const handleRequest = async () => {
    if (!user) {
      setError('Debes iniciar sesión para solicitar.')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (trip?.id) {
        await requestsDB.create({
          trip_id: trip.id,
          student_id: user.id,
          travel_type: travelType,
          payment: payment,
          status: 'pending',
        })
      }

      setLoading(false)
      navigate('/trip-active', {
        state: {
          trip: {
            ...trip,
            driver: driverName,
            from: origin,
            to: destination,
            time: depTime,
            price: price,
            vehicle: vehicleText,
            plate: vehiclePlate,
          },
        },
      })
    } catch (err) {
      setLoading(false)
      // Si ya solicitó o error de duplicado, igual permitir ver estado activo
      navigate('/trip-active', {
        state: {
          trip: {
            ...trip,
            driver: driverName,
            from: origin,
            to: destination,
            time: depTime,
            price: price,
            vehicle: vehicleText,
            plate: vehiclePlate,
          },
        },
      })
    }
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          padding: '52px 20px 28px', borderRadius: '0 0 28px 28px',
        }}>
          <button onClick={() => setStep(1)} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', marginBottom: 16,
          }}><ArrowLeft size={20} /></button>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Confirmar viaje</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Revisa los detalles antes de solicitar</p>
        </div>

        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.3s ease' }}>
          {/* Resumen */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Resumen del viaje</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar name={driverName} size={52} online />
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{driverName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>5.0</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>(Conductor verificado)</span>
                </div>
              </div>
            </div>
            {[
              { icon: '📍', label: 'Recogida', val: origin },
              { icon: '🏁', label: 'Destino', val: destination },
              { icon: '🕐', label: 'Hora', val: depTime },
              { icon: '🚗', label: 'Vehículo', val: vehicleText },
              { icon: '🔖', label: 'Placa', val: vehiclePlate },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{row.icon} {row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{row.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>${price.toLocaleString()} COP</span>
            </div>
          </div>

          {/* Pago seleccionado */}
          <div style={{
            background: '#eff6ff', border: '1.5px solid #bfdbfe',
            borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>{PAYMENT_METHODS.find(p => p.id === payment)?.icon}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
                {PAYMENT_METHODS.find(p => p.id === payment)?.label}
              </p>
              <p style={{ fontSize: 12, color: '#60a5fa' }}>
                {PAYMENT_METHODS.find(p => p.id === payment)?.desc}
              </p>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <Button fullWidth size="lg" loading={loading} onClick={handleRequest}>
            ✅ Solicitar viaje en tiempo real
          </Button>
          <button onClick={() => setStep(1)} style={{
            background: 'none', border: 'none', color: '#9ca3af',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', maxWidth: 430, margin: '0 auto', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        padding: '52px 20px 28px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <button onClick={() => navigate(-1)} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', marginBottom: 20,
        }}><ArrowLeft size={20} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={driverName} size={64} online />
          <div>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{driverName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>5.0</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>· Conductor</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge color="blue" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                <Shield size={10} /> Verificado
              </Badge>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Precio</p>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>${price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Ruta */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Ruta del viaje</p>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px #dcfce7' }} />
              <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, #22c55e, #2563eb)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 0 3px #dbeafe' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>Punto de recogida</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 2 }}>{origin}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>Destino</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 2 }}>{destination}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge color="blue"><Clock size={10} /> {depTime}</Badge>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>~20 min</p>
            </div>
          </div>
        </div>

        {/* Vehículo */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Vehículo</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🚗</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{vehicleText}</p>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Placa: <strong>{vehiclePlate}</strong></p>
            </div>
            <Badge color="gray"><Users size={10} /> {seats} pax</Badge>
          </div>
        </div>

        {/* Tipo de viaje */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Tipo de viaje</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { key: 'solo', emoji: '👤', label: 'Individual', desc: 'Solo tú' },
              { key: 'shared', emoji: '👥', label: 'Compartido', desc: 'Con más estudiantes' },
            ].map(t => (
              <button key={t.key} type="button" onClick={() => setTravelType(t.key)} style={{
                padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
                border: `2px solid ${travelType === t.key ? '#2563eb' : '#e5e7eb'}`,
                background: travelType === t.key ? '#eff6ff' : '#f9fafb',
                fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{t.emoji}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: travelType === t.key ? '#1d4ed8' : '#374151' }}>{t.label}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Método de pago */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Método de pago</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAYMENT_METHODS.map(pm => (
              <label key={pm.id} onClick={() => setPayment(pm.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                border: `2px solid ${payment === pm.id ? '#ec4899' : '#e5e7eb'}`,
                background: payment === pm.id ? '#fdf2f8' : '#f9fafb',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 24 }}>{pm.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: payment === pm.id ? '#9d174d' : '#374151' }}>{pm.label}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{pm.desc}</p>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${payment === pm.id ? '#ec4899' : '#d1d5db'}`,
                  background: payment === pm.id ? '#ec4899' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0,
                }}>
                  {payment === pm.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button fullWidth size="lg" onClick={() => setStep(2)}>
          Continuar con la solicitud
        </Button>
      </div>
    </div>
  )
}
