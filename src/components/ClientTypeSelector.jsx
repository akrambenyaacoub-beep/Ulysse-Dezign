// src/components/ClientTypeSelector.jsx
const CLIENT_TYPES = {
  particulier: {
    id: 'particulier',
    label: 'Particulier',
    icon: '👤',
    description: 'Client individuel',
    color: 'from-green-500/20 to-green-600/10',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10'
  },
  entreprise: {
    id: 'entreprise',
    label: 'Entreprise',
    icon: '🏢',
    description: 'Société / Organisation',
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10'
  },
  passager: {
    id: 'passager',
    label: 'Passager',
    icon: '🧳',
    description: 'Client occasionnel',
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10'
  }
};

export default function ClientTypeSelector({ value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label className="block text-gray-400 text-sm font-medium">
        Type de client *
      </label>
      <div className="grid grid-cols-3 gap-3">
        {Object.values(CLIENT_TYPES).map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => !disabled && onChange(type.id)}
            disabled={disabled}
            className={`
              relative p-3 rounded-xl border-2 transition-all duration-300
              ${value === type.id 
                ? `bg-gradient-to-br ${type.color} border-[#F0C75E] shadow-lg shadow-[#F0C75E]/10 scale-105`
                : `bg-[#071325] border-[#1A3A6B] hover:border-[#F0C75E]/40 hover:scale-[1.02]`
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              group
            `}
          >
            <div className="relative z-10">
              <div className="flex flex-col items-center gap-1">
                <span className={`text-2xl transition-transform duration-300 ${value === type.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {type.icon}
                </span>
                <span className={`text-sm font-semibold ${value === type.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {type.label}
                </span>
                <span className={`text-[10px] text-center ${value === type.id ? 'text-gray-300' : 'text-gray-500'}`}>
                  {type.description}
                </span>
              </div>
            </div>

            {value === type.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F0C75E] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#071325] text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}