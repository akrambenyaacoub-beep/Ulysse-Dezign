// src/components/Modal.jsx
import { useEffect, useRef } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  icon = 'receipt_long',
  iconColor = 'text-[#F0C75E]'
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // ❌ SUPPRIMÉ : document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // ❌ SUPPRIMÉ : document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className={`${sizeClasses[size]} w-full animate-fade-in-up my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] shadow-2xl overflow-hidden">
          
          {/* ============================================================ */}
          {/* HEADER AVEC ICÔNE ET CROIX */}
          {/* ============================================================ */}
          <div className="relative bg-gradient-to-r from-[#0A1628] via-[#0D1F3C] to-[#0A1628] px-6 py-4 border-b border-[#1A3A6B] sticky top-0 z-10">
            
            {/* Ligne décorative dorée en haut */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F0C75E] to-transparent"></div>
            
            {/* Effet de brillance subtil */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1359A9]/0 via-[#1359A9]/5 to-[#1359A9]/0 opacity-50"></div>
            
            <div className="relative flex items-center justify-between">
              {/* Titre à gauche avec icône */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1359A9]/20 to-[#F0C75E]/10 flex items-center justify-center border border-[#1A3A6B]">
                  <span className={`material-symbols-outlined ${iconColor} text-xl`}>{icon}</span>
                </div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
              </div>
              
              {/* Croix à droite avec animations */}
              <button
                onClick={onClose}
                className="group relative w-9 h-9 rounded-full bg-[#1A3A6B] hover:bg-[#2A4A6B] transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#F0C75E]/50"
                aria-label="Fermer"
              >
                <span className="absolute inset-0 rounded-full bg-[#F0C75E]/0 group-hover:bg-[#F0C75E]/10 transition-all duration-300"></span>
                
                <span className="material-symbols-outlined text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300 text-xl">
                  close
                </span>
              </button>
            </div>
          </div>
          
          {/* Contenu */}
          <div className="p-6 bg-[#0D1F3C]">
            {children}
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
          animation: fadeInUp 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}