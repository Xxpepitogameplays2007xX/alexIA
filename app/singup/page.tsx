'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Mail, Lock, ArrowRight, ArrowLeft, FileText, Shield, X, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import ParticlesBackground from '../components/ParticlesBackground'

// Componente de notificación personalizada
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
              <p className="text-white text-sm flex-1">{message}</p>
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

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLegal, setShowLegal] = useState(false)
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accepted) {
      showNotification('warning', 'Debes aceptar los términos y condiciones para continuar')
      return
    }

    if (password.length < 6) {
      showNotification('warning', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        showNotification('error', `Error al crear cuenta: ${error.message}`)
        setIsLoading(false)
        return
      }

      const user = data.user

      if (user) {
        const { error: dbError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              email: user.email,
            },
          ])

        if (dbError) {
          showNotification('error', `Error al guardar perfil: ${dbError.message}`)
          setIsLoading(false)
          return
        }

        showNotification('success', '¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      showNotification('error', 'Error inesperado al crear la cuenta')
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Notificación global */}
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
          className="w-full max-w-[440px] lg:max-w-lg relative z-10"
        >
          {/* Logo y título */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] mb-3 sm:mb-4"
            >
              <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
            >
              Crear Cuenta
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-[#64748B] text-sm sm:text-base"
            >
              Únete a LexIA Assistant
            </motion.p>
          </div>

          {/* Card del formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
              {/* Campo de email */}
              <div>
                <label className="block text-[#CBD5E1] text-sm font-medium mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div>
                <label className="block text-[#CBD5E1] text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Términos y Condiciones */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={() => setAccepted(!accepted)}
                    className="mt-1 w-4 h-4 rounded border-[#64748B] bg-white/5 checked:bg-[#2563EB] focus:ring-[#2563EB] focus:ring-2 cursor-pointer"
                    id="terms"
                  />
                  <label htmlFor="terms" className="text-[#CBD5E1] text-xs sm:text-sm cursor-pointer select-none">
                    Acepto el{' '}
                    <button
                      type="button"
                      onClick={() => setShowLegal(!showLegal)}
                      className="text-[#D4A017] hover:text-[#F59E0B] transition-colors font-medium underline inline-flex items-center gap-1"
                    >
                      Aviso Legal y Términos de Uso
                      <motion.span
                        animate={{ rotate: showLegal ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FileText className="w-3 h-3" />
                      </motion.span>
                    </button>
                  </label>
                </div>

                {/* Panel de texto legal expandible */}
                <AnimatePresence>
                  {showLegal && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#0F172A]/50 border border-[#D4A017]/20 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Shield className="w-4 h-4 text-[#D4A017]" />
                          <h3 className="text-[#D4A017] text-xs sm:text-sm font-semibold">
                            Aviso Legal y Términos de Uso
                          </h3>
                        </div>
                        <div className="space-y-2 sm:space-y-3 text-xs leading-relaxed max-h-32 sm:max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-[#94A3B8]">
                            Al registrarse y utilizar esta plataforma, el usuario acepta expresamente 
                            que el sistema tiene como finalidad exclusiva servir como una herramienta 
                            de apoyo para profesionales del derecho, proporcionando asistencia en la 
                            organización de información, análisis preliminar y generación de borradores 
                            de documentos.
                          </p>
                          <p className="text-[#94A3B8]">
                            El usuario reconoce y acepta que todas las decisiones legales, interpretaciones, 
                            estrategias jurídicas, redacción final de documentos y cualquier actuación 
                            profesional derivada del uso de la plataforma son de su entera y exclusiva 
                            responsabilidad.
                          </p>
                          <p className="text-[#94A3B8]">
                            Asimismo, el usuario entiende que el sistema incorpora tecnologías de 
                            inteligencia artificial que pueden generar resultados inexactos, incompletos 
                            o erróneos.
                          </p>
                          <p className="text-[#D4A017] font-medium">
                            El uso del sistema implica la aceptación total de estos términos.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botón de registro */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Link para volver al login */}
            <div className="mt-4 sm:mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#CBD5E1] transition-colors text-xs sm:text-sm group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio de sesión
              </Link>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-center mt-4 sm:mt-6 text-[#64748B] text-[10px] sm:text-xs px-4"
          >
            Al crear una cuenta, aceptas nuestros términos y política de privacidad
          </motion.p>
        </motion.div>

        {/* Estilos para la scrollbar personalizada */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.3);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(212, 160, 23, 0.3);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(212, 160, 23, 0.5);
          }
        `}</style>
      </div>
    </>
  )
}