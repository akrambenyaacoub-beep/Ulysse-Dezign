// src/components/sections/StatsSection.jsx
const STATS = [
  { number: '500+', label: 'Projets Réalisés', icon: 'check_circle' },
  { number: '98%', label: 'Clients Satisfaits', icon: 'sentiment_very_satisfied' },
  { number: '48h', label: 'Délai de Production', icon: 'schedule' },
  { number: '4.9/5', label: 'Note Moyenne', icon: 'star' }
];

const StatsSection = () => {
  return (
    // ✅ py-20 md:py-28 : identique à toutes les autres sections
    <section className="py-20 md:py-28 relative overflow-hidden bg-[#071325]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]" />
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#F0C75E 1px, transparent 1px), linear-gradient(90deg, #F0C75E 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* ✅ Conteneur identique : max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* En-tête identique aux autres sections */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 sm:mb-16">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="w-8 md:w-12 h-px bg-[#F0C75E]"></span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Chiffres Clés</span>
            </div>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight leading-tight">
              Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">Impact</span>
            </h2>
            <p className="text-sm sm:text-base text-white/60 mt-4 font-['Montserrat'] font-light max-w-xl mx-auto md:mx-0">
              Des chiffres qui parlent d'eux-mêmes et qui reflètent notre engagement.
            </p>
          </div>
        </div>

        {/* Grille des stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#F0C75E]/50 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(240,199,94,0.3)]"
            >
              <div className="w-12 h-12 rounded-full bg-[#F0C75E]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-2xl md:text-3xl text-[#F0C75E]">{stat.icon}</span>
              </div>
              <p className="font-['Playfair_Display'] text-3xl md:text-5xl text-white font-bold tracking-tight group-hover:text-[#F0C75E] transition-colors duration-500">{stat.number}</p>
              <div className="w-0 h-0.5 bg-[#F0C75E] my-3 group-hover:w-12 transition-all duration-500" />
              <p className="text-[10px] md:text-xs text-white/60 font-['Montserrat'] uppercase tracking-[0.2em] font-semibold text-center mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;