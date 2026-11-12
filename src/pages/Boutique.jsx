// src/pages/Boutique.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import StickerOrderForm from '../components/StickerOrderForm';

// 👇 IMPORTATION DE VOS ICÔNES (Vérifiez bien les noms de fichiers dans votre dossier assets)
import iconStickers from '../assets/icon-stickers.png';
import iconSignaletique from '../assets/icon-signaletique.png';
import iconPapeterie from '../assets/icon-papeterie.png';
import iconMenu from '../assets/icon-menu.png';
import iconImpression from '../assets/icon-impression.png';
import iconDigital from '../assets/icon-digital.png';

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
  // CATÉGORIES (Uniquement vos icônes)
  // =====================================================
  const categories = [
    { 
      id: 'all', 
      label: 'Tout voir', 
      customIcon: null, // On mettra une icône de grille spéciale en code
      color: 'bg-[#0D1F3C]', // Bleu nuit profond
      subcategories: null
    },
    { 
      id: 'papeterie', 
      label: 'Papeterie', 
      customIcon: iconPapeterie,
      color: 'bg-[#2A5A9B]',
      subcategories: ['Cartes de visite', 'Enveloppes', 'Papier à lettres', 'Bloc-notes', 'Carnets', 'Papier d\'art']
    },
    { 
      id: 'signaletique', 
      label: 'Signalétique', 
      customIcon: iconSignaletique,
      color: 'bg-[#1359A9]',
      subcategories: ['Enseignes LED', 'Panneaux', 'Vitrophanie', 'Lettrage adhésif', 'Totems', 'Signalétique intérieure']
    },
    { 
      id: 'impression', 
      label: 'Impression', 
      customIcon: iconImpression,
      color: 'bg-[#4A7ABF]',
      subcategories: ['Offset', 'Numérique', 'Grand format', 'UV', 'Sublimation', 'Écologique']
    },
    { 
      id: 'digital', 
      label: 'Digital', 
      customIcon: iconDigital,
      color: 'bg-[#7A5ABF]',
      subcategories: ['Design graphique', 'Montage vidéo', 'Retouche photo', 'Animation 3D', 'Réalité augmentée', 'Webdesign']
    },
    { 
      id: 'stickers', 
      label: 'Stickers', 
      customIcon: iconStickers,
      color: 'bg-[#F0C75E]', // Doré
      subcategories: ['Die-cut', 'Vinyle', 'Transparent', 'Waterproof', 'Holographique', '3D', 'Gonflable']
    },
    { 
      id: 'menu', 
      label: 'Menus & Cartes', 
      customIcon: iconMenu,
      color: 'bg-[#D4A83A]',
      subcategories: ['Menus restaurateurs', 'Cartes des vins', 'Cartes postales', 'Faire-part', 'Invitations', 'Marque-places']
    },
    { 
      id: 'packaging', 
      label: 'Packaging', 
      customIcon: null, // À remplacer si vous avez une icône
      color: 'bg-[#F0C75E]',
      subcategories: ['Boîtes', 'Sacs', 'Étiquettes', 'Emballage cadeau', 'Coffrets', 'Pochons']
    },
    { 
      id: 'autres', 
      label: 'Autres', 
      customIcon: null, // À remplacer si vous avez une icône
      color: 'bg-[#6B7280]',
      subcategories: ['Goodies', 'Objets publicitaires', 'Banderoles', 'Roll-ups', 'Kits', 'Sur mesure']
    }
  ];

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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      const matchSearch = (product.nom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSubcategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.prix || 0) - (b.prix || 0);
      if (sortBy === 'price-desc') return (b.prix || 0) - (a.prix || 0);
      if (sortBy === 'name') return (a.nom || '').localeCompare(b.nom || '');
      return 0;
    });

  // =====================================================
  // AJOUTER AU PANIER & STICKER FORM
  // =====================================================
  const addToCart = (product) => {
    const savedCart = localStorage.getItem('cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity += 1;
    else {
      cart.push({ 
        id: product.id, name: product.nom, price: product.prix || 0,
        image: product.image_url || '/placeholder-product.jpg', quantity: 1, categorie: product.categorie
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  };

  const openStickerForm = (product) => {
    setSelectedProduct(product);
    setShowStickerForm(true);
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1A3A6B] border-t-[#F0C75E]"></div></div>;
  if (error) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-center"><div><span className="text-6xl block mb-4">⚠️</span><p className="text-[#43474f] font-['Montserrat']">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#081b38] font-['Montserrat'] overflow-x-hidden pb-20">
      
      {showStickerForm && (
        <StickerOrderForm
          product={selectedProduct || { name: 'Stickers Vinyle Premium' }}
          onClose={() => { setShowStickerForm(false); setSelectedProduct(null); }}
          onAddToCart={(item) => {
            const savedCart = localStorage.getItem('cart');
            let cart = savedCart ? JSON.parse(savedCart) : [];
            cart.push(item);
            localStorage.setItem('cart', JSON.stringify(cart));
            setCartCount(cart.reduce((total, i) => total + i.quantity, 0));
          }}
        />
      )}

      {/* HEADER */}
      <header className={`fixed top-0 w-full z-50 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-[#F0C75E]/30 transition-all duration-300 ${scrolled ? 'py-2 shadow-sm' : 'py-3'}`}>
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#1A3A6B]"><span className="material-symbols-outlined">menu</span></button>
            <Link to="/" className="flex items-center gap-3"><span className="font-['Playfair_Display'] text-xl font-bold text-[#1A3A6B]">Ulysse <span className="text-[#F0C75E]">DeZign</span></span></Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm uppercase tracking-[0.1em] text-[#43474f] hover:text-[#F0C75E] transition-colors">Accueil</Link>
            <span className="text-sm uppercase tracking-[0.1em] text-[#F0C75E] font-bold">Boutique</span>
            <Link to="/" className="text-sm uppercase tracking-[0.1em] text-[#43474f] hover:text-[#F0C75E] transition-colors">Services</Link>
          </nav>
          <div className="flex items-center gap-6">
            {!authLoading && profile && isAdmin && (
              <Link to="/admin/produits" className="hidden md:flex items-center gap-1.5 bg-[#1A3A6B] text-white px-4 py-2 rounded-full text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#0D1F3C]"><span className="material-symbols-outlined text-sm">settings</span>Gestion</Link>
            )}
            <button className="text-[#1A3A6B] hover:text-[#F0C75E]"><span className="material-symbols-outlined">search</span></button>
            <Link to="/panier" className="relative text-[#1A3A6B] hover:text-[#F0C75E]">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#F0C75E] text-[#0D1F3C] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </Link>
            <Link to="/login" className="hidden md:block bg-[#1A3A6B] text-white px-6 py-2 rounded-full text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#0D1F3C]">Espace Équipage</Link>
          </div>
        </div>
      </header>

      {/* HERO BOUTIQUE */}
      <section className="relative pt-32 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[80px]"></div>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 text-center mb-8 relative z-10">
          <span className="inline-block border-2 border-[#F0C75E] px-4 py-1.5 rounded-full mb-4">
            <span className="text-xs uppercase tracking-[0.2em] text-[#1A3A6B] font-semibold">🛍️ Boutique Ulysse DeZign</span>
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#0D1F3C] font-bold mb-4">
            L'Excellence de l'Impression <br/><span className="text-[#1A3A6B]">à Portée de Clic</span>
          </h1>
        </div>

        {featuredProduct && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 relative z-10 mb-12">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#1A3A6B] to-[#0D1F3C] shadow-2xl flex flex-col md:flex-row items-center p-6 md:p-8 lg:p-10">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <img src={featuredProduct.image_url || '/placeholder-product.jpg'} alt={featuredProduct.nom} className="w-full max-h-64 object-contain rounded-xl" onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
              </div>
              <div className="md:w-2/3 md:pl-8 text-center md:text-left">
                <span className="text-[#F0C75E] text-sm uppercase tracking-widest font-semibold">✧ Notre coup de cœur</span>
                <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl text-white font-bold mt-2 mb-3">{featuredProduct.nom}</h2>
                <p className="text-white/70 text-sm sm:text-base mb-4 line-clamp-2">{featuredProduct.description || 'Un produit d\'exception.'}</p>
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <span className="text-2xl sm:text-3xl font-bold text-[#F0C75E]">{featuredProduct.prix} DT</span>
                  <button onClick={() => addToCart(featuredProduct)} className="bg-[#F0C75E] text-[#0D1F3C] px-6 py-2.5 rounded-full text-sm uppercase tracking-[0.1em] font-semibold hover:bg-[#F5D88A] shadow-lg">🛒 Ajouter au panier</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FILTRES & CATÉGORIES */}
      <section className="px-4 sm:px-6 md:px-12 pb-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><span className="material-symbols-outlined text-xl">search</span></span>
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-[#e5e7eb] text-[#081b38] focus:outline-none focus:border-[#F0C75E] transition-all text-sm" />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3 rounded-full bg-white border border-[#e5e7eb] text-[#081b38] focus:outline-none focus:border-[#F0C75E] text-sm">
                <option value="popular">Trier par : Populaire</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <span className="text-sm text-[#43474f] whitespace-nowrap">{filteredProducts.length} produits</span>
            </div>
          </div>

                             {/* 👇 DESIGN ÉPURÉ : SURVOL POUR AFFICHER LES SOUS-CATÉGORIES */}
          <div className="flex flex-wrap gap-6 md:gap-10 mb-12 justify-center md:justify-start">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
              
              return (
                <div key={cat.id} className="relative group flex flex-col items-center">
                  
                  {/* BOUTON CATÉGORIE */}
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory(null);
                    }}
                    className="flex flex-col items-center justify-center gap-3 transition-all duration-500 outline-none"
                  >
                    {/* ZONE DE L'ICÔNE (Sans cadre, juste l'effet de lumière) */}
                    <div className={`
                      w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-500 rounded-full
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `}>
                      {cat.customIcon ? (
                        <img 
                          src={cat.customIcon} 
                          alt={cat.label} 
                          className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-all duration-500 ${
                            isActive 
                              ? 'drop-shadow-[0_0_15px_rgba(255,255,0,0.8)] scale-110' // Effet de lumière dorée
                              : 'opacity-100 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(0,0,139,10000.500)]' // Lumière au survol
                          }`} 
                        />
                      ) : cat.id === 'all' ? (
                        <span className={`material-symbols-outlined text-3xl md:text-4xl transition-all duration-500 ${
                          isActive ? 'text-[#F0C75E] drop-shadow-[0_0_10px_rgba(240,199,94,0.6)]' : 'text-gray-400 group-hover:text-[#F0C75E] group-hover:drop-shadow-[0_0_10px_rgba(240,199,94,0.5)]'
                        }`}>
                          grid_view
                        </span>
                      ) : null}
                    </div>
                    
                    {/* TEXTE */}
                    <span className={`
                      font-['Montserrat'] text-xs md:text-sm font-semibold tracking-wide transition-all duration-500
                      ${isActive ? 'text-[#0D1F3C]' : 'text-gray-500 group-hover:text-[#0D1F3C]'}
                    `}>
                      {cat.label}
                    </span>
                  </button>
                  
                  {/* SOUS-CATÉGORIES (Apparaissent au survol) */}
                  {hasSubcategories && (
                    <div className={`
                      absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-[#e5e7eb] z-30 min-w-[220px] 
                      transition-all duration-300 origin-top
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      pointer-events-none group-hover:pointer-events-auto
                    `}>
                      <div className="text-[10px] text-gray-400 px-3 pb-2 font-['Montserrat'] font-semibold uppercase tracking-wider text-center">
                        Options {cat.label}
                      </div>
                      <div className="w-full h-px bg-gray-100 mb-2"></div>
                      {cat.subcategories.map(sub => (
                        <button
                          key={sub}
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche la fermeture
                            setSelectedSubcategory(selectedSubcategory === sub ? null : sub);
                          }}
                          className={`
                            block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-300 font-['Montserrat']
                            ${selectedSubcategory === sub 
                              ? 'bg-[#F0C75E]/10 text-[#0D1F3C] font-bold' 
                              : 'text-[#43474f] hover:bg-[#F8FAFC]'
                            }
                          `}
                        >
                          {selectedSubcategory === sub ? '✓ ' : ''}
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRILLE PRODUITS (Design inchangé mais nettoyé) */}
      <section className="px-4 sm:px-6 md:px-12 py-6">
        <div className="max-w-[1280px] mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20"><span className="text-6xl block mb-4">🔍</span><h3 className="text-2xl font-['Playfair_Display'] text-[#1A3A6B] mb-2">Aucun produit trouvé</h3><button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="mt-4 bg-[#1A3A6B] text-white px-6 py-2 rounded-full">Voir tous les produits</button></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const isSticker = product.categorie?.toLowerCase().includes('sticker') || product.nom?.toLowerCase().includes('sticker');
                return (
                  <div key={product.id} className="group bg-white rounded-2xl border border-[#e5e7eb] hover:border-[#F0C75E] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                    <div className="relative aspect-square overflow-hidden bg-[#F8FAFC]">
                      <img src={product.image_url || '/placeholder-product.jpg'} alt={product.nom} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                      <div className="absolute inset-0 bg-[#0D1F3C]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        {isSticker ? (
                          <button onClick={() => openStickerForm(product)} className="bg-[#F0C75E] text-[#0D1F3C] px-5 py-2.5 rounded-full text-xs uppercase font-semibold transform scale-90 group-hover:scale-100 shadow-lg">🎨 Personnaliser</button>
                        ) : (
                          <button onClick={() => addToCart(product)} disabled={product.stock === 0} className="bg-[#F0C75E] text-[#0D1F3C] px-5 py-2.5 rounded-full text-xs uppercase font-semibold transform scale-90 group-hover:scale-100 shadow-lg">{product.stock === 0 ? 'Indisponible' : 'Ajouter'}</button>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-['Playfair_Display'] text-base text-[#1A3A6B] font-semibold line-clamp-1">{product.nom}</h3>
                      <div className="pt-3 flex justify-between items-center mt-2 border-t border-[#e5e7eb]">
                        <span className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-bold">{product.prix !== undefined ? `${product.prix} DT` : 'Sur devis'}</span>
                        <button onClick={() => addToCart(product)} className="bg-[#1A3A6B] text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-semibold hover:bg-[#0D1F3C] transition-colors">Ajouter</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-[#1A3A6B] text-white mt-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[#F0C75E] text-4xl mb-4">rocket_launch</span>
            <h3 className="font-['Playfair_Display'] text-xl mb-2 font-semibold">Express 24h</h3>
            <p className="text-sm text-white/70">Traitement prioritaire pour une livraison record.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[#F0C75E] text-4xl mb-4">diamond</span>
            <h3 className="font-['Playfair_Display'] text-xl mb-2 font-semibold">Finitions Premium</h3>
            <p className="text-sm text-white/70">Un catalogue de textures et de dorures unique.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[#F0C75E] text-4xl mb-4">verified_user</span>
            <h3 className="font-['Playfair_Display'] text-xl mb-2 font-semibold">Paiement Sécurisé</h3>
            <p className="text-sm text-white/70">Transactions protégées par cryptage SSL.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0D1F3C] text-white border-t-2 border-[#F0C75E]/30 px-4 sm:px-6 md:px-12 py-12">
        <div className="max-w-[1280px] mx-auto text-center md:text-left grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-['Playfair_Display'] text-2xl text-[#F0C75E] font-bold mb-2">Ulysse DeZign</h3>
            <p className="text-sm text-white/50 italic">Plus qu'une imprimerie, une expérience.</p>
          </div>
          <div className="md:text-right flex flex-col justify-center">
            <p className="text-sm text-white/40">Djerba, Tunisie • +216 99 477 391</p>
            <p className="text-xs text-white/20 mt-2">© 2025 Ulysse DeZign. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#e5e7eb] z-50 flex justify-around items-center h-16">
        <Link to="/" className="flex flex-col items-center text-gray-400 hover:text-[#F0C75E]"><span className="material-symbols-outlined text-lg">home</span><span className="text-[9px] uppercase tracking-wider">Accueil</span></Link>
        <span className="flex flex-col items-center text-[#F0C75E] font-semibold"><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span><span className="text-[9px] uppercase tracking-wider">Boutique</span></span>
        <Link to="/panier" className="flex flex-col items-center text-gray-400 hover:text-[#F0C75E] relative"><span className="material-symbols-outlined text-lg">shopping_cart</span><span className="text-[9px] uppercase tracking-wider">Panier</span>{cartCount > 0 && <span className="absolute -top-1 -right-2 bg-[#F0C75E] text-[#0D1F3C] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}</Link>
        <Link to="/login" className="flex flex-col items-center text-gray-400 hover:text-[#F0C75E]"><span className="material-symbols-outlined text-lg">person</span><span className="text-[9px] uppercase tracking-wider">Compte</span></Link>
      </nav>

      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Boutique;