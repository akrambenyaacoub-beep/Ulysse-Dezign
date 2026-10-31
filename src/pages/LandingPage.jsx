// src/pages/LandingPage.jsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabaseErp } from '../lib/supabaseErp';
import OptimizedImage from '../components/OptimizedImage';
import LuxuryMasonryGallery from '../components/portfolio/LuxuryMasonryGallery';

// Import des images
import logoImage from '../assets/sticker Ulysse.png';
import heroImage from '../assets/img01.png';

// =====================================================
// CONFIGURATION
// =====================================================
const whatsappNumber = "21699477391";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20services%20d%27impression`;

// =====================================================
// IMAGES
// =====================================================
const IMAGES = {
  logo: logoImage,
  hero: heroImage,
  heroBg: 'https://www.quebec-printing.com/wp-content/uploads/2025/12/preparation-fichiers-impression-grand-format-qualite-dpi.webp',
  
  stickers: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&h=500&fit=crop&q=80',
  uv: 'https://sc04.alicdn.com/kf/H004a2c55a6ac4169a81b1730fd5e63e8h.jpg',
  grandFormat: 'https://yangraph.ma/wp-content/uploads/2026/06/baches-usages-facade-chantier-casablanca.webp',
  packaging: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJPdlDxrKIri_qqm4vFC3kKEGUl6dLcCUkZtH6WtNCe0GHKqO-r64IOo6n&s=10',
  
  stickerVinyles: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&h=600&fit=crop&q=80',
  rollUp: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=600&fit=crop&q=80',
  bache: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop&q=80',
  plexiglas: 'https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?w=600&h=600&fit=crop&q=80',
  flyers: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=80',
  cartesVisite: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop&q=80',
  
  design: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&q=80',
  production: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop&q=80',
  qualite: 'https://images.unsplash.com/photo-1581092335879-4b1faf40cdb5?w=600&h=400&fit=crop&q=80',
  livraison: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop&q=80',
  evenementiel: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop&q=80',
  
  témoin1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&q=80',
  témoin2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&q=80',
  témoin3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&q=80',
  
  etape1: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&q=80',
  etape2: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop&q=80',
  etape3: 'https://images.unsplash.com/photo-1581092335879-4b1faf40cdb5?w=400&h=300&fit=crop&q=80',
  etape4: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&q=80',
};

// =====================================================
// CATÉGORIES
// =====================================================
const CATEGORIES = [
  {
    id: 'stickers',
    title: 'Stickers & Découpes',
    icon: 'content_cut',
    description: 'Techniques & Formes',
    image: IMAGES.stickers,
    link: '/boutique?categorie=stickers',
    badge: 'Populaire'
  },
  {
    id: 'uv',
    title: 'Impression UV HD',
    icon: 'high_quality',
    description: 'Haute Résolution',
    image: IMAGES.uv,
    link: '/boutique?categorie=impression',
    badge: 'Premium'
  },
  {
    id: 'grand-format',
    title: 'Grand Format & Vinyles',
    icon: 'wallpaper',
    description: 'Affichage & Décor',
    image: IMAGES.grandFormat,
    link: '/boutique?categorie=grand-format',
    badge: 'Best-Seller'
  },
  {
    id: 'packaging',
    title: 'Packaging sur Mesure',
    icon: 'inventory_2',
    description: 'Solutions Premium',
    image: IMAGES.packaging,
    link: '/boutique?categorie=packaging',
    badge: 'Sur-Mesure'
  }
];

// =====================================================
// PRODUITS
// =====================================================
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Stickers Vinyle Premium',
    subtitle: 'Collection Signature',
    description: 'Vinyle de luxe avec découpe laser précise. Résistance UV 5 ans, waterproof et anti-rayures.',
    price: '45€',
    ancienPrix: '65€',
    badge: '⭐ Top Vente',
    image: IMAGES.stickerVinyles,
    categorie: 'Stickers',
    stock: true,
    format: 'A4 | A3 | A2',
    delai: '48h',
    features: ['Découpe laser', 'UV résistant', 'Finition mate/brillante'],
    garantie: '5 ans'
  },
  {
    id: 2,
    name: 'Roll-Up Élégance Pro',
    subtitle: 'Communication Premium',
    description: 'Standee professionnel en aluminium brossé. Impression 1440 DPI sur vinyle mat anti-reflet.',
    price: '195€',
    badge: '🔥 Nouveauté',
    image: IMAGES.rollUp,
    categorie: 'Grand Format',
    stock: true,
    format: '85x200cm | 100x250cm',
    delai: '72h',
    features: ['Aluminium brossé', 'Déploiement silencieux', 'Sac inclus'],
    garantie: '3 ans'
  },
  {
    id: 3,
    name: 'Bâche Extérieure 550g',
    subtitle: 'Résistance Ultime',
    description: 'Bâche haute performance pour l\'extérieur. Résistance UV, intempéries et déchirures.',
    price: '89€',
    ancienPrix: '120€',
    badge: '🌟 Best-Seller',
    image: IMAGES.bache,
    categorie: 'Grand Format',
    stock: true,
    format: '150x200cm | 200x300cm',
    delai: '48h',
    features: ['550g/m²', 'UV résistant', 'Œillets laiton'],
    garantie: '5 ans'
  },
  {
    id: 4,
    name: 'Impression UV Plexiglas',
    subtitle: 'Art & Photographie',
    description: 'Impression UV haute définition sur supports rigides de luxe. Rendu exceptionnel.',
    price: '135€',
    badge: '✨ Premium',
    image: IMAGES.plexiglas,
    categorie: 'Impression',
    stock: true,
    format: 'A4 à 120x80cm',
    delai: '72h',
    features: ['UV direct', 'Support rigide', 'Résistance UV'],
    garantie: '10 ans'
  },
  {
    id: 5,
    name: 'Flyers & Plaquettes HA',
    subtitle: 'Communication Papier',
    description: 'Flyers sur papier couché 300g avec finition mate ou brillante. Offset haute définition.',
    price: '29€',
    ancienPrix: '45€',
    badge: '💡 Promo',
    image: IMAGES.flyers,
    categorie: 'Paperboard',
    stock: true,
    format: 'A6 | A5 | A4 | A3',
    delai: '24h',
    features: ['Papier 300g', 'Finition mate/brillante', 'Recto/verso'],
    garantie: '2 ans'
  },
  {
    id: 6,
    name: 'Cartes de Visite Prestige',
    subtitle: 'Identité de Marque',
    description: 'Cartes de visite sur papier 350g avec finition premium. Recto/verso, dorure optionnelle.',
    price: '19€',
    badge: '📇 Populaire',
    image: IMAGES.cartesVisite,
    categorie: 'Paperboard',
    stock: true,
    format: '85x54mm | 90x55mm',
    delai: '24h',
    features: ['Papier 350g', 'Recto/verso', 'Dorure optionnelle'],
    garantie: '2 ans'
  }
];

// =====================================================
// SERVICES
// =====================================================
const SERVICES = [
  {
    icon: 'design_services',
    title: 'Studio de Création',
    subtitle: 'Design sur-mesure',
    description: 'Graphistes experts pour vos supports de communication.',
    image: IMAGES.design,
    points: ['Identité visuelle', 'Maquettes interactives', 'Retouches photo']
  },
  {
    icon: 'precision_manufacturing',
    title: 'Impression Pro',
    subtitle: 'Technologie de pointe',
    description: 'Machines dernier cri pour des résultats exceptionnels.',
    image: IMAGES.production,
    points: ['UV direct', 'Offset numérique', 'Découpe laser']
  },
  {
    icon: 'event_available',
    title: 'Événementiel & PLV',
    subtitle: 'Communication terrain',
    description: 'Solutions d\'affichage pour vos événements et points de vente.',
    image: IMAGES.evenementiel,
    points: ['Stand d\'exposition', 'Kakémonos', 'Signalétique']
  },
  {
    icon: 'verified',
    title: 'Contrôle Qualité',
    subtitle: 'Excellence garantie',
    description: 'Contrôle rigoureux à chaque étape de production.',
    image: IMAGES.qualite,
    points: ['Certification ISO', 'Contrôle couleur', 'Emballage sécurisé']
  },
  {
    icon: 'local_shipping',
    title: 'Logistique Express',
    subtitle: 'Livraison rapide',
    description: 'Livraison rapide dans toute la Tunisie avec suivi en ligne.',
    image: IMAGES.livraison,
    points: ['Livraison 24-72h', 'Suivi en ligne', 'Transport sécurisé']
  }
];

// =====================================================
// TÉMOIGNAGES
// =====================================================
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ahmed Ben Salah',
    role: 'CEO, EventPro Tunisie',
    content: 'Ulysse DeZign a transformé nos événements avec des impressions d\'une qualité exceptionnelle.',
    image: IMAGES.témoin1,
    rating: 5
  },
  {
    id: 2,
    name: 'Leila Trabelsi',
    role: 'Directrice Marketing',
    content: 'Les packagings réalisés ont donné à nos produits une image premium incomparable.',
    image: IMAGES.témoin2,
    rating: 5
  },
  {
    id: 3,
    name: 'Mohamed Ali Ben Hamida',
    role: 'Architecte d\'intérieur',
    content: 'La qualité des vinyles et des bâches est incomparable. Je recommande vivement !',
    image: IMAGES.témoin3,
    rating: 5
  }
];

// =====================================================
// PROCESSUS
// =====================================================
const PROCESS_STEPS = [
  {
    step: 1,
    title: 'Consultation',
    subtitle: 'On vous écoute',
    description: 'Analyse de vos besoins et objectifs.',
    image: IMAGES.etape1
  },
  {
    step: 2,
    title: 'Conception',
    subtitle: 'On crée pour vous',
    description: 'Maquettes uniques jusqu\'à votre satisfaction.',
    image: IMAGES.etape2
  },
  {
    step: 3,
    title: 'Production',
    subtitle: 'On fabrique avec soin',
    description: 'Impression avec les technologies les plus avancées.',
    image: IMAGES.etape3
  },
  {
    step: 4,
    title: 'Livraison',
    subtitle: 'On vous livre',
    description: 'Contrôle final et livraison rapide.',
    image: IMAGES.etape4
  }
];

// =====================================================
// STATISTIQUES
// =====================================================
const STATS = [
  { number: '500+', label: 'Projets Réalisés', icon: 'check_circle' },
  { number: '98%', label: 'Clients Satisfaits', icon: 'sentiment_very_satisfied' },
  { number: '48h', label: 'Délai de Production', icon: 'schedule' },
  { number: '4.9/5', label: 'Note Moyenne', icon: 'star' }
];

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
const LandingPage = () => {
  const { profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeProductFilter, setActiveProductFilter] = useState('tous');
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    date_souhaitee: '',
    livraison: 'a_emporter',
    notes: ''
  });

  // =====================================================
  // FILTRAGE DES PRODUITS
  // =====================================================
  const filteredProducts = useMemo(() => {
    if (activeProductFilter === 'tous') return products;
    return products.filter(p => p.categorie?.toLowerCase() === activeProductFilter.toLowerCase());
  }, [products, activeProductFilter]);

  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.categorie).filter(Boolean));
    return ['tous', ...cats];
  }, [products]);

  // =====================================================
  // RÉCUPÉRER LES PRODUITS
  // =====================================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseErp
          .from('erp_produits')
          .select('*')
          .eq('featured', true)
          .limit(6);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(FEATURED_PRODUCTS);
        }
      } catch (error) {
        console.error('❌ Erreur chargement produits:', error);
        setProducts(FEATURED_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // EFFETS
  // =====================================================
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setShowScrollTop(scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
      });
    }, 200);

    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearInterval(testimonialInterval);
    };
  }, []);

  // =====================================================
  // FORMULAIRE DE COMMANDE
  // =====================================================
  const handleFormChange = (e) => {
    const { id, value, type, name } = e.target;
    if (type === 'radio') {
      setFormData({ ...formData, [name]: value });
    } else if (id === 'clientNom') {
      setFormData({ ...formData, nom: value });
    } else if (id === 'clientTel') {
      setFormData({ ...formData, telephone: value });
    } else if (id === 'clientEmail') {
      setFormData({ ...formData, email: value });
    } else if (id === 'dateSouhaitee') {
      setFormData({ ...formData, date_souhaitee: value });
    } else if (id === 'notes') {
      setFormData({ ...formData, notes: value });
    }
  };

  const initQuickOrder = () => {
    const addBtn = document.getElementById('addProduitBtn');
    const produitsList = document.getElementById('produitsList');
    const sendBtn = document.getElementById('sendOrderBtn');

    const createProductItem = () => {
      const newProduct = document.createElement('div');
      newProduct.className = 'produit-item bg-white/5 rounded-xl p-3 border border-[#F0C75E]/30 transition-all duration-300 hover:border-[#F0C75E]';
      newProduct.innerHTML = `
        <div class="flex justify-end mb-2">
          <button type="button" class="remove-produit text-red-400 text-xs hover:text-red-300 transition transform hover:scale-110">✕ Supprimer</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" class="produit-nom w-full p-2 rounded-lg bg-white/10 border border-[#F0C75E]/30 text-white text-sm placeholder:text-white/40 focus:border-[#F0C75E] focus:outline-none transition" placeholder="Nom du produit *">
          <input type="number" class="produit-quantite w-full p-2 rounded-lg bg-white/10 border border-[#F0C75E]/30 text-white text-sm placeholder:text-white/40 focus:border-[#F0C75E] focus:outline-none transition" placeholder="Quantité" value="1" min="1">
        </div>
        <textarea class="produit-description w-full mt-2 p-2 rounded-lg bg-white/10 border border-[#F0C75E]/30 text-white text-sm placeholder:text-white/40 focus:border-[#F0C75E] focus:outline-none transition" rows="2" placeholder="Description (format, couleurs, finition...)"></textarea>
      `;
      
      const removeBtn = newProduct.querySelector('.remove-produit');
      removeBtn.addEventListener('click', () => {
        if (produitsList.children.length > 1) {
          newProduct.style.transform = 'scale(0.8)';
          newProduct.style.opacity = '0';
          setTimeout(() => newProduct.remove(), 300);
        } else {
          alert('Vous devez avoir au moins un produit');
        }
      });
      return newProduct;
    };

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const newItem = createProductItem();
        produitsList.appendChild(newItem);
        newItem.style.transform = 'scale(0.8)';
        newItem.style.opacity = '0';
        setTimeout(() => {
          newItem.style.transform = 'scale(1)';
          newItem.style.opacity = '1';
        }, 50);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const nom = document.getElementById('clientNom')?.value.trim();
        const telephone = document.getElementById('clientTel')?.value.trim();
        const email = document.getElementById('clientEmail')?.value.trim();
        const livraison = document.querySelector('input[name="livraison"]:checked')?.value;
        const notes = document.getElementById('notes')?.value;
        
        if (!nom || !telephone) {
          alert('Veuillez remplir votre nom et téléphone');
          return;
        }
        
        const produits = [];
        document.querySelectorAll('.produit-item').forEach((item) => {
          const produitNom = item.querySelector('.produit-nom')?.value.trim();
          if (produitNom) {
            produits.push({
              nom: produitNom,
              quantite: item.querySelector('.produit-quantite')?.value || 1,
              description: item.querySelector('.produit-description')?.value || ''
            });
          }
        });
        
        if (produits.length === 0) {
          alert('Veuillez ajouter au moins un produit');
          return;
        }
        
        const dateSouhaitee = document.getElementById('dateSouhaitee')?.value;
        const dateFormatted = dateSouhaitee ? new Date(dateSouhaitee).toLocaleDateString('fr-FR') : 'Non spécifiée';
        
        let produitsText = '';
        produits.forEach((p, idx) => {
          produitsText += `  ${idx + 1}. ${p.nom}`;
          if (p.quantite > 1) produitsText += ` x ${p.quantite}`;
          if (p.description) produitsText += `\n     📝 ${p.description}`;
          produitsText += '\n';
        });
        
        const message = `
🆕 NOUVELLE COMMANDE (Site Web)
━━━━━━━━━━━━━━━━━━━━━

👤 INFORMATIONS CLIENT
• Nom: ${nom}
• Téléphone: ${telephone}
${email ? `• Email: ${email}` : ''}

📦 PRODUITS/SERVICES (${produits.length} article${produits.length > 1 ? 's' : ''})
${produitsText}

📅 Date souhaitée: ${dateFormatted}
🚚 Livraison: ${livraison === 'a_emporter' ? 'À emporter (atelier)' : 'Livraison à domicile'}

📝 Notes supplémentaires:
${notes || 'Aucune'}

━━━━━━━━━━━━━━━━━━━━━
        `.trim();
        
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        document.getElementById('clientNom').value = '';
        document.getElementById('clientTel').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('dateSouhaitee').value = '';
        if (document.querySelector('input[name="livraison"][value="a_emporter"]')) {
          document.querySelector('input[name="livraison"][value="a_emporter"]').checked = true;
        }
        
        while (produitsList.children.length > 1) {
          produitsList.lastChild?.remove();
        }
        if (produitsList.children[0]) {
          produitsList.children[0].querySelector('.produit-nom').value = '';
          produitsList.children[0].querySelector('.produit-description').value = '';
          produitsList.children[0].querySelector('.produit-quantite').value = '1';
        }
        
        setFormData({
          nom: '',
          telephone: '',
          email: '',
          date_souhaitee: '',
          livraison: 'a_emporter',
          notes: ''
        });
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initQuickOrder();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // SCROLL
  // =====================================================
  const scrollTo = useCallback((id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // =====================================================
  // RENDU DES ÉTOILES
  // =====================================================
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#081b38] font-['Montserrat'] overflow-x-hidden">
      
      {/* =============================================
          HEADER
          ============================================= */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-700 ${scrolled ? 'bg-[#F8FAFC]/95 backdrop-blur-lg border-b border-[#F0C75E]/20 py-2 shadow-sm' : 'bg-transparent py-4'}`}>
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <OptimizedImage 
                src={IMAGES.logo} 
                alt="Ulysse DeZign" 
                className="rounded-xl"
                fallback={IMAGES.logo}
                lazy={false}
                width={50}
                height={50}
              />
            </div>
            <span className={`font-['Playfair_Display'] text-base sm:text-xl md:text-2xl font-bold transition-colors duration-700 ${scrolled ? 'text-[#1A3A6B]' : 'text-white'}`}>
              Ulysse <span className="text-[#F0C75E]">DeZign</span>
            </span>
          </div>
          
          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {['categories', 'portfolio', 'products', 'services', 'testimonials'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item)} 
                className={`text-sm uppercase tracking-[0.1em] font-semibold relative transition-colors duration-500 ${scrolled ? 'text-[#4A6A8A] hover:text-[#1A3A6B]' : 'text-white/80 hover:text-white'}`}
              >
                {item === 'portfolio' ? 'Portfolio' : item === 'testimonials' ? 'Avis' : item.charAt(0).toUpperCase() + item.slice(1)}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0C75E] transition-all duration-500 hover:w-full"></span>
              </button>
            ))}
            
            {/* Boutons de navigation - Version Glassmorphism Luxe */}
