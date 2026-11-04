// src/components/sections/StatsSection.jsx
const STATS = [
  { number: '500+', label: 'Projets Réalisés', icon: 'check_circle' },
  { number: '98%', label: 'Clients Satisfaits', icon: 'sentiment_very_satisfied' },
  { number: '48h', label: 'Délai de Production', icon: 'schedule' },
  { number: '4.9/5', label: 'Note Moyenne', icon: 'star' }
];

const StatsSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#1A3A6B] text-white relative overflow-hidden">
      {/* Motif de fond en pointillés */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #F0C75E 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
        {STATS.map((stat, idx) => (
          <div key={idx} className="text-center reveal-on-scroll" style={{ transitionDelay: `${idx * 150}ms` }}>
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#F0C75E] opacity-80">{stat.icon}</span>
            <p className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-bold mt-2">{stat.number}</p>
            <p className="text-xs sm:text-sm text-white/60 font-['Montserrat'] font-light">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;