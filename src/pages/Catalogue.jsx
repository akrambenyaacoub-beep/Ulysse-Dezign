// src/pages/Catalogue.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';

export default function Catalogue() {
  const { profile } = useAuth();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('tous');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [equipementFilter, setEquipementFilter] = useState('tous');
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  
  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    description: '',
    prix_achat: 0,
    prix_vente: 0,
    categorie: 'impression',
    stock: 0,
    unite: 'pièce',
    type_produit: 'vente',
    type_equipement: 'autre'
  });

  const categories = [
    { value: 'impression', label: '🖨️ Impression', color: 'bg-blue-500/20 text-blue-500' },
    { value: 'design', label: '🎨 Design', color: 'bg-purple-500/20 text-purple-500' },
    { value: 'signaletique', label: '📍 Signalétique', color: 'bg-green-500/20 text-green-500' },
    { value: 'textile', label: '👕 Textile', color: 'bg-pink-500/20 text-pink-500' },
    { value: 'goodies', label: '🎁 Goodies', color: 'bg-orange-500/20 text-orange-500' },
    { value: 'autres', label: '📦 Autres', color: 'bg-gray-500/20 text-gray-400' }
  ];

  useEffect(() => {
    loadProduits();
  }, []);

  async function loadProduits() {
    try {
      setLoading(true);
      const { data, error } = await supabaseErp
        .from('erp_produits')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      setProduits(data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      showAlert('error', 'Erreur lors du chargement du catalogue');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setSelectedProduit(null);
    setFormData({
      reference: generateReference(),
      nom: '',
      description: '',
      prix_achat: 0,
      prix_vente: 0,
      categorie: 'impression',
      stock: 0,
      unite: 'pièce',
      type_produit: 'vente',
      type_equipement: 'autre'
    });
    setModalOpen(true);
  }

  function openEditModal(produit) {
    setModalMode('edit');
    setSelectedProduit(produit);
    setFormData({
      reference: produit.reference,
      nom: produit.nom,
      description: produit.description || '',
      prix_achat: produit.prix_achat || 0,
      prix_vente: produit.prix_vente || 0,
      categorie: produit.categorie || 'impression',
      stock: produit.stock || 0,
      unite: produit.unite || 'pièce',
      type_produit: produit.type_produit || 'vente',
      type_equipement: produit.type_equipement || 'autre'
    });
    setModalOpen(true);
  }

  function openViewModal(produit) {
    setModalMode('view');
    setSelectedProduit(produit);
    setFormData({
      reference: produit.reference,
      nom: produit.nom,
      description: produit.description || '',
      prix_achat: produit.prix_achat || 0,
      prix_vente: produit.prix_vente || 0,
      categorie: produit.categorie || 'impression',
      stock: produit.stock || 0,
      unite: produit.unite || 'pièce',
      type_produit: produit.type_produit || 'vente',
      type_equipement: produit.type_equipement || 'autre'
    });
    setModalOpen(true);
  }

  function generateReference() {
    const prefix = 'P';
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `${prefix}-${random}`;
  }

  async function saveProduit() {
    try {
      if (!formData.nom) {
        showAlert('error', 'Le nom du produit est obligatoire');
        return;
      }

      const produitData = {
        nom: formData.nom,
        description: formData.description || null,
        prix_achat: formData.prix_achat || 0,
        prix_vente: formData.prix_vente || 0,
        categorie: formData.categorie,
        stock: formData.stock || 0,
        unite: formData.unite || 'pièce',
        type_produit: formData.type_produit || 'vente',
        type_equipement: formData.type_equipement || 'autre'
      };

      if (modalMode === 'create') {
        produitData.reference = formData.reference;
        const { error } = await supabaseErp
          .from('erp_produits')
          .insert([produitData]);
        
        if (error) throw error;
        showAlert('success', 'Produit ajouté avec succès');
      } else {
        const { error } = await supabaseErp
          .from('erp_produits')
          .update(produitData)
          .eq('id', selectedProduit.id);
        
        if (error) throw error;
        showAlert('success', 'Produit modifié avec succès');
      }
      
      setModalOpen(false);
      loadProduits();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showAlert('error', 'Erreur lors de la sauvegarde');
    }
  }

  async function deleteProduit(id) {
    try {
      const { error } = await supabaseErp
        .from('erp_produits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showAlert('success', 'Produit supprimé avec succès');
      loadProduits();
    } catch (error) {
      console.error('Erreur suppression:', error);
      showAlert('error', 'Erreur lors de la suppression');
    }
    setConfirmDialog({ open: false, id: null });
  }

  const getCategorieBadge = (categorie) => {
    const cat = categories.find(c => c.value === categorie);
    if (cat) {
      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.color}`}>{cat.label}</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-500">{categorie}</span>;
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'vente':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">🛒 Vente</span>;
      case 'achat':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">📦 Achat</span>;
      case 'service':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">🛠 Service</span>;
      default:
        return null;
    }
  };

  const getEquipementBadge = (type) => {
    switch(type) {
      case 'machine':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">⚙️ Machine</span>;
      case 'outil':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">🔧 Outil</span>;
      case 'consommable':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">🧴 Consommable</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">Autre</span>;
    }
  };

  const filteredProduits = produits.filter(produit => {
    const matchSearch = produit.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        produit.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        produit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = categorieFilter === 'tous' || produit.categorie === categorieFilter;
    const matchType = typeFilter === 'tous' || produit.type_produit === typeFilter;
    const matchEquipement = equipementFilter === 'tous' || produit.type_equipement === equipementFilter;
    return matchSearch && matchCategorie && matchType && matchEquipement;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F0C75E]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">Catalogue</h1>
          <p className="text-gray-400 text-sm mt-1">Gestion des produits et services</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-[#0D1F3C] border border-[#1A3A6B] text-white text-sm w-full sm:w-64 focus:outline-none focus:border-[#F0C75E]"
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-xl">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-xl">list</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold hover:bg-[#d4aa3a] transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Filtre par catégorie */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setCategorieFilter('tous')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${categorieFilter === 'tous' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          Tous
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategorieFilter(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${categorieFilter === cat.value ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filtre par type de produit */}
      <div className="flex flex-wrap gap-2 mb-3 border-t border-[#1A3A6B] pt-3">
        <span className="text-gray-400 text-sm mr-2 self-center">Type :</span>
        <button
          onClick={() => setTypeFilter('tous')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${typeFilter === 'tous' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          Tous
        </button>
        <button
          onClick={() => setTypeFilter('vente')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${typeFilter === 'vente' ? 'bg-green-500 text-white' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          🛒 Vente
        </button>
        <button
          onClick={() => setTypeFilter('achat')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${typeFilter === 'achat' ? 'bg-yellow-500 text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          📦 Achat
        </button>
        <button
          onClick={() => setTypeFilter('service')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${typeFilter === 'service' ? 'bg-blue-500 text-white' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          🛠 Service
        </button>
      </div>

      {/* Filtre par type d'équipement */}
      <div className="flex flex-wrap gap-2 mb-6 border-t border-[#1A3A6B] pt-3">
        <span className="text-gray-400 text-sm mr-2 self-center">Équipement :</span>
        <button
          onClick={() => setEquipementFilter('tous')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${equipementFilter === 'tous' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          Tous
        </button>
        <button
          onClick={() => setEquipementFilter('machine')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${equipementFilter === 'machine' ? 'bg-purple-500 text-white' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          ⚙️ Machine
        </button>
        <button
          onClick={() => setEquipementFilter('outil')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${equipementFilter === 'outil' ? 'bg-cyan-500 text-white' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          🔧 Outil
        </button>
        <button
          onClick={() => setEquipementFilter('consommable')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${equipementFilter === 'consommable' ? 'bg-rose-500 text-white' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          🧴 Consommable
        </button>
        <button
          onClick={() => setEquipementFilter('autre')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${equipementFilter === 'autre' ? 'bg-gray-500 text-white' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}
        >
          Autre
        </button>
      </div>

      {/* Vue Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProduits.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchTerm ? 'Aucun produit correspondant' : 'Aucun produit dans le catalogue'}
            </div>
          ) : (
            filteredProduits.map((produit) => (
              <div key={produit.id} className="bg-[#0D1F3C] border border-[#1A3A6B] rounded-xl p-4 hover:border-[#F0C75E]/30 transition hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1359A9]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#F0C75E] text-2xl">inventory_2</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openViewModal(produit)} className="text-blue-400 hover:text-blue-300 p-1">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button onClick={() => openEditModal(produit)} className="text-yellow-400 hover:text-yellow-300 p-1">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => setConfirmDialog({ open: true, id: produit.id })} className="text-red-400 hover:text-red-300 p-1">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{produit.reference}</p>
                  <h3 className="text-white font-semibold text-lg mt-1">{produit.nom}</h3>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{produit.description || 'Aucune description'}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1A3A6B] flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Prix vente</p>
                    <p className="text-[#F0C75E] font-bold">{produit.prix_vente} DT</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Stock</p>
                    <p className={`font-semibold ${produit.stock <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {produit.stock} {produit.unite || 'pièce'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {getCategorieBadge(produit.categorie)}
                  {getTypeBadge(produit.type_produit)}
                  {getEquipementBadge(produit.type_equipement)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-[#0D1F3C] border border-[#1A3A6B] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#071325] border-b border-[#1A3A6B]">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Réf.</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Nom</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Catégorie</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Type</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Équipement</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Prix vente</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Stock</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Unité</th>
                  <th className="text-left p-4 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduits.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-8 text-gray-500">
                      {searchTerm ? 'Aucun produit correspondant' : 'Aucun produit dans le catalogue'}
                    </td>
                  </tr>
                ) : (
                  filteredProduits.map((produit) => (
                    <tr key={produit.id} className="border-b border-[#1A3A6B] hover:bg-[#1A3A6B]/30 transition">
                      <td className="p-4 text-gray-400 text-sm">{produit.reference}</td>
                      <td className="p-4">
                        <p className="text-white font-medium">{produit.nom}</p>
                        <p className="text-gray-500 text-xs">{produit.description?.substring(0, 50)}</p>
                      </td>
                      <td className="p-4">{getCategorieBadge(produit.categorie)}</td>
                      <td className="p-4">{getTypeBadge(produit.type_produit)}</td>
                      <td className="p-4">{getEquipementBadge(produit.type_equipement)}</td>
                      <td className="p-4 text-[#F0C75E] font-semibold">{produit.prix_vente} DT</td>
                      <td className="p-4">
                        <span className={`${produit.stock <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                          {produit.stock}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{produit.unite || 'pièce'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => openViewModal(produit)} className="text-blue-400 hover:text-blue-300" title="Voir">
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          <button onClick={() => openEditModal(produit)} className="text-yellow-400 hover:text-yellow-300" title="Modifier">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button onClick={() => setConfirmDialog({ open: true, id: produit.id })} className="text-red-400 hover:text-red-300" title="Supprimer">
                            <span className="material-symbols-outlined text-xl">delete</span>
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
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Nouveau produit' : modalMode === 'edit' ? 'Modifier produit' : 'Détails produit'} size="medium">
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-400 text-sm">Référence</label><p className="text-white">{formData.reference}</p></div>
              <div><label className="text-gray-400 text-sm">Catégorie</label><p>{getCategorieBadge(formData.categorie)}</p></div>
              <div><label className="text-gray-400 text-sm">Nom</label><p className="text-white">{formData.nom}</p></div>
              <div><label className="text-gray-400 text-sm">Type</label><p>{getTypeBadge(formData.type_produit)}</p></div>
              <div><label className="text-gray-400 text-sm">Équipement</label><p>{getEquipementBadge(formData.type_equipement)}</p></div>
              <div><label className="text-gray-400 text-sm">Stock</label><p className="text-white">{formData.stock} {formData.unite || 'pièce'}</p></div>
              <div><label className="text-gray-400 text-sm">Prix achat</label><p className="text-white">{formData.prix_achat} DT</p></div>
              <div><label className="text-gray-400 text-sm">Prix vente</label><p className="text-[#F0C75E] font-bold">{formData.prix_vente} DT</p></div>
              <div><label className="text-gray-400 text-sm">Unité</label><p className="text-white">{formData.unite || 'pièce'}</p></div>
            </div>
            <div><label className="text-gray-400 text-sm">Description</label><p className="text-white">{formData.description || '-'}</p></div>
            <div className="flex justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition">Fermer</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  disabled
                  className="w-full p-2 rounded-lg bg-[#071325]/50 border border-[#1A3A6B] text-gray-400"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Catégorie *</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Prix d'achat (DT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix_achat}
                  onChange={(e) => setFormData({ ...formData, prix_achat: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Prix de vente (DT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix_vente}
                  onChange={(e) => setFormData({ ...formData, prix_vente: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Unité</label>
                <select
                  value={formData.unite}
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                >
                  <option value="pièce">Pièce</option>
                  <option value="mètre carré">m²</option>
                  <option value="mètre linéaire">m linéaire</option>
                  <option value="heure">Heure</option>
                  <option value="jour">Jour</option>
                  <option value="kg">Kilogramme</option>
                  <option value="litre">Litre</option>
                  <option value="unité">Unité (générique)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Type de produit</label>
                <select
                  value={formData.type_produit || 'vente'}
                  onChange={(e) => setFormData({ ...formData, type_produit: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                >
                  <option value="vente">🛒 Vente (catalogue client)</option>
                  <option value="achat">📦 Achat (consommable interne)</option>
                  <option value="service">🛠 Service (prestation)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Type d'équipement</label>
                <select
                  value={formData.type_equipement || 'autre'}
                  onChange={(e) => setFormData({ ...formData, type_equipement: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                >
                  <option value="autre">Autre</option>
                  <option value="machine">⚙️ Machine / Équipement</option>
                  <option value="outil">🔧 Outillage</option>
                  <option value="consommable">🧴 Consommable</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1A3A6B]">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition">Annuler</button>
              <button onClick={saveProduit} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold hover:bg-[#d4aa3a] transition">Enregistrer</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        onConfirm={() => deleteProduit(confirmDialog.id)}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
}