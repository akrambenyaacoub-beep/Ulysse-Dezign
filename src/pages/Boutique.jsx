// src/pages/Boutique.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import StickerOrderForm from '../components/StickerOrderForm';

const Boutique = () => {
  const { profile, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showStickerForm, setShowStickerForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'gerant' || profile?.role === 'gestionnaire';

  // =====================================================
  // CATÉGORIES AVEC SOUS-CATÉGORIES
  // =====================================================
  const categories = [
    { 
      id: 'all', 
      label: '✨ Tous les produits', 
      icon: 'grid_view', 
      color: 'bg-gradient-to-r from-[#1A3A6B] to-[#0D1F3C]',
      description: 'Découvrez toute notre collection'
    },
    { 
      id: 'papeterie', 
      label: '📝 Papeterie', 
      icon: 'description',
      color: 'bg-gradient-to-r from-[#2A5A9B] to-[#1A3A6B]',
      description: 'Papiers d\'exception pour une communication élégante',
      subcategories: ['Cartes de visite', 'Enveloppes', 'Papier à lettres', 'Bloc-notes', 'Carnets', 'Papier d\'art']
    },
    { 
      id: 'signaletique', 
      label: '🪧 Signalétique', 
      icon: 'signpost',
      color: 'bg-gradient-to-r from-[#1359A9] to-[#0D1F3C]',
      description: 'Habillez vos espaces avec style et précision',
      subcategories: ['Enseignes LED', 'Panneaux', 'Vitrophanie', 'Lettrage adhésif', 'Totems', 'Signalétique intérieure']
    },
    { 
      id: 'impression', 
      label: '🖨️ Impression', 
      icon: 'print',
      color: 'bg-gradient-to-r from-[#4A7ABF] to-[#2A5A9B]',
      description: 'La qualité d\'impression au service de votre image',
      subcategories: ['Offset', 'Numérique', 'Grand format', 'UV', 'Sublimation', 'Écologique']
    },
    { 
      id: 'digital', 
      label: '💻 Digital', 
      icon: 'computer',
      color: 'bg-gradient-to-r from-[#7A5ABF] to-[#4A2A9B]',
      description: 'Le digital au service de votre créativité',
      subcategories: ['Design graphique', 'Montage vidéo', 'Retouche photo', 'Animation 3D', 'Réalité augmentée', 'Webdesign']
    },
    { 
      id: 'stickers', 
      label: '🏷️ Stickers', 
      icon: 'campaign',
      color: 'bg-gradient-to-r from-[#F5D88A] to-[#F0C75E]',
      description: 'Des stickers pour toutes vos envies et tous vos supports',
      subcategories: ['Die-cut', 'Vinyle', 'Transparent', 'Waterproof', 'Holographique', '3D', 'Gonflable']
    },
    { 
      id: 'menu', 
      label: '📋 Menus & Cartes', 
      icon: 'restaurant_menu',
      color: 'bg-gradient-to-r from-[#D4A83A] to-[#B8922E]',
      description: 'Sublimez votre art culinaire avec des menus d\'exception',
      subcategories: ['Menus restaurateurs', 'Cartes des vins', 'Cartes postales', 'Faire-part', 'Invitations', 'Marque-places']
    },
    { 
      id: 'packaging', 
      label: '📦 Packaging', 
      icon: 'inventory_2',
      color: 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a]',
      description: 'Des emballages qui font la différence',
      subcategories: ['Boîtes', 'Sacs', 'Étiquettes', 'Emballage cadeau', 'Coffrets', 'Pochons']
    },
    { 
      id: 'autres', 
      label: '📌 Autres', 
      icon: 'more_horiz',
      color: 'bg-gradient-to-r from-[#6B7280] to-[#4B5563]',
      description: 'Des produits uniques pour des projets uniques',
      subcategories: ['Goodies', 'Objets publicitaires', 'Banderoles', 'Roll-ups', 'Kits', 'Sur mesure']
    }
  ];

  // =====================================================
  // MAPPING CATÉGORIES VERS BASE DE DONNÉES
  // =====================================================
  const categoryMapping = {
    'papeterie': ['Cartes de visite', 'Enveloppes', 'Papier à lettres', 'Bloc-notes', 'Carnets', 'Papier d\'art'],
    'signaletique': ['Enseignes LED', 'Panneaux', 'Vitrophanie', 'Lettrage adhésif', 'Totems', 'Signalétique intérieure'],
    'impression': ['Offset', 'Numérique', 'Grand format', 'UV', 'Sublimation', 'Écologique'],
    'digital': ['Design graphique', 'Montage vidéo', 'Retouche photo', 'Animation 3D', 'Réalité augmentée', 'Webdesign'],
    'stickers': ['Die-cut', 'Vinyle', 'Transparent', 'Waterproof', 'Holographique', '3D', 'Gonflable'],
    'menu': ['Menus restaurateurs', 'Cartes des vins', 'Cartes postales', 'Faire-part', 'Invitations', 'Marque-places'],
    'packaging': ['Boîtes', 'Sacs', 'Étiquettes', 'Emballage cadeau', 'Coffrets', 'Pochons'],
    'autres': ['Goodies', 'Objets publicitaires', 'Banderoles', 'Roll-ups', 'Kits', 'Sur mesure']
  };

  // =====================================================
  // RÉCUPÉRER LES PRODUITS
  // =====================================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabaseErp
          .from('erp_produits')
          .select('*')
          .order('featured', { ascending: false })
          .order('nom', { ascending: true });

        if (error) throw error;
        
        setProducts(data || []);
        
      } catch (err) {
        console.error('❌ Erreur chargement produits:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // CHARGER LE PANIER
  // =====================================================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // =====================================================
  // PRODUIT EN VEDETTE
  // =====================================================
  const featuredProduct = products.find(p => p.featured === true) || (products.length > 0 ? products[0] : null);

  // =====================================================
  // FILTRER ET TRIER LES PRODUITS
  // =====================================================
  const filteredProducts = products
    .filter(product => {
      let matchCategory = selectedCategory === 'all';
      if (!matchCategory) {
        const categoryValues = categoryMapping[selectedCategory] || [];
        matchCategory = categoryValues.includes(product.categorie);
      }
      
      const matchSubcategory = !selectedSubcategory || product.categorie === selectedSubcategory;
      
      const matchSearch = (product.nom || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        (product.description || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      
      return matchCategory && matchSubcategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.prix || 0) - (b.prix || 0);
      if (sortBy === 'price-desc') return (b.prix || 0) - (a.prix || 0);
      if (sortBy === 'name') return (a.nom || '').localeCompare(b.nom || '');
      return 0;
    });

  // =====================================================
  // AJOUTER AU PANIER
  // =====================================================
  const addToCart = (product) => {
    const savedCart = localStorage.getItem('cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ 
        id: product.id,
        name: product.nom,
        price: product.prix || 0,
        image: product.image_url || '/placeholder-product.jpg',
        quantity: 1,
        categorie: product.categorie
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  };

  // =====================================================
  // OUVRIR LE FORMULAIRE STICKER
  // =====================================================
  const openStickerForm = (product) => {
    setSelectedProduct(product);
    setShowStickerForm(true);
  };

  // =====================================================
  // RENDU
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1A3A6B] border-t-[#F0C75E] mx-auto mb-4"></div>
          <p className="text-[#1A3A6B] font-['Montserrat']">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">⚠️</span>
          <h3 className="text-2xl font-['Playfair_Display'] text-[#1A3A6B] mb-2">Erreur de chargement</h3>
          <p className="text-[#43474f] font-['Montserrat']">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#1A3A6B] text-white px-6 py-2 rounded-full hover:bg-[#0D1F3C] transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#081b38] font-['Montserrat'] overflow-x-hidden pb-20">
      
      {/* =============================================
          FORMULAIRE STICKER
          ============================================= */}
      {showStickerForm && (
        <StickerOrderForm
          product={selectedProduct || { name: 'Stickers Vinyle Premium' }}
          onClose={() => {
            setShowStickerForm(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(item) => {
            // Ajouter au panier
            const savedCart = localStorage.getItem('cart');
            let cart = savedCart ? JSON.parse(savedCart) : [];
            cart.push(item);
            localStorage.setItem('cart', JSON.stringify(cart));
            setCartCount(cart.reduce((total, i) => total + i.quantity, 0));
          }}
        />
      )}

      {/* =============================================
          HEADER BOUTIQUE
          ============================================= */}
      <header className={`fixed top-0 w-full z-50 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-[#F0C75E]/30 transition-all duration-300 ${scrolled ? 'py-2 shadow-sm' : 'py-3'}`}>
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-[#1A3A6B]"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/" className="flex items-center gap-3">
              <span className="font-['Playfair_Display'] text-xl font-bold text-[#1A3A6B]">
                Ulysse <span className="text-[#F0C75E]">DeZign</span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="font-['Montserrat'] text-sm uppercase tracking-[0.1em] text-[#43474f] hover:text-[#F0C75E] transition-colors">Accueil</Link>
            <span className="font-['Montserrat'] text-sm uppercase tracking-[0.1em] text-[#F0C75E] font-bold">Boutique</span>
            <Link to="/" className="font-['Montserrat'] text-sm uppercase tracking-[0.1em] text-[#43474f] hover:text-[#F0C75E] transition-colors">Services</Link>
          </nav>
          
          <div className="flex items-center gap-6">
            {!authLoading && profile && isAdmin && (
              <Link 
                to="/admin/produits" 
                className="hidden md:flex items-center gap-1.5 bg-[#1A3A6B] text-white px-4 py-2 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#0D1F3C] transition-all"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                Gestion
              </Link>
            )}
            
            <button className="text-[#1A3A6B] hover:text-[#F0C75E] transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <Link to="/panier" className="relative text-[#1A3A6B] hover:text-[#F0C75E] transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F0C75E] text-[#0D1F3C] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/login" className="hidden md:block bg-[#1A3A6B] text-white px-6 py-2 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#0D1F3C] transition-all">
              Espace Équipage
            </Link>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-[#F0C75E]/30 p-4 space-y-3">
            <Link to="/" className="block w-full text-left text-[#1A3A6B] py-2 font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold">Accueil</Link>
            <span className="block w-full text-left text-[#F0C75E] py-2 font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-bold">Boutique</span>
            <Link to="/" className="block w-full text-left text-[#43474f] hover:text-[#F0C75E] py-2 font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold">Services</Link>
            
            {!authLoading && profile && isAdmin && (
              <Link 
                to="/admin/produits" 
                className="block w-full text-center bg-[#1A3A6B] text-white px-4 py-2 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#0D1F3C] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                ⚙️ Gestion Produits
              </Link>
            )}
            
            <Link to="/login" className="block w-full text-center bg-[#1A3A6B] text-white px-4 py-2 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold">🔐 Espace Équipage</Link>
          </div>
        )}
      </header>

      {/* =============================================
          HERO BOUTIQUE
          ============================================= */}
      <section className="relative pt-32 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #1A3A6B 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[80px]"></div>
        
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-8 relative z-10">
            <span className="inline-block border-2 border-[#F0C75E] px-4 py-1.5 rounded-full mb-4">
              <span className="font-['Montserrat'] text-xs uppercase tracking-[0.2em] text-[#1A3A6B] font-semibold">🛍️ Boutique Ulysse DeZign</span>
            </span>
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-bold mb-4">
              L'Excellence de l'Impression <br/>
              <span className="text-[#1A3A6B]">à Portée de Clic</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#43474f] max-w-2xl mx-auto leading-relaxed font-['Montserrat']">
              Découvrez notre collection de produits d'impression haut de gamme, conçus pour sublimer vos projets.
            </p>
          </div>

          {/* PRODUIT EN VEDETTE */}
          {featuredProduct && (
            <div className="relative z-10 mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-[#1A3A6B] to-[#0D1F3C] shadow-2xl">
              <div className="flex flex-col md:flex-row items-center p-6 md:p-8 lg:p-10">
                <div className="md:w-1/3 mb-6 md:mb-0">
                  <div className="relative">
                    <img 
                      src={featuredProduct.image_url || '/placeholder-product.jpg'} 
                      alt={featuredProduct.nom}
                      className="w-full max-h-64 object-contain rounded-xl"
                      onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                    />
                    <span className="absolute -top-2 -right-2 bg-[#F0C75E] text-[#0D1F3C] px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                      ⭐ En vedette
                    </span>
                  </div>
                </div>
                <div className="md:w-2/3 md:pl-8 text-center md:text-left">
                  <span className="text-[#F0C75E] text-sm uppercase tracking-widest font-semibold">✧ Notre coup de cœur</span>
                  <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl text-white font-bold mt-2 mb-3">
                    {featuredProduct.nom}
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base mb-4 line-clamp-2">
                    {featuredProduct.description || 'Un produit d\'exception pour vos projets les plus ambitieux.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                    <span className="text-2xl sm:text-3xl font-bold text-[#F0C75E]">
                      {featuredProduct.prix} DT
                    </span>
                    <button
                      onClick={() => addToCart(featuredProduct)}
                      className="bg-[#F0C75E] text-[#0D1F3C] px-6 py-2.5 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#F5D88A] transition-all shadow-lg hover:shadow-[#F0C75E]/30"
                    >
                      🛒 Ajouter au panier
                    </button>
                    <span className="text-white/50 text-sm">
                      {featuredProduct.categorie || 'Produit'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F0C75E]/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F0C75E]/5 rounded-full blur-3xl"></div>
            </div>
          )}
        </div>
      </section>

      {/* =============================================
          FILTRES
          ============================================= */}
      <section className="px-4 sm:px-6 md:px-12 pb-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-[#c4c6d0] text-[#081b38] focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all font-['Montserrat'] text-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-full bg-white border border-[#c4c6d0] text-[#081b38] focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm"
              >
                <option value="popular">⭐ Populaire</option>
                <option value="price-asc">💰 Prix croissant</option>
                <option value="price-desc">💰 Prix décroissant</option>
                <option value="name">🔤 Nom A-Z</option>
              </select>
              <span className="text-sm text-[#43474f] font-['Montserrat'] whitespace-nowrap">
                {filteredProducts.length} produits
              </span>
            </div>
          </div>

          {/* CATÉGORIES */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
              
              return (
                <div key={cat.id} className="relative">
                  <button
                    onClick={() => {
                      if (isActive) {
                        setExpandedCategory(expandedCategory === cat.id ? null : cat.id);
                      } else {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(null);
                        setExpandedCategory(cat.id);
                      }
                    }}
                    className={`
                      group flex items-center gap-2 px-4 py-2.5 rounded-full 
                      font-['Montserrat'] text-sm font-medium transition-all duration-300
                      ${isActive 
                        ? `${cat.color} text-white shadow-lg scale-105` 
                        : 'bg-white border border-[#c4c6d0] text-[#43474f] hover:border-[#F0C75E] hover:shadow-md hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-base">{cat.icon}</span>
                    {cat.label}
                    {hasSubcategories && (
                      <span className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                        {expandedCategory === cat.id && isActive ? '▲' : '▼'}
                      </span>
                    )}
                    {isActive && (
                      <span className="ml-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </button>
                  
                  {/* SOUS-CATÉGORIES */}
                  {isActive && hasSubcategories && expandedCategory === cat.id && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-xl border border-[#c4c6d0] z-10 min-w-[200px] animate-fadeIn">
                      <div className="text-xs text-gray-400 px-3 py-1 font-['Montserrat'] font-semibold uppercase tracking-wider">
                        Sous-catégories
                      </div>
                      <div className="h-px bg-[#c4c6d0]/30 my-1"></div>
                      {cat.subcategories.map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedSubcategory(selectedSubcategory === sub ? null : sub);
                          }}
                          className={`
                            block w-full text-left px-3 py-2 rounded-xl text-sm transition-all font-['Montserrat']
                            ${selectedSubcategory === sub 
                              ? 'bg-[#1A3A6B] text-white' 
                              : 'text-[#43474f] hover:bg-[#f1f3ff]'
                            }
                          `}
                        >
                          {selectedSubcategory === sub && '✓ '}
                          {sub}
                        </button>
                      ))}
                      {selectedSubcategory && (
                        <div className="mt-2 pt-2 border-t border-[#c4c6d0]/30">
                          <button
                            onClick={() => setSelectedSubcategory(null)}
                            className="text-xs text-[#1A3A6B] hover:underline font-['Montserrat']"
                          >
                            ✕ Effacer le filtre
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {searchQuery && (
            <p className="text-sm text-[#43474f] font-['Montserrat'] mb-2">
              Résultats pour <span className="font-semibold text-[#1A3A6B]">"{searchQuery}"</span>
            </p>
          )}
          {selectedSubcategory && (
            <p className="text-sm text-[#43474f] font-['Montserrat'] mb-2">
              Filtre : <span className="font-semibold text-[#1A3A6B]">{selectedSubcategory}</span>
              <button 
                onClick={() => setSelectedSubcategory(null)}
                className="ml-2 text-red-500 hover:text-red-700 text-xs"
              >
                ✕ Retirer
              </button>
            </p>
          )}
        </div>
      </section>

      {/* =============================================
          GRILLE PRODUITS
          ============================================= */}
      <section className="px-4 sm:px-6 md:px-12 py-4">
        <div className="max-w-[1280px] mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🔍</span>
              <h3 className="text-2xl font-['Playfair_Display'] text-[#1A3A6B] mb-2">Aucun produit trouvé</h3>
              <p className="text-[#43474f] font-['Montserrat']">Essayez de modifier vos filtres ou votre recherche</p>
              <button 
                onClick={() => { 
                  setSelectedCategory('all'); 
                  setSelectedSubcategory(null);
                  setSearchQuery(''); 
                  setExpandedCategory(null);
                }}
                className="mt-4 bg-[#1A3A6B] text-white px-6 py-2 rounded-full hover:bg-[#0D1F3C] transition"
              >
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredProducts.map((product) => {
                const isFeatured = product.id === featuredProduct?.id && filteredProducts.length > 0;
                const isSticker = product.categorie?.toLowerCase().includes('sticker') || 
                                  product.nom?.toLowerCase().includes('sticker');
                
                return (
                  <div 
                    key={product.id} 
                    className={`
                      group bg-white rounded-2xl border transition-all duration-500 
                      hover:-translate-y-2 hover:shadow-2xl
                      ${isFeatured 
                        ? 'border-[#F0C75E] shadow-lg shadow-[#F0C75E]/20' 
                        : 'border-[#c4c6d0] hover:border-[#F0C75E]'
                      }
                    `}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-[#f1f3ff]">
                      <img 
                        src={product.image_url || '/placeholder-product.jpg'} 
                        alt={product.nom}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      {isFeatured && (
                        <span className="absolute top-3 right-3 bg-[#F0C75E] text-[#0D1F3C] px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg flex items-center gap-1">
                          ⭐ Top
                        </span>
                      )}
                      {isSticker && (
                        <span className="absolute top-3 left-3 bg-[#F0C75E]/90 text-[#0D1F3C] px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase shadow-lg flex items-center gap-1">
                          🏷️ Sticker
                        </span>
                      )}
                      {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase">
                          Stock limité
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase">
                          Rupture
                        </span>
                      )}
                      <div className="absolute inset-0 bg-[#1A3A6B]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center rounded-t-2xl">
                        {isSticker ? (
                          <button
                            onClick={() => openStickerForm(product)}
                            className="bg-[#F0C75E] text-[#0D1F3C] px-5 py-2.5 rounded-full font-['Montserrat'] text-xs uppercase tracking-[0.1em] font-semibold transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg"
                          >
                            🎨 Personnaliser
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="bg-[#F0C75E] text-[#0D1F3C] px-5 py-2.5 rounded-full font-['Montserrat'] text-xs uppercase tracking-[0.1em] font-semibold transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg"
                            disabled={product.stock === 0}
                          >
                            {product.stock === 0 ? 'Indisponible' : '🛒 Ajouter'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-['Playfair_Display'] text-sm sm:text-base md:text-lg text-[#1A3A6B] font-semibold line-clamp-1">
                          {product.nom}
                        </h3>
                        {product.categorie && (
                          <span className="text-[9px] text-[#43474f] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#c4c6d0] whitespace-nowrap">
                            {product.categorie}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-xs sm:text-sm text-[#43474f] line-clamp-2 mt-1 font-['Montserrat']">
                          {product.description}
                        </p>
                      )}
                      <div className="pt-3 flex justify-between items-center border-t border-[#c4c6d0]/30 mt-2">
                        <span className="font-['Playfair_Display'] text-lg sm:text-xl text-[#1A3A6B] font-bold">
                          {product.prix !== undefined && product.prix !== null 
                            ? `${product.prix} DT` 
                            : 'Sur devis'}
                        </span>
                        {isSticker ? (
                          <button
                            onClick={() => openStickerForm(product)}
                            className="bg-[#F0C75E] text-[#0D1F3C] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-['Montserrat'] text-[10px] sm:text-sm uppercase tracking-[0.1em] font-semibold transition-all hover:bg-[#d4aa3a] hover:shadow-lg"
                          >
                            🎨 Personnaliser
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-['Montserrat'] text-[10px] sm:text-sm uppercase tracking-[0.1em] font-semibold transition-all ${
                              product.stock === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#1A3A6B] text-white hover:bg-[#0D1F3C] hover:shadow-lg'
                            }`}
                          >
                            {product.stock === 0 ? 'Indisponible' : 'Ajouter'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =============================================
          BANNIÈRE STICKERS PROMO
          ============================================= */}
      <section className="px-4 sm:px-6 md:px-12 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] rounded-3xl p-6 sm:p-8 md:p-10 text-[#0D1F3C] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-3">
                  <span className="text-xs font-['Montserrat'] uppercase tracking-wider font-semibold">🎨 Offre Spéciale</span>
                </div>
                <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-bold">
                  Créez vos stickers <br className="hidden sm:block" />
                  <span className="text-[#1A3A6B]">sur mesure</span>
                </h2>
                <p className="text-sm sm:text-base text-[#1A3A6B]/70 mt-2 max-w-md font-['Montserrat']">
                  Personnalisez vos stickers avec notre outil de conception. Forme, dimensions, finition... Tout est possible !
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openStickerForm({ name: 'Stickers Vinyle Premium' })}
                  className="bg-[#1A3A6B] text-white px-8 py-3 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#0D1F3C] transition-all shadow-lg hover:shadow-[#1A3A6B]/30 flex items-center gap-2"
                >
                  <span className="text-xl">🎨</span>
                  Commander maintenant
                </button>
                <span className="text-sm text-[#1A3A6B]/60 font-['Montserrat'] flex items-center justify-center">
                  ⚡ À partir de 50 pièces
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          AVANTAGES
          ============================================= */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-[#1A3A6B] text-white mt-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#F0C75E]/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#F0C75E] text-3xl">rocket_launch</span>
            </div>
            <h3 className="font-['Playfair_Display'] text-xl mb-2 font-semibold">Express 24h</h3>
            <p className="text-sm text-white/70 font-['Montserrat']">Traitement prioritaire de vos commandes pour une livraison record.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#F0C75E]/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#F0C75E] text-3xl">diamond</span>
            </div>
            <h3 className="font-['Playfair_Display'] text-xl mb-2 font-semibold">Finitions Premium</h3>
            <p className="text-sm text-white/70 font-['Montserrat']">Un catalogue de textures et de dorures unique sur le marché.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#F0C75E]/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#F0C75E] text-3xl">verified_user</span>
            </div>
            <h3 className="font-['Playfair_Display'] text-xl mb-2 font-semibold">Paiement Sécurisé</h3>
            <p className="text-sm text-white/70 font-['Montserrat']">Transactions protégées par cryptage SSL de dernière génération.</p>
          </div>
        </div>
      </section>

      {/* =============================================
          NEWSLETTER
          ============================================= */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-2xl text-[#1A3A6B] font-semibold mb-4">📬 Rejoignez le Cercle Privé</h2>
          <p className="text-[#43474f] mb-6 font-['Montserrat']">Recevez nos offres exclusives et nos nouveautés</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Votre email" className="flex-1 px-4 py-3 rounded-full bg-white border border-[#c4c6d0] text-[#081b38] focus:outline-none focus:border-[#F0C75E] font-['Montserrat']" />
            <button type="submit" className="px-6 py-3 bg-[#1A3A6B] text-white rounded-full font-semibold hover:bg-[#0D1F3C] transition font-['Montserrat']">S'abonner</button>
          </form>
        </div>
      </section>

      {/* =============================================
          FOOTER
          ============================================= */}
      <footer className="bg-[#0D1F3C] text-white border-t-2 border-[#F0C75E]/30 px-4 sm:px-6 md:px-12 py-16">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-['Playfair_Display'] text-2xl text-[#F0C75E] font-bold mb-4">Ulysse DeZign</h3>
            <p className="text-sm text-white/50 font-['Montserrat'] italic">Plus qu'une imprimerie..</p>
            <p className="text-sm text-white/40 font-['Montserrat'] mt-4">© 2025 Ulysse DeZign. Excellence in Printing.</p>
          </div>
          <div>
            <h4 className="font-['Montserrat'] text-xs uppercase text-[#F0C75E] font-bold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-white/40 font-['Montserrat']">
              <li><Link to="/" className="hover:text-[#F0C75E] transition-colors">Accueil</Link></li>
              <li><span className="text-[#F0C75E]">Boutique</span></li>
              <li><Link to="/" className="hover:text-[#F0C75E] transition-colors">Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-['Montserrat'] text-xs uppercase text-[#F0C75E] font-bold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm text-white/40 font-['Montserrat']">
              <li><Link to="/" className="hover:text-[#F0C75E] transition-colors">Mentions légales</Link></li>
              <li><Link to="/" className="hover:text-[#F0C75E] transition-colors">FAQ</Link></li>
              <li><Link to="/" className="hover:text-[#F0C75E] transition-colors">Livraison</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-['Montserrat'] text-xs uppercase text-[#F0C75E] font-bold mb-4">Contact</h4>
            <p className="text-sm text-white/40 font-['Montserrat']">Djerba, Tunisie</p>
            <p className="text-sm text-white/40 font-['Montserrat']">📞 +216 99 477 391</p>
          </div>
        </div>
      </footer>

      {/* =============================================
          BOTTOM NAV (MOBILE)
          ============================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#F8FAFC] border-t border-[#c4c6d0] z-50 flex justify-around items-center h-14 sm:h-16">
        <Link to="/" className="flex flex-col items-center justify-center text-[#43474f] hover:text-[#F0C75E]">
          <span className="material-symbols-outlined text-sm">home</span>
          <span className="text-[8px] sm:text-[10px] font-['Montserrat']">Accueil</span>
        </Link>
        <span className="flex flex-col items-center justify-center text-[#F0C75E] font-semibold">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <span className="text-[8px] sm:text-[10px] font-['Montserrat']">Boutique</span>
        </span>
        <Link to="/panier" className="flex flex-col items-center justify-center text-[#43474f] hover:text-[#F0C75E] relative">
          <span className="material-symbols-outlined text-sm">shopping_cart</span>
          <span className="text-[8px] sm:text-[10px] font-['Montserrat']">Panier</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F0C75E] text-[#0D1F3C] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        
        {!authLoading && profile && isAdmin && (
          <Link to="/admin/produits" className="flex flex-col items-center justify-center text-[#1A3A6B] hover:text-[#F0C75E]">
            <span className="material-symbols-outlined text-sm">settings</span>
            <span className="text-[8px] sm:text-[10px] font-['Montserrat']">Admin</span>
          </Link>
        )}
        
        <Link to="/login" className="flex flex-col items-center justify-center text-[#43474f] hover:text-[#F0C75E]">
          <span className="material-symbols-outlined text-sm">person</span>
          <span className="text-[8px] sm:text-[10px] font-['Montserrat']">Compte</span>
        </Link>
      </nav>

      {/* =============================================
          STYLES CSS
          ============================================= */}
      <style>{`
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
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Boutique;