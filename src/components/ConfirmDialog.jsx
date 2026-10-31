// src/components/ConfirmDialog.jsx - Version premium corrigée
export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,      // Pour Annuler
  onClose        // Pour compatibilité (alias de onCancel)
}) {
  if (!isOpen) return null;

  // ✅ Si onClose est fourni mais pas onCancel, on utilise onClose
  const handleCancel = onCancel || onClose;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header - Style comme le modal de tâche */}
        <div className="bg-[#0A1628] px-6 py-4 border-b border-[#1A3A6B] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <span className="material-symbols-outlined text-red-400 text-xl">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title || 'Confirmation'}</h3>
              <p className="text-gray-400 text-sm">{message || 'Êtes-vous sûr de vouloir continuer ?'}</p>
            </div>
          </div>
          <button 
            onClick={handleCancel}  // ✅ Utilise handleCancel
            className="w-8 h-8 rounded-full bg-[#1A3A6B] hover:bg-[#2A4A6B] transition flex items-center justify-center text-gray-400 hover:text-white"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-[#0D1F3C]">
          <p className="text-gray-300 text-sm mb-6">
            {message || 'Cette action est irréversible. Voulez-vous vraiment continuer ?'}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}  // ✅ Utilise handleCancel
              className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/20 transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}