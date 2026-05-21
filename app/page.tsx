'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        // Si ya está logueado → dashboard
        router.push('/dashboard')
      } else {
        // Si no → login
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  return <p style={{ padding: '20px' }}>Cargando...</p>
}