// src/components/sections/HeroSection.jsx
import { useState, useEffect } from 'react'; // ✅ UN SEUL import React
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';
import heroImage from '../../assets/img01.png';
import heroImage2 from '../../assets/F.png'; // ✅ Corrigé en .png
import backgroundImage from '../../assets/background website.png';

const HeroSection = ({ scrollTo }) => {
  // État pour gérer l'image active du carrousel
  const [currentImage, setCurrentImage] = useState(0);
  const images = [heroImage, heroImage2];

  // Défilement automatique (Swipe auto) toutes les 4 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#0D1F3C] pt-24 pb-16" id="home">
      
      {/* --- FOND ET EFFETS LUMINEUX --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1F3C]/80 via-[#0D1F3C]/10 to-[#0D1F3C]/50"></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#F0C75E]/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full">
        
        {/* --- PARTIE GAUCHE : LE TEXTE --- */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left animate-slide-right">
          <div className="inline-flex items-center gap-2.5 mx-auto md:mx-0 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(240,199,94,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0C75E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0C75E]"></span>
            </span>
            <span className="font-['Montserrat'] text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold">
              L'Art de l'Impression
            </span>
          </div>
          
          <h1 className="font-['Playfair_Display'] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.1] font-bold tracking-tight drop-shadow-lg">
            L'Excellence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">
              de l'Impression
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-['Playfair_Display'] italic font-light max-w-lg mx-auto md:mx-0">
            "Plus qu'une imprimerie, une expérience."
          </p>
          
          <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed font-['Montserrat'] font-light mx-auto md:mx-0">
            Sublimez votre image de marque avec des finitions d'exception. Découpe laser, vinyle haute performance, et impression UV de pointe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <button 
              onClick={() => scrollTo('contact')} 
              className="group relative inline-flex items-center justify-center border border-[#F0C75E] text-[#F0C75E] px-8 py-4 rounded-full font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#F0C75E] hover:text-[#0D1F3C] transition-all duration-500 backdrop-blur-md shadow-[0_0_20px_-5px_rgba(240,199,94,0.3)]"
            >
              Devis sur-mesure
            </button>
          </div>
        </div>
        
        {/* --- PARTIE DROITE : LE CARROUSEL D'IMAGES --- */}
        <div className="relative order-first md:order-last mt-8 md:mt-0 flex justify-center md:justify-end animate-slide-left">
          
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] group">
            
            {/* Rectangle Gold Premium derrière */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a] transform rotate-3 scale-105 transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-[0_0_50px_-10px_rgba(240,199,94,0.4)] animate-gold-shimmer -z-10"></div>
            
            {/* L'IMAGE CARRÉE AVEC EFFET SWIPE */}
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20 bg-[#0D1F3C] z-10">
              
              {/* Carrousel d'images */}
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
              
              {/* Voile sombre en bas */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/90 via-[#0D1F3C]/10 to-transparent"></div>

              {/* LE BOUTON EXPLORER MIS EN VALEUR */}
              <div className="absolute bottom-5 left-5 right-5">
                <Link 
                  to="/boutique" 
                  className="group/btn relative flex items-center justify-between bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] p-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(240,199,94,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(240,199,94,0.8)] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                  
                  <div className="flex flex-col relative z-10">
                    <span className="font-['Playfair_Display'] text-lg font-bold">Explorer la vitrine</span>
                    <span className="text-[9px] font-['Montserrat'] uppercase tracking-widest opacity-80 mt-0.5">Découvrir nos produits</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#0D1F3C] flex items-center justify-center shadow-lg group-hover/btn:rotate-45 transition-transform duration-500 relative z-10">
                    <span className="material-symbols-outlined text-[#F0C75E]">arrow_forward</span>
                  </div>
                </Link>
              </div>

              {/* Indicateurs du Carrousel */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      idx === currentImage ? 'bg-[#F0C75E] w-6' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
        
      </div>
      
      {/* Indicateur de scroll */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollTo('categories')}>
        <span className="text-white text-[9px] uppercase tracking-[0.3em] font-['Montserrat']">Découvrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;