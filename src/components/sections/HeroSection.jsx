// src/components/sections/HeroSection.jsx
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';
import heroImage from '../../assets/img01.png';
import backgroundImage from '../../assets/background website.png';

const HeroSection = ({ scrollTo }) => {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#0D1F3C] pt-24 pb-16" id="home">
      
      {/* --- FOND ET EFFETS LUMINEUX --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        {/* Voile sombre pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1F3C]/95 via-[#0D1F3C]/80 to-[#0D1F3C]/40"></div>
        
        {/* Halo lumineux en arrière-plan */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#F0C75E]/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full">
        
        {/* --- PARTIE GAUCHE : LE TEXTE --- */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left animate-slide-right">
          
          {/* Badge Supérieur */}
          <div className="inline-flex items-center gap-2.5 mx-auto md:mx-0 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(240,199,94,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0C75E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0C75E]"></span>
            </span>
            <span className="font-['Montserrat'] text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold">
              L'Art de l'Impression
            </span>
          </div>
          
          {/* Titre */}
          <h1 className="font-['Playfair_Display'] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.1] font-bold tracking-tight drop-shadow-lg">
            L'Excellence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">
              de l'Impression
            </span>
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-['Playfair_Display'] italic font-light max-w-lg mx-auto md:mx-0">
            "Plus qu'une imprimerie, une expérience."
          </p>
          
          {/* Description */}
          <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed font-['Montserrat'] font-light mx-auto md:mx-0">
            Sublimez votre image de marque avec des finitions d'exception. Découpe laser, vinyle haute performance, et impression UV de pointe.
          </p>
          
          {/* Boutons d'Action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <Link 
              to="/boutique" 
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] px-8 py-4 rounded-full font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.15em] font-bold overflow-hidden shadow-[0_0_40px_-10px_rgba(240,199,94,0.6)] hover:shadow-[0_0_60px_-10px_rgba(240,199,94,0.8)] transition-all duration-500 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explorer la vitrine
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></span>
            </Link>

            <button 
              onClick={() => scrollTo('contact')} 
              className="group relative inline-flex items-center justify-center border border-white/20 text-white px-8 py-4 rounded-full font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.15em] font-semibold hover:bg-white/5 hover:border-white/40 transition-all duration-500 backdrop-blur-md"
            >
              Devis sur-mesure
            </button>
          </div>
        </div>
        
        {/* --- PARTIE DROITE : L'IMAGE CARRÉE + LE RECTANGLE GOLD --- */}
        <div className="relative order-first md:order-last mt-8 md:mt-0 flex justify-center md:justify-end animate-slide-left">
          
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] group">
            
            {/* 1. LE SEUL RECTANGLE DERRIÈRE L'IMAGE (Effet Gold Premium) */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a] transform rotate-3 scale-105 transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-[0_0_50px_-10px_rgba(240,199,94,0.4)] animate-gold-shimmer -z-10"></div>
            
            {/* 2. L'IMAGE CARRÉE */}
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20 bg-[#0D1F3C] z-10">
              
              <OptimizedImage 
                src={heroImage}
                alt="Ulysse DeZign" 
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                fallback={heroImage}
                lazy={false}
              />
              
              {/* Voile sombre en bas pour la lisibilité de la carte */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/90 via-[#0D1F3C]/10 to-transparent"></div>
              
              {/* 3. CARTE FLOTTANTE EN VERRE (Info Ulysse DeZign) */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Playfair_Display'] text-lg text-white font-bold">Ulysse DeZign</p>
                    <p className="text-[10px] text-[#F0C75E] font-['Montserrat'] uppercase tracking-widest mt-1">Premium Print Studio</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#F0C75E] flex items-center justify-center shadow-[0_0_15px_rgba(240,199,94,0.5)]">
                    <span className="material-symbols-outlined text-[#0D1F3C] text-sm">verified</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
      </div>
      
      {/* Indicateur de scroll élégant */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollTo('categories')}>
        <span className="text-white text-[9px] uppercase tracking-[0.3em] font-['Montserrat']">Découvrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;