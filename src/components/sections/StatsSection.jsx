// src/components/sections/StatsSection.jsx
import { useState, useEffect } from 'react';

const STATS = [
  { number: '500+', label: 'Projets Réalisés' },
  { number: '98%', label: 'Clients Satisfaits' },
  { number: '48h', label: 'Délai de Production' },
  { number: '4.9/5', label: 'Note Moyenne' }
];

const TESTIMONIALS = [
  { id: 1, name: 'Ahmed Ben Salah', role: 'CEO, EventPro Tunisie', content: 'Ulysse DeZign a transformé nos événements avec des impressions d\'une qualité exceptionnelle.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&q=80', rating: 5 },
  { id: 2, name: 'Leila Trabelsi', role: 'Directrice Marketing', content: 'Les packagings réalisés ont donné à nos produits une image premium incomparable.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&q=80', rating: 5 },
  { id: 3, name: 'Mohamed Ali Ben Hamida', role: 'Architecte d\'intérieur', content: 'La qualité des vinyles et des bâches est incomparable. Je recommande vivement !', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&q=80', rating: 5 }
];

const StatsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    // On remplace min-h-screen par py-20 pour que la section prenne juste la place nécessaire
    <section className="relative py-20 overflow-hidden bg-[#071325]" id="stats-and-testimonials">
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#071325] to-[#0A1628]" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative z-10 w-full">
        
        {/* 1. STATS (Compact) */}
        <div className="w-full flex flex-col items-center mb-16">
          <div className="flex items-center gap-4 mb-10">
            <span className="w-8 h-px bg-[#F0C75E]/30"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#F0C75E] font-bold font-['Montserrat']">Notre Impact</span>
            <span className="w-8 h-px bg-[#F0C75E]/30"></span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8 w-full">
            {STATS.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <p className="font-['Playfair_Display'] text-4xl md:text-5xl text-white font-bold mb-2 group-hover:text-[#F0C75E] transition-colors duration-500">
                  {stat.number}
                </p>
                <p className="text-[9px] md:text-[10px] text-white/40 font-['Montserrat'] uppercase tracking-[0.2em] font-semibold">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur discret entre stats et avis */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

        {/* 2. TÉMOIGNAGES (Compact) */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-4 mb-10">
            <span className="w-8 h-px bg-[#F0C75E]/30"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#F0C75E] font-bold font-['Montserrat']">Témoignages</span>
            <span className="w-8 h-px bg-[#F0C75E]/30"></span>
          </div>

          <div className="relative w-full max-w-4xl min-h-[180px]">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div 
                key={testimonial.id} 
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex flex-col items-center justify-center text-center ${
                  idx === activeTestimonial ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full pointer-events-none z-0'
                }`}
              >
                <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-['Playfair_Display'] italic leading-relaxed mb-6 max-w-3xl">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-50" />
                  <div className="text-left">
                    <h4 className="font-['Montserrat'] text-sm text-white font-bold">{testimonial.name}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveTestimonial(idx)} 
                className={`transition-all duration-500 rounded-full h-1 ${
                  idx === activeTestimonial ? 'bg-[#F0C75E] w-8' : 'bg-white/20 w-1.5 hover:bg-white/40'
                }`} 
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;