// src/components/chat/ChatMessage.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../../lib/supabaseErp';

function formatMessageTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'maintenant';
  if (diffInSeconds < 120) return '1m';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 7200) return '1h';
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 172800) return 'hier';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`;
  
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function ChatMessage({ message, isMine, onReply, onDelete, onEdit, currentUserId }) {
  const [showActions, setShowActions] = useState(false);
  const [senderName, setSenderName] = useState('Utilisateur');
  const [senderRole, setSenderRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  useEffect(() => {
    const getName = async () => {
      try {
        if (message.sender?.full_name) {
          setSenderName(message.sender.full_name);
          setSenderRole(message.sender.role);
          return;
        }

        if (message.sender_id) {
          const { data, error } = await supabaseErp
            .from('erp_profiles')
            .select('full_name, role')
            .eq('id', message.sender_id)
            .maybeSingle();

          if (!error && data) {
            setSenderName(data.full_name || 'Utilisateur');
            setSenderRole(data.role);
            return;
          }
        }
        setSenderName('Utilisateur');
      } catch (err) {
        console.error('❌ Erreur récupération nom:', err);
        setSenderName('Utilisateur');
      }
    };

    getName();
  }, [message.sender_id, message.sender, currentUserId]);

  const getRoleBadge = (role) => {
    const config = {
      admin: { label: 'Admin', color: 'bg-red-500/20 text-red-400' },
      gerant: { label: 'Gérant', color: 'bg-blue-500/20 text-blue-400' },
      imprimeur: { label: 'Imprimeur', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
      designer: { label: 'Designer', color: 'bg-purple-500/20 text-purple-400' },
      poseur: { label: 'Poseur', color: 'bg-orange-500/20 text-orange-400' },
      agent_financier: { label: 'Agent Financier', color: 'bg-green-500/20 text-green-400' },
      commercial: { label: 'Commercial', color: 'bg-blue-400/20 text-blue-400' },
      user: { label: 'Utilisateur', color: 'bg-gray-500/20 text-gray-400' }
    };
    return config[role] || config.user;
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-teal-500','bg-cyan-500','bg-indigo-500','bg-amber-500','bg-lime-500','bg-rose-500','bg-violet-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const messageDate = new Date(message.created_at);
  const timeAgo = formatMessageTime(messageDate);

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const isImageMessage = message.message_type === 'image' || (hasAttachments && message.attachments[0]?.type === 'image');

  return (
    <div 
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
        {/* En-tête */}
        <div className={`flex items-center gap-2 mb-0.5 ${isMine ? 'justify-end mr-1' : 'ml-1'}`}>
          {!isMine && (
            <>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(senderName)}`}>
                {senderName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white">
                {senderName}
              </span>
              {senderRole && senderRole !== 'user' && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  getRoleBadge(senderRole)?.color || 'bg-gray-500/20 text-gray-400'
                }`}>
                  {getRoleBadge(senderRole)?.label}
                </span>
              )}
              <span className="text-[10px] text-gray-500 ml-auto">
                {timeAgo}
              </span>
            </>
          )}
          {isMine && (
            <>
              <span className="text-[10px] text-gray-500">
                {timeAgo}
              </span>
              <span className="text-xs text-gray-400">Vous</span>
            </>
          )}
        </div>

        {/* Bulle du message */}
        <div 
          className={`relative rounded-2xl px-4 py-2 ${
            isMine 
              ? 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-br-sm' 
              : 'bg-[#0D1F3C] border border-[#1A3A6B] text-gray-200 rounded-bl-sm'
          }`}
        >
          {message.reply_to && (
            <div className={`text-[10px] mb-1 ${isMine ? 'text-[#071325]/60' : 'text-[#F0C75E]/60'} border-l-2 pl-2 border-[#F0C75E]/30`}>
              ⤷ Réponse
            </div>
          )}

          {isImageMessage && message.attachments && (
            <div className="mb-2">
              <img 
                src={message.attachments[0].data} 
                alt="Image"
                className="max-w-full max-h-[150px] rounded-lg object-contain bg-black/20 cursor-pointer"
                onClick={() => window.open(message.attachments[0].data, '_blank')}
              />
            </div>
          )}

          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 px-3 py-1 rounded-lg bg-[#071325] text-white border border-[#1A3A6B] text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <button onClick={handleEdit} className="px-2 py-1 bg-[#F0C75E] text-[#071325] rounded-lg text-xs">✅</button>
              <button onClick={() => setIsEditing(false)} className="px-2 py-1 bg-[#1A3A6B] text-white rounded-lg text-xs">✕</button>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
              {message.content}
            </p>
          )}

          {message.is_read && isMine && (
            <div className="text-[10px] text-right mt-0.5 text-[#071325]/50">
              ✓✓ Lu
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && !isEditing && (
          <div className={`flex gap-0.5 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <button onClick={() => onReply(message.id)} className="p-1 rounded hover:bg-[#1A3A6B] text-gray-500 hover:text-white transition text-xs">💬</button>
            {isMine && (
              <>
                <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-[#1A3A6B] text-gray-500 hover:text-blue-400 transition text-xs">✏️</button>
                <button onClick={() => onDelete(message.id)} className="p-1 rounded hover:bg-[#1A3A6B] text-gray-500 hover:text-red-400 transition text-xs">🗑️</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}