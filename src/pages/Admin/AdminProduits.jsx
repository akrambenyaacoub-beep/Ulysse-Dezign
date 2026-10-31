// src/pages/Admin/AdminProduits.jsx
import { useState, useEffect, useRef } from 'react';
import { supabaseErp } from '../../lib/supabaseErp';
import { showAlert } from '../../components/AlertModal';

// ✅ Liste des catégories disponibles
const CATEGORIES = [
  // Papeterie
  'Cartes de visite',
  'Enveloppes',
  'Papier à lettres',
  'Bloc-notes',
  'Carnets',
  'Papier d\'art',
  // Signalétique
  'Enseignes LED',
  'Panneaux',
  'Vitrophanie',
  'Lettrage adhésif',
  'Totems',
  'Signalétique intérieure',
  // Impression
  'Offset',
  'Numérique',
  'Grand format',
  'UV',
  'Sublimation',
  'Écologique',
  // Digital
  'Design graphique',
  'Montage vidéo',
  'Retouche photo',
  'Animation 3D',
  'Réalité augmentée',
  'Webdesign',
  // Stickers
  'Die-cut',
  'Vinyle',
  'Transparent',
  'Waterproof',
  'Holographique',
  '3D',
  'Gonflable',
  // Menus & Cartes
  'Menus restaurateurs',
  'Cartes des vins',
  'Cartes postales',
  'Faire-part',
  'Invitations',
  'Marque-places',
  // Packaging
  'Boîtes',
  'Sacs',
  'Étiquettes',
  'Emballage cadeau',
  'Coffrets',
  'Pochons',
  // Autres
  'Goodies',
  'Objets publicitaires',
  'Banderoles',
  'Roll-ups',
  'Kits',
  'Sur mesure'
];

