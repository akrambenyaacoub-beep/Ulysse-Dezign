// src/components/sections/HeroSection.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../../assets/background website.png';

// Les 4 produits avec les données de la ProductsSection
const HERO_PRODUCTS = [
  { id: 1, name: 'Stickers Vinyle Premium', subtitle: 'Collection Signature', price: '45€', ancienPrix: '65€', badge: '⭐ Top Vente', image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&h=800&fit=crop&q=80' },
  { id: 2, name: 'Roll-Up Élégance Pro', subtitle: 'Communication Premium', price: '195€', badge: '🔥 Nouveauté', image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=800&fit=crop&q=80' },
  { id: 3, name: 'Bâche Extérieure 550g', subtitle: 'Résistance Ultime', price: '89€', ancienPrix: '120€', badge: '🌟 Best-Seller', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=800&fit=crop&q=80' },
  { id: 4, name: 'Impression UV Plexiglas', subtitle: 'Art & Photographie', price: '135€', badge: '✨ Premium', image: 'https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?w=600&h=800&fit=crop&q=80' }
];

const whatsappLink = `https://wa.me/21699477391?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20services%20d%27impression`;

const HeroSection = ({ scrollTo }) => {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fonction pour faire défiler d'une carte vers la gauche ou la droite
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      
      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  // Fonction pour mettre à jour l'index actif lors du scroll (swipe)
  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0D1F3C] pt-20" id="home">
      
      {/* --- FOND ET EFFETS LUMINEUX --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1F3C]/90 via-[#0D1F3C]/70 to-[#0D1F3C]/40"></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#F0C75E]/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-16 items-center relative z-10 w-full pt-10 pb-20">
        
        {/* --- PARTIE GAUCHE : LE TEXTE --- */}
        <div className="order-1 md:order-1 space-y-4 md:space-y-6 text-center md:text-left animate-slide-right">
          
          <div className="inline-flex items-center gap-2.5 mx-auto md:mx-0 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(240,199,94,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0C75E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0C75E]"></span>
            </span>
            <span className="font-['Montserrat'] text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold">
              L'Art de l'Impression
            </span>
          </div>
          
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-[5rem] text-white leading-[1.1] font-bold tracking-tight drop-shadow-lg">
            L'Excellence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">
              de l'Impression
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl text-white/90 font-['Playfair_Display'] italic font-light max-w-lg mx-auto md:mx-0">
            "Plus qu'une imprimerie, une expérience."
          </p>

          <p className="text-xs sm:text-sm md:text-base text-white/60 max-w-md leading-relaxed font-['Montserrat'] font-light mx-auto md:mx-0">
            Sublimez votre image de marque avec des finitions d'exception. Découpe laser, vinyle haute performance, et impression UV de pointe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4 justify-center md:justify-start">
            <Link 
              to="/boutique" 
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] px-8 py-3 md:py-4 rounded-full font-['Montserrat'] text-xs md:text-sm uppercase tracking-[0.15em] font-bold overflow-hidden shadow-[0_0_30px_-10px_rgba(240,199,94,0.6)] hover:shadow-[0_0_50px_-10px_rgba(240,199,94,0.8)] transition-all duration-500 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explorer la vitrine
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></span>
            </Link>
          </div>
        </div>
        
        {/* --- PARTIE DROITE : LE CARROUSEL SWIPE --- */}
        <div className="order-2 md:order-2 mt-8 md:mt-0 flex justify-center md:justify-end animate-slide-left">
          
          {/* Cadre doré d'origine */}
          <div className="relative w-full max-w-[360px] group">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a] transform rotate-3 scale-105 transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-[0_0_50px_-10px_rgba(240,199,94,0.4)] animate-gold-shimmer -z-10"></div>
            
            {/* Conteneur du carrousel (Snap Scroll) */}
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20 bg-[#0D1F3C] z-10">
              <div 
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory h-full w-full hide-scrollbar"
              >
                {HERO_PRODUCTS.map((product) => (
                  <div key={product.id} className="snap-center shrink-0 w-full h-full relative group/card">
                    
                    {/* Image du produit en fond de carte */}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-110" 
                      loading="lazy" 
                    />
                    
                    {/* Dégradé pour la lisibilité */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/95 via-[#0D1F3C]/40 to-transparent" />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-[#0D1F3C] shadow-lg">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Contenu textuel en bas */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 flex flex-col justify-end z-20">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#F0C75E] mb-1">
                        {product.subtitle}
                      </p>
                      <h3 className="font-['Playfair_Display'] text-xl text-white font-bold leading-tight mb-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/20">
                        <div className="flex flex-col">
                          {product.ancienPrix && <span className="text-[10px] text-white/50 line-through">{product.ancienPrix}</span>}
                          <span className="font-['Playfair_Display'] text-xl text-[#F0C75E] font-bold">
                            {product.price}
                          </span>
                        </div>
                        <button onClick={() => window.open(whatsappLink, '_blank')} className="w-9 h-9 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300 flex-shrink-0">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 👇 FLÈCHES DE NAVIGATION (Gauche / Droite) */}
              {activeIndex > 0 && (
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#F0C75E] hover:text-[#0D1F3C] hover:border-[#F0C75E] transition-all duration-300"
                  aria-label="Produit précédent"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
              )}

              {activeIndex < HERO_PRODUCTS.length - 1 && (
                <button 
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#F0C75E] hover:text-[#0D1F3C] hover:border-[#F0C75E] transition-all duration-300"
                  aria-label="Produit suivant"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              )}
            </div>

            {/* Indicateur de pagination (Dots) */}
            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center items-center gap-2 pointer-events-none">
              <div className="flex gap-1.5 items-center bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                {HERO_PRODUCTS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === activeIndex ? 'w-4 bg-[#F0C75E]' : 'w-1.5 bg-white/40'
                    }`} 
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
        
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer z-20" onClick={() => scrollTo('categories')}>
        <span className="text-white text-[9px] uppercase tracking-[0.3em] font-['Montserrat']">Découvrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;