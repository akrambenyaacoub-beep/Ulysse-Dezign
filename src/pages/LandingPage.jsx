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
        <section className="py-16 sm:py-20 md:py-24 bg-white" id="services">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-semibold">Nos Services</h2>
              <p className="text-sm sm:text-base md:text-lg text-[#4A6A8A] mt-3 font-['Montserrat'] font-light">Des solutions complètes pour tous vos besoins d'impression</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {SERVICES.map((service, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#F8FAFC] border border-[#e8e8ec] hover:border-[#F0C75E] transition-all duration-700 hover:-translate-y-2 hover:shadow-xl">
                  <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                    <img src={service.image} alt={service.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/70 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 bg-[#F0C75E] p-2 rounded-lg">
                      <span className="material-symbols-outlined text-[#0D1F3C] text-2xl">{service.icon}</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#1A3A6B] font-semibold">{service.title}</h3>
                    <p className="text-xs sm:text-sm text-[#4A6A8A] mt-2 font-['Montserrat'] font-light">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. PROCESSUS (Remis en place) */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-semibold">Notre Processus</h2>
              <p className="text-sm sm:text-base md:text-lg text-[#4A6A8A] mt-3 font-['Montserrat'] font-light">De l'idée à la réalisation en quelques étapes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="relative text-center">
                  <div className="relative z-10">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto rounded-full bg-[#1A3A6B] border-2 border-[#F0C75E] flex items-center justify-center text-white font-['Playfair_Display'] text-xl sm:text-2xl font-bold shadow-lg">{step.step}</div>
                    <div className="mt-4 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8e8ec] shadow-sm">
                      <span className="text-[8px] sm:text-[10px] text-[#F0C75E] font-medium uppercase tracking-wider">{step.subtitle}</span>
                      <h3 className="font-['Playfair_Display'] text-base sm:text-lg text-[#1A3A6B] font-semibold mt-1">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-[#4A6A8A] mt-2 font-['Montserrat'] font-light">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. AVIS CLIENTS */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#1A3A6B] text-white" id="testimonials">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-semibold">⭐ Avis Clients</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="relative overflow-hidden min-h-[200px]">
                {TESTIMONIALS.map((testimonial, idx) => (
                  <div key={testimonial.id} className={`transition-all duration-1000 transform ${idx === activeTestimonial ? 'opacity-100 translate-x-0 relative' : 'opacity-0 absolute inset-0 translate-x-full pointer-events-none'}`}>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F0C75E] flex-shrink-0">
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-['Playfair_Display'] text-lg text-white font-semibold">{testimonial.name}</h4>
                          <p className="text-xs text-white/50 font-['Montserrat']">{testimonial.role}</p>
                          <div className="text-sm mt-0.5">{'⭐'.repeat(testimonial.rating)}</div>
                        </div>
                      </div>
                      <p className="text-base sm:text-lg text-white/80 font-['Playfair_Display'] italic">"{testimonial.content}"</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {TESTIMONIALS.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveTestimonial(idx)} className={`transition-all duration-500 ${idx === activeTestimonial ? 'bg-[#F0C75E] w-8 h-1.5 rounded-full' : 'bg-white/20 w-1.5 h-1.5 rounded-full hover:bg-white/40'}`} />
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

        {/* 10. NEWSLETTER (Remis en place) */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#F8FAFC] relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-10%] w-64 h-64 border border-[#F0C75E]/10 rounded-full"></div>
          <div className="absolute left-[-10%] bottom-[-10%] w-64 h-64 border border-[#1A3A6B]/10 rounded-full"></div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-block border border-[#F0C75E]/20 px-5 py-1.5 rounded-full mb-4">
              <span className="text-[10px] sm:text-xs font-['Montserrat'] uppercase tracking-[0.3em] text-[#F0C75E] font-light">Ne manquez rien</span>
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl text-[#1A3A6B] font-semibold mb-3">📬 Rejoignez le Cercle Privé</h2>
            <p className="text-sm sm:text-base text-[#4A6A8A] mb-6 sm:mb-8 font-['Montserrat'] font-light">
              Inscrivez-vous pour recevoir nos invitations exclusives, nos conseils de design et nos offres privilèges.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Votre adresse email" className="flex-1 px-4 py-3 rounded-full bg-white border border-[#c4c6d0] text-[#081b38] focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm transition-all duration-500" />
              <button type="submit" className="px-6 py-3 bg-[#1A3A6B] text-white rounded-full font-semibold hover:bg-[#0D1F3C] transition-all duration-500 font-['Montserrat'] text-sm">S'inscrire</button>
            </form>
          </div>
        </section>

        {/* 11. FORMULAIRE DE CONTACT */}
        <ContactSection />
      </main>

      <Footer scrollTo={scrollTo} />

      {/* BOUTONS FLOTTANTS */}
      <a href="https://wa.me/21699477391" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-500">
        <span className="text-xl">💬</span>
      </a>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-6 z-50 bg-[#F0C75E] text-[#0D1F3C] p-3 rounded-full shadow-xl hover:scale-105 transition-all duration-500 text-lg"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default LandingPage;