// src/components/sections/HeroSection.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';
import heroImage from '../../assets/img01.png';
import heroImage2 from '../../assets/F.png';
import backgroundImage from '../../assets/background website.png';

const HeroSection = ({ scrollTo }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [heroImage, heroImage2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    // 👇 Réduction du padding top sur mobile (pt-20 au lieu de pt-24) et min-h-[85vh] pour laisser de la place
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0D1F3C] pt-20 pb-10 md:pt-24 md:pb-16" id="home">
      
      {/* --- FOND ET EFFETS LUMINEUX --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1F3C]/80 via-[#0D1F3C]/10 to-[#0D1F3C]/50"></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#F0C75E]/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-16 items-center relative z-10 w-full">
        
        {/* --- PARTIE GAUCHE : LE TEXTE (Mis en premier sur mobile) --- */}
        {/* 👇 order-1 sur mobile pour que le texte soit en haut */}
        <div className="order-1 md:order-1 space-y-4 md:space-y-8 text-center md:text-left animate-slide-right">
          
          <div className="inline-flex items-center gap-2.5 mx-auto md:mx-0 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(240,199,94,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0C75E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0C75E]"></span>
            </span>
            <span className="font-['Montserrat'] text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold">
              L'Art de l'Impression
            </span>
          </div>
          
          {/* 👇 Taille de police réduite sur mobile */}
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] text-white leading-[1.1] font-bold tracking-tight drop-shadow-lg">
            L'Excellence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">
              de l'Impression
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-2xl text-white/90 font-['Playfair_Display'] italic font-light max-w-lg mx-auto md:mx-0">
            "Plus qu'une imprimerie, une expérience."
          </p>
          
          {/* La description peut être cachée sur mobile si ça prend trop de place, mais on la laisse pour l'instant */}
          <p className="hidden sm:block text-sm md:text-base text-white/60 max-w-md leading-relaxed font-['Montserrat'] font-light mx-auto md:mx-0">
            Sublimez votre image de marque avec des finitions d'exception. Découpe laser, vinyle haute performance, et impression UV de pointe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4 justify-center md:justify-start">
            <button 
              onClick={() => scrollTo('contact')} 
              className="group relative inline-flex items-center justify-center border border-[#F0C75E] text-[#F0C75E] px-6 py-3 md:px-8 md:py-4 rounded-full font-['Montserrat'] text-xs md:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#F0C75E] hover:text-[#0D1F3C] transition-all duration-500 backdrop-blur-md shadow-[0_0_20px_-5px_rgba(240,199,94,0.3)]"
            >
              Devis sur-mesure
            </button>
          </div>
        </div>
        
        {/* --- PARTIE DROITE : LE CARROUSEL D'IMAGES (Mis en deuxième sur mobile) --- */}
        {/* 👇 order-2 sur mobile, image plus petite (max-w-[240px]) */}
        <div className="order-2 md:order-2 mt-4 md:mt-0 flex justify-center md:justify-end animate-slide-left">
          
          <div className="relative w-full max-w-[240px] sm:max-w-[320px] md:max-w-[420px] group">
            
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a] transform rotate-3 scale-105 transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-[0_0_50px_-10px_rgba(240,199,94,0.4)] animate-gold-shimmer -z-10"></div>
            
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20 bg-[#0D1F3C] z-10">
              
              {images.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Ulysse DeZign ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                    index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                />
              ))}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/90 via-[#0D1F3C]/10 to-transparent"></div>

              <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5">
                <Link 
                  to="/boutique" 
                  className="group/btn relative flex items-center justify-between bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] p-3 md:p-4 rounded-xl md:rounded-2xl shadow-[0_10px_30px_-10px_rgba(240,199,94,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(240,199,94,0.8)] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                  
                  <div className="flex flex-col relative z-10 text-left">
                    <span className="font-['Playfair_Display'] text-base md:text-lg font-bold">Explorer la vitrine</span>
                    <span className="text-[8px] md:text-[9px] font-['Montserrat'] uppercase tracking-widest opacity-80 mt-0.5">Découvrir nos produits</span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0D1F3C] flex items-center justify-center shadow-lg group-hover/btn:rotate-45 transition-transform duration-500 relative z-10">
                    <span className="material-symbols-outlined text-[#F0C75E] text-sm md:text-base">arrow_forward</span>
                  </div>
                </Link>
              </div>

              <div className="absolute top-3 right-3 md:top-4 md:right-4 flex gap-1.5 z-20">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-500 ${
                      idx === currentImage ? 'bg-[#F0C75E] md:w-6' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
        
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollTo('categories')}>
        <span className="text-white text-[9px] uppercase tracking-[0.3em] font-['Montserrat']">Découvrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;