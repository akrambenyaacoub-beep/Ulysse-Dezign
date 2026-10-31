// src/components/chat/EmojiPicker.jsx
import { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
  '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🥲', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪',
  '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
  '🥴', '😵', '🤯', '🤠', '🥳', '😈', '👿', '👹', '👺', '💀',
  '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🐶', '🐱', '🐭',
  '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
  '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺',
  '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🍎', '🍐', '🍊',
  '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭',
  '🍍', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕',
  '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯',
  '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕',
  '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲',
  '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍵', '☕', '🧃',
  '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹',
  '🍾', '🧊', '🥄', '🍴', '🥢', '🍽️', '🚗', '🚕', '🚙', '🚌',
  '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜',
  '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '✈️', '🛩️', '🛫',
  '🛬', '🪂', '💺', '🚀', '🛸', '🚄', '⚽', '🏀', '🏈', '⚾',
  '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒',
  '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽',
  '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🇹🇳', '🇫🇷', '🇪🇸', '🇮🇹',
  '🇩🇪', '🇬🇧', '🇺🇸', '🇨🇦', '🇯🇵', '🇨🇳', '🇷🇺', '🇧🇷', '🇦🇷', '🇲🇦'
];

export default function EmojiPicker({ onEmojiSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState([]);
  const pickerRef = useRef(null);

  // Empêcher la fermeture quand on clique à l'intérieur
  const handlePickerClick = (e) => {
    e.stopPropagation();
  };

  const filteredEmojis = EMOJIS.filter(emoji => {
    if (searchTerm) {
      return emoji.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleEmojiClick = (emoji) => {
    const updatedRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 15);
    setRecentEmojis(updatedRecent);
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <div 
      ref={pickerRef}
      onClick={handlePickerClick}
      className="bg-[#0D1F3C] border border-[#1A3A6B] rounded-xl shadow-2xl w-[380px] max-w-[90vw] max-h-[50vh] overflow-hidden"
    >
      {/* En-tête compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1A3A6B] bg-[#071325]">
        <div className="flex items-center gap-2">
          <span className="text-lg">😊</span>
          <span className="text-white font-semibold text-xs">Emojis</span>
          <span className="text-[10px] text-gray-500">({EMOJIS.length})</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-[#1A3A6B] text-sm"
        >
          ✕
        </button>
      </div>

      {/* Recherche compacte */}
      <div className="p-2 border-b border-[#1A3A6B] bg-[#0A1628]">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 bg-[#071325] border border-[#1A3A6B] rounded-lg text-white text-xs focus:outline-none focus:border-[#F0C75E] placeholder-gray-500"
          autoFocus
        />
      </div>

      {/* Liste des emojis compacte */}
      <div className="overflow-y-auto max-h-[280px] p-2 custom-scrollbar bg-[#0A1628]">
        {recentEmojis.length > 0 && !searchTerm && (
          <>
            <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
              <span>🕐</span> Récents
            </div>
            <div className="grid grid-cols-8 gap-0.5 mb-2">
              {recentEmojis.map((emoji, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl p-1 hover:bg-[#1A3A6B] rounded-lg transition hover:scale-125"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}

        {!searchTerm && (
          <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
            <span>📦</span> Tous
          </div>
        )}
        
        <div className="grid grid-cols-8 gap-0.5">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`emoji-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl p-1 hover:bg-[#1A3A6B] rounded-lg transition hover:scale-125"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-xs">Aucun emoji trouvé</p>
          </div>
        )}
      </div>

      {/* Footer compact */}
      <div className="px-3 py-1.5 border-t border-[#1A3A6B] bg-[#071325] flex justify-between items-center">
        <span className="text-[9px] text-gray-500">
          {filteredEmojis.length} emojis
        </span>
        <span className="text-[9px] text-gray-600">
          Cliquez pour insérer
        </span>
      </div>
    </div>
  );
}