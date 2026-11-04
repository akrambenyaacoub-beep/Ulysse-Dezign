// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';
import logoImage from '../../assets/logo.png';

const Navbar = ({ scrollTo }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    scrollTo(id);
  };

  const navItems = [
    { id: 'categories', label: 'Catégories' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'products', label: 'Produits' },
    { id: 'services', label: 'Services' },
    { id: 'testimonials', label: 'Avis' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-[#F0C75E]/20 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.05)]' 
            : 'bg-gradient-to-b from-black/50 to-transparent py-6'
        }`}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 w-full max-w-[1400px] mx-auto">
          
          {/* --- LOGO --- */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleScrollTo('home')}
          >
            <span className={`font-['Playfair_Display'] text-2xl sm:text-3xl font-bold transition-colors duration-500 ${
              scrolled ? 'text-[#0D1F3C]' : 'text-white'
            }`}>
              Ulysse <span className="text-[#F0C75E] group-hover:text-[#d4aa3a] transition-colors">DeZign</span>
            </span>
          </div>
          
          {/* --- NAVIGATION DESKTOP --- */}
          <nav className="hidden lg:flex items-center gap-10">
            
            {/* Liens */}
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleScrollTo(item.id)} 
                  className={`relative group text-[13px] uppercase tracking-[0.15em] font-semibold transition-colors duration-300 ${
                    scrolled ? 'text-[#4A6A8A] hover:text-[#0D1F3C]' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* Ligne dorée animée au survol */}
                  <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#F0C75E] transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>
            
            {/* Boutons d'action */}
            <div className="flex items-center gap-4 ml-4">
              {/* Bouton Équipage (Outline) */}
              <Link 
                to="/login" 
                className={`group relative px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-500 overflow-hidden border ${
                  scrolled 
                    ? 'border-[#1A3A6B] text-[#1A3A6B] hover:bg-[#1A3A6B] hover:text-white' 
                    : 'border-white/30 text-white hover:border-white'
                }`}
              >
                <span className="relative z-10">Équipage</span>
                {/* Effet de remplissage au survol */}
                {!scrolled && (
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                )}
              </Link>

              {/* Bouton Vitrine (Couleur) */}
              <Link 
                to="/boutique" 
                className={`group relative px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-500 overflow-hidden shadow-lg ${
                  scrolled 
                    ? 'bg-[#0D1F3C] text-white hover:bg-[#1A3A6B]' 
                    : 'bg-[#F0C75E] text-[#0D1F3C] hover:bg-[#d4aa3a]'
                } hover:shadow-xl`}
              >
                <span className="relative z-10">Vitrine</span>
                {/* Effet de brillance (Shine) */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
              </Link>

              {/* Bouton Client (Plein Doré) */}
              <Link 
                to="/client/login" 
                className="group relative px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-500 overflow-hidden shadow-lg bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] hover:shadow-[#F0C75E]/40 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Client</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
              </Link>
            </div>
          </nav>

          {/* --- BURGER MENU (Mobile) --- */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center focus:outline-none"
          >
            <div className="relative w-6 h-5">
              <span className={`absolute block h-[2px] w-full rounded-full transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 top-2' : 'top-0'} ${scrolled ? 'bg-[#0D1F3C]' : 'bg-white'}`}></span>
              <span className={`absolute block h-[2px] w-full rounded-full transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0' : 'top-2'} ${scrolled ? 'bg-[#0D1F3C]' : 'bg-white'}`}></span>
              <span className={`absolute block h-[2px] w-full rounded-full transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 top-2' : 'top-4'} ${scrolled ? 'bg-[#0D1F3C]' : 'bg-white'}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* --- MENU MOBILE PLEIN ÉCRAN --- */}
      <div 
        className={`lg:hidden fixed inset-0 bg-[#0D1F3C]/95 backdrop-blur-2xl z-40 transition-all duration-500 flex flex-col justify-center items-center ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Logo dans le menu mobile */}
        <div className="h-24 mb-10">
          <OptimizedImage src={logoImage} alt="Ulysse DeZign" className="h-full w-auto object-contain" lazy={false} />
        </div>
        
        <div className="w-12 h-[1px] bg-[#F0C75E]/50 mb-10"></div>
        
        {/* Liens Mobiles */}
        <nav className="flex flex-col items-center gap-6 w-full max-w-xs mb-12">
          {[
            { id: 'home', label: 'Accueil' },
            { id: 'categories', label: 'Catégories' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'products', label: 'Produits' },
            { id: 'services', label: 'Services' },
            { id: 'testimonials', label: 'Avis' },
            { id: 'contact', label: 'Contact' }
          ].map((item, idx) => (
            <button 
              key={item.id} 
              onClick={() => handleScrollTo(item.id)} 
              className="text-white text-xl font-['Playfair_Display'] italic hover:text-[#F0C75E] transition-colors duration-300"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Boutons Mobiles */}
        <div className="flex flex-col gap-4 w-full max-w-xs px-6">
          <Link 
            to="/boutique" 
            className="w-full text-center bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] px-6 py-4 rounded-full font-['Montserrat'] text-xs uppercase tracking-widest font-bold" 
            onClick={() => setMobileMenuOpen(false)}
          >
            Explorer la Vitrine
          </Link>
          <div className="flex gap-3">
            <Link 
              to="/login" 
              className="flex-1 text-center border border-white/20 text-white px-4 py-4 rounded-full font-['Montserrat'] text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Équipage
            </Link>
            <Link 
              to="/client/login" 
              className="flex-1 text-center border border-white/20 text-white px-4 py-4 rounded-full font-['Montserrat'] text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Client
            </Link>
          </div>
        </div>
        
        {/* Bouton Fermer */}
        <button 
          onClick={() => setMobileMenuOpen(false)} 
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-4xl font-light">close</span>
        </button>
      </div>
    </>
  );
};

export default Navbar;