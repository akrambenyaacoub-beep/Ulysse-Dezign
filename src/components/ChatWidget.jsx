// src/components/chat/ChatWidget.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import { supabaseErp } from '../../lib/supabaseErp';

export default function ChatWidget() {
  const { profile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!profile) return null;
  
  const isAuthPage = ['/login', '/', '/client/login', '/client/register'].includes(location.pathname);
  if (isAuthPage) return null;

  const userId = profile?.id || 'dummy-user-id';
  const chat = useChat(userId, activeChannel);

  if (chat?.error) {
    return (
      <div className="fixed bottom-24 right-6 z-[99999] bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-w-sm shadow-2xl">
        <div className="flex items-center gap-2 text-red-400">
          <span className="text-xl">⚠️</span>
          <h3 className="font-semibold">Chat indisponible</h3>
        </div>
        <p className="text-gray-300 text-sm mt-1">{chat.error}</p>
        <button
          onClick={() => chat?.loadMessages?.()}
          className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  // Chargement des canaux
  useEffect(() => {
    let mounted = true;
    
    const loadChannels = async () => {
      try {
        setLoadingChannels(true);
        const { data, error } = await supabaseErp
          .from('erp_channels')
          .select('*')
          .order('name');

        if (error) throw error;
        if (mounted) setChannels(data || []);
      } catch (err) {
        console.error('❌ Erreur chargement canaux:', err);
      } finally {
        if (mounted) setLoadingChannels(false);
      }
    };

    loadChannels();
    return () => { mounted = false; };
  }, []);

  // Marquer comme lu
  useEffect(() => {
    if (isOpen && chat?.markAllAsRead) {
      chat.markAllAsRead();
    }
  }, [isOpen, chat]);

  // Scroll automatique
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages, isOpen]);

  // Envoyer un message
  const handleSend = async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!chat?.sendMessage) return;

    try {
      await chat.sendMessage(newMessage.trim(), replyTo);
      setNewMessage('');
      setReplyTo(null);
      inputRef.current?.focus();
    } catch (err) {
      console.error('❌ Erreur envoi message:', err);
    }
  };

  // Emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
    setShowEmojiPicker(false);
  };

  // Image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const imageData = reader.result;
        await chat.sendMessage('📷 Image partagée', replyTo, {
          attachments: [{
            type: 'image',
            data: imageData,
            name: file.name,
            size: file.size
          }],
          message_type: 'image'
        });
        setNewMessage('');
        setReplyTo(null);
        setUploading(false);
        fileInputRef.current.value = '';
      };
    } catch (err) {
      console.error('❌ Erreur upload image:', err);
      alert('Erreur lors de l\'envoi de l\'image');
      setUploading(false);
    }
  };

  // Gestionnaire de saisie
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    chat?.handleTyping?.(e.target.value.length > 0);
  };

  // Répondre
  const handleReply = (messageId) => {
    setReplyTo(messageId);
    inputRef.current?.focus();
    const original = chat?.messages?.find(m => m.id === messageId);
    if (original) {
      setNewMessage(`@${original.sender?.full_name || 'Utilisateur'} `);
    }
  };

  // Supprimer
  const handleDelete = async (messageId) => {
    if (!chat?.deleteMessage) return;
    if (window.confirm('Supprimer ce message ?')) {
      await chat.deleteMessage(messageId);
    }
  };

  // Modifier
  const handleEdit = async (messageId, newContent) => {
    if (!chat?.loadMessages) return;
    try {
      await supabaseErp
        .from('erp_messages')
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq('id', messageId);
      await chat.loadMessages();
    } catch (err) {
      console.error('❌ Erreur modification:', err);
    }
  };

  // Changer de canal
  const handleChannelChange = (e) => {
    const newChannel = e.target.value;
    setActiveChannel(newChannel);
    setReplyTo(null);
    setNewMessage('');
    chat?.loadMessages?.();
  };

  if (chat?.loading) {
    return (
      <div className="fixed bottom-24 right-6 z-[99999] bg-[#0D1F3C] border border-[#1A3A6B] rounded-xl p-4 shadow-2xl">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#F0C75E] border-t-transparent mx-auto"></div>
      </div>
    );
  }

  const unreadCount = chat?.unreadCount || 0;
  const messages = chat?.messages || [];

  return (
    <>
      {/* BOUTON D'OUVERTURE - Dans le coin */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[99999] w-14 h-14 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl group"
      >
        {isOpen ? (
          '✕'
        ) : (
          <>
            💬
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* WIDGET CHAT - Dans le coin en bas à droite */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[99999] w-[420px] max-w-[95vw] h-[600px] max-h-[80vh] bg-[#0D1F3C] border border-[#1A3A6B] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          
          {/* EN-TÊTE */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A3A6B] bg-[#071325] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] flex items-center justify-center text-sm">
                💬
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Chat Équipage</h3>
                <p className="text-[10px] text-gray-400">
                  {messages.length} messages · {unreadCount} non lus
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeChannel}
                onChange={handleChannelChange}
                className="bg-[#0D1F3C] border border-[#1A3A6B] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#F0C75E] max-w-[100px]"
                disabled={loadingChannels}
              >
                <option value="general"># Général</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.type === 'private' ? '🔒' : '#'} {ch.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-[#1A3A6B]"
              >
                ✕
              </button>
            </div>
          </div>

          {/* LISTE DES MESSAGES */}
          <div className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar bg-[#0A1628]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-4xl block mb-3">💭</span>
                <p className="text-gray-500 text-sm">Aucun message</p>
                <p className="text-gray-400 text-xs mt-1">Soyez le premier à envoyer un message !</p>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isMine={msg.sender_id === profile?.id}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    currentUserId={profile?.id}
                  />
                ))}
              </div>
            )}
            
            {chat?.typingUsers?.length > 0 && (
              <div className="flex items-center gap-2 text-gray-400 text-[10px] mt-2 ml-2">
                <div className="flex gap-0.5">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
                <span>{chat.typingUsers.length} personne(s) écrivent...</span>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* INDICATEUR DE RÉPONSE */}
          {replyTo && (
            <div className="px-3 py-1.5 bg-[#071325] border-t border-[#1A3A6B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">💬 Réponse à un message</span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-[10px] text-red-400 hover:text-red-300 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* ZONE DE SAISIE */}
          <div className="p-2 border-t border-[#1A3A6B] bg-[#071325] shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-1.5">
              {/* Bouton Emoji */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 bg-[#0D1F3C] border border-[#1A3A6B] rounded-full hover:bg-[#1A3A6B] transition text-sm text-gray-400 hover:text-white"
                  title="Emojis"
                >
                  😊
                </button>
                
                {/* Emoji Picker - Compact et centré */}
                {showEmojiPicker && (
                  <div 
                    className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowEmojiPicker(false)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <EmojiPicker
                        onEmojiSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-[#0D1F3C] border border-[#1A3A6B] rounded-full hover:bg-[#1A3A6B] transition text-sm text-gray-400 hover:text-white"
                title="Envoyer une image"
                disabled={uploading}
              >
                {uploading ? '⏳' : '🖼️'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Champ de saisie */}
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={uploading ? 'Envoi de l\'image...' : 'Écrire un message...'}
                className="flex-1 px-3 py-2 bg-[#0D1F3C] border border-[#1A3A6B] rounded-full text-white text-sm focus:outline-none focus:border-[#F0C75E] transition placeholder-gray-500"
                style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}
                disabled={chat?.loading || uploading}
              />

              {/* Bouton Envoyer */}
              <button
                type="submit"
                disabled={!newMessage.trim() || chat?.loading || uploading}
                className="px-3 py-2 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-full hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 font-medium text-sm"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}