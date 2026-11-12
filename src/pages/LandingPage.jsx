// src/pages/LandingPage.jsx
import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Composants de structure
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Sections extraites
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import ProductsSection from '../components/sections/ProductsSection';
import ContactSection from '../components/sections/ContactSection';

// Composants existants
import LuxuryMasonryGallery from '../components/portfolio/LuxuryMasonryGallery';

// =====================================================
// DONNÉES POUR LES SECTIONS RESTANTES
// =====================================================
const SERVICES = [
  { icon: 'design_services', title: 'Studio de Création', subtitle: 'Design sur-mesure', description: 'Graphistes experts pour vos supports de communication.', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&q=80', points: ['Identité visuelle', 'Maquettes interactives', 'Retouches photo'] },
  { icon: 'precision_manufacturing', title: 'Impression Pro', subtitle: 'Technologie de pointe', description: 'Machines dernier cri pour des résultats exceptionnels.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop&q=80', points: ['UV direct', 'Offset numérique', 'Découpe laser'] },
  { icon: 'event_available', title: 'Événementiel & PLV', subtitle: 'Communication terrain', description: 'Solutions d\'affichage pour vos événements.', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop&q=80', points: ['Stand d\'exposition', 'Kakémonos', 'Signalétique'] },
  { icon: 'verified', title: 'Contrôle Qualité', subtitle: 'Excellence garantie', description: 'Contrôle rigoureux à chaque étape de production.', image: 'https://images.unsplash.com/photo-1581092335879-4b1faf40cdb5?w=600&h=400&fit=crop&q=80', points: ['Certification ISO', 'Contrôle couleur', 'Emballage sécurisé'] },
  { icon: 'local_shipping', title: 'Logistique Express', subtitle: 'Livraison rapide', description: 'Livraison rapide dans toute la Tunisie.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop&q=80', points: ['Livraison 24-72h', 'Suivi en ligne', 'Transport sécurisé'] }
];

const PROCESS_STEPS = [
  { step: 1, title: 'Consultation', subtitle: 'On vous écoute', description: 'Analyse de vos besoins.' },
  { step: 2, title: 'Conception', subtitle: 'On crée pour vous', description: 'Maquettes uniques.' },
  { step: 3, title: 'Production', subtitle: 'On fabrique avec soin', description: 'Technologies avancées.' },
  { step: 4, title: 'Livraison', subtitle: 'On vous livre', description: 'Livraison rapide.' }
];