<div className="flex items-center gap-3">
  {/* Vitrine */}
  <Link 
    to="/boutique" 
    className={`group relative px-6 py-2.5 rounded-full text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-500 overflow-hidden ${
      scrolled 
        ? 'bg-[#1A3A6B] text-white hover:bg-[#0D1F3C]' 
        : 'bg-[#F0C75E]/90 backdrop-blur-sm text-[#0D1F3C] hover:bg-[#F0C75E]'
    } shadow-lg hover:shadow-[#F0C75E]/20`}
  >
    <span className="relative z-10">Vitrine</span>
    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
  </Link>

  {/* Équipage */}
  <Link 
    to="/login" 
    className={`group relative px-6 py-2.5 rounded-full text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-500 overflow-hidden ${
      scrolled 
        ? 'border border-[#1A3A6B] text-[#1A3A6B] hover:bg-[#1A3A6B] hover:text-white' 
        : 'border border-white/40 text-white hover:border-white hover:bg-white/10'
    }`}
  >
    <span className="relative z-10">Équipage</span>
    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
  </Link>

  {/* Client */}
  <Link 
    to="/client/login" 
    className={`group relative px-6 py-2.5 rounded-full text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-500 overflow-hidden shadow-lg hover:shadow-[#F0C75E]/30 ${
      scrolled 
        ? 'bg-[#F0C75E] text-[#0D1F3C] hover:bg-[#d4aa3a]' 
        : 'bg-[#F0C75E] text-[#0D1F3C] hover:bg-[#d4aa3a]'
    }`}
  >
    <span className="relative z-10">Client</span>
    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
  </Link>
