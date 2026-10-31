// src/components/StickerOrderForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const StickerOrderForm = ({ product, onClose, onAddToCart }) => {
  const [formData, setFormData] = useState({
    quantite: 100,
    forme: 'cercle',
    dimension: {
      diametre: '',
      largeur: '',
      hauteur: ''
    },
    fond: 'blanc',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWhatsAppContact, setShowWhatsAppContact] = useState(false);

  const whatsappNumber = "21699477391";

  // Gestion des changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Calcul du prix selon les dimensions et quantité
  const calculatePrice = () => {
    // Récupérer la plus grande dimension
    let maxDimension = 0;
    if (formData.forme === 'cercle') {
      maxDimension = parseFloat(formData.dimension.diametre) || 0;
    } else if (formData.forme === 'personnalisable') {
      return null;
    } else {
      const largeur = parseFloat(formData.dimension.largeur) || 0;
      const hauteur = parseFloat(formData.dimension.hauteur) || 0;
      maxDimension = Math.max(largeur, hauteur);
    }

    if (maxDimension > 5) {
      return 'contact';
    }

    if (maxDimension < 1 || maxDimension === 0) {
      return null;
    }

    const quantite = formData.quantite;

    if (quantite >= 1000) {
      return 'contact';
    }

    // Offre spéciale : 100 pièces à 10 DT (uniquement 1-3 cm)
    if (quantite === 100 && maxDimension <= 3) {
      let basePrice = 10;
      if (formData.fond === 'dore' || formData.fond === 'argent') {
        basePrice += 25;
      }
      if (formData.forme === 'personnalisable') {
        basePrice += 10;
      }
      return Math.round(basePrice);
    }

    let basePrice = 0;

    // Dimension 1-3 cm
    if (maxDimension <= 3) {
      const priceTable = {
        100: 18, 200: 18, 300: 25, 400: 32,
        500: 38, 600: 44, 700: 50, 800: 55, 900: 60
      };
      basePrice = priceTable[quantite] || null;
    } 
    // Dimension 3.1-4 cm
    else if (maxDimension <= 4) {
      const priceTable = {
        100: 15, 200: 28, 300: 40, 400: 50,
        500: 60, 600: 70, 700: 78, 800: 85, 900: 90
      };
      basePrice = priceTable[quantite] || null;
    } 
    // Dimension 4.1-5 cm
    else if (maxDimension <= 5) {
      const priceTable = {
        100: 22, 200: 42, 300: 60, 400: 76,
        500: 90, 600: 102, 700: 112, 800: 120, 900: 126
      };
      basePrice = priceTable[quantite] || null;
    } 
    else {
      return 'contact';
    }

    if (basePrice === null) {
      return null;
    }

    let finalPrice = basePrice;

    if (formData.fond === 'dore' || formData.fond === 'argent') {
      finalPrice += 25;
    }

    if (formData.forme === 'personnalisable') {
      finalPrice += 10;
    }

    return Math.round(finalPrice);
  };

  // Vérifier si l'offre spéciale est active
  const isSpecialOfferActive = () => {
    const maxDimension = Math.max(
      parseFloat(formData.dimension.diametre) || 0,
      parseFloat(formData.dimension.largeur) || 0,
      parseFloat(formData.dimension.hauteur) || 0
    );
    return formData.quantite === 100 && maxDimension > 0 && maxDimension <= 3;
  };

  // Vérifier si le devis est nécessaire
  const needsQuotation = () => {
    const quantite = formData.quantite;
    let maxDimension = 0;
    if (formData.forme === 'cercle') {
      maxDimension = parseFloat(formData.dimension.diametre) || 0;
    } else if (formData.forme !== 'personnalisable') {
      const largeur = parseFloat(formData.dimension.largeur) || 0;
      const hauteur = parseFloat(formData.dimension.hauteur) || 0;
      maxDimension = Math.max(largeur, hauteur);
    }
    return maxDimension > 5 || quantite >= 1000 || formData.forme === 'personnalisable';
  };

  // Validation du formulaire
  const validate = () => {
    const newErrors = {};
    
    if (formData.quantite < 100) {
      newErrors.quantite = 'La quantité minimum est de 100 pièces';
    }
    
    if (formData.forme === 'cercle') {
      if (!formData.dimension.diametre || parseFloat(formData.dimension.diametre) <= 0) {
        newErrors.diametre = 'Veuillez entrer un diamètre valide (en cm)';
      }
    } else if (formData.forme === 'personnalisable') {
      if (!formData.notes || formData.notes.trim() === '') {
        newErrors.notes = 'Veuillez décrire la forme personnalisée souhaitée';
      }
    } else {
      if (!formData.dimension.largeur || parseFloat(formData.dimension.largeur) <= 0) {
        newErrors.largeur = 'Veuillez entrer une largeur valide (en cm)';
      }
      if (!formData.dimension.hauteur || parseFloat(formData.dimension.hauteur) <= 0) {
        newErrors.hauteur = 'Veuillez entrer une hauteur valide (en cm)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter au panier
  const handleAddToCart = () => {
    if (!validate()) {
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (needsQuotation()) {
      setShowWhatsAppContact(true);
      return;
    }

    const price = calculatePrice();
    
    if (price === null || price === 'contact') {
      alert('Veuillez vérifier les dimensions et la quantité');
      return;
    }

    setIsSubmitting(true);

    // Construire le nom du produit
    const getFormeLabel = (value) => {
      const labels = {
        cercle: 'Cercle',
        carre: 'Carré',
        rectangulaire: 'Rectangulaire',
        personnalisable: 'Personnalisable'
      };
      return labels[value] || value;
    };

    const getFondLabel = (value) => {
      const labels = {
        blanc: 'Blanc',
        transparent: 'Transparent',
        dore: 'Doré',
        argent: 'Argent'
      };
      return labels[value] || value;
    };

    let dimensionsText = '';
    if (formData.forme === 'cercle') {
      dimensionsText = `Diamètre: ${formData.dimension.diametre}cm`;
    } else if (formData.forme === 'personnalisable') {
      dimensionsText = 'Sur mesure';
    } else {
      dimensionsText = `${formData.dimension.largeur} x ${formData.dimension.hauteur}cm`;
    }

    // Construction du nom avec les détails
    const productName = `Stickers ${getFormeLabel(formData.forme)} - ${dimensionsText} - Fond ${getFondLabel(formData.fond)} (${formData.quantite} pièces)`;

    // ⚠️ IMPORTANT : La quantité dans le panier est 1 (une commande personnalisée)
    // Le nombre de stickers est stocké dans les options
    const cartItem = {
      id: `sticker-${Date.now()}`,
      name: productName,
      price: price,
      image: product?.image || '/placeholder-product.jpg',
      quantity: 1, // ← UNE commande, pas le nombre de stickers
      categorie: 'Stickers',
      options: {
        forme: formData.forme,
        dimension: formData.dimension,
        fond: formData.fond,
        notes: formData.notes,
        nombreStickers: formData.quantite // ← Nombre réel de stickers
      },
      isSticker: true,
      unitPrice: price,
      notes: formData.notes,
      stickerQuantity: formData.quantite, // ← Pour affichage dans le panier
      // Métadonnées pour le panier
      meta: {
        forme: getFormeLabel(formData.forme),
        dimensions: dimensionsText,
        fond: getFondLabel(formData.fond),
        nombreStickers: formData.quantite
      }
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    setIsSuccess(true);
    setIsSubmitting(false);
  };

  // Contacter WhatsApp
  const contactWhatsApp = () => {
    const getFormeLabel = (value) => {
      const labels = {
        cercle: 'Cercle',
        carre: 'Carré',
        rectangulaire: 'Rectangulaire',
        personnalisable: 'Personnalisable'
      };
      return labels[value] || value;
    };

    const getFondLabel = (value) => {
      const labels = {
        blanc: 'Blanc',
        transparent: 'Transparent',
        dore: 'Doré',
        argent: 'Argent'
      };
      return labels[value] || value;
    };

    let dimensionsText = '';
    if (formData.forme === 'cercle') {
      dimensionsText = `Diamètre: ${formData.dimension.diametre}cm`;
    } else if (formData.forme === 'personnalisable') {
      dimensionsText = 'Sur mesure';
    } else {
      dimensionsText = `${formData.dimension.largeur} x ${formData.dimension.hauteur}cm`;
    }

    let reason = '';
    const maxDimension = Math.max(
      parseFloat(formData.dimension.diametre) || 0,
      parseFloat(formData.dimension.largeur) || 0,
      parseFloat(formData.dimension.hauteur) || 0
    );
    
    if (formData.quantite >= 1000) {
      reason = `Commande de ${formData.quantite} pièces (devis personnalisé)`;
    } else if (maxDimension > 5) {
      reason = `Dimension > 5cm (${maxDimension}cm)`;
    } else if (formData.forme === 'personnalisable') {
      reason = 'Forme personnalisée';
    }

    const message = `
🆕 DEMANDE DE DEVIS STICKERS
━━━━━━━━━━━━━━━━━━━━━

📦 DÉTAILS DE LA COMMANDE
• Type: Stickers Vinyle Premium
• Quantité: ${formData.quantite} pièces
• Forme: ${getFormeLabel(formData.forme)}
• Dimensions: ${dimensionsText}
• Fond: ${getFondLabel(formData.fond)}
${formData.notes ? `• Notes: ${formData.notes}` : ''}

📝 Raison du devis: ${reason}
━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setShowWhatsAppContact(false);
    onClose();
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl text-[#1A3A6B] font-semibold mb-2">
            Ajouté au panier !
          </h3>
          <p className="text-[#4A6A8A] font-['Montserrat'] text-sm mb-6">
            Votre commande personnalisée de stickers a été ajoutée au panier.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="px-6 py-3 bg-[#1A3A6B] text-white rounded-full font-['Montserrat'] text-sm hover:bg-[#0D1F3C] transition"
            >
              Continuer mes achats
            </button>
            <Link
              to="/panier"
              className="px-6 py-3 bg-[#F0C75E] text-[#0D1F3C] rounded-full font-['Montserrat'] text-sm font-semibold hover:bg-[#d4aa3a] transition"
            >
              🛒 Voir mon panier
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Modal WhatsApp pour devis
  if (showWhatsAppContact) {
    const getReason = () => {
      const maxDimension = Math.max(
        parseFloat(formData.dimension.diametre) || 0,
        parseFloat(formData.dimension.largeur) || 0,
        parseFloat(formData.dimension.hauteur) || 0
      );
      
      if (formData.quantite >= 1000) {
        return `📦 ${formData.quantite} pièces`;
      } else if (maxDimension > 5) {
        return `📐 ${maxDimension}cm (dimension > 5cm)`;
      } else if (formData.forme === 'personnalisable') {
        return `✨ Forme personnalisée`;
      }
      return 'Devis personnalisé';
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl text-[#1A3A6B] font-semibold mb-2">
            Demande de devis
          </h3>
          <p className="text-[#4A6A8A] font-['Montserrat'] text-sm mb-2">
            Votre commande nécessite un devis personnalisé.
          </p>
          <p className="text-[#1A3A6B] font-['Montserrat'] text-sm font-semibold mb-4">
            Raison : {getReason()}
          </p>
          <p className="text-[#4A6A8A] font-['Montserrat'] text-sm mb-4">
            Contactez-nous sur WhatsApp pour obtenir un prix sur mesure.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={contactWhatsApp}
              className="px-6 py-3 bg-[#25D366] text-white rounded-full font-['Montserrat'] text-sm font-semibold hover:bg-[#20b859] transition flex items-center justify-center gap-2"
            >
              <span className="text-xl">💬</span>
              Contacter sur WhatsApp
            </button>
            <button
              onClick={() => {
                setShowWhatsAppContact(false);
              }}
              className="px-6 py-3 border border-[#c4c6d0] text-[#4A6A8A] rounded-full font-['Montserrat'] text-sm hover:bg-[#f5f4f0] transition"
            >
              Retour au formulaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  const price = calculatePrice();
  const isDimensionValid = price !== null && price !== 'contact';
  const isQuotation = needsQuotation();
  const isSpecialOffer = isSpecialOfferActive();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 my-8 animate-slideUp">
        
        {/* En-tête */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl text-[#1A3A6B] font-semibold">
              🎨 Personnaliser vos stickers
            </h2>
            <p className="text-[#4A6A8A] font-['Montserrat'] text-sm mt-1">
              {product?.name || 'Stickers Vinyle Premium'}
            </p>
            {formData.quantite >= 1000 && (
              <p className="text-[#F0C75E] font-['Montserrat'] text-xs mt-1 font-semibold">
                📱 Pour {formData.quantite} pièces → Devis personnalisé
              </p>
            )}
            {isSpecialOffer && (
              <p className="text-green-600 font-['Montserrat'] text-xs mt-1 font-semibold">
                ⭐ Offre spéciale : 100 pièces à seulement 10 DT !
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#4A6A8A] hover:text-[#1A3A6B] transition p-2"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAddToCart(); }} className="space-y-6">
          
          {/* Quantité de stickers */}
          <div className="bg-[#f8fafc] rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">
              📦 Nombre de stickers (min 100)
            </h3>
            
            <div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    quantite: Math.max(100, prev.quantite - 100)
                  }))}
                  className="w-10 h-10 rounded-full border border-[#c4c6d0] hover:border-[#F0C75E] transition flex items-center justify-center text-xl"
                >
                  -
                </button>
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  className={`w-24 text-center px-3 py-2 rounded-xl border ${
                    errors.quantite ? 'border-red-500' : 'border-[#c4c6d0]'
                  } focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-lg font-bold transition`}
                  min="100"
                  step="100"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    quantite: Math.min(900, prev.quantite + 100)
                  }))}
                  className="w-10 h-10 rounded-full border border-[#c4c6d0] hover:border-[#F0C75E] transition flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-[#4A6A8A] text-xs font-['Montserrat']">
                    Quantité minimum : 100 pièces
                  </p>
                  {isSpecialOffer && (
                    <p className="text-green-600 text-xs font-['Montserrat'] font-semibold mt-1">
                      ⭐ Offre spéciale 100 pièces à 10 DT !
                    </p>
                  )}
                </div>
                <p className="text-[#1A3A6B] text-sm font-['Montserrat'] font-semibold">
                  {isQuotation ? (
                    <span className="text-[#25D366]">📱 Sur devis</span>
                  ) : isDimensionValid ? (
                    `Prix : ${price} DT`
                  ) : (
                    'Veuillez renseigner les dimensions'
                  )}
                </p>
              </div>
              {formData.quantite >= 1000 && (
                <div className="p-2 bg-[#F0C75E]/10 rounded-lg border border-[#F0C75E]/30 mt-2">
                  <p className="text-[#1A3A6B] text-xs font-['Montserrat'] text-center">
                    📱 Pour {formData.quantite} pièces, contactez-nous pour un devis personnalisé
                  </p>
                </div>
              )}
              {errors.quantite && (
                <p className="text-red-500 text-xs mt-1 font-['Montserrat'] error-message">
                  {errors.quantite}
                </p>
              )}
            </div>
          </div>

          {/* Forme */}
          <div className="bg-[#f8fafc] rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">
              🔷 Forme
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['cercle', 'carre', 'rectangulaire', 'personnalisable'].map((forme) => (
                <button
                  key={forme}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, forme }))}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.forme === forme
                      ? 'border-[#F0C75E] bg-[#F0C75E]/10 text-[#1A3A6B]'
                      : 'border-[#c4c6d0] hover:border-[#F0C75E] text-[#4A6A8A]'
                  } font-['Montserrat'] text-sm font-medium`}
                >
                  {forme === 'personnalisable' ? '✨ Perso' : forme.charAt(0).toUpperCase() + forme.slice(1)}
                </button>
              ))}
            </div>
            {formData.forme === 'personnalisable' && (
              <p className="text-xs text-[#F0C75E] font-['Montserrat'] mt-2">
                ⚠️ Veuillez décrire la forme souhaitée dans la zone "Notes"
              </p>
            )}
          </div>

          {/* Dimensions */}
          <div className="bg-[#f8fafc] rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">
              📐 Dimensions
            </h3>
            
            <div className="p-3 bg-[#F0C75E]/10 rounded-xl border border-[#F0C75E]/20 mb-4">
              <p className="text-[#1A3A6B] text-xs font-['Montserrat']">
                ⚡ Offre spéciale : 100 pièces à 10 DT pour les dimensions 1-3 cm
              </p>
              <p className="text-[#4A6A8A] text-xs font-['Montserrat'] mt-1">
                📱 Au-delà de 5cm ou 1000+ pièces, contactez-nous pour un devis
              </p>
            </div>
            
            {formData.forme === 'cercle' && (
              <div>
                <label className="block text-[#4A6A8A] text-sm font-['Montserrat'] mb-1.5">
                  Diamètre (en cm) *
                </label>
                <input
                  type="number"
                  name="dimension.diametre"
                  value={formData.dimension.diametre}
                  onChange={handleChange}
                  step="0.1"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.diametre ? 'border-red-500' : 'border-[#c4c6d0]'
                  } focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm transition`}
                  placeholder="Ex: 3"
                />
                {errors.diametre && (
                  <p className="text-red-500 text-xs mt-1 font-['Montserrat'] error-message">
                    {errors.diametre}
                  </p>
                )}
              </div>
            )}
            
            {formData.forme === 'personnalisable' && (
              <div className="p-4 bg-[#F0C75E]/5 rounded-xl border border-[#F0C75E]/20">
                <p className="text-[#4A6A8A] font-['Montserrat'] text-sm">
                  ✨ Forme personnalisée - Décrivez-la dans les notes ci-dessous
                </p>
              </div>
            )}
            
            {(formData.forme === 'carre' || formData.forme === 'rectangulaire') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A6A8A] text-sm font-['Montserrat'] mb-1.5">
                    Largeur (en cm) *
                  </label>
                  <input
                    type="number"
                    name="dimension.largeur"
                    value={formData.dimension.largeur}
                    onChange={handleChange}
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.largeur ? 'border-red-500' : 'border-[#c4c6d0]'
                    } focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm transition`}
                    placeholder="Ex: 3"
                  />
                  {errors.largeur && (
                    <p className="text-red-500 text-xs mt-1 font-['Montserrat'] error-message">
                      {errors.largeur}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#4A6A8A] text-sm font-['Montserrat'] mb-1.5">
                    Hauteur (en cm) *
                  </label>
                  <input
                    type="number"
                    name="dimension.hauteur"
                    value={formData.dimension.hauteur}
                    onChange={handleChange}
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.hauteur ? 'border-red-500' : 'border-[#c4c6d0]'
                    } focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm transition`}
                    placeholder="Ex: 3"
                  />
                  {errors.hauteur && (
                    <p className="text-red-500 text-xs mt-1 font-['Montserrat'] error-message">
                      {errors.hauteur}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fond */}
          <div className="bg-[#f8fafc] rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">
              🎨 Fond
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'blanc', label: '⬜ Blanc', color: 'bg-white border-gray-300' },
                { id: 'transparent', label: '🪟 Transparent', color: 'bg-gray-100 border-gray-300' },
                { id: 'dore', label: '✨ Doré (+25DT)', color: 'bg-gradient-to-r from-[#F5D88A] to-[#D4A83A] border-[#D4A83A]' },
                { id: 'argent', label: '💎 Argent (+25DT)', color: 'bg-gradient-to-r from-[#E8E8E8] to-[#C0C0C0] border-[#C0C0C0]' }
              ].map((fond) => (
                <button
                  key={fond.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, fond: fond.id }))}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.fond === fond.id
                      ? 'border-[#F0C75E] shadow-lg shadow-[#F0C75E]/20'
                      : 'border-[#c4c6d0] hover:border-[#F0C75E]'
                  } font-['Montserrat'] text-sm font-medium flex items-center gap-2 justify-center`}
                >
                  <span className={`w-4 h-4 rounded-full ${fond.color}`}></span>
                  {fond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#f8fafc] rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">
              📝 Notes
            </h3>
            
            <div>
              <label className="block text-[#4A6A8A] text-sm font-['Montserrat'] mb-1.5">
                {formData.forme === 'personnalisable' ? 'Décrivez la forme souhaitée *' : 'Informations complémentaires'}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.notes ? 'border-red-500' : 'border-[#c4c6d0]'
                } focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm transition resize-none`}
                placeholder={formData.forme === 'personnalisable' 
                  ? "Ex: Forme en étoile, cœur, animal, logo personnalisé..." 
                  : "Instructions spéciales, couleurs spécifiques, etc..."}
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1 font-['Montserrat'] error-message">
                  {errors.notes}
                </p>
              )}
              {formData.forme === 'personnalisable' && (
                <p className="text-xs text-[#4A6A8A] font-['Montserrat'] mt-1">
                  ⚠️ La description de la forme est obligatoire pour une commande personnalisée
                </p>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-[#f8fafc] rounded-xl p-4 md:p-6 space-y-3">
            <h3 className="font-['Playfair_Display'] text-lg text-[#1A3A6B] font-semibold">
              📋 Résumé de votre commande
            </h3>
            <div className="space-y-2 text-sm font-['Montserrat']">
              <div className="flex justify-between">
                <span className="text-[#4A6A8A]">Nombre de stickers</span>
                <span className="font-semibold text-[#1A3A6B]">{formData.quantite} pièces</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8A]">Forme</span>
                <span className="font-semibold text-[#1A3A6B]">
                  {formData.forme === 'personnalisable' ? 'Personnalisable' : formData.forme.charAt(0).toUpperCase() + formData.forme.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8A]">Dimensions</span>
                <span className="font-semibold text-[#1A3A6B]">
                  {formData.forme === 'cercle' && `${formData.dimension.diametre || '0'} cm`}
                  {formData.forme === 'personnalisable' && 'Sur mesure'}
                  {(formData.forme === 'carre' || formData.forme === 'rectangulaire') && 
                    `${formData.dimension.largeur || '0'} x ${formData.dimension.hauteur || '0'} cm`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8A]">Fond</span>
                <span className="font-semibold text-[#1A3A6B]">
                  {formData.fond === 'blanc' && '⬜ Blanc'}
                  {formData.fond === 'transparent' && '🪟 Transparent'}
                  {formData.fond === 'dore' && '✨ Doré'}
                  {formData.fond === 'argent' && '💎 Argent'}
                </span>
              </div>
              {formData.notes && (
                <div className="flex justify-between">
                  <span className="text-[#4A6A8A]">Notes</span>
                  <span className="font-semibold text-[#1A3A6B] text-right max-w-[60%] truncate">
                    {formData.notes}
                  </span>
                </div>
              )}
              {isSpecialOffer && (
                <div className="flex justify-between">
                  <span className="text-[#4A6A8A]">Offre spéciale</span>
                  <span className="font-semibold text-green-600">⭐ 100 pièces à 10 DT</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#c4c6d0]/30 flex justify-between">
                <span className="font-semibold text-[#1A3A6B]">Total estimé</span>
                <span className="text-2xl font-bold text-[#F0C75E]">
                  {isQuotation ? (
                    <span className="text-[#25D366] text-base">📱 Sur devis</span>
                  ) : isDimensionValid ? (
                    `${price} DT`
                  ) : (
                    'À compléter'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isQuotation ? (
              <button
                type="button"
                onClick={contactWhatsApp}
                className="flex-1 px-8 py-4 rounded-xl bg-[#25D366] text-white font-['Montserrat'] text-sm font-semibold uppercase tracking-wider hover:bg-[#20b859] hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">💬</span>
                Demander un devis
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isDimensionValid || (formData.forme === 'personnalisable' && !formData.notes.trim())}
                className={`flex-1 px-8 py-4 rounded-xl font-['Montserrat'] text-sm font-semibold uppercase tracking-wider transition-all ${
                  isSubmitting || !isDimensionValid || (formData.forme === 'personnalisable' && !formData.notes.trim())
                    ? 'bg-[#c4c6d0] text-[#4A6A8A] cursor-not-allowed'
                    : 'bg-[#F0C75E] text-[#0D1F3C] hover:bg-[#d4aa3a] hover:shadow-lg'
                }`}
              >
                {isSubmitting ? 'Ajout en cours...' : '🛒 Ajouter au panier'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-xl border border-[#c4c6d0] font-['Montserrat'] text-sm font-semibold hover:bg-[#f5f4f0] transition"
            >
              Annuler
            </button>
          </div>
          
          <p className="text-center text-[#4A6A8A] text-xs font-['Montserrat']">
            {isQuotation ? 
              '📱 Contactez-nous pour un devis personnalisé' : 
              '📦 Une commande personnalisée sera ajoutée à votre panier'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default StickerOrderForm;