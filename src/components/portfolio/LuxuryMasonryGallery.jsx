// src/components/portfolio/LuxuryMasonryGallery.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';

// =====================================================
// DONNÉES DES PROJETS
// =====================================================
const PROJECTS = [
  {
    id: 1,
    title: "Collection Printemps 2024",
    category: "Stickers",
    client: "Maison Fleurie",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR52eF2BIB_fjtUjuAquLJmDX6cyHBmS03-rrKBKwRTo-EyQ1mYkz-QolnZ&s=10",
    size: "large",
    colors: ["#F5D88A", "#D4A83A", "#8B7355"],
    description: "Une collection florale luxueuse pour une marque de parfumerie.",
    tags: ["Stickers", "Vinyle", "Découpe laser"]
  },
  {
    id: 2,
    title: "Enseigne LED Premium",
    category: "Signalétique",
    client: "Hotel Royal",
    image: "https://premium-enseigne.com/wp-content/uploads/2026/05/enseigne-lettres-decoupees-neon.jpg",
    size: "medium",
    colors: ["#1A3A6B", "#0D1F3C", "#F0C75E"],
    description: "Enseigne lumineuse en aluminium brossé pour un hôtel 5 étoiles.",
    tags: ["LED", "Aluminium", "Grand format"]
  },
  {
    id: 3,
    title: "Packaging Prestige",
    category: "Packaging",
    client: "Cosmetics Lab",
    image: "https://3.bp.blogspot.com/-t5ChmdC1vNo/UoBm8-TTErI/AAAAAAABA8o/zeTrWL2-iy4/s1600/F&S_Bohemia_Sekt_Prestige_RGB_300dpi.jpg",
    size: "medium",
    colors: ["#FFFFFF", "#F0C75E", "#1A3A6B"],
    description: "Packaging sur mesure pour une gamme de cosmétiques haut de gamme.",
    tags: ["Packaging", "Dorure", "Sur mesure"]
  },
  {
    id: 4,
    title: "Vitrophanie Boutique",
    category: "Signalétique",
    client: "Dior Tunisie",
    image: "https://vitrophanie.art/wp-content/uploads/2023/01/vitrauphanie-vegetale-vitrine-magasin-show-room.jpg",
    size: "large",
    colors: ["#D4A83A", "#0D1F3C", "#FFFFFF"],
    description: "Vitrophanie sur mesure pour la boutique Dior de Tunis.",
    tags: ["Vitrophanie", "Vinyle", "Découpe"]
  },
  {
    id: 5,
    title: "Cartes de Visite Pro",
    category: "Papeterie",
    client: "Cabinet d'Avocats",
    image: "https://www.creation-logo.net/userfiles/images/Les%20erreurs%20%C3%A0%20%C3%A9viter%20lorsque%20vous%20cr%C3%A9ez%20vos%20cartes%20de%20visite%201.jpeg",
    size: "small",
    colors: ["#1A3A6B", "#F0C75E", "#FFFFFF"],
    description: "Cartes de visite sur papier 350g avec dorure à chaud.",
    tags: ["Papeterie", "Dorure", "Premium"]
  },
  {
    id: 6,
    title: "Stand Expo 2024",
    category: "Grand Format",
    client: "Tech Summit",
    image: "https://www.pro-expo.net/wp-content/uploads/2024/10/Siegfried-CPHI-2024-1-uai-1706x1280.jpg",
    size: "large",
    colors: ["#0D1F3C", "#F0C75E", "#FFFFFF"],
    description: "Stand d'exposition grand format pour le Tech Summit Tunisie.",
    tags: ["Grand format", "Stand", "Événementiel"]
  },
  {
    id: 7,
    title: "Menus Gastronomiques",
    category: "Menu",
    client: "Restaurant Le Jardin",
    image: "https://bonaloca.fr/media/16192/BL-220.jpg",
    size: "small",
    colors: ["#8B7355", "#F0C75E", "#FFFFFF"],
    description: "Menus sur papier premium pour un restaurant gastronomique.",
    tags: ["Menus", "Papeterie", "Reliure"]
  },
  {
    id: 8,
    title: "Roll-Up Collection",
    category: "Grand Format",
    client: "Fashion Week",
    image: "https://printodelivery.in/wp-content/uploads/2024/07/2-3.png",
    size: "medium",
    colors: ["#1A3A6B", "#F0C75E", "#D4A83A"],
    description: "Roll-ups pour les défilés de la Fashion Week de Tunis.",
    tags: ["Roll-up", "Grand format", "Événementiel"]
  },
  {
    id: 9,
    title: "Stickers 3D Holographiques",
    category: "Stickers",
    client: "Cosmetics Lab",
    image: "https://slapsta.com/cdn/shop/products/3d-security-hologram-stickers-made-in-us-mothership-slapsta-838.png?v=1600981888",
    size: "small",
    colors: ["#FF6B6B", "#4ECDC4", "#F0C75E"],
    description: "Stickers holographiques 3D pour une marque de cosmétiques.",
    tags: ["Stickers", "3D", "Holographique"]
  }
];

