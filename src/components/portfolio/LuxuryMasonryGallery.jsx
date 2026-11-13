// src/components/portfolio/LuxuryMasonryGallery.jsx
import { useState, useEffect } from 'react';
import SectionHeader from '../ui/SectionHeader';



// =====================================================
// 1. DONNÉES DES PROJETS
// =====================================================
const PROJECTS = [
  // --- STICKERS ---
  { id: 1, title: "Stickers Vinyle Floral", category: "Stickers", client: "Maison Fleurie", image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&q=80", description: "Stickers vinyles découpés à la main.", size: "pano" },
  { id: 2, title: "Stickers Holographiques", category: "Stickers", client: "Cosmetics Lab", image: "https://images.unsplash.com/photo-1620168341738-67d8a58b9b80?w=600&q=80", description: "Stickers 3D holographiques.", size: "square" },
  { id: 3, title: "Stickers Logo Entreprise", category: "Stickers", client: "Tech Corp", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&q=80", description: "Stickers de logos personnalisés.", size: "square" },
  { id: 4, title: "Stickers Ronds", category: "Stickers", client: "Boulangerie Bio", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80", description: "Stickers de scellés pour pains.", size: "tall" },

  // --- IMPRESSION UV ---
  { id: 5, title: "Plexiglas UV", category: "Impression UV", client: "Galerie d'Art", image: "https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?w=600&q=80", description: "Impression UV sur plexiglas.", size: "tall" },
  { id: 6, title: "Bois Personnalisé", category: "Impression UV", client: "Cadeau Pro", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80", description: "Impression UV sur médium.", size: "square" },
  { id: 7, title: "Métal Brossé UV", category: "Impression UV", client: "Industrie", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80", description: "Impression UV sur aluminium.", size: "square" },

  // --- GRAND FORMAT ---
  { id: 8, title: "Bâche Chantier", category: "Grand Format", client: "BTP Tunisie", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80", description: "Bâche géante pour couvrir un échafaudage.", size: "square" },
  { id: 9, title: "Enseigne Lumineuse", category: "Grand Format", client: "Hotel Royal", image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&q=80", description: "Enseigne lumineuse grand format.", size: "tall" },
  { id: 10, title: "Vitrophanie Boutique", category: "Grand Format", client: "Dior", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", description: "Habillage de vitrine complète.", size: "square" },
  { id: 11, title: "Stand Expo", category: "Grand Format", client: "Tech Summit", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", description: "Stand d'exposition grand format.", size: "tall" },

  // --- PACKAGING ---
  { id: 12, title: "Boîtes Cadeaux", category: "Packaging", client: "Joallerie", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80", description: "Boîtes avec finitions mates.", size: "tall" },
  { id: 13, title: "Packaging Cosmétique", category: "Packaging", client: "Cosmetics Lab", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80", description: "Packaging sur mesure.", size: "square" },
];

const MAIN_CATEGORIES = [
  { id: 'Stickers', title: 'Stickers & Découpes', icon: 'content_cut', image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&q=80' },
  { id: 'Impression UV', title: 'Impression UV HD', icon: 'high_quality', image: 'https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?w=600&q=80' },
  { id: 'Grand Format', title: 'Grand Format & Vinyles', icon: 'wallpaper', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80' },
  { id: 'Packaging', title: 'Packaging sur Mesure', icon: 'inventory_2', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80' }
];

// =====================================================
// 2. COMPOSANT CARTE PROJET
// =====================================================
const ProjectCard = ({ project, onClick }) => {
  // On ajoute la logique pour gérer plusieurs tailles
  let aspectClass = 'aspect-square'; // Par défaut
  
  if (project.size === 'tall') aspectClass = 'aspect-[3/4]';
  else if (project.size === 'wide') aspectClass = 'aspect-video';
  else if (project.size === 'portrait') aspectClass = 'aspect-[4/5]';
  else if (project.size === 'pano') aspectClass = 'aspect-[51/9]';

  return (
   <div 
      className={`group relative ${aspectClass} rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer bg-[#f5f4f0] transition-all duration-700 hover:-translate-y-2`} 
      onClick={() => onClick(project)}
    >
      <img 
        src={project.image} 
        alt={project.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
        loading="lazy" 
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/95 via-[#0D1F3C]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#F0C75E]/50 rounded-[1.5rem] transition-colors duration-500 z-20 pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 z-20">
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-widest rounded-full mb-3">
          {project.category}
        </span>
        <h3 className="font-['Playfair_Display'] text-white text-xl font-bold leading-tight group-hover:text-[#F0C75E] transition-colors">
          {project.title}
        </h3>
        
        <div className="overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-4">
          <button className="px-5 py-2.5 bg-[#F0C75E] text-[#0D1F3C] rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#d4aa3a] transition-colors shadow-lg">
            Voir le projet
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// 3. MODAL DE PROJET
// =====================================================
const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1F3C]/90 backdrop-blur-xl animate-fadeIn" onClick={onClose}>
      <div className="relative bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/20 text-white rounded-full hover:bg-black/40 flex items-center justify-center backdrop-blur-md transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-3/5 bg-[#f5f4f0]">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover aspect-square md:aspect-auto" />
          </div>
          
          <div className="md:w-2/5 p-8 md:p-10 overflow-y-auto flex flex-col justify-center">
            <span className="inline-block px-4 py-1.5 bg-[#F0C75E]/10 text-[#F0C75E] text-[10px] uppercase tracking-widest font-bold rounded-full mb-4 w-max">
              {project.category}
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#0D1F3C] font-bold leading-tight">{project.title}</h2>
            
            <div className="w-12 h-0.5 bg-[#F0C75E] my-5"></div>
            
            <p className="text-[#4A6A8A] font-['Montserrat'] text-sm font-semibold mb-2">Client : <span className="text-[#0D1F3C]">{project.client}</span></p>
            <p className="text-[#4A6A8A] font-['Montserrat'] text-sm leading-relaxed mb-8">{project.description}</p>
            
            <button className="w-full px-6 py-4 bg-[#0D1F3C] text-white rounded-xl font-['Montserrat'] text-xs uppercase tracking-widest font-bold hover:bg-[#1A3A6B] hover:shadow-lg transition-all duration-300">
              Demander un devis similaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// 4. COMPOSANT PRINCIPAL
// =====================================================
const LuxuryMasonryGallery = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredProjects = activeCategory 
    ? PROJECTS.filter(p => p.category === activeCategory) 
    : [];

  return (
    <div className="py-20 md:py-32 bg-[#F8FAFC] relative overflow-hidden" id="portfolio">
      
      {/* Halos de lumière en fond */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F0C75E]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1A3A6B]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* --- VUE 1 : LA GRILLE DES 4 CATÉGORIES (Avec le nouvel en-tête à gauche) --- */}
        {!activeCategory && (
          <div className="animate-fadeIn">
            
            <SectionHeader
  eyebrow="Explorer"
  title="Nos"
  highlight="Réalisations"
  description="Cliquez sur une catégorie pour plonger dans notre univers créatif."
  light
/>

            {/* Les 4 blocs catégories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {MAIN_CATEGORIES.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="group relative overflow-hidden aspect-[3/4] rounded-[2rem] cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
                >
                  <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F3C]/95 via-[#0D1F3C]/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#F0C75E]/50 rounded-[2rem] transition-colors duration-500 z-20 pointer-events-none"></div>

                  <div className="absolute bottom-0 left-0 p-6 text-white w-full z-20">
                    <span className="material-symbols-outlined text-[#F0C75E] text-3xl mb-3">{cat.icon}</span>
                    <h3 className="font-['Playfair_Display'] text-xl md:text-2xl font-bold leading-tight group-hover:text-[#F0C75E] transition-colors">{cat.title}</h3>
                    
                    <div className="overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-3">
                      <p className="text-[#F0C75E] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                        Voir les projets <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VUE 2 : LA GALERIE DES TRAVAUX (Style Masonry) --- */}
        {activeCategory && (
          <div className="animate-slideUp">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#e8e8ec] pb-8">
              <div>
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="inline-flex items-center gap-2 text-[#4A6A8A] hover:text-[#0D1F3C] font-['Montserrat'] text-xs uppercase tracking-widest font-bold mb-6 group transition-colors"
                >
                  <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Retour aux catégories
                </button>
                <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#0D1F3C] font-bold">
                  {activeCategory}
                </h2>
                <p className="text-[#4A6A8A] mt-2 font-['Montserrat'] text-sm">
                  {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} dans cette catégorie
                </p>
              </div>
              
              <div className="hidden md:block text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#F0C75E] font-bold font-['Montserrat']">Collection Exclusive</span>
              </div>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="break-inside-avoid">
                  <ProjectCard project={project} onClick={setSelectedProject} />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}

      </div>
    </div>
  );
};

export default LuxuryMasonryGallery;