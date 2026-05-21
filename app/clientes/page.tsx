'use client'

import DashboardBackground from '../components/DashboardBackground'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  UserPlus,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Mail,
  CreditCard,
  Hash
} from 'lucide-react'

type Client = {
  id: string
  name: string
  email: string
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

export default function Clients() {
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    isVisible: boolean
  }>({
    type: 'info',
    message: '',
    isVisible: false
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dpi: '',
    nit: '',
    address: '',
    profession: '',
    notes: '',
  })

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }))
    }, 5000)
  }

  const loadClients = async (value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showNotification('warning', 'Sesión no encontrada')
        return
      }

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .ilike('name', `%${value}%`)
        .order('created_at', { ascending: false })

      if (error) {
        showNotification('error', 'Error al cargar clientes')
        console.error('Error:', error)
      } else if (data) {
        setClients(data)
      }
    } catch (error) {
      showNotification('error', 'Error inesperado al cargar clientes')
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      loadClients(search)
    }, 300)

    return () => clearTimeout(delay)
  }, [search])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // Crear o actualizar cliente
  const saveClient = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showNotification('error', 'Sesión no encontrada')
      return
    }

    if (!form.name.trim()) {
      showNotification('warning', 'El nombre del cliente es requerido')
      return
    }

    setLoading(true)

    try {
      if (editingId) {
        // Actualizar
        const { error } = await supabase
          .from('clients')
          .update(form)
          .eq('id', editingId)

        if (error) {
          showNotification('error', 'Error al actualizar el cliente')
          return
        }
        showNotification('success', 'Cliente actualizado correctamente')
        setEditingId(null)
      } else {
        // Crear
        const { error } = await supabase.from('clients').insert([
          {
            user_id: user.id,
            ...form,
          },
        ])

        if (error) {
          showNotification('error', 'Error al crear el cliente')
          return
        }
        showNotification('success', 'Cliente creado correctamente')
      }

      resetForm()
      loadClients(search)
    } catch (error) {
      showNotification('error', 'Error inesperado al guardar el cliente')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar cliente
  const deleteClient = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)

      if (error) {
        showNotification('error', 'Error al eliminar el cliente')
      } else {
        showNotification('success', 'Cliente eliminado correctamente')
        loadClients(search)
      }
    } catch (error) {
      showNotification('error', 'Error inesperado al eliminar')
    }
  }

  // Editar cliente
  const editClient = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        showNotification('error', 'Error al cargar datos del cliente')
        return
      }

      if (data) {
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dpi: data.dpi || '',
          nit: data.nit || '',
          address: data.address || '',
          profession: data.profession || '',
          notes: data.notes || '',
        })

        setEditingId(id)
        showNotification('info', 'Editando cliente. Modifica los campos y guarda los cambios.')
        
        // Scroll al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      showNotification('error', 'Error al cargar cliente para edición')
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      dpi: '',
      nit: '',
      address: '',
      profession: '',
      notes: '',
    })
    setEditingId(null)
  }

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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Clientes
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    Gestiona tu cartera de clientes
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Menú
              </button>
            </div>
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              {editingId ? (
                <Edit3 className="w-5 h-5 text-blue-600" />
              ) : (
                <UserPlus className="w-5 h-5 text-emerald-600" />
              )}
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="name"
                  placeholder="Nombre completo *"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="dpi"
                  placeholder="DPI"
                  value={form.dpi}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="nit"
                  placeholder="NIT"
                  value={form.nit}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative sm:col-span-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="address"
                  placeholder="Dirección"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="profession"
                  placeholder="Profesión"
                  value={form.profession}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="notes"
                  placeholder="Notas"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Botones de acción */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveClient}
                  disabled={loading}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingId ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Actualizar Cliente
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Crear Cliente
                    </>
                  )}
                </motion.button>

                {editingId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetForm}
                    className="flex-1 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar Edición
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Búsqueda y Lista */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                Lista de Clientes
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {clients.length}
                </span>
              </h2>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No se encontraron clientes</p>
                <p className="text-gray-400 text-sm">
                  {search ? 'Intenta con otro término de búsqueda' : 'Crea tu primer cliente usando el formulario'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 font-medium text-sm truncate">
                          {client.name}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {client.email || 'Sin correo'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => editClient(client.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="hidden sm:inline">Editar</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteClient(client.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}