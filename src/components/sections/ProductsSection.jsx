// src/components/sections/ProductsSection.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabaseErp } from '../../lib/supabaseErp';

// --- DONNÉES DE SECOURS (5 produits pour le design) ---
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Stickers Vinyle Premium',
    subtitle: 'Collection Signature',
    description: 'Vinyle de luxe avec découpe laser précise. Résistance UV 5 ans, waterproof et anti-rayures.',
    price: '45€',
    ancienPrix: '65€',
    badge: '⭐ Top Vente',
    image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&h=600&fit=crop&q=80',
    categorie: 'Stickers',
    stock: true,
  },
  {
    id: 2,
    name: 'Roll-Up Élégance Pro',
    subtitle: 'Communication Premium',
    description: 'Standee professionnel en aluminium brossé. Impression 1440 DPI sur vinyle mat anti-reflet.',
    price: '195€',
    badge: '🔥 Nouveauté',
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=600&fit=crop&q=80',
    categorie: 'Grand Format',
    stock: true,
  },
  {
    id: 3,
    name: 'Bâche Extérieure 550g',
    subtitle: 'Résistance Ultime',
    description: 'Bâche haute performance pour l\'extérieur. Résistance UV, intempéries et déchirures.',
    price: '89€',
    ancienPrix: '120€',
    badge: '🌟 Best-Seller',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop&q=80',
    categorie: 'Grand Format',
    stock: true,
  },
  {
    id: 4,
    name: 'Impression UV Plexiglas',
    subtitle: 'Art & Photographie',
    description: 'Impression UV haute définition sur supports rigides de luxe. Rendu exceptionnel.',
    price: '135€',
    badge: '✨ Premium',
    image: 'https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?w=600&h=600&fit=crop&q=80',
    categorie: 'Impression',
    stock: true,
  },
  {
    id: 5,
    name: 'Flyers & Plaquettes HA',
    subtitle: 'Communication Papier',
    description: 'Flyers sur papier couché 300g avec finition mate ou brillante. Offset haute définition.',
    price: '29€',
    ancienPrix: '45€',
    badge: '💡 Promo',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=80',
    categorie: 'Paperboard',
    stock: true,
  }
];

const whatsappLink = `https://wa.me/21699477391?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20services%20d%27impression`;

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProductFilter, setActiveProductFilter] = useState('tous');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseErp
          .from('erp_produits')
          .select('*')
          .eq('featured', true)
          .limit(5);

        if (error) throw error;
        
        // 👇 On force l'utilisation des données de secours si la BDD renvoie moins de 5 produits
        if (data && data.length >= 5) {
          setProducts(data);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (error) {
        console.error('❌ Erreur chargement produits:', error);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = activeProductFilter === 'tous' 
      ? products 
      : products.filter(p => p.categorie?.toLowerCase() === activeProductFilter.toLowerCase());
    return filtered.slice(0, 5); // On garde 5 max
  }, [products, activeProductFilter]);

  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.categorie).filter(Boolean));
    return ['tous', ...cats];
  }, [products]);

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-[#071325]" id="products">
      
      {/* --- DÉCORATIONS DE FOND --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* --- EN-TÊTE --- */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 sm:mb-20">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="w-8 md:w-12 h-px bg-[#F0C75E]"></span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Collection Exclusive</span>
            </div>
            <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight leading-tight">
              Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">Incontournables</span>
            </h2>
            <p className="text-sm sm:text-base text-white/60 mt-4 font-['Montserrat'] font-light max-w-xl mx-auto md:mx-0">
              Découvrez notre sélection de produits haut de gamme, conçus pour sublimer votre image de marque.
            </p>
          </div>
          
          <Link to="/boutique" className="mt-6 md:mt-0 inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 uppercase tracking-widest text-xs font-bold font-['Montserrat'] group">
            Voir la boutique
            <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#F0C75E] group-hover:bg-[#F0C75E] group-hover:text-[#0D1F3C] transition-all duration-500">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </Link>
        </div>
        
        {/* --- FILTRES --- */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-12">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveProductFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-500 border ${
                activeProductFilter === cat
                  ? 'bg-[#F0C75E] text-[#0D1F3C] border-[#F0C75E] shadow-[0_0_20px_-5px_rgba(240,199,94,0.5)]'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-[#F0C75E]/50 hover:text-white'
              }`}
            >
              {cat === 'tous' ? 'Tous les produits' : cat}
            </button>
          ))}
        </div>
        
        {/* --- GRILLE DES PRODUITS (3 colonnes pour voir 5 articles) --- */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[#F0C75E]/30 border-t-[#F0C75E] rounded-full animate-spin"></div>
          </div>
        ) : (
          // 👇 Changement de grid-cols-5 à grid-cols-3 pour que les cartes soient plus grandes
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white/5 backdrop-blur-md rounded-[1.5rem] p-3 transition-all duration-700 hover:-translate-y-2 hover:bg-white/10 border border-white/10 hover:border-[#F0C75E]/30 hover:shadow-[0_20px_50px_-12px_rgba(240,199,94,0.15)] flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] rounded-[1rem] overflow-hidden bg-[#0D1F3C]">
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-[#0D1F3C] shadow-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  <img 
                    src={product.image || 'https://via.placeholder.com/600'} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Hover Button */}
                  <div className="absolute inset-0 bg-[#0D1F3C]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <Link 
                      to="/boutique" 
                      className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-[#F0C75E] text-[#0D1F3C] px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
                    >
                      Découvrir
                    </Link>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#F0C75E] mb-1">
                    {product.subtitle || 'Prestige'}
                  </p>
                  <h3 className="font-['Playfair_Display'] text-xl text-white font-bold leading-tight mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  
                  {/* Prix */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex flex-col">
                      {product.ancienPrix && (
                        <span className="text-[10px] text-white/40 line-through">{product.ancienPrix}</span>
                      )}
                      <span className="font-['Playfair_Display'] text-2xl text-[#F0C75E] font-bold">
                        {product.price || 'Sur devis'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => window.open(whatsappLink, '_blank')}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-full hover:bg-[#25D366] hover:text-white transition-all duration-300"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;