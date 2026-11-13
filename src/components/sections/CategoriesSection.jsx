// src/components/sections/CategoriesSection.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import stickersImg from '../../assets/stickers.jpg';
import uvImg from '../../assets/uv.webp';
import grfImg from '../../assets/grandformat.jpg';
import pckImg from '../../assets/packaging.webp';
import bgImage from '../../assets/background website 02.jpg';

const CATEGORIES = [
  { id: 'stickers', num: '01', title: 'Stickers & Découpes', icon: 'content_cut', image: stickersImg, link: '/boutique?categorie=stickers' },
  { id: 'uv', num: '02', title: 'Impression UV HD', icon: 'high_quality', image: uvImg, link: '/boutique?categorie=impression' },
  { id: 'grand-format', num: '03', title: 'Grand Format & Vinyles', icon: 'wallpaper', image: grfImg, link: '/boutique?categorie=grand-format' },
  { id: 'packaging', num: '04', title: 'Packaging sur Mesure', icon: 'inventory_2', image: pckImg, link: '/boutique?categorie=packaging' }
];

const CategoriesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    // min-h-screen : prend toute la hauteur de l'écran comme le Hero
    <section id="categories" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-12 bg-[#071325]">
      
      {/* IMAGE DE FOND AVEC ANIMATION */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full scale-105 animate-slow-zoom"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1F3C]/80 via-[#0D1F3C]/10 to-[#0D1F3C]/50"></div>
      </div>

      {/* Halos de lumière */}
      <div className="absolute top-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#F0C75E]/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[80px] md:blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 relative z-10 w-full flex flex-col h-full">
        
        <SectionHeader
          eyebrow="Domaines d'expertise"
          title="Explorez nos"
          highlight="Savoir-Faire"
        />

        {/* === VUE DESKTOP (PC) === */}
        {/* flex-1 permet de prendre tout l'espace restant sous le titre */}
        <div className="hidden lg:flex flex-row gap-16 items-stretch flex-1 pb-8">
          
          {/* Liste Gauche (Chaque ligne prend une hauteur égale pour remplir l'espace) */}
          <div className="w-1/2 flex flex-col justify-between">
            {CATEGORIES.map((cat, index) => (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveIndex(index)}
                // flex-1 pour que chaque catégorie prenne 1/4 de la hauteur
                className={`group border-b border-white/10 flex-1 flex items-center cursor-pointer transition-all duration-500 relative ${activeIndex === index ? 'pl-6' : 'pl-0'}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#fce8aa] to-[#d4aa3a] transition-all duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`} />
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-6">
                    <span className={`font-['Montserrat'] text-sm font-bold transition-colors duration-500 ${activeIndex === index ? 'text-[#F0C75E]' : 'text-white/30'}`}>{cat.num}</span>
                    <h3 className={`font-['Playfair_Display'] text-4xl transition-colors duration-500 ${activeIndex === index ? 'text-white' : 'text-white/40'}`}>{cat.title}</h3>
                  </div>
                  <span className={`material-symbols-outlined text-[#F0C75E] transition-all duration-500 ${activeIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>{cat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Image Droite (Prend toute la hauteur disponible) */}
          <div className="w-1/2 relative">
            {/* h-full : l'image s'adapte à la hauteur de la liste de gauche */}
            <div className="h-full min-h-[400px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 relative">
              {CATEGORIES.map((cat, index) => (
                <img key={cat.id} src={cat.image} alt={cat.title} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${activeIndex === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/90 via-[#0D1F3C]/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Link to={CATEGORIES[activeIndex].link} className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-xl text-white hover:bg-[#F0C75E] hover:text-[#0D1F3C] transition-all duration-500 group">
                  <span className="font-['Montserrat'] text-xs uppercase tracking-widest font-bold">Découvrir {CATEGORIES[activeIndex].title}</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* === VUE MOBILE (Téléphone) === */}
        <div className="lg:hidden w-full relative mt-8">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 hide-scrollbar">
            {CATEGORIES.map((cat, index) => (
              <div key={cat.id} className="snap-center shrink-0 w-[85vw] sm:w-[60vw] relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/95 via-[#0D1F3C]/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
                  <span className="text-[10px] text-[#F0C75E] font-bold font-['Montserrat']">{cat.num}</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="font-['Playfair_Display'] text-2xl text-white font-bold mb-3">{cat.title}</h3>
                  <Link to={cat.link} className="flex items-center justify-between bg-[#F0C75E] p-3 rounded-xl text-[#0D1F3C]">
                    <span className="font-['Montserrat'] text-[10px] uppercase tracking-widest font-bold">Découvrir</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                {index < CATEGORIES.length - 1 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] animate-slide-hint">
                      <span className="material-symbols-outlined text-white text-xl">chevron_right</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 flex justify-center">
            <Link to="/boutique" className="inline-flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-bold font-['Montserrat'] group">
              Voir toute la boutique
              <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#F0C75E] group-hover:bg-[#F0C75E] group-hover:text-[#0D1F3C] transition-all duration-500">
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </Link>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default CategoriesSection;