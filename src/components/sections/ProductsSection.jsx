// src/components/sections/ProductsSection.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabaseErp } from '../../lib/supabaseErp';

// --- DONNÉES DE SECOURS ---
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
          .limit(6);

        if (error) throw error;
        setProducts(data && data.length > 0 ? data : FALLBACK_PRODUCTS);
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
    if (activeProductFilter === 'tous') return products;
    return products.filter(p => p.categorie?.toLowerCase() === activeProductFilter.toLowerCase());
  }, [products, activeProductFilter]);

  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.categorie).filter(Boolean));
    return ['tous', ...cats];
  }, [products]);

  return (
    <section className="py-24 sm:py-32 bg-[#F8FAFC] relative overflow-hidden" id="products">
      {/* --- DÉCORATIONS DE FOND (Lueur dorée et bleutée) --- */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F0C75E]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1A3A6B]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* --- EN-TÊTE --- */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-16 h-px bg-gradient-to-r from-transparent to-[#F0C75E]"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#F0C75E] font-bold">Collection Exclusive</span>
            <span className="w-16 h-px bg-gradient-to-l from-transparent to-[#F0C75E]"></span>
          </div>
          
          <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-7xl text-[#0D1F3C] font-bold tracking-tight leading-tight">
            Nos <span className="relative inline-block text-[#1A3A6B]">
              Incontournables
              <span className="absolute -bottom-2 left-0 w-full h-[4px] bg-gradient-to-r from-[#F0C75E] via-[#F0C75E]/50 to-transparent rounded-full"></span>
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4A6A8A] mt-6 font-light max-w-2xl mx-auto">
            Découvrez notre sélection de produits haut de gamme, conçus pour sublimer votre image de marque.
          </p>
        </div>
        
        {/* --- FILTRES (Design "Pill" raffiné) --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveProductFilter(cat)}
              className={`px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-500 ${
                activeProductFilter === cat
                  ? 'bg-[#0D1F3C] text-[#F0C75E] shadow-xl shadow-[#0D1F3C]/30 scale-105'
                  : 'bg-white text-[#4A6A8A] border border-[#e8e8ec] hover:border-[#F0C75E] hover:text-[#0D1F3C] hover:shadow-lg'
              }`}
            >
              {cat === 'tous' ? 'Tous les produits' : cat}
            </button>
          ))}
        </div>
        
        {/* --- GRILLE DES PRODUITS --- */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[#F0C75E]/30 border-t-[#F0C75E] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white rounded-[2rem] p-3 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(13,31,60,0.15)]"
              >
                {/* Conteneur Image */}
                <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-[#f5f4f0]">
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {product.badge && (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm ${
                        product.badge.includes('Top') ? 'bg-[#F0C75E] text-[#0D1F3C]' :
                        product.badge.includes('Promo') ? 'bg-red-500 text-white' :
                        'bg-white/90 text-[#0D1F3C]'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <img 
                    src={product.image || 'https://via.placeholder.com/600'} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Effet de survol : Bouton Découvrir */}
                  <div className="absolute inset-0 bg-[#0D1F3C]/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <Link 
                      to="/boutique" 
                      className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-white text-[#0D1F3C] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-[#F0C75E]"
                    >
                      Voir le produit
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>

                  {/* Étiquette Catégorie (Verre) */}
                  <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3A6B]">{product.categorie}</span>
                  </div>
                </div>

                {/* Contenu (Texte et Prix) */}
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#F0C75E] mb-2">
                    {product.subtitle || 'Collection Prestige'}
                  </p>
                  <h3 className="font-['Playfair_Display'] text-2xl text-[#0D1F3C] font-bold leading-tight mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#4A6A8A] leading-relaxed line-clamp-2 mb-6">
                    {product.description}
                  </p>
                  
                  {/* Prix et Action */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#f0f0f0]">
                    <div className="flex flex-col">
                      {product.ancienPrix && (
                        <span className="text-xs text-gray-400 line-through">{product.ancienPrix}</span>
                      )}
                      <span className="font-['Playfair_Display'] text-3xl text-[#1A3A6B] font-bold">
                        {product.price || 'Sur devis'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => window.open(whatsappLink, '_blank')}
                      className="w-12 h-12 flex items-center justify-center bg-[#f5f4f0] text-[#0D1F3C] rounded-full hover:bg-[#25D366] hover:text-white transition-all duration-300 group-hover:shadow-lg"
                      title="Commander sur WhatsApp"
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