</div>
          </nav>

          {/* Burger Menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center focus:outline-none"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <div className="relative w-6 h-5">
              <span className={`absolute block h-0.5 w-full transform transition-all duration-500 ease-in-out ${
                mobileMenuOpen ? 'rotate-45 top-2' : 'top-0'
              } ${scrolled ? 'bg-[#1A3A6B]' : 'bg-white'}`}></span>
              <span className={`absolute block h-0.5 w-full transform transition-all duration-500 ease-in-out ${
                mobileMenuOpen ? 'opacity-0' : 'top-2'
              } ${scrolled ? 'bg-[#1A3A6B]' : 'bg-white'}`}></span>
              <span className={`absolute block h-0.5 w-full transform transition-all duration-500 ease-in-out ${
                mobileMenuOpen ? '-rotate-45 top-2' : 'top-4'
              } ${scrolled ? 'bg-[#1A3A6B]' : 'bg-white'}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* =============================================
          MENU MOBILE COMPLET
          ============================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 bg-[#0D1F3C] z-40 animate-fadeIn overflow-y-auto">
          <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl border-2 border-[#F0C75E]/30">
                <OptimizedImage 
                  src={IMAGES.logo} 
                  alt="Ulysse DeZign" 
                  className="w-full h-full object-cover"
                  lazy={false}
                />
              </div>
              <span className="font-['Playfair_Display'] text-3xl font-bold text-white">
                Ulysse <span className="text-[#F0C75E]">DeZign</span>
              </span>
            </div>
            
            {/* Séparateur */}
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#F0C75E] to-transparent mb-8"></div>
            
            {/* Navigation principale */}
            <nav className="flex flex-col items-center gap-2 w-full max-w-xs">
              {[
                { id: 'home', label: '🏠 Accueil' },
                { id: 'categories', label: '📂 Catégories' },
                { id: 'portfolio', label: '🎨 Portfolio' },
                { id: 'products', label: '🛍️ Produits' },
                { id: 'services', label: '⚡ Services' },
                { id: 'testimonials', label: '⭐ Avis' },
                { id: 'contact', label: '📞 Contact' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => scrollTo(item.id)} 
                  className="w-full text-center text-white text-base font-['Montserrat'] font-light py-3 px-4 rounded-xl hover:bg-white/5 transition-all duration-500 hover:text-[#F0C75E]"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            
            {/* Séparateur */}
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#F0C75E]/30 to-transparent my-6"></div>
            
            {/* Boutons d'action */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {/* 🛍️ Vitrine */}
              <Link 
                to="/boutique" 
                className="w-full text-center bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] px-6 py-4 rounded-xl font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-bold hover:shadow-xl hover:shadow-[#F0C75E]/30 transition-all duration-500 transform hover:-translate-y-0.5" 
                onClick={() => setMobileMenuOpen(false)}
              >
                🛍️ Explorer la Vitrine
              </Link>
              
              {/* 🔐 Équipage */}
              <Link 
                to="/login" 
                className="w-full text-center border-2 border-white/30 text-white px-6 py-4 rounded-xl font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-500 transform hover:-translate-y-0.5" 
                onClick={() => setMobileMenuOpen(false)}
              >
                🔐 Espace Équipage
              </Link>
              
              {/* 👤 Espace Client */}
              <Link 
                to="/client/login" 
                className="w-full text-center bg-white/10 text-white px-6 py-4 rounded-xl font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-white/20 transition-all duration-500 border border-white/20 transform hover:-translate-y-0.5" 
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 Espace Client
              </Link>
              
              {/* 💬 WhatsApp */}
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-6 py-4 rounded-xl font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:shadow-xl hover:shadow-[#25D366]/30 transition-all duration-500 transform hover:-translate-y-0.5 flex items-center justify-center gap-2" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">💬</span>
                Commander sur WhatsApp
              </a>
            </div>
            
            {/* Fermer le menu */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors duration-500 p-2"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            
            {/* Version */}
            <p className="absolute bottom-8 text-white/20 text-xs font-['Montserrat'] tracking-wider">
              Ulysse DeZign © 2025
            </p>
          </div>
        </div>
      )}

      {/* =============================================
          HERO SECTION
          ============================================= */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden" id="home">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${IMAGES.heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1F3C]/80 via-[#1A3A6B]/70 to-[#0D1F3C]/90"></div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-2 gap-6 items-center relative z-10 w-full py-20">
          <div className="space-y-5 sm:space-y-6 reveal-on-scroll text-center md:text-left">
            <div className="inline-block mx-auto md:mx-0 border border-[#F0C75E]/50 px-5 py-2 rounded-full bg-[#F0C75E]/5 backdrop-blur-sm">
              <span className="font-['Montserrat'] text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#F0C75E] font-light">Artisanat de Précision</span>
            </div>
            
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight font-bold">
              L'Excellence<br />
              <span className="text-[#F0C75E]">de l'Impression</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-[#F0C75E] font-['Playfair_Display'] italic font-light">
              Plus qu'une imprimerie, une expérience
            </p>
            
            <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed font-['Montserrat'] font-light">
              Des finitions exceptionnelles pour vos projets les plus ambitieux. Découpe laser, vinyle haute performance, impression UV...
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/boutique" className="inline-flex items-center justify-center gap-2 bg-[#F0C75E] text-[#0D1F3C] px-8 py-4 rounded-full font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#d4aa3a] transition-all duration-500 shadow-lg hover:shadow-[#F0C75E]/20">
                🛍️ Explorer
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button onClick={() => scrollTo('contact')} className="inline-flex items-center justify-center border border-white/30 text-white px-8 py-4 rounded-full font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.1em] font-semibold hover:bg-white/5 transition-all duration-500">
                Devis personnalisé
              </button>
            </div>
          </div>
          
          <div className="relative reveal-on-scroll order-first md:order-last mt-6 md:mt-0">
            <div className="aspect-square max-w-[320px] sm:max-w-[400px] mx-auto md:max-w-full rounded-2xl overflow-hidden shadow-2xl relative border border-[#F0C75E]/20 bg-[#0D1F3C]">
              <OptimizedImage 
                src={IMAGES.hero}
                alt="Ulysse DeZign" 
                className="transition-transform duration-1000 hover:scale-105"
                fallback={IMAGES.logo}
                lazy={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-[#F0C75E] p-2 sm:p-3 rounded-xl shadow-lg">
                <p className="font-['Playfair_Display'] text-xs sm:text-sm text-[#0D1F3C] leading-tight font-semibold">Ulysse DeZign</p>
                <p className="text-[8px] sm:text-[10px] text-[#0D1F3C]/70">Plus qu'une imprimerie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          STATISTIQUES
          ============================================= */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#1A3A6B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #F0C75E 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
          {STATS.map((stat, idx) => (
            <div key={idx} className="text-center reveal-on-scroll" style={{ transitionDelay: `${idx * 150}ms` }}>
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#F0C75E] opacity-80">{stat.icon}</span>
              <p className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-bold mt-2">{stat.number}</p>
              <p className="text-xs sm:text-sm text-white/60 font-['Montserrat'] font-light">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================
          CATÉGORIES
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-white" id="categories">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-14 md:mb-18 reveal-on-scroll">
            <div>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-semibold">Nos Catégories</h2>
              <div className="w-16 h-0.5 bg-[#F0C75E] mt-3"></div>
            </div>
            <Link to="/boutique" className="font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.15em] text-[#4A6A8A] hover:text-[#1A3A6B] transition-colors duration-500 border-b border-[#4A6A8A]/20 hover:border-[#1A3A6B] pb-1 mt-3 sm:mt-0 group flex items-center gap-1">
              Voir tout 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-500">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {CATEGORIES.map((cat, idx) => (
              <Link 
                key={cat.id} 
                to={cat.link}
                className="group relative overflow-hidden aspect-[3/4] sm:aspect-[4/5] rounded-xl sm:rounded-2xl border border-[#e8e8ec] hover:border-[#F0C75E] transition-all duration-700 cursor-pointer reveal-on-scroll hover:-translate-y-1 hover:shadow-xl"
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105">
                  <OptimizedImage 
                    src={cat.image} 
                    alt={cat.title}
                    lazy={true}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/80 via-[#0D1F3C]/30 to-transparent"></div>
                {cat.badge && (
                  <span className="absolute top-3 right-3 bg-[#F0C75E] text-[#0D1F3C] text-[8px] sm:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {cat.badge}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 md:p-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#F0C75E] text-lg sm:text-xl group-hover:scale-110 transition-transform duration-500">{cat.icon}</span>
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-[#F0C75E] font-light">/{cat.description}</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-base sm:text-lg md:text-xl font-semibold leading-tight">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          PORTFOLIO - GALERIE MASONRY LUXE
          ============================================= */}
      <div id="portfolio">
        <LuxuryMasonryGallery />
      </div>

      {/* =============================================
          PRODUITS - VERSION LUXE AMÉLIORÉE
          ============================================= */}
      <section className="py-20 sm:py-24 md:py-32 bg-[#F8FAFC] relative overflow-hidden" id="products">
        {/* Éléments décoratifs de fond */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-gradient-to-br from-[#F0C75E]/5 via-transparent to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-gradient-to-tr from-[#1A3A6B]/3 via-transparent to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #1A3A6B 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="text-center mb-16 sm:mb-20 md:mb-24 reveal-on-scroll">
            {/* Ornement décoratif */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#F0C75E]"></span>
              <span className="material-symbols-outlined text-[#F0C75E] text-xl">diamond</span>
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#F0C75E]"></span>
            </div>
            
            <div className="inline-block border border-[#F0C75E]/20 px-6 py-2 rounded-full mb-5 bg-[#F0C75E]/5 backdrop-blur-sm">
              <span className="text-[10px] sm:text-xs font-['Montserrat'] uppercase tracking-[0.3em] text-[#F0C75E] font-semibold">
                ✧ Collection Prestige
              </span>
            </div>
            
            <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#0D1F3C] font-bold tracking-tight leading-tight">
              Nos <span className="text-[#1A3A6B] relative inline-block">
                Incontournables
                <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-gradient-to-r from-[#F0C75E] to-transparent rounded-full"></span>
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#4A6A8A] mt-4 font-['Montserrat'] font-light max-w-2xl mx-auto">
              La sélection privilégiée par nos clients les plus exigeants
            </p>
            
            {/* Filtres - Design amélioré */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 sm:mt-10">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveProductFilter(cat)}
                  className={`group px-5 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-sm font-['Montserrat'] font-medium tracking-wider uppercase transition-all duration-500 relative ${
                    activeProductFilter === cat
                      ? 'bg-[#1A3A6B] text-white shadow-xl shadow-[#1A3A6B]/20 transform -translate-y-0.5'
                      : 'bg-white/80 backdrop-blur-sm text-[#4A6A8A] border border-[#e8e8ec] hover:border-[#F0C75E] hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {cat === 'tous' ? '🏆 Tous' : cat}
                  {activeProductFilter === cat && (
                    <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#F0C75E] rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-[#c4c6d0] border-t-[#F0C75E]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-['Montserrat'] uppercase tracking-[0.2em] text-[#1A3A6B]">Chargement</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  className="group relative bg-white rounded-3xl border border-[#e8e8ec] hover:border-[#F0C75E] transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#1A3A6B]/10 reveal-on-scroll overflow-hidden"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  {/* BADGES */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {product.badge && (
                      <span className={`px-3.5 py-1.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-2xl backdrop-blur-sm ${
                        product.badge.includes('Top') ? 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C]' :
                        product.badge.includes('Premium') ? 'bg-gradient-to-r from-[#1A3A6B] to-[#0D1F3C] text-white border border-[#F0C75E]/30' :
                        product.badge.includes('Best') ? 'bg-gradient-to-r from-[#0D1F3C] to-[#1A3A6B] text-white' :
                        product.badge.includes('Promo') ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' :
                        'bg-[#1A3A6B] text-white'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                    {product.ancienPrix && (
                      <span className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
                        -{Math.round(((product.ancienPrix.replace('€','') - product.price.replace('€','')) / product.ancienPrix.replace('€','')) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* IMAGE */}
                  <div className="relative aspect-square overflow-hidden bg-[#f5f4f0]">
                    <OptimizedImage 
                      src={product.image} 
                      alt={product.name}
                      className="transition-transform duration-1000 group-hover:scale-110"
                      lazy={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/70 via-[#0D1F3C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 border-2 border-[#F0C75E]/0 group-hover:border-[#F0C75E]/40 transition-all duration-700 rounded-t-3xl"></div>
                    <div className="absolute inset-0 bg-[#0D1F3C]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="transform scale-90 group-hover:scale-100 transition-all duration-500 delay-100">
                        <Link 
                          to={`${product.link || '/boutique'}`} 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] px-8 py-3.5 rounded-full font-['Montserrat'] text-[10px] uppercase tracking-[0.15em] font-semibold shadow-2xl hover:shadow-[#F0C75E]/40 transition-all hover:-translate-y-0.5"
                        >
                          Découvrir
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-xl z-10 border border-[#F0C75E]/20">
                      <span className="text-[7px] sm:text-[8px] font-['Montserrat'] uppercase tracking-[0.2em] text-[#1A3A6B] font-semibold">{product.categorie}</span>
                    </div>
                    {product.garantie && (
                      <div className="absolute bottom-3 right-3 bg-[#0D1F3C]/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-xl z-10 border border-[#F0C75E]/20">
                        <span className="text-[7px] font-['Montserrat'] text-[#F0C75E] uppercase tracking-wider">
                          🔒 {product.garantie}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F0C75E]/0 via-[#F0C75E]/0 to-[#F0C75E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                  </div>

                  {/* INFORMATIONS PRODUIT */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <div className="flex flex-col">
                      <span className="text-[7px] sm:text-[8px] font-['Montserrat'] uppercase tracking-[0.2em] text-[#F0C75E] font-light">
                        {product.subtitle || 'Collection Prestige'}
                      </span>
                      <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#1A3A6B] font-semibold leading-tight mt-1 line-clamp-1">
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#4A6A8A] leading-relaxed mt-2 flex-grow font-['Montserrat'] font-light line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {product.features?.slice(0, 3).map((feature, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[7px] sm:text-[8px] bg-[#f5f4f0] text-[#4A6A8A] px-2.5 py-1 rounded-full font-['Montserrat']">
                          <span className="w-1 h-1 rounded-full bg-[#F0C75E]"></span>
                          {feature}
                        </span>
                      ))}
                      {product.features?.length > 3 && (
                        <span className="text-[7px] sm:text-[8px] text-[#4A6A8A]/50 font-['Montserrat']">
                          +{product.features.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[7px] sm:text-[8px] text-[#4A6A8A]/70">
                      {product.format && (
                        <span className="inline-flex items-center gap-1 bg-white border border-[#e8e8ec] px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[10px] sm:text-xs">straighten</span>
                          {product.format}
                        </span>
                      )}
                      {product.delai && (
                        <span className="inline-flex items-center gap-1 bg-white border border-[#e8e8ec] px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[10px] sm:text-xs">schedule</span>
                          {product.delai}
                        </span>
                      )}
                      {product.stock && product.stock > 0 && (
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-green-700">
                          <span className="material-symbols-outlined text-[10px] sm:text-xs">check_circle</span>
                          En stock
                        </span>
                      )}
                    </div>
                    <div className="pt-4 mt-4 flex justify-between items-center border-t border-[#e8e8ec]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#1A3A6B] font-bold tracking-tight">
                            {product.price}
                          </span>
                          {product.ancienPrix && (
                            <span className="text-xs text-[#4A6A8A]/40 line-through font-['Montserrat']">{product.ancienPrix}</span>
                          )}
                        </div>
                        {product.stock && product.stock <= 5 && product.stock > 0 && (
                          <span className="text-[8px] text-orange-500 font-['Montserrat'] uppercase tracking-wider font-semibold">
                            ⚡ Stock limité
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => window.open(whatsappLink, '_blank')}
                        className="group/btn relative overflow-hidden bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-4 sm:px-5 py-2.5 rounded-full font-['Montserrat'] text-[10px] sm:text-xs uppercase tracking-[0.1em] font-semibold transition-all hover:shadow-xl hover:shadow-[#25D366]/30 flex items-center gap-2"
                      >
                        <span className="relative z-10 flex items-center gap-1.5">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Commander
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-[#20b859] to-[#0e6b5a] transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left"></span>
                      </button>
                    </div>
                  </div>

                  <div className="absolute -inset-px bg-gradient-to-r from-[#F0C75E]/0 via-[#F0C75E]/0 to-[#F0C75E]/0 group-hover:from-[#F0C75E]/5 group-hover:via-[#F0C75E]/10 group-hover:to-transparent transition-all duration-700 pointer-events-none rounded-3xl"></div>
                </div>
              ))}
            </div>
          )}
          
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="inline-block p-10 bg-white rounded-3xl shadow-2xl border border-[#e8e8ec]">
                <span className="material-symbols-outlined text-6xl text-[#4A6A8A]/30">search</span>
                <p className="text-[#4A6A8A] font-['Montserrat'] mt-4">Aucun produit dans cette catégorie.</p>
              </div>
            </div>
          )}
          
          <div className="text-center mt-16 sm:mt-20 reveal-on-scroll">
            <Link 
              to="/boutique" 
              className="group inline-flex items-center gap-4 bg-gradient-to-r from-[#1A3A6B] to-[#0D1F3C] text-white px-10 sm:px-14 py-5 rounded-full font-['Montserrat'] text-xs sm:text-sm uppercase tracking-[0.15em] font-semibold hover:shadow-2xl hover:shadow-[#1A3A6B]/30 transform hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">collections_bookmark</span>
                Explorer toute la collection
                <span className="material-symbols-outlined text-lg group-hover:translate-x-2 transition-transform duration-500">arrow_forward</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></span>
              <span className="absolute inset-0 border-2 border-[#F0C75E]/0 group-hover:border-[#F0C75E]/30 transition-all duration-500 rounded-full"></span>
            </Link>
            <p className="text-xs text-[#4A6A8A]/50 font-['Montserrat'] mt-4">
              {filteredProducts.length} produits • Qualité premium • Fabrication artisanale
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          SERVICES
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-white" id="services">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 reveal-on-scroll">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-semibold">Nos Services</h2>
            <p className="text-sm sm:text-base md:text-lg text-[#4A6A8A] mt-3 font-['Montserrat'] font-light">Des solutions complètes pour tous vos besoins d'impression</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((service, idx) => (
              <div 
                key={idx} 
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#F8FAFC] border border-[#e8e8ec] hover:border-[#F0C75E] transition-all duration-700 hover:-translate-y-2 hover:shadow-xl reveal-on-scroll"
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                  <OptimizedImage 
                    src={service.image} 
                    alt={service.title}
                    className="transition-transform duration-1000 group-hover:scale-105"
                    lazy={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 bg-[#F0C75E] p-2 rounded-lg">
                    <span className="material-symbols-outlined text-[#0D1F3C] text-2xl">{service.icon}</span>
                  </div>
                  <span className="absolute top-3 right-3 bg-[#0D1F3C]/70 backdrop-blur-sm text-white text-[8px] sm:text-[10px] font-medium px-3 py-1 rounded-full">
                    {service.subtitle}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#1A3A6B] font-semibold">{service.title}</h3>
                  <p className="text-xs sm:text-sm text-[#4A6A8A] mt-2 font-['Montserrat'] font-light">{service.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {service.points?.map((point, i) => (
                      <span key={i} className="text-[8px] sm:text-[10px] bg-[#F0C75E]/5 text-[#1A3A6B] px-2 py-0.5 rounded-full">✓ {point}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          PROCESSUS
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 reveal-on-scroll">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-semibold">Notre Processus</h2>
            <p className="text-sm sm:text-base md:text-lg text-[#4A6A8A] mt-3 font-['Montserrat'] font-light">De l'idée à la réalisation en quelques étapes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {PROCESS_STEPS.map((step, idx) => (
              <div 
                key={idx} 
                className="relative text-center reveal-on-scroll"
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="relative z-10">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto rounded-full bg-[#1A3A6B] border-2 border-[#F0C75E] flex items-center justify-center text-white font-['Playfair_Display'] text-xl sm:text-2xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <div className="mt-4 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8e8ec] shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
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

      {/* =============================================
          TÉMOIGNAGES (AVIS)
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#1A3A6B] text-white" id="testimonials">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 reveal-on-scroll">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-semibold">⭐ Avis Clients</h2>
            <p className="text-sm sm:text-base md:text-lg text-white/60 mt-3 font-['Montserrat'] font-light">Ils nous ont fait confiance et partagent leur expérience</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden min-h-[200px]">
              {TESTIMONIALS.map((testimonial, idx) => (
                <div 
                  key={testimonial.id}
                  className={`transition-all duration-1000 transform ${
                    idx === activeTestimonial 
                      ? 'opacity-100 translate-x-0 relative' 
                      : 'opacity-0 absolute inset-0 translate-x-full pointer-events-none'
                  }`}
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F0C75E] flex-shrink-0">
                        <OptimizedImage 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover"
                          lazy={false}
                          objectFit="cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-['Playfair_Display'] text-lg text-white font-semibold">{testimonial.name}</h4>
                        <p className="text-xs text-white/50 font-['Montserrat']">{testimonial.role}</p>
                        <div className="text-sm mt-0.5">{renderStars(testimonial.rating)}</div>
                      </div>
                    </div>
                    <p className="text-base sm:text-lg text-white/80 font-['Playfair_Display'] italic">"{testimonial.content}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`transition-all duration-500 ${
                    idx === activeTestimonial 
                      ? 'bg-[#F0C75E] w-8 h-1.5 rounded-full' 
                      : 'bg-white/20 w-1.5 h-1.5 rounded-full hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          AVANTAGES
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 text-center">
          {[
            { icon: 'high_quality', title: 'Résolution Extra HD', desc: 'Une finesse de détail inégalée pour toutes vos impressions.' },
            { icon: 'shield', title: 'Durée de Vie Prolongée', desc: 'Encres polymérisées aux UV pour une résistance optimale.' },
            { icon: 'content_cut', title: 'Découpe Laser Précise', desc: 'Contours nets et formes complexes avec précision chirurgicale.' },
            { icon: 'rocket_launch', title: 'Production Express', desc: 'Expédition sous 48h pour vos projets prioritaires.' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center reveal-on-scroll" style={{ transitionDelay: `${idx * 120}ms` }}>
              <div className="w-16 h-16 rounded-full border border-[#F0C75E]/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[#F0C75E] text-3xl">{item.icon}</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#4A6A8A] font-['Montserrat'] font-light mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================
          NEWSLETTER
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] w-64 h-64 border border-[#F0C75E]/10 rounded-full"></div>
        <div className="absolute left-[-10%] bottom-[-10%] w-64 h-64 border border-[#1A3A6B]/10 rounded-full"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10 reveal-on-scroll">
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
          <p className="mt-3 text-xs text-[#4A6A8A]/50 font-['Montserrat']">En vous inscrivant, vous acceptez notre politique de confidentialité.</p>
        </div>
      </section>

      {/* =============================================
          COMMANDE RAPIDE
          ============================================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#0D1F3C] text-white" id="contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-8 sm:mb-12 reveal-on-scroll">
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Prêt à commander ?</h2>
            <p className="text-sm sm:text-base text-white/50 font-['Montserrat'] font-light">Remplissez ce formulaire et recevez un devis rapide sur WhatsApp</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 reveal-on-scroll">
            <form id="quickOrderForm" className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">Nom complet *</label>
                  <input type="text" id="clientNom" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">Téléphone *</label>
                  <input type="tel" id="clientTel" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" placeholder="+216 XX XXX XXX" />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">Email</label>
                <input type="email" id="clientEmail" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" placeholder="votre@email.com" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white/60 text-xs sm:text-sm font-semibold font-['Montserrat']">📦 Produits / Services</label>
                  <button type="button" id="addProduitBtn" className="text-[#F0C75E] text-xs sm:text-sm hover:underline font-['Montserrat'] transition-all duration-500">+ Ajouter</button>
                </div>
                <div id="produitsList" className="space-y-3">
                  <div className="produit-item bg-white/5 rounded-lg p-3 border border-white/10 transition-all duration-500 hover:border-[#F0C75E]/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" className="produit-nom w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#F0C75E] focus:outline-none transition-all duration-500" placeholder="Nom du produit *" />
                      <input type="number" className="produit-quantite w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#F0C75E] focus:outline-none transition-all duration-500" placeholder="Quantité" defaultValue="1" min="1" />
                    </div>
                    <textarea className="produit-description w-full mt-2 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#F0C75E] focus:outline-none transition-all duration-500" rows="2" placeholder="Description (format, couleurs, finition...)"></textarea>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">📅 Date souhaitée</label>
                  <input type="date" id="dateSouhaitee" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white font-['Montserrat'] text-sm focus:border-[#F0C75E] focus:outline-none transition-all duration-500" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">🚚 Livraison</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-white/60 text-xs sm:text-sm font-['Montserrat'] cursor-pointer hover:text-white transition-all duration-500">
                      <input type="radio" name="livraison" value="a_emporter" defaultChecked className="accent-[#F0C75E]" /> À emporter
                    </label>
                    <label className="flex items-center gap-2 text-white/60 text-xs sm:text-sm font-['Montserrat'] cursor-pointer hover:text-white transition-all duration-500">
                      <input type="radio" name="livraison" value="livraison" className="accent-[#F0C75E]" /> Livraison
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">📝 Notes supplémentaires</label>
                <textarea id="notes" rows={2} className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" placeholder="Informations complémentaires..."></textarea>
              </div>

              <button type="button" id="sendOrderBtn" className="w-full py-4 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Envoyer la commande
              </button>
            </form>
            <p className="text-center text-white/30 text-xs mt-4 font-['Montserrat']">📱 Aucun compte nécessaire. Notre équipe vous répondra directement sur WhatsApp</p>
          </div>
        </div>
      </section>

      {/* =============================================
          FOOTER
          ============================================= */}
      <footer className="bg-[#0D1F3C] text-white border-t border-white/5 px-4 sm:px-6 md:px-12 py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#F0C75E]/30 flex-shrink-0">
                <OptimizedImage 
                  src={IMAGES.logo} 
                  alt="Ulysse DeZign" 
                  className="w-full h-full object-cover"
                  lazy={false}
                />
              </div>
              <span className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold text-[#F0C75E]">Ulysse DeZign</span>
            </div>
            <p className="text-xs sm:text-sm text-white/40 font-['Montserrat'] font-light italic">Plus qu'une imprimerie, une expérience</p>
            <p className="text-xs sm:text-sm text-white/20 font-['Montserrat']">© 2025 Ulysse DeZign. Premium Print Studio.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-['Montserrat'] text-[10px] sm:text-xs uppercase text-[#F0C75E] font-light tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/30 font-['Montserrat'] font-light">
              <li><button onClick={() => scrollTo('home')} className="hover:text-[#F0C75E] transition-colors duration-500">Accueil</button></li>
              <li><Link to="/boutique" className="hover:text-[#F0C75E] transition-colors duration-500">Boutique</Link></li>
              <li><button onClick={() => scrollTo('services')} className="hover:text-[#F0C75E] transition-colors duration-500">Services</button></li>
              <li><button onClick={() => scrollTo('testimonials')} className="hover:text-[#F0C75E] transition-colors duration-500">Avis</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-['Montserrat'] text-[10px] sm:text-xs uppercase text-[#F0C75E] font-light tracking-wider">Informations</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/30 font-['Montserrat'] font-light">
              <li><button className="hover:text-[#F0C75E] transition-colors duration-500">Mentions légales</button></li>
              <li><button className="hover:text-[#F0C75E] transition-colors duration-500">FAQ</button></li>
              <li><button className="hover:text-[#F0C75E] transition-colors duration-500">Livraison</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-['Montserrat'] text-[10px] sm:text-xs uppercase text-[#F0C75E] font-light tracking-wider">Contact</h4>
            <div className="space-y-2 text-xs sm:text-sm text-white/30 font-['Montserrat'] font-light">
              <p>📍 Djerba, Tunisie</p>
              <p>📞 +216 99 477 391</p>
              <p>✉️ contact@ulyssedezign.tn</p>
              <div className="flex gap-4 mt-3">
                <a href="#" className="hover:text-[#F0C75E] transition-colors duration-500" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="hover:text-[#F0C75E] transition-colors duration-500" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto pt-6 mt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-white/20 text-[10px] sm:text-xs font-['Montserrat']">© 2025 Ulysse DeZign. Djerba, Tunisie.</div>
          <div className="flex gap-6 text-[10px] sm:text-xs text-white/20 font-['Montserrat']">
            <span>Tous droits réservés</span>
            <button className="hover:text-white/40 transition-colors duration-500">Mentions</button>
            <button className="hover:text-white/40 transition-colors duration-500">Cookies</button>
          </div>
        </div>
      </footer>

      {/* =============================================
          FLOATING WHATSAPP
          ============================================= */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-500">
        <span className="text-xl">💬</span>
      </a>

      {/* =============================================
          SCROLL TO TOP
          ============================================= */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-6 z-50 bg-[#F0C75E] text-[#0D1F3C] p-3 rounded-full shadow-xl hover:scale-105 transition-all duration-500 text-lg"
        >
          ↑
        </button>
      )}

      {/* =============================================
          STYLES
          ============================================= */}
      <style>{`
        .reveal-on-scroll { 
          opacity: 0; 
          transform: translateY(40px); 
          transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
        }
        .reveal-on-scroll.active { 
          opacity: 1; 
          transform: translateY(0); 
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #F8FAFC;
        }
        ::-webkit-scrollbar-thumb {
          background: #1A3A6B;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #F0C75E;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;