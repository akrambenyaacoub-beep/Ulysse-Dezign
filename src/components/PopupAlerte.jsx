// src/components/PopupAlerte.jsx
export default function PopupAlerte({ alerte, onClose, onDismiss }) {
  if (!alerte) return null;

  const couleurs = {
    red: 'border-red-500 bg-red-500/10',
    orange: 'border-orange-500 bg-orange-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
    green: 'border-green-500 bg-green-500/10'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className={`max-w-md w-full rounded-2xl border-2 ${couleurs[alerte.couleur]} bg-[#0D1F3C] shadow-2xl transform animate-scaleIn`}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">
              {alerte.type === 'danger' ? '🚨' : alerte.type === 'warning' ? '⚠️' : '💰'}
            </span>
            <div className="flex-1">
              <h3 className="text-white text-lg font-bold mb-2">{alerte.titre}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{alerte.message}</p>
            </div>
          </div>
          
          {alerte.depenses && (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {alerte.depenses.slice(0, 5).map((d, i) => (
                <div key={i} className="flex justify-between items-center bg-[#0A1628] rounded-lg p-2">
                  <span className="text-white text-xs">{d.designation}</span>
                  <span className="text-[#F0C75E] text-xs font-semibold">{d.montant?.toLocaleString()} DT</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition text-sm">
              Voir plus tard
            </button>
            <button onClick={onDismiss} className="flex-1 px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold hover:shadow-lg transition text-sm">
              OK, compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}