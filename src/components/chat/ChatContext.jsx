// src/components/chat/ChatContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseErp } from '../../lib/supabaseErp'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    // Écouter les nouveaux messages pour mettre à jour le compteur global
    const channel = supabaseErp
      .channel('global-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'erp_messages'
      }, (payload) => {
        if (!isOpen) {
          setUnreadCount(prev => prev + 1)
        }
      })
      .subscribe()
    
    return () => supabaseErp.removeChannel(channel)
  }, [isOpen])
  
  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      unreadCount,
      setUnreadCount
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}