const TESTIMONIALS = [
  { id: 1, name: 'Ahmed Ben Salah', role: 'CEO, EventPro Tunisie', content: 'Ulysse DeZign a transformé nos événements avec des impressions d\'une qualité exceptionnelle.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&q=80', rating: 5 },
  { id: 2, name: 'Leila Trabelsi', role: 'Directrice Marketing', content: 'Les packagings réalisés ont donné à nos produits une image premium incomparable.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&q=80', rating: 5 },
  { id: 3, name: 'Mohamed Ali Ben Hamida', role: 'Architecte d\'intérieur', content: 'La qualité des vinyles et des bâches est incomparable. Je recommande vivement !', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&q=80', rating: 5 }
];

const LandingPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fonction de scroll globale
  const scrollTo = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - headerHeight - 20, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // Gestion du bouton "Scroll to Top"
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    // Défilement automatique des avis
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#081b38] font-['Montserrat'] overflow-x-hidden">
      
      <Navbar scrollTo={scrollTo} />

      <main>
        {/* 1. HERO */}
        <HeroSection scrollTo={scrollTo} />

        {/* 2. STATISTIQUES */}
        <StatsSection />

        {/* 3. CATÉGORIES */}
        <CategoriesSection />

        {/* 4. PRODUITS (Nouvellement extrait) */}
        <ProductsSection />

        {/* 5. PORTFOLIO */}
        <div id="portfolio">
          <LuxuryMasonryGallery />
        </div>

        {/* 6. SERVICES (Remis en place) */}
                {/* 6. SERVICES */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-[#071325]" id="services">
          
          {/* --- DÉCORATIONS DE FOND (Homogène) --- */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
            
            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 sm:mb-20">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="w-8 md:w-12 h-px bg-[#F0C75E]"></span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Notre Expertise</span>
                </div>
                <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight leading-tight">
                  Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">Services</span>
                </h2>
                <p className="text-sm sm:text-base text-white/60 mt-4 font-['Montserrat'] font-light max-w-xl mx-auto md:mx-0">
                  Des solutions complètes et sur-mesure pour tous vos besoins d'impression.
                </p>
              </div>
            </div>

            {/* --- GRILLE DES SERVICES --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {SERVICES.map((service, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-white/5 backdrop-blur-md rounded-[1.5rem] p-3 transition-all duration-700 hover:-translate-y-2 hover:bg-white/10 border border-white/10 hover:border-[#F0C75E]/30 hover:shadow-[0_20px_50px_-12px_rgba(240,199,94,0.15)] flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 rounded-[1rem] overflow-hidden bg-[#0D1F3C]">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/90 via-[#0D1F3C]/20 to-transparent"></div>
                    
                    {/* Icône en verre dépoli */}
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[#F0C75E] transition-colors duration-500">
                      <span className="material-symbols-outlined text-white group-hover:text-[#0D1F3C] text-2xl transition-colors duration-500">{service.icon}</span>
                    </div>
                  </div>

                  {/* Texte */}
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#F0C75E] mb-2">
                      {service.subtitle || 'Service Premium'}
                    </p>
                    <h3 className="font-['Playfair_Display'] text-xl text-white font-bold leading-tight mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed font-['Montserrat'] font-light">
                      {service.description}
                    </p>
                    
                    {/* Liste des points forts (si présents dans vos données) */}
                    {service.points && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {service.points.map((point, i) => (
                          <span key={i} className="text-[9px] bg-white/5 text-white/70 px-2 py-1 rounded-full border border-white/5">
                            ✓ {point}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

                {/* 7. PROCESSUS (Compact et Moderne) */}
        <section className="py-16 md:py-20 relative overflow-hidden bg-[#071325]">
          
          {/* Décorations de fond */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071325] to-[#0D1F3C]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#F0C75E]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
            
            {/* En-tête compact */}
            <div className="text-center mb-10 md:mb-16">
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight">
                Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">Processus</span>
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-2 font-['Montserrat']">
                De l'idée à la réalisation en quelques étapes.
              </p>
            </div>

            {/* Grille des étapes (Design compact sans grosses cartes) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 relative">
              
              {/* Ligne de connexion derrière les numéros (visible uniquement sur PC) */}
              <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#F0C75E]/30 to-transparent z-0"></div>

              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="relative text-center group z-10">
                  
                  {/* Numéro (Petit cercle doré) */}
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#0D1F3C] border border-[#F0C75E]/50 flex items-center justify-center text-[#F0C75E] font-['Playfair_Display'] text-lg font-bold shadow-[0_0_15px_-3px_rgba(240,199,94,0.3)] group-hover:scale-110 group-hover:bg-[#F0C75E] group-hover:text-[#0D1F3C] transition-all duration-500">
                    {step.step}
                  </div>
                  
                  {/* Texte (Sans fond, juste posé sur le fond sombre) */}
                  <div className="mt-4">
                    <span className="text-[9px] text-[#F0C75E] font-bold uppercase tracking-widest opacity-80">
                      {step.subtitle}
                    </span>
                    <h3 className="font-['Playfair_Display'] text-base md:text-lg text-white font-semibold mt-1 group-hover:text-[#F0C75E] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-[11px] md:text-xs text-white/50 mt-1 font-['Montserrat'] leading-relaxed max-w-[150px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                  
                </div>
              ))}
            </div>

          </div>
        </section>

               {/* 8. AVIS CLIENTS (Design Premium) */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-[#071325]" id="testimonials">
          
          {/* --- DÉCORATIONS DE FOND HOMOGÈNES --- */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]"></div>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
            
            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 sm:mb-16">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="w-8 md:w-12 h-px bg-[#F0C75E]"></span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Témoignages</span>
                </div>
                <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight leading-tight">
                  Ce qu'ils pensent de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">nous</span>
                </h2>
              </div>
            </div>

            {/* --- CARROUSEL D'AVIS --- */}
            <div className="relative max-w-3xl mx-auto">
              <div className="relative overflow-hidden min-h-[250px] md:min-h-[220px]">
                {TESTIMONIALS.map((testimonial, idx) => (
                  <div 
                    key={testimonial.id} 
                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex items-center justify-center ${
                      idx === activeTestimonial 
                        ? 'opacity-100 translate-x-0 z-10' 
                        : 'opacity-0 -translate-x-full pointer-events-none z-0'
                    }`}
                  >
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] w-full relative">
                      
                      {/* Icône de citation décorative */}
                      <div className="absolute top-6 right-8 text-[#F0C75E]/10">
                        <span className="material-symbols-outlined text-6xl">format_quote</span>
                      </div>

                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#F0C75E] flex-shrink-0 shadow-[0_0_20px_rgba(240,199,94,0.3)]">
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Texte */}
                        <div className="text-center md:text-left flex-1">
                          <div className="flex justify-center md:justify-start gap-1 text-[#F0C75E] mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                          </div>
                          
                          <p className="text-lg md:text-xl text-white/90 font-['Playfair_Display'] italic leading-relaxed mb-4">
                            "{testimonial.content}"
                          </p>
                          
                          <div>
                            <h4 className="font-['Playfair_Display'] text-lg text-white font-bold">{testimonial.name}</h4>
                            <p className="text-xs text-[#F0C75E] font-['Montserrat'] uppercase tracking-wider mt-1">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicateurs de navigation (Points) */}
              <div className="flex justify-center gap-3 mt-8">
                {TESTIMONIALS.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveTestimonial(idx)} 
                    className={`transition-all duration-500 rounded-full ${
                      idx === activeTestimonial 
                        ? 'bg-[#F0C75E] w-10 h-2 shadow-[0_0_10px_rgba(240,199,94,0.5)]' 
                        : 'bg-white/20 w-2 h-2 hover:bg-white/40'
                    }`} 
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 9. AVANTAGES (Remis en place) */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 text-center">
            {[
              { icon: 'high_quality', title: 'Résolution Extra HD', desc: 'Une finesse de détail inégalée pour toutes vos impressions.' },
              { icon: 'shield', title: 'Durée de Vie Prolongée', desc: 'Encres polymérisées aux UV pour une résistance optimale.' },
              { icon: 'content_cut', title: 'Découpe Laser Précise', desc: 'Contours nets et formes complexes avec précision chirurgicale.' },
              { icon: 'rocket_launch', title: 'Production Express', desc: 'Expédition sous 48h pour vos projets prioritaires.' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-[#F0C75E]/20 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[#F0C75E] text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#4A6A8A] font-['Montserrat'] font-light mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

               {/* 10. NEWSLETTER (Design Premium) */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-[#071325]">
          
          {/* --- DÉCORATIONS DE FOND HOMOGÈNES --- */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(240,199,94,0.15)] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0C75E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0C75E]"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Ne manquez rien</span>
            </div>

            {/* Titre */}
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight mb-4">
              Rejoignez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">Cercle Privé</span>
            </h2>
            
            <p className="text-sm sm:text-base text-white/60 mb-10 font-['Montserrat'] font-light max-w-lg mx-auto">
              Inscrivez-vous pour recevoir nos invitations exclusives, nos conseils de design et nos offres privilèges.
            </p>

            {/* Formulaire */}
            <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="flex-1 px-6 py-4 rounded-full bg-[#0D1F3C]/50 backdrop-blur-md border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0C75E] focus:ring-1 focus:ring-[#F0C75E]/50 font-['Montserrat'] text-sm transition-all duration-300" 
              />
              <button 
                type="submit" 
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] font-bold font-['Montserrat'] text-sm uppercase tracking-widest overflow-hidden shadow-[0_0_30px_-10px_rgba(240,199,94,0.6)] hover:shadow-[0_0_40px_-10px_rgba(240,199,94,0.8)] transition-all duration-500 hover:-translate-y-0.5"
              >
                <span className="relative z-10">S'inscrire</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></span>
              </button>
            </form>

          </div>
        </section>

             {/* =============================================
          11. FORMULAIRE DE CONTACT
          ============================================= */}
      <ContactSection />
      </main>

      <Footer scrollTo={scrollTo} />

      {/* =============================================
          BOUTONS FLOTTANTS (Design Premium)
          ============================================= */}
      
      {/* Bouton WhatsApp */}
      <a 
        href="https://wa.me/21699477391" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="group fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_-10px_rgba(37,211,102,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(37,211,102,0.8)] hover:scale-110 transition-all duration-500 flex items-center justify-center"
      >
        {/* Effet de pulsation derrière le bouton */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40"></span>
        
        <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Bouton Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group fixed bottom-24 right-6 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-[#F0C75E] p-3 rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:bg-[#F0C75E] hover:text-[#0D1F3C] hover:border-[#F0C75E] hover:scale-110 hover:shadow-[0_0_20px_-5px_rgba(240,199,94,0.6)] transition-all duration-500 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-2xl font-bold group-hover:-translate-y-1 transition-transform">arrow_upward</span>
        </button>
      )}
    </div>
  );
};

export default LandingPage;