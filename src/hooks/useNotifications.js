// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { showAlert } from '../components/AlertModal';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNotification, setNewNotification] = useState(null);
  const channelRef = useRef(null);
  const audioRef = useRef(null);

  // =====================================================
  // CHARGER LES NOTIFICATIONS
  // =====================================================
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabaseErp
        .from('erp_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
      
    } catch (err) {
      console.error('❌ Erreur chargement notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // =====================================================
  // MARQUER COMME LU
  // =====================================================
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { error } = await supabaseErp
        .from('erp_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('❌ Erreur marquage lu:', err);
    }
  }, []);

  // =====================================================
  // MARQUER TOUT COMME LU
  // =====================================================
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabaseErp
        .from('erp_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n =>
        unreadIds.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(0);
      
    } catch (err) {
      console.error('❌ Erreur marquage tout lu:', err);
    }
  }, [notifications]);

  // =====================================================
  // SUPPRIMER UNE NOTIFICATION
  // =====================================================
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const { error } = await supabaseErp
        .from('erp_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notifications.find(n => n.id === notificationId && !n.is_read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
    }
  }, [notifications]);

  // =====================================================
  // SUPPRIMER TOUT
  // =====================================================
  const deleteAll = useCallback(async () => {
    try {
      const { error } = await supabaseErp
        .from('erp_notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
      
    } catch (err) {
      console.error('❌ Erreur suppression tout:', err);
    }
  }, [userId]);

  // =====================================================
  // JOUER LE SON
  // =====================================================
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch(() => {});
    } catch (err) {
      console.log('⚠️ Son de notification non disponible');
    }
  }, []);

  // =====================================================
  // AFFICHER UNE ALERTE POUR LA NOTIFICATION
  // =====================================================
  const showNotificationAlert = useCallback((notification) => {
    const icons = {
      task: '📋',
      order: '📦',
      payment: '💰',
      team: '👥',
      system: '⚙️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const icon = icons[notification.type] || '🔔';
    showAlert(
      notification.priority === 'urgent' ? 'error' : 
      notification.priority === 'high' ? 'warning' : 'info',
      `${icon} ${notification.title}`,
      notification.message
    );
  }, []);

  // =====================================================
  // ÉCOUTE EN TEMPS RÉEL
  // =====================================================
  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    // Créer le canal Realtime
    const channel = supabaseErp.channel(`notifications:${userId}`);

    // Écouter les nouvelles notifications
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'erp_notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new;
        console.log('🔔 Nouvelle notification:', newNotif);
        
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        setNewNotification(newNotif);
        
        // Jouer le son
        playNotificationSound();
        
        // Afficher l'alerte
        showNotificationAlert(newNotif);
      });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabaseErp.removeChannel(channel);
    };
  }, [userId, loadNotifications, playNotificationSound, showNotificationAlert]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    newNotification,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    setNewNotification
  };
}