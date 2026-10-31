// src/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseErp } from '../lib/supabaseErp';

export function useChat(userId, channelId = 'general') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [channelUUID, setChannelUUID] = useState(null);
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);
  const isSubscribedRef = useRef(false);

  console.log('🔍 useChat initialisé:', { userId, channelId });

  // =====================================================
  // RÉCUPÉRER L'UUID DU CANAL
  // =====================================================
  const getChannelUUID = useCallback(async (channelName) => {
    try {
      // Si c'est déjà un UUID, le retourner
      if (channelName?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return channelName;
      }

      // Chercher le canal par son nom
      const { data, error } = await supabaseErp
        .from('erp_channels')
        .select('id')
        .eq('name', channelName)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur recherche canal:', error);
        return null;
      }

      if (!data) {
        console.warn(`⚠️ Canal "${channelName}" non trouvé, création...`);
        const { data: newChannel, error: createError } = await supabaseErp
          .from('erp_channels')
          .insert({ name: channelName, description: `Canal ${channelName}`, type: 'public' })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Erreur création canal:', createError);
          return null;
        }

        return newChannel.id;
      }

      return data.id;
    } catch (err) {
      console.error('❌ Erreur getChannelUUID:', err);
      return null;
    }
  }, []);

  // =====================================================
  // CHARGER LES MESSAGES
  // =====================================================
  const loadMessages = useCallback(async () => {
    // Si userId est dummy ou inexistant, retourner des données vides
    if (!userId || userId === 'dummy-user-id') {
      console.log('⏳ useChat: userId dummy ou inexistant, retour vide');
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const uuid = await getChannelUUID(channelId);
      if (!uuid) {
        setError('Canal non trouvé');
        setLoading(false);
        return;
      }
      setChannelUUID(uuid);

      const { data: messagesData, error: fetchError } = await supabaseErp
        .from('erp_messages')
        .select('*')
        .eq('channel_id', uuid)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) {
        console.error('❌ Erreur fetch messages:', fetchError);
        setError(fetchError.message);
        setMessages([]);
        setLoading(false);
        return;
      }

      console.log('✅ Messages chargés:', messagesData?.length || 0);

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Récupérer les profils des utilisateurs
      const userIds = [...new Set(messagesData.map(msg => msg.sender_id).filter(id => id))];
      
      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabaseErp
          .from('erp_profiles')
          .select('id, full_name, role, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('❌ Erreur fetch profils:', profilesError);
        } else {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      // Formater les messages avec les profils et les pièces jointes
      const formattedMessages = messagesData.map(msg => ({
        ...msg,
        sender: profilesMap[msg.sender_id] || null,
        attachments: msg.attachments || [],
        message_type: msg.message_type || 'text'
      }));

      setMessages(formattedMessages);
      
      // Compter les messages non lus
      const unread = formattedMessages.filter(msg => 
        msg.sender_id !== userId && !msg.is_read
      ).length;
      setUnreadCount(unread);
      
    } catch (err) {
      console.error('❌ Erreur chargement messages:', err);
      setError(err.message || 'Erreur inconnue');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [channelId, userId, getChannelUUID]);

  // =====================================================
  // ENVOYER UN MESSAGE (AVEC SUPPORT DES PIÈCES JOINTES)
  // =====================================================
  const sendMessage = useCallback(async (content, replyTo = null, options = {}) => {
    // Vérifier si le message a du contenu ou des pièces jointes
    if (!content?.trim() && !options?.attachments?.length) {
      console.warn('⚠️ Message vide, ignoré');
      return null;
    }

    if (!userId || userId === 'dummy-user-id') {
      console.error('❌ Utilisateur non connecté');
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      let uuid = channelUUID;
      if (!uuid) {
        uuid = await getChannelUUID(channelId);
        if (!uuid) {
          setError('Canal non trouvé');
          return null;
        }
        setChannelUUID(uuid);
      }

      const newMessage = {
        content: content || '',
        sender_id: userId,
        channel_id: uuid,
        reply_to: replyTo,
        is_read: false,
        created_at: new Date().toISOString(),
        message_type: options?.message_type || 'text',
        attachments: options?.attachments || []
      };

      console.log('📤 Envoi message:', newMessage);

      const { data, error: insertError } = await supabaseErp
        .from('erp_messages')
        .insert(newMessage)
        .select('*')
        .single();

      if (insertError) {
        console.error('❌ Erreur insertion:', insertError);
        setError(insertError.message);
        throw insertError;
      }

      if (data) {
        // Récupérer le profil de l'utilisateur
        const { data: profileData } = await supabaseErp
          .from('erp_profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', userId)
          .single();

        const messageWithSender = {
          ...data,
          sender: profileData || null,
          attachments: data.attachments || []
        };

        console.log('✅ Message envoyé:', data.id);
        setMessages(prev => [...prev, messageWithSender]);
        return messageWithSender;
      }
      
      return data;
      
    } catch (err) {
      console.error('❌ Erreur envoi message:', err);
      setError(err.message);
      throw err;
    }
  }, [userId, channelId, channelUUID, getChannelUUID]);

  // =====================================================
  // MARQUER TOUS LES MESSAGES COMME LUS
  // =====================================================
  const markAllAsRead = useCallback(async () => {
    if (!userId || userId === 'dummy-user-id') return;

    try {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id !== userId && !msg.is_read
      );

      if (unreadMessages.length === 0) return;

      const unreadIds = unreadMessages.map(msg => msg.id);

      const { error: updateError } = await supabaseErp
        .from('erp_messages')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .in('id', unreadIds);

      if (updateError) {
        console.error('❌ Erreur marquage lu:', updateError);
        return;
      }

      setMessages(prev => prev.map(msg =>
        unreadIds.includes(msg.id) ? { ...msg, is_read: true } : msg
      ));
      setUnreadCount(0);
      
      console.log('✅ Messages marqués comme lus:', unreadIds.length);
      
    } catch (err) {
      console.error('❌ Erreur markAllAsRead:', err);
    }
  }, [messages, userId]);

  // =====================================================
  // SUPPRIMER UN MESSAGE
  // =====================================================
  const deleteMessage = useCallback(async (messageId) => {
    if (!messageId) return;

    try {
      const { error: deleteError } = await supabaseErp
        .from('erp_messages')
        .update({
          deleted_at: new Date().toISOString(),
          content: '[Message supprimé]'
        })
        .eq('id', messageId);

      if (deleteError) {
        console.error('❌ Erreur suppression:', deleteError);
        setError(deleteError.message);
        return;
      }

      setMessages(prev => prev.map(msg =>
        msg.id === messageId 
          ? { ...msg, deleted_at: new Date().toISOString(), content: '[Message supprimé]' } 
          : msg
      ));
      
      console.log('✅ Message supprimé:', messageId);
      
    } catch (err) {
      console.error('❌ Erreur deleteMessage:', err);
      setError(err.message);
    }
  }, []);

  // =====================================================
  // GESTION DE LA FRAPPE
  // =====================================================
  const handleTyping = useCallback((isTypingNow) => {
    setIsTyping(isTypingNow);
    
    if (isTypingNow) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: true }
      });
    }
  }, [userId]);

  // =====================================================
  // RÉINITIALISER LES ERREURS
  // =====================================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =====================================================
  // RÉAL TIME - ÉCOUTE DES MESSAGES
  // =====================================================
  useEffect(() => {
    // Si userId est dummy ou inexistant, ne pas créer de canal
    if (!userId || userId === 'dummy-user-id') {
      console.log('⏳ useChat: userId dummy ou inexistant, pas de canal Realtime');
      setLoading(false);
      return;
    }

    // Charger les messages initiaux
    loadMessages();

    // Attendre d'avoir l'UUID du canal
    if (!channelUUID) return;

    // Nettoyer l'ancien canal si existe
    if (channelRef.current) {
      supabaseErp.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    console.log('🔌 Création du canal Realtime pour:', channelUUID);

    // Créer le canal Realtime
    const channel = supabaseErp.channel(`chat:${channelUUID}`);

    // AJOUTER TOUS LES ÉCOUTEURS AVANT subscribe()
    
    // Écouter les nouveaux messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'erp_messages',
      filter: `channel_id=eq.${channelUUID}`
    }, async (payload) => {
      const newMessage = payload.new;
      console.log('📩 Nouveau message reçu:', newMessage.id);
      
      // Récupérer le profil de l'expéditeur
      const { data: profileData } = await supabaseErp
        .from('erp_profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', newMessage.sender_id)
        .single();

      const messageWithSender = {
        ...newMessage,
        sender: profileData || null,
        attachments: newMessage.attachments || []
      };
      
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, messageWithSender];
      });
      
      if (newMessage.sender_id !== userId && !newMessage.is_read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Écouter les mises à jour
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'erp_messages',
      filter: `channel_id=eq.${channelUUID}`
    }, (payload) => {
      const updatedMessage = payload.new;
      console.log('📝 Message mis à jour:', updatedMessage.id);
      
      setMessages(prev => prev.map(msg =>
        msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
      ));
    });

    // Écouter les événements de frappe
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.userId !== userId) {
        setTypingUsers(prev => {
          const exists = prev.some(u => u.userId === payload.userId);
          if (payload.isTyping && !exists) {
            return [...prev, { userId: payload.userId, timestamp: Date.now() }];
          } else if (!payload.isTyping) {
            return prev.filter(u => u.userId !== payload.userId);
          }
          return prev;
        });
      }
    });

    // ENSUITE subscribe()
    channel.subscribe((status) => {
      console.log('🔌 Canal chat status:', status);
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
        console.log('✅ Canal chat connecté');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        isSubscribedRef.current = false;
        console.warn('⚠️ Canal chat fermé ou erreur');
      }
    });

    channelRef.current = channel;

    // Nettoyer
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (channelRef.current) {
        supabaseErp.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        console.log('🔌 Canal chat déconnecté');
      }
    };
  }, [channelUUID, userId, loadMessages]);

  // Nettoyer les utilisateurs en frappe après 3 secondes d'inactivité
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(u => now - u.timestamp < 3000)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    loading,
    error,
    unreadCount,
    typingUsers,
    isTyping,
    sendMessage,
    markAllAsRead,
    handleTyping,
    deleteMessage,
    loadMessages,
    clearError,
    channelUUID
  };
}