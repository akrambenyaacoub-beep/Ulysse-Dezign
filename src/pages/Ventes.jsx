// src/pages/Ventes.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';

export default function Ventes() {
  const { profile } = useAuth();
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVente, setSelectedVente] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  
  const [formData, setFormData] = useState({
    client_id: '',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mode_paiement: 'especes'
  });

  useEffect(() => {
    loadVentes();
    loadClients();
  }, []);

  async function loadVentes() {
    try {
      setLoading(true);
      const { data, error } = await supabaseErp
        .from('erp_ventes_rapides')
        .select('*, erp_clients(nom, prenom)')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setVentes(data || []);
    } catch (error) {
      console.error('Erreur chargement ventes:', error);
      showAlert('error', 'Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const { data, error } = await supabaseErp
        .from('erp_clients')
        .select('*')
        .order('nom');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setSelectedVente(null);
    setFormData({
      client_id: '',
      montant: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      mode_paiement: 'especes'
    });
    setModalOpen(true);
  }

  function openEditModal(vente) {
    setModalMode('edit');
    setSelectedVente(vente);
    setFormData({
      client_id: vente.client_id || '',
      montant: vente.montant || '',
      description: vente.description || '',
      date: vente.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      mode_paiement: vente.mode_paiement || 'especes'
    });
    setModalOpen(true);
  }

  function openViewModal(vente) {
    setModalMode('view');
    setSelectedVente(vente);
    setFormData({
      client_id: vente.client_id || '',
      montant: vente.montant || '',
      description: vente.description || '',
      date: vente.date?.split('T')[0] || '',
      mode_paiement: vente.mode_paiement || 'especes'
    });
    setModalOpen(true);
  }

  async function saveVente() {
    try {
      if (!formData.montant || parseFloat(formData.montant) <= 0) {
        showAlert('error', 'Veuillez saisir un montant valide');
        return;
      }

      const venteData = {
        client_id: formData.client_id || null,
        montant: parseFloat(formData.montant),
        description: formData.description || null,
        date: formData.date,
        mode_paiement: formData.mode_paiement
      };

      if (modalMode === 'create') {
        const { error } = await supabaseErp
          .from('erp_ventes_rapides')
          .insert([venteData]);
        
        if (error) throw error;
        showAlert('success', 'Vente ajoutée avec succès');
      } else {
        const { error } = await supabaseErp
          .from('erp_ventes_rapides')
          .update(venteData)
          .eq('id', selectedVente.id);
        
        if (error) throw error;
        showAlert('success', 'Vente modifiée avec succès');
      }
      
      setModalOpen(false);
      loadVentes();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showAlert('error', 'Erreur lors de la sauvegarde');
    }
  }

  async function deleteVente(id) {
    try {
      const { error } = await supabaseErp
        .from('erp_ventes_rapides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showAlert('success', 'Vente supprimée avec succès');
      loadVentes();
    } catch (error) {
      console.error('Erreur suppression:', error);
      showAlert('error', 'Erreur lors de la suppression');
    }
    setConfirmDialog({ open: false, id: null });
  }

  const getModePaiementBadge = (mode) => {
    const styles = {
      especes: 'bg-green-500/20 text-green-500 border-green-500/30',
      carte: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      cheque: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      virement: 'bg-orange-500/20 text-orange-500 border-orange-500/30'
    };
    const labels = {
      especes: '💵 Espèces',
      carte: '💳 Carte',
      cheque: '📝 Chèque',
      virement: '🏦 Virement'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[mode] || styles.especes}`}>
        {labels[mode] || mode}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F0C75E]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">Ventes rapides</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold hover:bg-[#d4aa3a] transition"
        >
          + Nouvelle vente
        </button>
      </div>

      <div className="bg-[#0D1F3C] border border-[#1A3A6B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#071325] border-b border-[#1A3A6B]">
              <tr>
                <th className="text-left p-4 text-gray-400 font-semibold text-sm">Date</th>
                <th className="text-left p-4 text-gray-400 font-semibold text-sm">Client</th>
                <th className="text-left p-4 text-gray-400 font-semibold text-sm">Description</th>
                <th className="text-left p-4 text-gray-400 font-semibold text-sm">Montant</th>
                <th className="text-left p-4 text-gray-400 font-semibold text-sm">Paiement</th>
                <th className="text-left p-4 text-gray-400 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ventes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">Aucune vente</td>
                </tr>
              ) : (
                ventes.map((vente) => (
                  <tr key={vente.id} className="border-b border-[#1A3A6B] hover:bg-[#1A3A6B]/30 transition">
                    <td className="p-4 text-gray-300">{new Date(vente.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 text-gray-300">{vente.erp_clients?.nom || 'Client inconnu'}</td>
                    <td className="p-4 text-gray-300">{vente.description || '-'}</td>
                    <td className="p-4 text-[#F0C75E] font-semibold">{vente.montant.toLocaleString()} DT</td>
                    <td className="p-4">{getModePaiementBadge(vente.mode_paiement)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openViewModal(vente)} className="text-blue-400 hover:text-blue-300" title="Voir">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        <button onClick={() => openEditModal(vente)} className="text-yellow-400 hover:text-yellow-300" title="Modifier">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button onClick={() => setConfirmDialog({ open: true, id: vente.id })} className="text-red-400 hover:text-red-300" title="Supprimer">
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Nouvelle vente' : modalMode === 'edit' ? 'Modifier vente' : 'Détails vente'} size="medium">
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-400 text-sm">Client</label><p className="text-white">{clients.find(c => c.id === formData.client_id)?.nom || '-'}</p></div>
              <div><label className="text-gray-400 text-sm">Date</label><p className="text-white">{new Date(formData.date).toLocaleDateString('fr-FR')}</p></div>
              <div><label className="text-gray-400 text-sm">Montant</label><p className="text-[#F0C75E] font-bold">{formData.montant} DT</p></div>
              <div><label className="text-gray-400 text-sm">Mode paiement</label><p>{getModePaiementBadge(formData.mode_paiement)}</p></div>
            </div>
            <div><label className="text-gray-400 text-sm">Description</label><p className="text-white">{formData.description || '-'}</p></div>
            <div className="flex justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg">Fermer</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Client</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Montant (DT) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Mode de paiement</label>
              <select
                value={formData.mode_paiement}
                onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
              >
                <option value="especes">💵 Espèces</option>
                <option value="carte">💳 Carte</option>
                <option value="cheque">📝 Chèque</option>
                <option value="virement">🏦 Virement</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"
                placeholder="Description de la vente..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1A3A6B]">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg">Annuler</button>
              <button onClick={saveVente} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold">Enregistrer</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible."
        onConfirm={() => deleteVente(confirmDialog.id)}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
}