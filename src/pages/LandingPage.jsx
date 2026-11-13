// src/pages/LandingPage.jsx
import { useCallback, useState, useEffect } from 'react';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

import HeroSection from '../components/sections/HeroSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import LuxuryMasonryGallery from '../components/portfolio/LuxuryMasonryGallery';
import StatsSection from '../components/sections/StatsSection';
import ContactSection from '../components/sections/ContactSection';

// =====================================================
// 1. DONNÉES
// =====================================================
const SERVICES_LIST = [
  { id: '01', title: 'Conception graphique', subtitle: 'Identité & Design', description: 'Création de logos, chartes graphiques et supports de communication sur-mesure pour affirmer votre image de marque.', icon: 'draw' },
  { id: '02', title: 'Création de contenus', subtitle: 'Digital & Print', description: 'Élaboration de visuels percutants, rédaction web et gestion de vos réseaux sociaux pour engager votre audience.', icon: 'auto_awesome' },
  { id: '03', title: 'Pose de vinyle', subtitle: 'Habillage & Signalétique', description: 'Application professionnelle de vinyles adhésifs sur véhicules, vitrines et murs intérieurs avec une finition parfaite.', icon: 'layers' },
  { id: '04', title: 'Installation façade', subtitle: 'Enseignes & Grand Format', description: 'Conception et pose d\'enseignes lumineuses, lettres découpées et habillages de façades pour une visibilité maximale.', icon: 'storefront' },
  { id: '05', title: 'Création plateforme', subtitle: 'Web & Landing Page', description: 'Développement de sites vitrines, e-commerce et landing pages optimisées pour la conversion et l\'expérience utilisateur.', icon: 'devices' },
];

const PROCESS_STEPS = [
  { step: 1, title: 'Consultation', subtitle: 'On vous écoute', description: 'Analyse de vos besoins.' },
  { step: 2, title: 'Conception', subtitle: 'On crée pour vous', description: 'Maquettes uniques.' },
  { step: 3, title: 'Production', subtitle: 'On fabrique avec soin', description: 'Technologies avancées.' },
  { step: 4, title: 'Livraison', subtitle: 'On vous livre', description: 'Livraison rapide.' }
];

// =====================================================
// 2. COMPOSANT PRINCIPAL
// =====================================================
const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollTo = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - headerHeight - 20, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // 👇 On écoute le scroll natif du navigateur (window)
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#081b38] font-['Montserrat']">
      
      <Navbar scrollTo={scrollTo} />

      {/* 👇 La div .snap-container a été supprimée. Le scroll est géré par le body. */}
      
      {/* 1. HERO */}
      <div className="snap-section w-full">
        <HeroSection scrollTo={scrollTo} />
      </div>

      {/* 2. CATÉGORIES */}
      <div className="snap-section w-full">
        <CategoriesSection />
      </div>

      {/* 3. PORTFOLIO */}
      <div className="snap-section w-full" id="portfolio">
        <LuxuryMasonryGallery />
      </div>

     {/* 4. SERVICES & PROCESSUS */}
<div className="snap-section w-full">
  <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#071325] py-20" id="services">
    
    <div className="absolute inset-0 bg-gradient-to-b from-[#071325] to-[#0A1628]" />
    
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10 w-full h-full flex flex-col justify-center">
      
      {/* En-tête */}
      <div className="text-center mb-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#F0C75E] font-bold font-['Montserrat'] mb-4">
          Notre Savoir-Faire
        </p>
        <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl text-white font-bold tracking-tight">
          Une expertise <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a]">complète</span>
        </h2>
      </div>

      {/* Les 5 services (Taille maîtrisée, centrées) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 w-full mb-20">
        {SERVICES_LIST.map((service) => (
          <div 
            key={service.id} 
            className="group relative flex flex-col justify-center p-6 border border-white/5 bg-white/[0.02] rounded-2xl hover:bg-white/[0.05] transition-all duration-500 overflow-hidden min-h-[180px]"
          >
            {/* Effet de ligne dorée qui monte du bas au survol */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            
            <span className="text-[10px] font-bold text-[#F0C75E]/50 group-hover:text-[#F0C75E] mb-4 transition-colors duration-500">
              {service.id}
            </span>
            <h3 className="font-['Playfair_Display'] text-lg md:text-xl text-white/80 group-hover:text-white font-bold leading-tight mb-4 transition-colors duration-500">
              {service.title}
            </h3>
            <p className="text-[9px] uppercase tracking-widest text-[#F0C75E]/70 group-hover:text-[#F0C75E] font-semibold mt-auto transition-colors duration-500">
              {service.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline Processus */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-px bg-[#F0C75E]/30"></span>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Notre Processus</p>
          <span className="w-12 h-px bg-[#F0C75E]/30"></span>
        </div>
        
        <div className="relative w-full max-w-5xl flex items-center justify-between">
          <div className="absolute top-5 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#F0C75E]/30 to-transparent z-0" />
          {PROCESS_STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-[#071325] border border-[#F0C75E]/40 flex items-center justify-center text-[#F0C75E] font-['Playfair_Display'] text-sm font-bold mb-4 group-hover:scale-110 group-hover:bg-[#F0C75E] group-hover:text-[#071325] transition-all duration-500 shadow-[0_0_15px_-3px_rgba(240,199,94,0.3)]">
                {step.step}
              </div>
              <span className="text-[8px] font-bold text-[#F0C75E] uppercase tracking-widest mb-1">{step.subtitle}</span>
              <h4 className="font-['Playfair_Display'] text-base text-white font-semibold">{step.title}</h4>
            </div>
          ))}
        </div>
      </div>

    </div>
  </section>
</div>

      {/* 5. STATS & AVIS */}
      <div className="snap-section w-full">
        <StatsSection />
      </div>

      {/* 6. CONTACT */}
      <div className="snap-section w-full">
        <ContactSection />
      </div>

      <Footer scrollTo={scrollTo} />

      {/* WhatsApp flottant */}
      <a href="https://wa.me/21699477391" target="_blank" rel="noopener noreferrer" className="group fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_-10px_rgba(37,211,102,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(37,211,102,0.8)] hover:scale-110 transition-all duration-500 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40" />
        <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {showScrollTop && (
        <button onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} className="group fixed bottom-24 right-6 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-[#F0C75E] p-3 rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:bg-[#F0C75E] hover:text-[#0D1F3C] hover:border-[#F0C75E] hover:scale-110 hover:shadow-[0_0_20px_-5px_rgba(240,199,94,0.6)] transition-all duration-500 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl font-bold group-hover:-translate-y-1 transition-transform">arrow_upward</span>
        </button>
      )}
    </div>
  );
};

export default LandingPage;