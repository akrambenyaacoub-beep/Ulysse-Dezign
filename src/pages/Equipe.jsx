// src/pages/Equipe.jsx
import { useState, useEffect } from 'react';
import { supabaseErp, supabaseAdmin } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth'; // ✅ Named export
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';

export default function Equipe() {
  const { profile } = useAuth(); // ✅ MAINTENANT FONCTIONNE
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'designer',
    telephone: '',
    password: ''
  });

  const roles = [
    { value: 'admin', label: '👑 Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'gerant', label: '📋 Gérant', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'agent_financier', label: '💰 Agent Financier', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'designer', label: '🎨 Designer', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'poseur', label: '🔧 Poseur', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'imprimeur', label: '🖨️ Imprimeur', color: 'bg-gray-900/20 text-gray-900 border-gray-900/30 dark:bg-gray-100/20 dark:text-gray-100 dark:border-gray-100/30' },
  ];

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    loadMembres();
  }, []);

  async function loadMembres() {
    try {
      setLoading(true);
      const { data, error } = await supabaseErp
        .from('erp_profiles')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setMembres(data || []);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      showAlert('error', 'Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setSelectedMembre(null);
    setFormData({ 
      full_name: '', 
      email: '', 
      role: 'designer', 
      telephone: '',
      password: '' 
    });
    setModalOpen(true);
  }

  function openEditModal(membre) {
    setModalMode('edit');
    setSelectedMembre(membre);
    setFormData({
      full_name: membre.full_name || '',
      email: membre.email || '',
      role: membre.role || 'designer',
      telephone: membre.telephone || '',
      password: ''
    });
    setModalOpen(true);
  }

  function openViewModal(membre) {
    setModalMode('view');
    setSelectedMembre(membre);
    setFormData({
      full_name: membre.full_name || '',
      email: membre.email || '',
      role: membre.role || 'designer',
      telephone: membre.telephone || '',
      password: ''
    });
    setModalOpen(true);
  }

  async function saveMembre() {
    if (!formData.full_name?.trim()) {
      showAlert('error', '❌ Le nom complet est obligatoire');
      return;
    }
    if (!formData.email?.trim()) {
      showAlert('error', '❌ L\'email est obligatoire');
      return;
    }
    if (!isValidEmail(formData.email)) {
      showAlert('error', '❌ Format d\'email invalide');
      return;
    }
    if (modalMode === 'create' && !formData.password?.trim()) {
      showAlert('error', '❌ Le mot de passe est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const email = formData.email.trim().toLowerCase();

      if (modalMode === 'create') {
        const { data: existingProfiles, error: checkError } = await supabaseErp
          .from('erp_profiles')
          .select('id, email')
          .eq('email', email)
          .limit(1);

        if (checkError) throw checkError;
        
        if (existingProfiles && existingProfiles.length > 0) {
          showAlert('error', '❌ Cet email existe déjà dans l\'équipe');
          setSaving(false);
          return;
        }

        const membreData = {
          full_name: formData.full_name.trim(),
          email: email,
          role: formData.role,
          telephone: formData.telephone?.trim() || null,
          password_hash: formData.password.trim(),
          can_login: true,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabaseErp
          .from('erp_profiles')
          .insert([membreData]);

        if (insertError) {
          console.error('❌ Erreur insertion:', insertError);
          showAlert('error', '❌ ' + insertError.message);
          setSaving(false);
          return;
        }

        showAlert('success', `✅ Membre "${formData.full_name}" ajouté avec succès !`);
        setModalOpen(false);
        loadMembres();

      } else {
        const membreData = {
          full_name: formData.full_name.trim(),
          role: formData.role,
          telephone: formData.telephone?.trim() || null,
          updated_at: new Date().toISOString()
        };

        if (formData.password?.trim()) {
          membreData.password_hash = formData.password.trim();
        }

        const { error } = await supabaseErp
          .from('erp_profiles')
          .update(membreData)
          .eq('id', selectedMembre.id);

        if (error) {
          console.error('❌ Erreur modification:', error);
          showAlert('error', '❌ ' + error.message);
          setSaving(false);
          return;
        }

        showAlert('success', '✅ Membre modifié !');
        setModalOpen(false);
        loadMembres();
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', '❌ ' + (error.message || 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteMembre(id) {
    try {
      const membre = membres.find(m => m.id === id);
      
      const { error: profileError } = await supabaseErp
        .from('erp_profiles')
        .delete()
        .eq('id', id);
      
      if (profileError) throw profileError;

      try {
        if (supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(id);
        }
      } catch (authError) {
        console.warn('⚠️ Erreur suppression compte Auth:', authError);
      }

      showAlert('success', `✅ Membre "${membre?.full_name}" supprimé`);
      loadMembres();
    } catch (error) {
      console.error('Erreur suppression:', error);
      showAlert('error', 'Erreur suppression');
    }
    setConfirmDialog({ open: false, id: null });
  }

  const getRoleBadge = (role) => {
    const roleConfig = roles.find(r => r.value === role) || roles[3];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
        {roleConfig.label}
      </span>
    );
  };

  const stats = {
    total: membres.length,
    admin: membres.filter(m => m.role === 'admin').length,
    gerant: membres.filter(m => m.role === 'gerant').length,
    financier: membres.filter(m => m.role === 'agent_financier').length,
    designer: membres.filter(m => m.role === 'designer').length,
    poseur: membres.filter(m => m.role === 'poseur').length,
    imprimeur: membres.filter(m => m.role === 'imprimeur').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">Équipe</h1>
          <p className="text-gray-400 text-sm mt-1">Gestion des membres de l'équipe</p>
        </div>
        <button onClick={openCreateModal} className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
          <span className="material-symbols-outlined">person_add</span> Nouveau membre
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-7 gap-2 mb-5">
        <div className="bg-[#0D1F3C] rounded-xl p-3 border border-[#1A3A6B] text-center">
          <p className="text-xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-gray-400">Total</p>
        </div>
        {[
          { value: stats.admin, color: 'red', icon: '👑', label: 'Admin' },
          { value: stats.gerant, color: 'blue', icon: '📋', label: 'Gérant' },
          { value: stats.financier, color: 'green', icon: '💰', label: 'Finance' },
          { value: stats.designer, color: 'purple', icon: '🎨', label: 'Designer' },
          { value: stats.poseur, color: 'orange', icon: '🔧', label: 'Poseur' },
          { value: stats.imprimeur, color: 'gray', icon: '🖨️', label: 'Imprimeur' },
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-500/10 rounded-xl p-3 border border-${stat.color}-500/20 text-center`}>
            <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.icon} {stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-[#0D1F3C]/80 backdrop-blur-sm border border-[#1A3A6B] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#071325] border-b border-[#1A3A6B]">
              <tr>
                <th className="text-left px-5 py-4 text-gray-400 font-semibold text-sm">Membre</th>
                <th className="text-left px-5 py-4 text-gray-400 font-semibold text-sm">Email</th>
                <th className="text-left px-5 py-4 text-gray-400 font-semibold text-sm">Rôle</th>
                <th className="text-left px-5 py-4 text-gray-400 font-semibold text-sm">Téléphone</th>
                <th className="text-center px-5 py-4 text-gray-400 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3A6B]">
              {membres.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-500"><span className="text-4xl block mb-2">👥</span><p>Aucun membre</p></td></tr>
              ) : (
                membres.map((membre) => (
                  <tr key={membre.id} className="hover:bg-[#1A3A6B]/20 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1359A9] to-[#1E7AC4] flex items-center justify-center text-white font-bold text-sm">
                          {membre.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-white font-medium">{membre.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{membre.email}</td>
                    <td className="px-5 py-4">{getRoleBadge(membre.role)}</td>
                    <td className="px-5 py-4 text-gray-300">{membre.telephone || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openViewModal(membre)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition">👁️</button>
                        <button onClick={() => openEditModal(membre)} className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition">✏️</button>
                        <button onClick={() => setConfirmDialog({ open: true, id: membre.id })} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Équipe */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} 
        title={modalMode === 'create' ? '➕ Nouveau membre' : modalMode === 'edit' ? '✏️ Modifier' : '👁️ Détails'} 
        size="medium">
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1359A9] to-[#1E7AC4] flex items-center justify-center text-white font-bold text-2xl">
                {formData.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="text-white text-xl font-semibold">{formData.full_name}</h3>
                <p className="text-gray-400">{formData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-[#0A1628] rounded-lg p-4">
              <div><label className="text-gray-500 text-xs">Rôle</label><div className="mt-1">{getRoleBadge(formData.role)}</div></div>
              <div><label className="text-gray-500 text-xs">Téléphone</label><p className="text-white mt-1">{formData.telephone || '-'}</p></div>
            </div>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg w-full">Fermer</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Nom complet <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                value={formData.full_name} 
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:ring-2 focus:ring-[#F0C75E]/50" 
                placeholder="Nom et prénom" 
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Email <span className="text-red-400">*</span></label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:ring-2 focus:ring-[#F0C75E]/50" 
                placeholder="email@exemple.com" 
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Rôle <span className="text-red-400">*</span></label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:ring-2 focus:ring-[#F0C75E]/50"
              >
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Téléphone</label>
              <input 
                type="tel" 
                value={formData.telephone} 
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:ring-2 focus:ring-[#F0C75E]/50" 
                placeholder="+216 XX XXX XXX" 
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">
                Mot de passe {modalMode === 'create' && <span className="text-red-400">*</span>}
              </label>
              <input 
                type="text" 
                value={formData.password || ''} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:ring-2 focus:ring-[#F0C75E]/50" 
                placeholder={modalMode === 'create' ? 'Définir un mot de passe' : 'Laisser vide pour ne pas changer'} 
                required={modalMode === 'create'}
              />
              {modalMode === 'edit' && (
                <p className="text-gray-500 text-xs mt-1">💡 Laissez vide pour conserver le mot de passe actuel</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#1A3A6B]">
              <button 
                onClick={() => setModalOpen(false)} 
                className="px-5 py-2.5 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition" 
                disabled={saving}
              >
                Annuler
              </button>
              <button 
                onClick={saveMembre} 
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? '⏳...' : modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={() => deleteMembre(confirmDialog.id)} 
        title="🗑️ Supprimer" 
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible." 
        confirmText="Supprimer" 
      />
    </div>
  );
}