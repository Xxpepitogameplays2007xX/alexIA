'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Mail, Lock, ArrowRight, X, CheckCircle, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react'
import ParticlesBackground from '../components/ParticlesBackground'

// Componente de notificación personalizada (reutilizable)
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  isVisible: boolean
  onClose: () => void
}

const Notification = ({ type, message, isVisible, onClose }: NotificationProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <X className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  }

  const colors = {
    success: 'border-emerald-400/30 bg-emerald-400/10',
    error: 'border-red-400/30 bg-red-400/10',
    warning: 'border-amber-400/30 bg-amber-400/10',
    info: 'border-blue-400/30 bg-blue-400/10'
  }

  const titles = {
    success: '¡Éxito!',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[90vw] sm:w-auto sm:min-w-[320px] sm:max-w-md"
        >
          <div className={`backdrop-blur-xl ${colors[type]} border rounded-2xl p-4 shadow-2xl`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {icons[type]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm mb-1">{titles[type]}</h4>
                <p className="text-white/80 text-sm">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    isVisible: boolean
  }>({
    type: 'info',
    message: '',
    isVisible: false
  })
  const router = useRouter()

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }))
    }, 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones previas
    if (!email.trim()) {
      showNotification('warning', 'Por favor ingresa tu correo electrónico')
      return
    }

    if (!password.trim()) {
      showNotification('warning', 'Por favor ingresa tu contraseña')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        // Manejo de errores específicos de Supabase
        if (error.message.includes('Invalid login credentials')) {
          showNotification('error', 'Credenciales inválidas. Verifica tu correo y contraseña.')
        } else if (error.message.includes('Email not confirmed')) {
          showNotification('warning', 'Tu correo no ha sido confirmado. Revisa tu bandeja de entrada.')
        } else {
          showNotification('error', `Error al iniciar sesión: ${error.message}`)
        }
        setIsLoading(false)
        return
      }

      // Login exitoso
      if (data?.user) {
        showNotification('success', '¡Inicio de sesión exitoso! Redirigiendo...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      showNotification('error', 'Error inesperado al iniciar sesión. Intenta de nuevo.')
      setIsLoading(false)
    }
  }

  // Manejar tecla Enter para submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin(e)
    }
  }

  return (
    <>
      {/* Sistema de notificaciones */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Fondo de partículas */}
        <div className="absolute inset-0">
          <ParticlesBackground />
        </div>

        {/* Contenedor principal responsivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] lg:max-w-md relative z-10"
        >
          {/* Logo y título */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] mb-3 sm:mb-4 shadow-lg shadow-blue-500/20"
            >
              <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
            >
              LexIA Assistant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-[#64748B] text-sm sm:text-base"
            >
              Asistente Jurídico Inteligente
            </motion.p>
          </div>

          {/* Card del formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Campo de email */}
              <div>
                <label 
                  htmlFor="email"
                  className="block text-[#CBD5E1] text-sm font-medium mb-2"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Campo de contraseña con toggle de visibilidad */}
              <div>
                <label 
                  htmlFor="password"
                  className="block text-[#CBD5E1] text-sm font-medium mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#CBD5E1] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de inicio de sesión */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Link para registrarse */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-[#64748B] text-xs sm:text-sm">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/singup"
                  className="text-[#D4A017] hover:text-[#F59E0B] transition-colors font-medium inline-flex items-center gap-1"
                >
                  Regístrate
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-center mt-4 sm:mt-6 text-[#64748B] text-[10px] sm:text-xs px-4"
          >
            Protegido con encriptación de grado jurídico
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}