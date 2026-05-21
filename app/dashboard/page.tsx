'use client'

import DashboardBackground from '../components/DashboardBackground'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, 
  MessageSquare, 
  Users, 
  Clock, 
  FolderOpen, 
  CheckCircle2, 
  AlertCircle,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  LayoutDashboard,
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react'

type Chat = {
  id: string
  title: string
  status: string
}

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
                <h4 className="text-gray-900 font-medium text-sm mb-1">{titles[type]}</h4>
                <p className="text-gray-700 text-sm">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
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

// Componente para el estado de carga
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
      />
      <p className="text-gray-600 text-lg font-medium">Cargando dashboard...</p>
    </motion.div>
  </div>
)

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          showNotification('warning', 'Sesión no encontrada. Redirigiendo al login...')
          setTimeout(() => router.push('/login'), 1500)
          return
        }

        setUser(user)

        const { data: chatsData, error } = await supabase
          .from('chats')
          .select('id, title, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          showNotification('error', 'Error al cargar los chats')
          console.error('Error:', error)
        } else if (chatsData) {
          setChats(chatsData)
        }
      } catch (error) {
        showNotification('error', 'Error inesperado al cargar los datos')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Filtros
  const activos = chats.filter(c =>
    !['resuelto', 'archivado'].includes(c.status)
  )

  const pendientes = chats.filter(c =>
    [
      'pendiente de información',
      'pendiente de documentos',
      'pendiente de revisión',
      'pendiente de firma'
    ].includes(c.status)
  )

  const finalizados = chats.filter(c =>
    ['resuelto', 'archivado'].includes(c.status)
  )

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        showNotification('error', 'Error al cerrar sesión')
      } else {
        showNotification('success', 'Sesión cerrada correctamente')
        setTimeout(() => router.push('/login'), 1000)
      }
    } catch (error) {
      showNotification('error', 'Error inesperado al cerrar sesión')
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('id, title, status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        showNotification('error', 'Error al actualizar los datos')
      } else if (chatsData) {
        setChats(chatsData)
        showNotification('success', 'Datos actualizados correctamente')
      }
    } catch (error) {
      showNotification('error', 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <DashboardBackground />
        {/* Contenedor principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Dashboard
                  </h1>
                  {user && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRefresh}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs sm:text-sm font-medium shadow-lg shadow-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Cards de resumen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            {/* Card Activos */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {activos.length}
                </span>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm sm:text-base">Casos Activos</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">En proceso actual</p>
            </motion.div>

            {/* Card Pendientes */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-amber-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <span className="text-3xl sm:text-4xl font-bold text-amber-600">
                  {pendientes.length}
                </span>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm sm:text-base">Pendientes</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Requieren atención</p>
            </motion.div>

            {/* Card Finalizados */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <span className="text-3xl sm:text-4xl font-bold text-emerald-600">
                  {finalizados.length}
                </span>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm sm:text-base">Finalizados</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Casos completados</p>
            </motion.div>
          </motion.div>

          {/* Listas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            {/* Pendientes */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pendientes</h3>
                <span className="ml-auto text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {pendientes.length}
                </span>
              </div>
              {pendientes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No hay casos pendientes
                </p>
              ) : (
                <div className="space-y-2">
                  {pendientes.map(chat => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/chat/${chat.id}`)}
                    >
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium">{chat.title}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Activos */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Activos</h3>
                <span className="ml-auto text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {activos.length}
                </span>
              </div>
              {activos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No hay casos activos
                </p>
              ) : (
                <div className="space-y-2">
                  {activos.map(chat => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/chat/${chat.id}`)}
                    >
                      <FolderOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium">{chat.title}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/chat')}
              className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Ir al Chat
              <Plus className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/clientes')}
              className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Ver Clientes
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  )
}