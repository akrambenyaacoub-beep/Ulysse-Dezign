// src/components/ClientSearch.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useTheme } from '../hooks/useTheme';

export default function ClientSearch({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Rechercher un client...",
  className = "",
  disabled = false,
  required = false,
  autoFocus = false,
  minChars = 2
}) {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Mettre à jour l'input quand la valeur externe change
  useEffect(() => {
    if (value) {
      if (typeof value === 'object' && value !== null) {
        const displayName = `${value.prenom || ''} ${value.nom || ''}`.trim() || value.nom || '';
        setInputValue(displayName);
        setSelectedClient(value);
      } else if (typeof value === 'string') {
        setInputValue(value);
      }
    } else {
      if (!selectedClient) {
        setInputValue('');
      }
    }
  }, [value]);

  // Fermer la liste au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  const searchClients = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabaseErp
        .from('erp_clients')
        .select('id, nom, prenom, email, telephone, type_client, entreprise')
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,entreprise.ilike.%${searchTerm}%`)
        .order('nom')
        .limit(20);

      if (error) throw error;
      setSuggestions(data || []);
      setIsOpen(data && data.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Erreur recherche clients:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [minChars]);

  // Debounce sur la saisie
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Si l'utilisateur efface tout, on notifie le parent
    if (value.trim() === '') {
      setSelectedClient(null);
      setIsOpen(false);
      setSuggestions([]);
      onChange?.(null);
      onSelect?.(null);
      return;
    }

    // Annuler le debounce précédent
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Lancer la recherche après 300ms
    debounceTimer.current = setTimeout(() => {
      searchClients(value);
    }, 300);
  };

  // Sélectionner un client
  const handleSelectClient = (client) => {
    const displayName = `${client.prenom || ''} ${client.nom || ''}`.trim() || client.nom || '';
    setInputValue(displayName);
    setSelectedClient(client);
    setIsOpen(false);
    setSuggestions([]);
    onChange?.(client);
    onSelect?.(client);
  };

  // Navigation clavier
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectClient(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Obtenir le badge de type
  const getTypeBadge = (type) => {
    const config = {
      particulier: { label: '👤', color: 'bg-green-500/20 text-green-400' },
      entreprise: { label: '🏢', color: 'bg-blue-500/20 text-blue-400' },
      passager: { label: '🧳', color: 'bg-purple-500/20 text-purple-400' }
    };
    const c = config[type] || config.particulier;
    return <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${c.color}`}>{c.label}</span>;
  };

  // Formater le nom du client pour l'affichage
  const getClientDisplayName = (client) => {
    const name = `${client.prenom || ''} ${client.nom || ''}`.trim() || client.nom || '';
    if (client.type_client === 'passager') {
      return `🧳 ${name}`;
    }
    if (client.entreprise) {
      return `${name} (${client.entreprise})`;
    }
    return name;
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= minChars) {
              searchClients(inputValue);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={`w-full px-4 py-2.5 pr-10 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
            isDark
              ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
              : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#F0C75E] border-t-transparent"></div>
          </div>
        )}
        {selectedClient && !loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-green-400 text-sm">✅</span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto ${
          isDark
            ? 'bg-[#0D1F3C] border-[#1A3A6B]'
            : 'bg-white border-gray-200'
        }`}>
          {suggestions.map((client, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <div
                key={client.id}
                onClick={() => handleSelectClient(client)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-2.5 cursor-pointer transition flex items-center justify-between ${
                  isHighlighted
                    ? isDark
                      ? 'bg-[#F0C75E]/20'
                      : 'bg-[#F0C75E]/10'
                    : isDark
                      ? 'hover:bg-[#1A3A6B]/50'
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {getClientDisplayName(client)}
                    </span>
                    {getTypeBadge(client.type_client)}
                  </div>
                  {client.email && (
                    <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {client.email} {client.telephone ? `• ${client.telephone}` : ''}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}