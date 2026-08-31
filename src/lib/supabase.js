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

    const enriched = data.map(t => ({
      ...t,
      profiles: profilesMap[t.driver_id] || { full_name: 'Conductor' },
      vehicle: vehiclesMap[t.driver_id] || null,
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
    const { data, error } = await supabase
      .from('trip_requests')
      .insert(req)
      .select()
      .single()
    return { data, error }
  },

  async getByDriver(driverId) {
    // 1. Obtener viajes del conductor
    const { data: trips } = await supabase
      .from('trips')
      .select('id, origin, destination, departure_time, price')
      .eq('driver_id', driverId)

    if (!trips || trips.length === 0) return { data: [], error: null }

    const tripIds = trips.map(t => t.id)
    const tripsMap = Object.fromEntries(trips.map(t => [t.id, t]))

    // 2. Obtener solicitudes de esos viajes
    const { data: reqs, error } = await supabase
      .from('trip_requests')
      .select('*')
      .in('trip_id', tripIds)
      .order('created_at', { ascending: false })

    if (error || !reqs) return { data: [], error }

    // 3. Enriquecer con perfiles de estudiantes
    const studentIds = [...new Set(reqs.map(r => r.student_id).filter(Boolean))]
    let studentMap = {}

    if (studentIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds)

      if (profs) {
        profs.forEach(p => {
          studentMap[p.user_id] = p
          studentMap[p.id] = p
        })
      }
    }

    const enriched = reqs.map(r => ({
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
    const { data, error } = await supabase
      .from('trip_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single()
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
