// (Chat) page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import CaseIntelligence from '@/app/components/CaseIntelligence'
import { 
  Send, 
  Paperclip, 
  MessageSquare, 
  Users, 
  Plus,
  ArrowLeft,
  LogOut,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Loader2,
  Menu,
  ChevronLeft
} from 'lucide-react'

type Message = {
  user_message: string
  ai_message: string
}

type Chat = {
  id: string
  title: string
  status: string
  client_id?: string
}

type Client = {
  id: string
  name: string
  email?: string
  dpi?: string
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

export default function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [chatId, setChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Cambiado a false para móvil
  const [isMobile, setIsMobile] = useState(false)

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeClient, setActiveClient] = useState<Client | null>(null)

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    isVisible: boolean
  }>({
    type: 'info',
    message: '',
    isVisible: false
  })

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }))
    }, 5000)
  }

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true) // Siempre abierto en desktop/tablet
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cargar clientes DEL USUARIO ACTUAL
  useEffect(() => {
    const loadClients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          showNotification('warning', 'Sesión no encontrada')
          return
        }

        const { data, error } = await supabase
          .from('clients')
          .select('id, name, email, dpi')
          .eq('user_id', user.id) // 🔥 FILTRAR POR USUARIO
          .order('created_at', { ascending: false })

        if (error) {
          showNotification('error', 'Error al cargar clientes')
        } else if (data) {
          setClients(data)
        }
      } catch (error) {
        showNotification('error', 'Error inesperado al cargar clientes')
      }
    }

    loadClients()
  }, [])

  // Cargar chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          showNotification('warning', 'Sesión no encontrada. Redirigiendo...')
          setTimeout(() => router.push('/login'), 1500)
          return
        }

        const { data, error } = await supabase
          .from('chats')
          .select('id, title, status, client_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          showNotification('error', 'Error al cargar expedientes')
        } else if (data) {
          setChats(data)

          if (data.length > 0 && !chatId) {
            setChatId(data[0].id)
            setActiveChat(data[0])
          }
        }
      } catch (error) {
        showNotification('error', 'Error inesperado al cargar expedientes')
      }
    }

    loadChats()
  }, [router])

  // Cargar mensajes
  useEffect(() => {
    if (!chatId) return

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('user_message, ai_message')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })

        if (error) {
          showNotification('error', 'Error al cargar mensajes')
        } else if (data) {
          if (data.length === 0 && activeClient) {
            setMessages([
              {
                user_message: '',
                ai_message: `Háblame del caso de "${activeClient.name}". Puedes comenzar describiendo los hechos.`
              }
            ])
          } else {
            setMessages(data)
          }
        }
      } catch (error) {
        showNotification('error', 'Error al cargar mensajes')
      }
    }

    loadMessages()
  }, [chatId, activeClient])

  // Cargar cliente activo
  useEffect(() => {
    const loadClient = async () => {
      if (!activeChat?.client_id) return setActiveClient(null)

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', activeChat.client_id)
          .single()

        if (error) {
          showNotification('error', 'Error al cargar datos del cliente')
        } else if (data) {
          setActiveClient(data)
        }
      } catch (error) {
        showNotification('error', 'Error al cargar cliente')
      }
    }

    loadClient()
  }, [activeChat])

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

  const createNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showNotification('error', 'Sesión no encontrada')
      return
    }

    if (!selectedClient) {
      showNotification('warning', 'Selecciona un cliente para crear el expediente')
      return
    }

    try {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            user_id: user.id,
            client_id: selectedClient,
            title: 'Nuevo expediente',
            status: 'en entrevista'
          }
        ])
        .select()
        .single()

      if (error) {
        showNotification('error', 'Error al crear el expediente')
      } else if (newChat) {
        setChats((prev) => [newChat, ...prev])
        setChatId(newChat.id)
        setActiveChat(newChat)
        setMessages([])
        showNotification('success', 'Expediente creado correctamente')
        
        // Solo cerrar sidebar en móvil
        if (isMobile) {
          setSidebarOpen(false)
        }
      }
    } catch (error) {
      showNotification('error', 'Error al crear expediente')
    }
  }

  const switchChat = (chat: Chat) => {
    setChatId(chat.id)
    setActiveChat(chat)
    
    // Solo cerrar sidebar en móvil
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const sendMessage = async () => {
    if (!message && !file) {
      showNotification('warning', 'Escribe un mensaje o adjunta un archivo')
      return
    }
    
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      let fileBase64 = null
      let fileName = null

      if (file) {
        fileName = file.name

        const reader = new FileReader()

        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string
            const base64 = result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
        })

        reader.readAsDataURL(file)
        fileBase64 = await base64Promise
      }

      setMessages((prev) => [
        ...prev,
        {
          user_message: message || '📎 Archivo enviado',
          ai_message: 'Analizando...'
        }
      ])

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          message,
          fileBase64,
          fileName,
          chatId,
          client: activeClient
        })
      })

      if (!res.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await res.json()

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].ai_message = data.reply
        return updated
      })

      setMessage('')
      setFile(null)
    } catch (error) {
      showNotification('error', 'Error al enviar el mensaje')
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].ai_message = 'Error al procesar la solicitud. Intenta de nuevo.'
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex overflow-hidden">
        
        {/* Overlay para móvil cuando sidebar está abierto */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            isMobile 
              ? `fixed z-30 h-full transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'relative' // Siempre visible en desktop/tablet
          } w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-900">Expedientes</h2>
              </div>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
            </div>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createNewChat}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Expediente
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay expedientes</p>
                <p className="text-gray-400 text-xs mt-1">Crea uno nuevo para comenzar</p>
              </div>
            ) : (
              chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ x: 3 }}
                  onClick={() => switchChat(chat)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    chat.id === chatId 
                      ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 flex-shrink-0 ${
                      chat.id === chatId ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium truncate ${
                      chat.id === chatId ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {chat.title}
                    </span>
                  </div>
                  {chat.status && (
                    <span className={`text-xs ml-6 px-2 py-0.5 rounded-full ${
                      chat.status === 'en entrevista' 
                        ? 'bg-amber-100 text-amber-700'
                        : chat.status === 'activo'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {chat.status}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Menú Principal
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header del Chat */}
          <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center gap-3">
            {/* Botón hamburguesa solo visible en móvil */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex-1 min-w-0">
              {activeChat ? (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {activeChat.title}
                  </h3>
                  {activeClient && (
                    <p className="text-xs text-gray-500 truncate">
                      {activeClient.name} {activeClient.email && `• ${activeClient.email}`}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-gray-400 text-sm sm:text-base">
                    Selecciona o crea un expediente
                  </h3>
                </div>
              )}
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
            {chatId && <CaseIntelligence chatId={chatId} />}
            
            {!chatId && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Sin conversación activa</p>
                  <p className="text-gray-400 text-sm">
                    Selecciona un expediente o crea uno nuevo para comenzar
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {m.user_message && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-[70%] bg-blue-600 text-white p-3 sm:p-4 rounded-2xl rounded-br-lg shadow-sm">
                      <p className="text-sm whitespace-pre-wrap break-words">{m.user_message}</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[70%] bg-blue-200 border border-blue-550 p-3 sm:p-4 rounded-2xl rounded-bl-lg shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {m.ai_message === 'Analizando...' ? (
                        <span className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analizando...
                        </span>
                      ) : (
                        m.ai_message
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input de mensaje */}
          {chatId && (
            <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
              <div className="flex items-end gap-2 sm:gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 sm:p-3 rounded-xl transition-all flex-shrink-0 ${
                    file 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-2.5 sm:p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Escribe tu mensaje..."
                    disabled={loading}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading}
                  className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              
              {file && (
                <div className="mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-700 truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}