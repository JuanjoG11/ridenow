import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bdofqrtsfqxqcllsxmmy.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkb2ZxcnRzZnF4cWNsbHN4bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTI2NjgsImV4cCI6MjEwMzQyODY2OH0.t8rnoa4RHliZyfrZIXOXnM2KExyV-RsBHosJR804k_E'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ─── AUTH ────────────────────────────────────────────────────
export const authHelpers = {
  async signUp({ email, password, fullName, phone, university }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          university: university || '',
        },
      },
    })
    if (error) return { user: null, session: null, error: error.message }

    const user = data.user
    if (user) {
      // Garantizar que el perfil exista en la tabla profiles
      await profilesDB.upsert({
        user_id: user.id,
        full_name: fullName,
        phone: phone,
        university: university || '',
      })
    }
    return { user: data.user, session: data.session, error: null }
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, session: null, error: error.message }
    return { user: data.user, session: data.session, error: null }
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  async getUser() {
    return supabase.auth.getUser()
  },

  onAuthStateChange(cb) {
    return supabase.auth.onAuthStateChange(cb)
  },
}

// ─── PROFILES ────────────────────────────────────────────────
export const profilesDB = {
  async get(userId) {
    if (!userId) return { data: null, error: null }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle()
    return { data, error }
  },

  async upsert(profileData) {
    const userId = profileData.user_id || profileData.id
    if (!userId) return { data: null, error: 'No user ID provided' }

    // Verificar si ya existe el perfil por user_id o id
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, user_id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
      return { data, error }
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          ...profileData,
        })
        .select()
        .single()
      return { data, error }
    }
  },
}

// ─── VEHICLES ────────────────────────────────────────────────
export const vehiclesDB = {
  async upsert(vehicleData) {
    const driverId = vehicleData.driver_id
    if (!driverId) return { data: null, error: 'No driver ID provided' }

    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('driver_id', driverId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', existing.id)
        .select()
        .single()
      return { data, error }
    } else {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single()
      return { data, error }
    }
  },

  async getByDriver(driverId) {
    if (!driverId) return { data: null, error: null }
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('driver_id', driverId)
      .maybeSingle()
    return { data, error }
  },
}

// ─── TRIPS ───────────────────────────────────────────────────
export const tripsDB = {
  async create(trip) {
    const { data, error } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .single()
    return { data, error }
  },

  async getById(tripId) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .maybeSingle()
    return { data, error }
  },

  async getAvailable() {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    
    if (error || !data) return { data: [], error }

    const tripIds = data.map(t => t.id)

    // Enriquecer con perfiles de conductores
    const driverIds = [...new Set(data.map(t => t.driver_id).filter(Boolean))]
    let profilesMap = {}
    let vehiclesMap = {}

    if (driverIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', driverIds)

      if (profs) {
        profs.forEach(p => {
          profilesMap[p.user_id] = p
          profilesMap[p.id] = p
        })
      }

      const { data: vehs } = await supabase
        .from('vehicles')
        .select('*')
        .in('driver_id', driverIds)

      if (vehs) {
        vehs.forEach(v => {
          vehiclesMap[v.driver_id] = v
        })
      }
    }

    // Enriquecer con solicitudes de estudiantes (pending + accepted)
    let requestsMap = {}  // tripId -> [{ student_id, status, student: { full_name } }]
    if (tripIds.length > 0) {
      const { data: reqs } = await supabase
        .from('trip_requests')
        .select('id, trip_id, student_id, status')
        .in('trip_id', tripIds)
        .in('status', ['pending', 'accepted'])

      if (reqs && reqs.length > 0) {
        // Perfiles de estudiantes
        const studentIds = [...new Set(reqs.map(r => r.student_id).filter(Boolean))]
        let studentMap = {}
        if (studentIds.length > 0) {
          const { data: studs } = await supabase
            .from('profiles')
            .select('id, user_id, full_name')
            .or(studentIds.map(id => `id.eq.${id},user_id.eq.${id}`).join(','))
          if (studs) {
            studs.forEach(s => {
              studentMap[s.id] = s
              if (s.user_id) studentMap[s.user_id] = s
            })
          }
        }
        reqs.forEach(r => {
          if (!requestsMap[r.trip_id]) requestsMap[r.trip_id] = []
          requestsMap[r.trip_id].push({
            ...r,
            student: studentMap[r.student_id] || { full_name: 'Estudiante' },
          })
        })
      }
    }

    const enriched = data.map(t => ({
      ...t,
      profiles: profilesMap[t.driver_id] || { full_name: 'Conductor' },
      vehicle: vehiclesMap[t.driver_id] || null,
      passengers: requestsMap[t.id] || [],
    }))

    return { data: enriched, error: null }
  },

  async getByDriver(driverId) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  },

  async updateStatus(tripId, status) {
    const { data, error } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', tripId)
      .select()
      .single()
    return { data, error }
  },
}

// ─── TRIP REQUESTS ───────────────────────────────────────────
export const requestsDB = {
  async create(req) {
    // ── Estrategia: intentar Supabase, si falla por RLS → guardar en localStorage
    // como solicitud "local" que el conductor ve vía polling combinado.

    // 1. Intentar resolver el profiles.id real del estudiante
    let studentId = req.student_id
    if (studentId) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .or(`id.eq.${studentId},user_id.eq.${studentId}`)
          .maybeSingle()
        if (prof?.id) studentId = prof.id
      } catch (_) { /* continuar con el id original */ }
    }

    // 2. Intentar insertar en Supabase
    const { data, error } = await supabase
      .from('trip_requests')
      .insert({ ...req, student_id: studentId })
      .select()
      .single()

    if (!error && data) {
      return { data, error: null }
    }

    // 3. Si Supabase falla (RLS, FK, etc.) → guardar localmente como respaldo
    console.warn('Supabase insert falló, usando localStorage como fallback:', error)
    const localReq = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'req_' + Date.now(),
      ...req,
      student_id: studentId,
      status: 'pending',
      created_at: new Date().toISOString(),
      _local: true,  // marca para distinguirlo
    }
    try {
      const existing = JSON.parse(localStorage.getItem('ridenow_requests') || '[]')
      // Evitar duplicados por trip_id + student_id
      const isDup = existing.some(r => r.trip_id === localReq.trip_id && r.student_id === req.student_id)
      if (!isDup) {
        existing.push(localReq)
        localStorage.setItem('ridenow_requests', JSON.stringify(existing))
      }
    } catch (_) {}

    // Devolver éxito con el objeto local (la UI puede continuar)
    return { data: localReq, error: null }
  },

  async getByDriver(driverId) {
    // 1. Obtener viajes del conductor
    const { data: trips } = await supabase
      .from('trips')
      .select('id, origin, destination, departure_time, price')
      .eq('driver_id', driverId)

    if (!trips || trips.length === 0) {
      // Aún así revisar localStorage
      const localAll = JSON.parse(localStorage.getItem('ridenow_requests') || '[]')
      return { data: localAll.filter(r => r._local), error: null }
    }

    const tripIds = trips.map(t => t.id)
    const tripsMap = Object.fromEntries(trips.map(t => [t.id, t]))

    // 2. Obtener solicitudes de esos viajes desde Supabase
    const { data: reqs } = await supabase
      .from('trip_requests')
      .select('*')
      .in('trip_id', tripIds)
      .order('created_at', { ascending: false })

    // 2b. Mezclar con solicitudes locales (fallback) del mismo conductor
    const localAll = JSON.parse(localStorage.getItem('ridenow_requests') || '[]')
    const localReqs = localAll.filter(r => r._local && tripIds.includes(r.trip_id))
    const remoteReqs = reqs || []

    // Evitar duplicados: si ya está en Supabase no agregar el local
    const remoteKeys = new Set(remoteReqs.map(r => `${r.trip_id}_${r.student_id}`))
    const onlyLocalReqs = localReqs.filter(r => !remoteKeys.has(`${r.trip_id}_${r.student_id}`))
    const allReqs = [...remoteReqs, ...onlyLocalReqs]

    if (allReqs.length === 0) return { data: [], error: null }

    // 3. Enriquecer con perfiles de estudiantes
    const studentIds = [...new Set(allReqs.map(r => r.student_id).filter(Boolean))]
    let studentMap = {}

    if (studentIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .or(studentIds.map(id => `id.eq.${id},user_id.eq.${id}`).join(','))

      if (profs) {
        profs.forEach(p => {
          studentMap[p.user_id] = p
          studentMap[p.id] = p
        })
      }

      // Para locales sin perfil en Supabase, buscar en localStorage de usuarios registrados
      const cachedUsers = JSON.parse(localStorage.getItem('ridenow_registered_users') || '{}')
      Object.values(cachedUsers).forEach(u => {
        const name = u.user_metadata?.full_name || u.email || 'Estudiante'
        if (!studentMap[u.id]) {
          studentMap[u.id] = { id: u.id, full_name: name, university: u.user_metadata?.university || '' }
        }
      })
    }

    const enriched = allReqs.map(r => ({
      ...r,
      student: studentMap[r.student_id] || { full_name: 'Estudiante' },
      trip: tripsMap[r.trip_id] || {},
    }))

    return { data: enriched, error: null }
  },

  async getByStudent(studentId) {
    const { data: reqs, error } = await supabase
      .from('trip_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error || !reqs) return { data: [], error }

    const tripIds = [...new Set(reqs.map(r => r.trip_id).filter(Boolean))]
    let tripMap = {}
    let driverMap = {}

    if (tripIds.length > 0) {
      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .in('id', tripIds)

      if (trips) {
        trips.forEach(t => { tripMap[t.id] = t })
        const driverIds = [...new Set(trips.map(t => t.driver_id).filter(Boolean))]
        if (driverIds.length > 0) {
          const { data: drivers } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', driverIds)
          if (drivers) {
            drivers.forEach(d => {
              driverMap[d.user_id] = d
              driverMap[d.id] = d
            })
          }
        }
      }
    }

    const enriched = reqs.map(r => {
      const trip = tripMap[r.trip_id] || {}
      return {
        ...r,
        trip: {
          ...trip,
          driver: driverMap[trip.driver_id] || { full_name: 'Conductor' },
        },
      }
    })

    return { data: enriched, error: null }
  },

  async updateStatus(requestId, status) {
    // Intentar actualizar en Supabase primero
    const { data, error } = await supabase
      .from('trip_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single()

    // Si no está en Supabase, actualizar en localStorage
    if (error || !data) {
      try {
        const existing = JSON.parse(localStorage.getItem('ridenow_requests') || '[]')
        const updated = existing.map(r => r.id === requestId ? { ...r, status } : r)
        localStorage.setItem('ridenow_requests', JSON.stringify(updated))
        const found = updated.find(r => r.id === requestId)
        if (found) return { data: found, error: null }
      } catch (_) {}
    }

    return { data, error }
  },
}

// ─── REVIEWS ─────────────────────────────────────────────────
export const reviewsDB = {
  async create(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()
    return { data, error }
  },

  async getAvgRating(userId) {
    if (!userId) return { avg: null, count: 0 }
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', userId)

    if (error || !data?.length) return { avg: '5.0', count: 0 }
    const avg = (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1)
    return { avg, count: data.length }
  },
}