const AdminProduits = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: '',
    image_url: '',
    stock: '',
    unite: '',
    featured: false
  });

  // =====================================================
  // CHARGER LES PRODUITS
  // =====================================================
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseErp
        .from('erp_produits')
        .select('*')
        .order('featured', { ascending: false })
        .order('nom', { ascending: true });
      
      if (error) throw error;
      
      console.log('📦 Produits chargés:', data?.length || 0);
      setProducts(data || []);
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', 'Erreur de chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TOGGLE PRODUIT EN VEDETTE
  // =====================================================
  const toggleFeatured = async (product) => {
    try {
      const newFeatured = !product.featured;
      
      if (newFeatured) {
        // Désactiver tous les autres produits en vedette
        await supabaseErp
          .from('erp_produits')
          .update({ featured: false })
          .neq('id', product.id)
          .eq('featured', true);
      }
      
      const { error } = await supabaseErp
        .from('erp_produits')
        .update({ featured: newFeatured })
        .eq('id', product.id);
      
      if (error) throw error;
      
      showAlert('success', newFeatured ? '⭐ Produit mis en vedette' : '⭐ Produit retiré des vedettes');
      fetchProducts();
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', error.message);
    }
  };

  // =====================================================
  // UPLOAD D'IMAGE
  // =====================================================
  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Veuillez sélectionner une image');
        setUploading(false);
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'L\'image ne doit pas dépasser 5MB');
        setUploading(false);
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `produits/${fileName}`;

      const { error: uploadError } = await supabaseErp.storage
        .from('produits')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseErp.storage
        .from('produits')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setUploading(false);
      
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      showAlert('error', 'Erreur lors de l\'upload: ' + error.message);
      setUploading(false);
      return null;
    }
  };

  // =====================================================
  // GESTIONNAIRE DE FICHIER
  // =====================================================
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      showAlert('success', '✅ Image uploadée avec succès');
    }
    e.target.value = '';
  };

  // =====================================================
  // DRAG & DROP
  // =====================================================
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const imageUrl = await uploadImage(files[0]);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        showAlert('success', '✅ Image uploadée avec succès');
      }
    }
  };

  // =====================================================
  // OUVRIRE LE MODAL
  // =====================================================
  const openEditModal = (product) => {
    console.log('✏️ Édition produit:', product);
    setEditingProduct(product);
    setFormData({
      nom: product.nom || '',
      description: product.description || '',
      prix: product.prix || '',
      categorie: product.categorie || '',
      image_url: product.image_url || '',
      stock: product.stock || '',
      unite: product.unite || '',
      featured: product.featured || false
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      nom: '',
      description: '',
      prix: '',
      categorie: '',
      image_url: '',
      stock: '',
      unite: '',
      featured: false
    });
    setIsModalOpen(true);
  };

  // =====================================================
  // AJOUTER / MODIFIER UN PRODUIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      showAlert('error', 'Le nom du produit est obligatoire');
      return;
    }

    try {
      const productData = {
        nom: formData.nom.trim(),
        description: formData.description || '',
        prix: parseFloat(formData.prix) || 0,
        categorie: formData.categorie || '',
        image_url: formData.image_url || '',
        stock: parseInt(formData.stock) || 0,
        unite: formData.unite || '',
        featured: formData.featured || false,
        updated_at: new Date().toISOString()
      };

      // Si le produit est mis en vedette, désactiver les autres
      if (productData.featured) {
        await supabaseErp
          .from('erp_produits')
          .update({ featured: false })
          .neq('id', editingProduct?.id || '')
          .eq('featured', true);
      }

      if (editingProduct) {
        const { error } = await supabaseErp
          .from('erp_produits')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        showAlert('success', '✅ Produit modifié avec succès');
      } else {
        const { error } = await supabaseErp
          .from('erp_produits')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        showAlert('success', '✅ Produit ajouté avec succès');
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', error.message || 'Erreur lors de l\'opération');
    }
  };

  // =====================================================
  // SUPPRIMER UN PRODUIT
  // =====================================================
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit définitivement ?')) return;
    
    try {
      const { error } = await supabaseErp
        .from('erp_produits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showAlert('success', '✅ Produit supprimé');
      await fetchProducts();
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', error.message);
    }
  };

  // =====================================================
  // FILTRER
  // =====================================================
  const filteredProducts = products.filter(product =>
    product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =====================================================
  // RENDU
  // =====================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1A3A6B] border-t-[#F0C75E] mx-auto mb-4"></div>
          <p className="text-[#1A3A6B]">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#1A3A6B]">📦 Gestion des Produits</h1>
            <p className="text-sm text-[#43474f] font-['Montserrat']">
              {products.filter(p => p.featured).length} produit(s) en vedette
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-[#1A3A6B] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#0D1F3C] transition flex items-center gap-2 text-sm sm:text-base"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Nouveau Produit
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 rounded-lg bg-white border border-[#c4c6d0] text-[#081b38] focus:outline-none focus:border-[#F0C75E] font-['Montserrat'] text-sm"
          />
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-xl border border-[#c4c6d0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f1f3ff] border-b border-[#c4c6d0]">
                <tr>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">⭐</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">Image</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">Nom</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">Catégorie</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">Prix</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">Stock</th>
                  <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3A6B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-[#43474f]">
                      {searchTerm ? 'Aucun produit correspondant' : 'Aucun produit dans le catalogue'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className={`border-b border-[#c4c6d0] hover:bg-[#f8fafc] transition ${product.featured ? 'bg-[#F0C75E]/5' : ''}`}>
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <button
                          onClick={() => toggleFeatured(product)}
                          className={`transition-transform hover:scale-110 ${product.featured ? 'text-[#F0C75E]' : 'text-gray-300'}`}
                          title={product.featured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                        >
                          {product.featured ? '⭐' : '☆'}
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <img 
                          src={product.image_url || '/placeholder-product.jpg'} 
                          alt={product.nom} 
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                          onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                        />
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-medium text-sm sm:text-base">
                        {product.nom}
                        {product.featured && (
                          <span className="ml-2 text-[10px] bg-[#F0C75E] text-[#0D1F3C] px-2 py-0.5 rounded-full font-bold">
                            ⭐ Top
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-[#f1f3ff] rounded text-xs text-[#1A3A6B]">
                          {product.categorie || 'Non catégorisé'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm">{product.prix} DT</td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="text-blue-500 hover:text-blue-700 transition p-1 hover:bg-blue-50 rounded"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="text-red-500 hover:text-red-700 transition p-1 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =============================================
          MODAL AJOUT / MODIFICATION
          ============================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#1A3A6B]">
                {editingProduct ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl hover:rotate-90 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom et Catégorie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6d0] rounded-lg focus:outline-none focus:border-[#F0C75E] text-sm"
                    required
                    placeholder="Nom du produit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6d0] rounded-lg focus:outline-none focus:border-[#F0C75E] text-sm"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#c4c6d0] rounded-lg focus:outline-none focus:border-[#F0C75E] text-sm resize-none"
                  placeholder="Description du produit..."
                />
              </div>

              {/* Prix, Stock, Unité */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6d0] rounded-lg focus:outline-none focus:border-[#F0C75E] text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6d0] rounded-lg focus:outline-none focus:border-[#F0C75E] text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <input
                    type="text"
                    value={formData.unite}
                    onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6d0] rounded-lg focus:outline-none focus:border-[#F0C75E] text-sm"
                    placeholder="pièce, m², etc."
                  />
                </div>
              </div>

              {/* Produit en vedette */}
              <div className="flex items-center gap-3 p-3 bg-[#f1f3ff] rounded-lg border border-[#c4c6d0]">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 accent-[#F0C75E] rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-[#1A3A6B] flex items-center gap-2 cursor-pointer">
                  ⭐ Mettre ce produit en vedette (apparaîtra en premier dans la boutique)
                </label>
              </div>

              {/* Upload d'image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image du produit</label>
                
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                    dragActive ? 'border-[#F0C75E] bg-[#F0C75E]/10' : 'border-[#c4c6d0]'
                  } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.image_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.image_url} 
                        alt="Aperçu" 
                        className="max-h-40 object-contain rounded-lg border border-[#c4c6d0]"
                      />
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{formData.image_url}</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-5xl mb-3">📤</div>
                      <p className="text-gray-600 font-['Montserrat']">
                        Glissez-déposez une image ici
                      </p>
                      <p className="text-sm text-gray-400 font-['Montserrat']">ou</p>
                      <label className="cursor-pointer text-[#1A3A6B] font-semibold hover:underline font-['Montserrat']">
                        parcourez vos fichiers
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-2 font-['Montserrat']">
                        PNG, JPG, WEBP (max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 font-['Montserrat']">
                      <span>Upload en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#F0C75E] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {formData.image_url && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 font-['Montserrat'] break-all">
                      <span className="font-semibold">URL:</span> {formData.image_url}
                    </p>
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#c4c6d0]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-[#c4c6d0] rounded-lg hover:bg-gray-50 transition text-sm font-['Montserrat']"
                  disabled={uploading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#0D1F3C] transition text-sm font-['Montserrat']"
                  disabled={uploading}
                >
                  {editingProduct ? '💾 Modifier' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProduits;