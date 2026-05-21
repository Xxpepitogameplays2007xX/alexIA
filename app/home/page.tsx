'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  email: string
}

export default function HomePage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    const getData = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      setUser(userData.user)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        console.log(error)
      } else {
        setProfiles(data)
      }
    }

    getData()
  }, [router])

  return (
    <div className="container">
      <div className="card">

        <h1 className="title">🏠 Panel del Usuario</h1>

        {user && (
          <p className="subtitle">
            Bienvenido 👋 <br />
            <span className="email">{user.email}</span>
          </p>
        )}

        <h2>Usuarios registrados</h2>

        <ul className="list">
          {profiles.map((p) => (
            <li key={p.id}>{p.email}</li>
          ))}
        </ul>

        <button className="btn" onClick={() => router.push('/dashboard')}>
          🔙 Volver al menú
        </button>

      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f0f0f;
          color: white;
        }

        .card {
          width: 450px;
          padding: 30px;
          background: #1a1a1a;
          border-radius: 16px;
          box-shadow: 0 0 25px rgba(0,0,0,0.6);
          text-align: center;
        }

        .title {
          margin-bottom: 10px;
        }

        .subtitle {
          color: #aaa;
          margin-bottom: 20px;
        }

        .email {
          color: #60a5fa;
        }

        .list {
          text-align: left;
          margin: 15px 0;
          max-height: 200px;
          overflow-y: auto;
        }

        .btn {
          margin-top: 15px;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  )
}