// =====================================================
// COMPOSANT CARTE PROJET
// =====================================================
const ProjectCard = ({ project, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getSizeClass = () => {
    switch(project.size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-2';
      default: return 'col-span-1';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative ${getSizeClass()} cursor-pointer transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(project)}
    >
      <div className="relative h-full rounded-2xl overflow-hidden shadow-xl bg-[#f5f4f0]">
        {/* Image */}
        <div className="relative w-full h-full">
          <OptimizedImage
            src={project.image}
            alt={project.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            lazy={true}
          />
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/90 via-[#0D1F3C]/40 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-60'
          }`} />
          
          {/* Effet de lumière dorée */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#F0C75E]/20 transition-opacity duration-700 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Bordure dorée */}
          <div className={`absolute inset-0 border-2 border-[#F0C75E]/0 transition-all duration-700 rounded-2xl ${
            isHovered ? 'border-[#F0C75E]/50' : ''
          }`} />
        </div>

        {/* Contenu */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ${
          isHovered ? 'translate-y-0' : 'translate-y-4'
        }`}>
          {/* Catégorie */}
          <span className="inline-block px-3 py-1 bg-[#F0C75E]/20 backdrop-blur-sm text-[#F0C75E] text-xs uppercase tracking-widest rounded-full mb-2">
            {project.category}
          </span>
          
          {/* Titre */}
          <h3 className={`font-['Playfair_Display'] text-white text-xl md:text-2xl font-bold transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-90'
          }`}>
            {project.title}
          </h3>
          
          {/* Détails au survol */}
          <div className={`overflow-hidden transition-all duration-500 ${
            isHovered ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}>
            <p className="text-white/70 text-sm font-['Montserrat'] font-light">
              {project.client}
            </p>
            <p className="text-white/50 text-xs mt-1 font-['Montserrat'] line-clamp-2">
              {project.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/60 text-[8px] uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Bouton */}
          <button
            className={`mt-4 px-6 py-2 bg-[#F0C75E] text-[#0D1F3C] rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-[#d4aa3a] transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Voir le projet
          </button>
        </div>

        {/* Indicateur de taille */}
        <div className="absolute top-4 right-4 flex gap-1">
          <div className={`w-1.5 h-1.5 rounded-full bg-[#F0C75E] transition-opacity ${
            project.size === 'large' ? 'opacity-100' : 'opacity-30'
          }`} />
          <div className={`w-1.5 h-1.5 rounded-full bg-[#F0C75E] transition-opacity ${
            project.size === 'medium' || project.size === 'large' ? 'opacity-100' : 'opacity-30'
          }`} />
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MODAL DE PROJET
// =====================================================
const ProjectModal = ({ project, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    project.image,
    project.image.replace('w=800', 'w=600'),
    project.image.replace('w=800', 'w=400'),
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/40 transition flex items-center justify-center"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Galerie */}
          <div className="md:w-3/5 bg-[#f5f4f0] p-4">
            <div className="relative aspect-square overflow-hidden rounded-xl">
              <img
                src={images[currentImage]}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation des images */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2 h-2 rounded-full transition ${
                      currentImage === i ? 'bg-[#F0C75E] w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="md:w-2/5 p-6 md:p-8 overflow-y-auto">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-[#F0C75E]/10 text-[#F0C75E] text-xs uppercase tracking-widest rounded-full">
                {project.category}
              </span>
            </div>
            
            <h2 className="font-['Playfair_Display'] text-3xl text-[#1A3A6B] font-bold">
              {project.title}
            </h2>
            
            <p className="text-[#4A6A8A] mt-2 font-['Montserrat'] text-sm">
              {project.client}
            </p>
            
            <p className="text-[#4A6A8A] mt-4 font-['Montserrat'] text-sm leading-relaxed">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-[#f5f4f0] text-[#4A6A8A] text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Palette de couleurs */}
            <div className="mt-6 p-4 bg-[#f5f4f0] rounded-xl">
              <p className="text-xs text-[#4A6A8A] font-['Montserrat'] uppercase tracking-wider mb-2">
                Palette de couleurs
              </p>
              <div className="flex gap-3">
                {project.colors.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[8px] text-[#4A6A8A] uppercase font-['Montserrat']">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-6 py-3 bg-[#1A3A6B] text-white rounded-full font-['Montserrat'] text-sm uppercase tracking-wider hover:bg-[#0D1F3C] transition">
                Demander un devis
              </button>
              <button className="px-6 py-3 border-2 border-[#1A3A6B] text-[#1A3A6B] rounded-full font-['Montserrat'] text-sm uppercase tracking-wider hover:bg-[#1A3A6B]/5 transition">
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// FILTRES
// =====================================================
const FilterBar = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-6 py-2.5 rounded-full text-sm font-['Montserrat'] transition-all duration-500 ${
            activeCategory === cat
              ? 'bg-gradient-to-r from-[#1A3A6B] to-[#0D1F3C] text-white shadow-lg shadow-[#1A3A6B]/30 transform -translate-y-0.5'
              : 'bg-white/80 backdrop-blur-sm text-[#4A6A8A] border border-[#c4c6d0] hover:border-[#F0C75E] hover:shadow-lg'
          }`}
        >
          {cat}
          {activeCategory === cat && (
            <span className="ml-2 inline-block w-1.5 h-1.5 bg-[#F0C75E] rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
const LuxuryMasonryGallery = ({ limit = null, showFilter = true }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [filteredProjects, setFilteredProjects] = useState(PROJECTS);

  const categories = ['Tous', ...new Set(PROJECTS.map(p => p.category))];

  useEffect(() => {
    if (activeCategory === 'Tous') {
      setFilteredProjects(PROJECTS);
    } else {
      setFilteredProjects(PROJECTS.filter(p => p.category === activeCategory));
    }
  }, [activeCategory]);

  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  return (
    <div className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-16 h-px bg-gradient-to-r from-transparent to-[#F0C75E]"></span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-['Montserrat'] font-semibold">
              ✧ Portfolio
            </span>
            <span className="w-16 h-px bg-gradient-to-l from-transparent to-[#F0C75E]"></span>
          </div>
          
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl text-[#0D1F3C] font-bold">
            Nos <span className="text-[#1A3A6B]">Réalisations</span>
          </h2>
          <p className="text-[#4A6A8A] mt-4 font-['Montserrat'] font-light max-w-2xl mx-auto">
            Des projets d'exception qui reflètent notre savoir-faire et notre passion pour l'impression
          </p>
          
          <p className="text-sm text-[#4A6A8A] mt-4 font-['Montserrat']">
            <span className="font-bold text-[#1A3A6B]">{displayProjects.length}</span> projets réalisés
          </p>
        </div>

        {/* Filtres */}
        {showFilter && (
          <FilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}

        {/* Grille Masonry */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[300px] gap-4 md:gap-6">
          {displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={setSelectedProject}
            />
          ))}
        </div>

        {/* Message si aucun projet */}
        {displayProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#4A6A8A] font-['Montserrat']">
              Aucun projet dans cette catégorie.
            </p>
          </div>
        )}

        {/* Modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}

        {/* Bouton Voir plus */}
        {limit && filteredProjects.length > limit && (
          <div className="text-center mt-12">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-3 bg-[#1A3A6B] text-white px-8 py-4 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.15em] font-semibold hover:bg-[#0D1F3C] transition-all duration-500 shadow-lg hover:shadow-[#1A3A6B]/30"
            >
              Voir tous nos projets
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        )}

        {/* Lien vers la boutique */}
        {!limit && (
          <div className="text-center mt-12">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-3 bg-[#1A3A6B] text-white px-8 py-4 rounded-full font-['Montserrat'] text-sm uppercase tracking-[0.15em] font-semibold hover:bg-[#0D1F3C] transition-all duration-500 shadow-lg hover:shadow-[#1A3A6B]/30"
            >
              Découvrir tous nos produits
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuxuryMasonryGallery;