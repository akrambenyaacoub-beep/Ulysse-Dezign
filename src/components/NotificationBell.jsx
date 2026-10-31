// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationBell() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll
  } = useNotifications(profile?.id);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =====================================================
  // FILTRER LES NOTIFICATIONS
  // =====================================================
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.is_read;
    return n.type === activeTab;
  });

  // =====================================================
  // TYPES DE NOTIFICATIONS
  // =====================================================
  const notificationTypes = {
    task: { label: '📋 Tâches', color: 'bg-blue-500/20 text-blue-400' },
    order: { label: '📦 Commandes', color: 'bg-orange-500/20 text-orange-400' },
    payment: { label: '💰 Paiements', color: 'bg-green-500/20 text-green-400' },
    team: { label: '👥 Équipe', color: 'bg-purple-500/20 text-purple-400' },
    system: { label: '⚙️ Système', color: 'bg-gray-500/20 text-gray-400' }
  };

  // =====================================================
  // RENDU D'UNE NOTIFICATION
  // =====================================================
  const NotificationItem = ({ notification }) => {
    const typeInfo = notificationTypes[notification.type] || notificationTypes.system;
    const isUnread = !notification.is_read;

    return (
      <div 
        className={`group flex items-start gap-3 p-3 border-b border-[#1A3A6B] hover:bg-[#1A3A6B]/30 transition cursor-pointer ${
          isUnread ? 'bg-[#F0C75E]/5 border-l-2 border-l-[#F0C75E]' : ''
        }`}
        onClick={() => {
          markAsRead(notification.id);
          if (notification.link) {
            window.location.href = notification.link;
          }
        }}
      >
        {/* Icône */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
          <span className="text-sm">{notification.icon || '🔔'}</span>
        </div>
        
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-white truncate">
              {notification.title}
            </p>
            <span className="text-[10px] text-gray-500 whitespace-nowrap flex-shrink-0">
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">{notification.message}</p>
          
          {/* Badge priorité */}
          {notification.priority === 'urgent' && (
            <span className="text-[10px] text-red-400 font-semibold">🔴 Urgent</span>
          )}
          {notification.priority === 'high' && (
            <span className="text-[10px] text-orange-400 font-semibold">🟠 Haute</span>
          )}
        </div>
        
        {/* Bouton supprimer */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition p-1"
        >
          ✕
        </button>
      </div>
    );
  };

  // =====================================================
  // RENDU PRINCIPAL
  // =====================================================
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#1A3A6B] transition"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[420px] max-h-[500px] bg-[#0D1F3C] border border-[#1A3A6B] rounded-xl shadow-2xl overflow-hidden z-[99999]">
          
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A3A6B] bg-[#071325]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} non lues
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#F0C75E] hover:text-[#d4aa3a] transition"
                >
                  Tout lire
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={deleteAll}
                  className="text-xs text-gray-500 hover:text-red-400 transition"
                >
                  Tout supprimer
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-1 px-3 py-2 border-b border-[#1A3A6B] bg-[#0A1628] overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs transition flex-shrink-0 ${
                activeTab === 'all' 
                  ? 'bg-[#F0C75E] text-[#071325]' 
                  : 'bg-[#071325] text-gray-400 hover:text-white'
              }`}
            >
              📋 Toutes
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-lg text-xs transition flex-shrink-0 ${
                activeTab === 'unread' 
                  ? 'bg-[#F0C75E] text-[#071325]' 
                  : 'bg-[#071325] text-gray-400 hover:text-white'
              }`}
            >
              🔴 Non lues {unreadCount > 0 && `(${unreadCount})`}
            </button>
            {Object.entries(notificationTypes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1 rounded-lg text-xs transition flex-shrink-0 ${
                  activeTab === key 
                    ? 'bg-[#F0C75E] text-[#071325]' 
                    : 'bg-[#071325] text-gray-400 hover:text-white'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#F0C75E] border-t-transparent"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-3xl block mb-2">📭</span>
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              filteredNotifications.map(n => (
                <NotificationItem key={n.id} notification={n} />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#1A3A6B] bg-[#071325] text-center">
            <span className="text-[10px] text-gray-500">
              {notifications.length} notifications au total
            </span>
          </div>
        </div>
      )}
    </div>
  );
}