import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, authHelpers, profilesDB, vehiclesDB } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar perfil y vehículo desde Supabase
  const loadUserData = async (currentUser) => {
    if (!currentUser) {
      setUser(null)
      setProfile(null)
      setVehicle(null)
      setLoading(false)
      return
    }

    setUser(currentUser)
    try {
      const { data: prof } = await profilesDB.get(currentUser.id)
      if (prof) {
        setProfile(prof)
        if (prof.role === 'driver') {
          const { data: veh } = await vehiclesDB.getByDriver(currentUser.id)
          setVehicle(veh || null)
        }
      } else {
        // Si no tiene perfil aún, crear el básico
        const newProf = {
          user_id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || '',
          phone: currentUser.user_metadata?.phone || '',
          university: currentUser.user_metadata?.university || '',
        }
        const { data: created } = await profilesDB.upsert(newProf)
        setProfile(created || newProf)
      }
    } catch (err) {
      console.error('Error cargando perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setLoading(false)
      }
    })

    // 2. Suscribirse a cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setVehicle(null)
        setLoading(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const updateProfile = async (data) => {
    if (!user) return null
    try {
      const { data: updated, error } = await profilesDB.upsert({
        user_id: user.id,
        ...data,
      })
      if (!error && updated) {
        setProfile(prev => ({ ...prev, ...updated }))
        return updated
      }
    } catch (err) {
      console.error('Error actualizando perfil:', err)
    }
    // Optimistic update
    setProfile(prev => ({ ...prev, ...data }))
    return null
  }

  const updateVehicle = async (vehData) => {
    if (!user) return null
    try {
      const { data: saved, error } = await vehiclesDB.upsert({
        driver_id: user.id,
        ...vehData,
      })
      if (!error && saved) {
        setVehicle(saved)
        return saved
      }
    } catch (err) {
      console.error('Error guardando vehículo:', err)
    }
    return null
  }

  const login = async ({ email, password }) => {
    const res = await authHelpers.signIn({ email, password })
    if (res.error) return res
    if (res.user) {
      await loadUserData(res.user)
    }
    return res
  }

  const register = async ({ email, password, fullName, phone, university }) => {
    const res = await authHelpers.signUp({ email, password, fullName, phone, university })
    if (res.error) return res
    if (res.user) {
      await loadUserData(res.user)
    }
    return res
  }

  const logout = async () => {
    await authHelpers.signOut()
    setUser(null)
    setProfile(null)
    setVehicle(null)
  }

  return (
    <AppContext.Provider value={{
      user,
      profile,
      vehicle,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateVehicle,
      refreshUser: () => user && loadUserData(user),
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
