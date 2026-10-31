// src/pages/Depenses.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';
import EtatFournisseurPDF from '../components/EtatFournisseurPDF';

const CATEGORIES_CONFIG = {
  achat_materiel: { label: 'Achat matériel', icon: '🖨️', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', fill: '#3b82f6' },
  maintenance: { label: 'Maintenance', icon: '🔧', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', fill: '#f97316' },
  electricite: { label: 'Électricité', icon: '⚡', color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', fill: '#eab308' },
  loyer: { label: 'Loyer', icon: '🏠', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', fill: '#a855f7' },
  salaires: { label: 'Salaires', icon: '👥', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', fill: '#22c55e' },
  transport: { label: 'Transport', icon: '🚚', color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', fill: '#ef4444' },
  logiciels: { label: 'Logiciels', icon: '💻', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', fill: '#6366f1' },
  marketing: { label: 'Marketing', icon: '📢', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', fill: '#ec4899' },
  fournitures: { label: 'Fournitures', icon: '📎', color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', fill: '#14b8a6' },
  impots: { label: 'Impôts', icon: '🏛️', color: 'from-red-600 to-red-800', bg: 'bg-red-600/10', border: 'border-red-600/30', text: 'text-red-300', fill: '#dc2626' },
  assurance: { label: 'Assurance', icon: '🛡️', color: 'from-sky-500 to-blue-600', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', fill: '#0ea5e9' },
  internet: { label: 'Internet/Télécom', icon: '📶', color: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', fill: '#06b6d4' },
  autre: { label: 'Autre', icon: '📦', color: 'from-gray-500 to-slate-500', bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', fill: '#6b7280' }
};

export default function Depenses() {
  const { profile } = useAuth();
  
  const [depenses, setDepenses] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vue');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDepense, setSelectedDepense] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [showEtatFournisseur, setShowEtatFournisseur] = useState(false);
  const [selectedFournisseurId, setSelectedFournisseurId] = useState(null);
  const [showFournisseurModal, setShowFournisseurModal] = useState(false);
  const [fournisseurForm, setFournisseurForm] = useState({ id: null, nom: '', contact: '', telephone: '', email: '', adresse: '', categorie: '' });
  const [confirmFournisseurDialog, setConfirmFournisseurDialog] = useState({ open: false, id: null });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showTranchesModal, setShowTranchesModal] = useState(false);
  const [selectedDepenseForTranches, setSelectedDepenseForTranches] = useState(null);
  const [tranches, setTranches] = useState([]);
  const [newTranche, setNewTranche] = useState({ montant: '', date_prevue: '' });
  
  const [formData, setFormData] = useState({
    fournisseur_id: '', date: new Date().toISOString().split('T')[0],
    designation: '', montant: '', categorie: 'achat_materiel',
    statut_paiement: 'non_paye', date_echeance: '', notes: '', mode_paiement: 'especes'
  });

  const statuts = [
    { value: 'non_paye', label: 'Non payé', color: 'bg-red-500/20 text-red-400' },
    { value: 'en_attente', label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'partiel', label: 'Partiel', color: 'bg-orange-500/20 text-orange-400' },
    { value: 'paye', label: 'Payé', color: 'bg-green-500/20 text-green-400' }
  ];

  useEffect(() => { loadData(); }, []);

 // ============================================================
// ✅ FONCTIONS DE FORMATAGE DE DATE - CORRIGÉES
// ============================================================
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '-';
    const date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch (e) {
    return '-';
  }
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '-';
    const date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch (e) {
    return '-';
  }
};

const toDateStr = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch (e) {
    return null;
  }
};

  // ============================================================
  // CHARGEMENT
  // ============================================================
  async function loadData() {
    setLoading(true);
    try {
      const [depensesRes, fournisseursRes] = await Promise.all([
        supabaseErp.from('erp_depenses').select('*, erp_fournisseurs(nom)').order('date', { ascending: false }),
        supabaseErp.from('erp_fournisseurs').select('*').order('nom')
      ]);
      setDepenses(depensesRes.data || []);
      setFournisseurs(fournisseursRes.data || []);
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  }

  // Stats
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const totalGeneral = depenses.reduce((s, d) => s + (d.montant || 0), 0);
  const totalMois = depenses.filter(d => d.date >= debutMois && d.date <= finMois).reduce((s, d) => s + (d.montant || 0), 0);
  const totalNonPaye = depenses.filter(d => d.statut_paiement !== 'paye').reduce((s, d) => s + (d.montant || 0), 0);
  const dans30Jours = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const traficAVenir = depenses.filter(d => d.date_echeance && d.statut_paiement !== 'paye' && d.date_echeance >= now.toISOString().split('T')[0] && d.date_echeance <= dans30Jours).sort((a, b) => new Date(a.date_echeance) - new Date(b.date_echeance));
  const totalTrafic = traficAVenir.reduce((s, d) => s + (d.montant || 0), 0);

// ============================================================
// ✅ GÉNÉRATION DU CALENDRIER - CORRIGÉ
// ============================================================
const getJoursDuMois = () => {
  const jours = [];
  const debutMois = new Date(Date.UTC(calendarYear, calendarMonth, 1));
  const dernierJour = new Date(Date.UTC(calendarYear, calendarMonth + 1, 0));
  const premierJourSemaine = debutMois.getUTCDay();
  
  for (let d = 1; d <= dernierJour.getUTCDate(); d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const depensesJour = depenses.filter(dp => {
      const dpDate = dp.date_echeance || dp.date;
      return dpDate === dateStr;
    });
    
    jours.push({
      jour: d,
      date: dateStr,
      depenses: depensesJour,
      total: depensesJour.reduce((s, dp) => s + (dp.montant || 0), 0),
      isToday: dateStr === now.toISOString().split('T')[0],
      isSelected: dateStr === selectedDate,
      nonPaye: depensesJour.filter(d => d.statut_paiement !== 'paye').length
    });
  }
  return { jours, premierJourSemaine };
};

 const { jours, premierJourSemaine } = getJoursDuMois();
const moisLabel = new Date(calendarYear, calendarMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

// ✅ Filtrage des dépenses par date sélectionnée
const depensesSelectedDate = depenses.filter(dp => {
  const dpDate = dp.date_echeance || dp.date;
  return dpDate === selectedDate;
});

  // Fonctions fournisseur
  function openFournisseurModal(f = null) {
    if (f) setFournisseurForm({ id: f.id, nom: f.nom || '', contact: f.contact || '', telephone: f.telephone || '', email: f.email || '', adresse: f.adresse || '', categorie: f.categorie || '' });
    else setFournisseurForm({ id: null, nom: '', contact: '', telephone: '', email: '', adresse: '', categorie: '' });
    setShowFournisseurModal(true);
  }

  async function saveFournisseur() {
    if (!fournisseurForm.nom?.trim()) { showAlert('error', '❌ Nom obligatoire'); return; }
    try {
      const data = { nom: fournisseurForm.nom.trim(), contact: fournisseurForm.contact?.trim() || null, telephone: fournisseurForm.telephone?.trim() || null, email: fournisseurForm.email?.trim() || null, adresse: fournisseurForm.adresse?.trim() || null, categorie: fournisseurForm.categorie || null };
      if (fournisseurForm.id) { await supabaseErp.from('erp_fournisseurs').update(data).eq('id', fournisseurForm.id); showAlert('success', '✅ Fournisseur modifié'); }
      else { await supabaseErp.from('erp_fournisseurs').insert([data]); showAlert('success', '✅ Fournisseur créé'); }
      setShowFournisseurModal(false); loadData();
    } catch (error) { showAlert('error', 'Erreur: ' + (error.code === '23505' ? 'Ce fournisseur existe déjà' : error.message)); }
  }

  async function deleteFournisseur(id) {
    try {
      await supabaseErp.from('erp_depenses').update({ fournisseur_id: null }).eq('fournisseur_id', id);
      const { error } = await supabaseErp.from('erp_fournisseurs').delete().eq('id', id);
      if (error) throw error;
      showAlert('success', '✅ Fournisseur supprimé'); loadData();
    } catch (error) { showAlert('error', 'Erreur: ' + error.message); }
    setConfirmFournisseurDialog({ open: false, id: null });
  }

  // Fonctions dépense
  async function saveDepense() {
    if (!formData.designation?.trim()) { showAlert('error', '❌ Désignation obligatoire'); return; }
    if (!formData.montant || parseFloat(formData.montant) <= 0) { showAlert('error', '❌ Montant > 0 obligatoire'); return; }
    try {
      const data = { designation: formData.designation.trim(), montant: parseFloat(formData.montant), date: formData.date || now.toISOString().split('T')[0], categorie: formData.categorie || 'autre', fournisseur_id: formData.fournisseur_id || null, statut_paiement: formData.statut_paiement || 'non_paye', date_echeance: formData.date_echeance || null, notes: formData.notes?.trim() || null, mode_paiement: formData.mode_paiement || 'especes' };
      if (modalMode === 'create') { await supabaseErp.from('erp_depenses').insert([data]); showAlert('success', '✅ Dépense créée'); }
      else { await supabaseErp.from('erp_depenses').update(data).eq('id', selectedDepense.id); showAlert('success', '✅ Dépense modifiée'); }
      setModalOpen(false); resetForm(); loadData();
    } catch (error) { showAlert('error', 'Erreur: ' + error.message); }
  }

  async function deleteDepense(id) { await supabaseErp.from('erp_depenses').delete().eq('id', id); showAlert('success', '✅ Supprimée'); loadData(); setConfirmDialog({ open: false, id: null }); }

  function openCreateModal(date = null) { setModalMode('create'); setSelectedDepense(null); setFormData({ fournisseur_id: '', date: date || now.toISOString().split('T')[0], designation: '', montant: '', categorie: 'achat_materiel', statut_paiement: 'non_paye', date_echeance: date || '', notes: '', mode_paiement: 'especes' }); setModalOpen(true); }

  function openEditModal(depense) { setModalMode('edit'); setSelectedDepense(depense); setFormData({ fournisseur_id: depense.fournisseur_id || '', date: depense.date?.split('T')[0] || now.toISOString().split('T')[0], designation: depense.designation || '', montant: depense.montant || '', categorie: depense.categorie || 'achat_materiel', statut_paiement: depense.statut_paiement || 'non_paye', date_echeance: depense.date_echeance?.split('T')[0] || '', notes: depense.notes || '', mode_paiement: depense.mode_paiement || 'especes' }); setModalOpen(true); }

  function resetForm() { setFormData({ fournisseur_id: '', date: now.toISOString().split('T')[0], designation: '', montant: '', categorie: 'achat_materiel', statut_paiement: 'non_paye', date_echeance: '', notes: '', mode_paiement: 'especes' }); }

  const getStatutBadge = (statut) => { const s = statuts.find(st => st.value === statut) || statuts[0]; return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.color}`}>{s.label}</span>; };

  // Fonctions tranches
  async function loadTranches(depenseId) {
    const { data } = await supabaseErp.from('erp_tranches_paiement').select('*').eq('depense_id', depenseId).order('numero_tranche');
    setTranches(data || []);
  }

  async function addTranche() {
    if (!newTranche.montant || parseFloat(newTranche.montant) <= 0) { showAlert('error', 'Montant obligatoire'); return; }
    const depense = selectedDepenseForTranches;
    const totalDeja = tranches.reduce((s, t) => s + parseFloat(t.montant), 0);
    if (totalDeja + parseFloat(newTranche.montant) > depense.montant) { showAlert('error', 'Total dépasse la dette'); return; }
    await supabaseErp.from('erp_tranches_paiement').insert([{ depense_id: depense.id, fournisseur_id: depense.fournisseur_id, numero_tranche: tranches.length + 1, montant: parseFloat(newTranche.montant), date_prevue: newTranche.date_prevue || null, statut: 'en_attente' }]);
    showAlert('success', '✅ Tranche ajoutée'); setNewTranche({ montant: '', date_prevue: '' }); loadTranches(depense.id); loadData();
  }

  async function payerTranche(trancheId) {
  const today = new Date().toISOString().split('T')[0];
  
  const tranche = tranches.find(t => t.id === trancheId);
  const depense = selectedDepenseForTranches;
  const fournisseur = fournisseurs.find(f => f.id === depense.fournisseur_id);
  
  await supabaseErp.from('erp_tranches_paiement')
    .update({ statut: 'payee', date_paiement: today })
    .eq('id', trancheId);

  await supabaseErp.from('erp_journal_caisse').insert([{
    date: today,
    type: 'expense',
    montant: tranche.montant,
    designation: `Paiement tranche #${tranche.numero_tranche} - ${depense.designation}`,
    category: depense.categorie || 'autre',
    note: `Fournisseur: ${fournisseur?.nom || 'N/A'} | ${depense.designation}`,
    depense_id: depense.id,
    tranche_id: trancheId,
    fournisseur_id: depense.fournisseur_id
  }]);

  const { data: all } = await supabaseErp.from('erp_tranches_paiement')
    .select('*').eq('depense_id', depense.id);
  const paye = (all || []).filter(t => t.statut === 'payee')
    .reduce((s, t) => s + t.montant, 0);
  
  if (Math.abs(paye - depense.montant) < 0.001) {
    await supabaseErp.from('erp_depenses')
      .update({ statut_paiement: 'paye' }).eq('id', depense.id);
    showAlert('success', '🎉 Dette entièrement payée !');
  } else if (paye > 0) {
    await supabaseErp.from('erp_depenses')
      .update({ statut_paiement: 'partiel' }).eq('id', depense.id);
  }

  loadTranches(depense.id);
  loadData();
}

  async function deleteTranche(trancheId) {
    await supabaseErp.from('erp_tranches_paiement').delete().eq('id', trancheId).eq('statut', 'en_attente');
    showAlert('success', '✅ Tranche supprimée'); loadTranches(selectedDepenseForTranches.id); loadData();
  }

  function openTranchesModal(depense) { setSelectedDepenseForTranches(depense); loadTranches(depense.id); setShowTranchesModal(true); }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">Dépenses</h1><p className="text-gray-400 text-sm mt-1">Suivi élégant de votre trésorerie</p></div>
        <button onClick={() => openCreateModal()} className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold hover:shadow-lg transition-all">➕ Nouvelle dépense</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[{ v: `${totalGeneral.toLocaleString()} DT`, l: 'Total général', icon: '💰', bg: 'bg-[#0D1F3C]', c: 'text-white' },{ v: `${totalMois.toLocaleString()} DT`, l: 'Ce mois', icon: '📅', bg: 'bg-[#F0C75E]/10', c: 'text-[#F0C75E]' },{ v: `${totalNonPaye.toLocaleString()} DT`, l: 'Reste à payer', icon: '⚠️', bg: 'bg-red-500/10', c: 'text-red-400' },{ v: `${totalTrafic.toLocaleString()} DT`, l: '30 prochains jours', icon: '📈', bg: 'bg-blue-500/10', c: 'text-blue-400' }].map((s, i) => (<div key={i} className={`${s.bg} rounded-xl p-4 border border-[#1A3A6B]`}><span className="text-2xl">{s.icon}</span><p className={`text-xl font-bold ${s.c} mt-2`}>{s.v}</p><p className="text-[10px] text-gray-400">{s.l}</p></div>))}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[{ id: 'vue', label: '🎨 Vue élégante' },{ id: 'calendrier', label: '📅 Calendrier' },{ id: 'dettes', label: '💰 Mes dettes' },{ id: 'fournisseurs', label: '🏢 Fournisseurs' },{ id: 'liste', label: '📋 Liste' }].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#F0C75E] text-[#071325] shadow-lg' : 'bg-[#0D1F3C] text-gray-400 border border-[#1A3A6B] hover:text-white'}`}>{tab.label}</button>))}
      </div>

      {/* VUE ÉLÉGANTE */}
      {activeTab === 'vue' && (
        <div className="space-y-4">
          {traficAVenir.length > 0 && (<div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5"><h3 className="text-white font-bold text-lg mb-4">📈 Trafic avant échéance (30 jours)</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{traficAVenir.map(d => { const jr = Math.ceil((new Date(d.date_echeance) - now) / 86400000); const cat = CATEGORIES_CONFIG[d.categorie] || CATEGORIES_CONFIG.autre; return (<div key={d.id} className="flex items-center justify-between bg-[#0A1628] rounded-lg p-3 border border-[#1A3A6B] hover:border-[#F0C75E]/30 transition"><div className="flex items-center gap-3"><span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg`}>{cat.icon}</span><div><p className="text-white font-medium text-sm">{d.designation}</p><p className="text-gray-500 text-[10px]">{d.erp_fournisseurs?.nom || 'Sans fournisseur'}</p></div></div><div className="text-right"><p className="text-[#F0C75E] font-bold">{d.montant?.toLocaleString()} DT</p><p className={`text-[10px] ${jr <= 7 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{jr} jour{jr > 1 ? 's' : ''}</p></div></div>); })}</div><div className="mt-3 pt-3 border-t border-[#1A3A6B] flex justify-between"><span className="text-gray-400 text-sm">Total à venir</span><span className="text-[#F0C75E] text-xl font-bold">{totalTrafic.toLocaleString()} DT</span></div></div>)}
          <h3 className="text-white font-bold text-lg">📊 Par catégorie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(CATEGORIES_CONFIG).map(([key, cat]) => { const deps = depenses.filter(d => d.categorie === key); const total = deps.reduce((s, d) => s + (d.montant || 0), 0); if (total === 0) return null; return (<div key={key} className={`bg-gradient-to-br ${cat.bg} rounded-xl p-4 border ${cat.border} cursor-pointer hover:scale-[1.02] transition-all`} onClick={() => setActiveTab('liste')}><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><span className="text-2xl">{cat.icon}</span><span className={`font-bold ${cat.text}`}>{cat.label}</span></div><span className="text-white text-xs bg-black/20 px-2 py-1 rounded-full">{deps.length} dépenses</span></div><p className={`text-3xl font-bold ${cat.text}`}>{total.toLocaleString()} <span className="text-sm">DT</span></p><div className="mt-3 w-full h-2 bg-black/20 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min((total / (totalGeneral || 1)) * 100, 100)}%`, backgroundColor: cat.fill }} /></div><p className="text-gray-400 text-[10px] mt-1">{((total / (totalGeneral || 1)) * 100).toFixed(1)}% du total</p></div>); })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CALENDRIER - CORRIGÉ */}
      {/* ============================================================ */}
      {/* ============================================================ */}
{/* CALENDRIER - CORRIGÉ (FUSEAU HORAIRE) */}
{/* ============================================================ */}
{activeTab === 'calendrier' && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2">
      <div className="bg-[#0D1F3C] rounded-xl border border-[#1A3A6B] p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => { 
              if (calendarMonth === 0) { 
                setCalendarMonth(11); 
                setCalendarYear(calendarYear - 1); 
              } else setCalendarMonth(calendarMonth - 1); 
            }} 
            className="p-2 rounded-lg bg-[#0D1F3C] text-white hover:bg-[#1A3A6B] transition"
          >
            ◀
          </button>
          <h3 className="text-white font-bold text-lg capitalize">
            {new Date(calendarYear, calendarMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => { 
              if (calendarMonth === 11) { 
                setCalendarMonth(0); 
                setCalendarYear(calendarYear + 1); 
              } else setCalendarMonth(calendarMonth + 1); 
            }} 
            className="p-2 rounded-lg bg-[#0D1F3C] text-white hover:bg-[#1A3A6B] transition"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map(j => (
            <div key={j} className="text-center text-gray-500 text-xs font-semibold py-2">{j}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: premierJourSemaine }).map((_, i) => (
            <div key={`e-${i}`} className="min-h-[80px] rounded-lg" />
          ))}
          {jours.map((j, i) => {
            const todayStr = toDateStr(new Date());
            const isToday = j.date === todayStr;
            
            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(j.date)} 
                className={`min-h-[85px] rounded-xl p-1.5 border-2 transition-all cursor-pointer 
                  ${j.isSelected ? 'border-[#F0C75E] bg-[#F0C75E]/10 shadow-lg scale-105 z-10' : ''} 
                  ${isToday && !j.isSelected ? 'border-white/30 bg-white/5' : ''} 
                  ${!j.isSelected && !isToday ? 'border-[#1A3A6B] bg-[#0A1628] hover:border-[#F0C75E]/40' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold ${j.isSelected ? 'text-[#F0C75E]' : isToday ? 'text-white' : 'text-gray-500'}`}>
                    {j.jour}
                  </span>
                  {j.nonPaye > 0 && <span className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
                {j.total > 0 && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-[#F0C75E]/70">
                      {j.total.toLocaleString()} DT
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* ✅ Détails du jour sélectionné - DATE CORRIGÉE */}
    <div className="lg:col-span-1">
      <div className="bg-[#0D1F3C] rounded-xl border border-[#1A3A6B] p-4 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">
            📅 {selectedDate ? formatDateDisplay(selectedDate) : 'Sélectionnez un jour'}
          </h3>
          <button 
            onClick={() => openCreateModal(selectedDate)} 
            className="p-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-xs"
          >
            +
          </button>
        </div>

        {depensesSelectedDate.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-sm">
              {selectedDate ? 'Aucune dépense ce jour' : 'Cliquez sur un jour'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {depensesSelectedDate.map(d => {
              const cat = CATEGORIES_CONFIG[d.categorie] || CATEGORIES_CONFIG.autre;
              return (
                <div 
                  key={d.id} 
                  className="bg-[#0A1628] rounded-lg p-3 border border-[#1A3A6B] cursor-pointer hover:border-[#F0C75E]/30 transition"
                  onClick={() => openEditModal(d)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-sm`}>
                      {cat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{d.designation}</p>
                      <p className="text-gray-500 text-[10px]">{formatDateShort(d.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F0C75E] font-bold">{d.montant?.toLocaleString()} DT</span>
                    {getStatutBadge(d.statut_paiement)}
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-[#1A3A6B] flex justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-[#F0C75E] font-bold text-lg">
                {depensesSelectedDate.reduce((s, d) => s + (d.montant || 0), 0).toLocaleString()} DT
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* MES DETTES */}
      {activeTab === 'dettes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-3">
            {[{ v: totalNonPaye.toLocaleString(), l: 'Total dettes', c: 'text-red-400', bg: 'bg-red-500/10', b: 'border-red-500/30' },{ v: depenses.filter(d => d.statut_paiement !== 'paye').length, l: 'Factures impayées', c: 'text-orange-400', bg: 'bg-orange-500/10', b: 'border-orange-500/30' },{ v: depenses.filter(d => d.date_echeance && d.statut_paiement !== 'paye' && new Date(d.date_echeance) < now).length, l: 'En retard', c: 'text-yellow-400', bg: 'bg-yellow-500/10', b: 'border-yellow-500/30' },{ v: traficAVenir.length, l: 'Échéances 30j', c: 'text-blue-400', bg: 'bg-blue-500/10', b: 'border-blue-500/30' }].map((s, i) => (<div key={i} className={`${s.bg} border ${s.b} rounded-2xl p-4 text-center`}><p className={`text-3xl font-black ${s.c}`}>{s.v}</p><p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{s.l}</p></div>))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CATEGORIES_CONFIG).map(([key, cat]) => {
              const dettes = depenses.filter(d => d.categorie === key && d.statut_paiement !== 'paye');
              const total = dettes.reduce((s, d) => s + (d.montant || 0), 0);
              if (total === 0) return null;
              const enRetard = dettes.filter(d => d.date_echeance && new Date(d.date_echeance) < now).length;
              return (
                <div key={key} className={`relative bg-gradient-to-br from-[#0D1F3C] to-[#0A1628] rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer group ${enRetard > 0 ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-[#1A3A6B] hover:border-[#F0C75E]/30'}`}>
                  <div className={`h-2 w-full bg-gradient-to-r ${cat.color} rounded-t-2xl`} />
                  {enRetard > 0 && <div className="absolute -top-3 -right-3 z-10"><span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xl animate-pulse">⚠️ {enRetard}</span></div>}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shadow-lg`}>{cat.icon}</div><div className="flex-1 min-w-0"><h3 className="text-white font-bold text-sm truncate">{cat.label}</h3><p className="text-gray-500 text-[10px]">{dettes.length} facture{dettes.length > 1 ? 's' : ''}</p></div></div>
                    <div className="mb-4"><p className={`text-3xl font-black ${cat.text}`}>{total.toLocaleString()}</p><p className="text-gray-500 text-xs">DT</p></div>
                    <div className="mb-3"><div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min((total / (totalNonPaye || 1)) * 100, 100)}%`, background: `linear-gradient(to right, ${cat.fill}, ${cat.fill}88)` }} /></div></div>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                      {dettes.sort((a, b) => (a.montant || 0) - (b.montant || 0)).slice(0, 4).map(d => { const isRetard = d.date_echeance && new Date(d.date_echeance) < now; return (
                        <div key={d.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-2.5 py-1.5 hover:bg-white/[0.05] transition cursor-pointer" onClick={(e) => { e.stopPropagation(); openEditModal(d); }}>
                          <div className="flex items-center gap-2 min-w-0 flex-1"><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRetard ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} /><span className="text-gray-300 text-[10px] truncate">{d.designation}</span></div>
                          <button onClick={(e) => { e.stopPropagation(); openTranchesModal(d); }} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] hover:bg-blue-500/30 mr-1">💰</button>
                          <span className="text-[#F0C75E] text-[10px] font-semibold flex-shrink-0">{d.montant?.toLocaleString()} DT</span>
                        </div>
                      );})}
                    </div>
                    <button className="w-full mt-3 py-2 rounded-xl bg-white/[0.03] text-gray-400 text-[10px] font-medium hover:bg-white/[0.08] hover:text-white transition" onClick={() => setActiveTab('liste')}>Voir tout →</button>
                  </div>
                </div>
              );
            })}
          </div>
          {totalNonPaye === 0 && <div className="text-center py-20"><span className="text-7xl block mb-6">🎉</span><h3 className="text-2xl text-white font-bold">Aucune dette !</h3></div>}
        </div>
      )}

      {/* FOURNISSEURS */}
      {activeTab === 'fournisseurs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-white font-bold text-lg">🏢 Mes fournisseurs</h3><button onClick={() => openFournisseurModal()} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-semibold">➕ Ajouter</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fournisseurs.map(f => { const deps = depenses.filter(d => d.fournisseur_id === f.id); const total = deps.reduce((s, d) => s + (d.montant || 0), 0); const nonPaye = deps.filter(d => d.statut_paiement !== 'paye').reduce((s, d) => s + (d.montant || 0), 0); return (
              <div key={f.id} className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] p-5 hover:border-[#F0C75E]/30 transition-all group">
                <div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg">🏢</div><div><h4 className="text-white font-bold">{f.nom}</h4><p className="text-gray-500 text-[10px]">{deps.length} dépenses</p></div></div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => openFournisseurModal(f)} className="p-2 rounded-lg bg-[#1A3A6B] text-yellow-400 hover:bg-yellow-500/20">✏️</button><button onClick={() => setConfirmFournisseurDialog({ open: true, id: f.id })} className="p-2 rounded-lg bg-[#1A3A6B] text-red-400 hover:bg-red-500/20">🗑️</button><button onClick={() => { setSelectedFournisseurId(f.id); setShowEtatFournisseur(true); }} className="p-2 rounded-lg bg-[#1A3A6B] text-purple-400 hover:bg-purple-500/20">📄</button></div></div>
                <div className="grid grid-cols-3 gap-2"><div className="bg-[#0A1628] rounded-lg p-2 text-center"><p className="text-[#F0C75E] text-sm font-bold">{total.toLocaleString()}</p><p className="text-gray-500 text-[9px]">Total</p></div><div className="bg-red-500/5 rounded-lg p-2 text-center"><p className="text-red-400 text-sm font-bold">{nonPaye.toLocaleString()}</p><p className="text-gray-500 text-[9px]">Impayé</p></div><div className="bg-green-500/5 rounded-lg p-2 text-center"><p className="text-green-400 text-sm font-bold">{(total - nonPaye).toLocaleString()}</p><p className="text-gray-500 text-[9px]">Payé</p></div></div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* LISTE */}
      {activeTab === 'liste' && (
        <div className="bg-[#0D1F3C]/80 border border-[#1A3A6B] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-[#071325]"><tr><th className="p-3 text-left text-gray-400 text-xs">Date</th><th className="p-3 text-left text-gray-400 text-xs">Désignation</th><th className="p-3 text-left text-gray-400 text-xs">Fournisseur</th><th className="p-3 text-right text-gray-400 text-xs">Montant</th><th className="p-3 text-left text-gray-400 text-xs">Statut</th><th className="p-3 text-center text-gray-400 text-xs">✏️</th></tr></thead><tbody className="divide-y divide-[#1A3A6B]">{depenses.slice(0, 50).map(d => (<tr key={d.id} className="hover:bg-[#1A3A6B]/20"><td className="p-3 text-white text-xs">{formatDateShort(d.date)}</td><td className="p-3 text-white text-sm">{d.designation}</td><td className="p-3 text-gray-300 text-xs">{d.erp_fournisseurs?.nom || '-'}</td><td className="p-3 text-[#F0C75E] text-sm font-semibold text-right">{d.montant?.toLocaleString()} DT</td><td className="p-3">{getStatutBadge(d.statut_paiement)}</td><td className="p-3"><div className="flex justify-center gap-1"><button onClick={() => openEditModal(d)} className="p-1.5 text-yellow-400 hover:bg-yellow-500/10 text-xs">✏️</button><button onClick={() => setConfirmDialog({ open: true, id: d.id })} className="p-1.5 text-red-400 hover:bg-red-500/10 text-xs">🗑️</button></div></td></tr>))}</tbody></table></div></div>
      )}

      {/* MODAL DÉPENSE */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? '➕ Nouvelle dépense' : '✏️ Modifier'} size="large">
        <div className="space-y-5">
          <div><div className="flex items-center gap-2 mb-3"><span className="w-6 h-6 rounded-full bg-[#F0C75E] text-[#071325] flex items-center justify-center text-xs font-bold">1</span><label className="text-white text-sm font-semibold">Catégorie</label></div><div className="grid grid-cols-3 md:grid-cols-4 gap-2">{Object.entries(CATEGORIES_CONFIG).map(([key, cat]) => (<button key={key} type="button" onClick={() => setFormData({ ...formData, categorie: key, fournisseur_id: '' })} className={`p-3 rounded-xl border-2 transition-all text-center ${formData.categorie === key ? 'border-[#F0C75E] bg-[#F0C75E]/10 shadow-lg scale-105' : 'border-[#1A3A6B] bg-[#071325] hover:border-[#F0C75E]/40'}`}><span className="text-2xl block mb-1">{cat.icon}</span><span className={`text-[10px] font-medium ${formData.categorie === key ? 'text-[#F0C75E]' : 'text-gray-400'}`}>{cat.label}</span></button>))}</div></div>

          {formData.categorie === 'achat_materiel' && (<div><div className="flex items-center gap-2 mb-3"><span className="w-6 h-6 rounded-full bg-[#F0C75E] text-[#071325] flex items-center justify-center text-xs font-bold">2</span><label className="text-white text-sm font-semibold">Fournisseur</label></div><div className="flex gap-2"><select value={formData.fournisseur_id} onChange={e => setFormData({ ...formData, fournisseur_id: e.target.value })} className="flex-1 p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm"><option value="">Sélectionner</option>{fournisseurs.map(f => <option key={f.id} value={f.id}>🏢 {f.nom}</option>)}</select><button type="button" onClick={() => openFournisseurModal()} className="px-4 py-2.5 bg-[#1A3A6B] text-white rounded-lg text-sm">➕ Créer</button></div></div>)}

          <div><div className="flex items-center gap-2 mb-3"><span className="w-6 h-6 rounded-full bg-[#F0C75E] text-[#071325] flex items-center justify-center text-xs font-bold">{formData.categorie === 'achat_materiel' ? '3' : '2'}</span><label className="text-white text-sm font-semibold">Détails</label></div><div className="bg-[#0A1628] rounded-xl p-4 border border-[#1A3A6B] space-y-3"><div><label className="block text-gray-400 text-xs mb-1">Désignation <span className="text-red-400">*</span></label><input type="text" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-gray-400 text-xs mb-1">Montant <span className="text-red-400">*</span></label><input type="number" step="0.001" value={formData.montant} onChange={e => setFormData({ ...formData, montant: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" /></div><div><label className="block text-gray-400 text-xs mb-1">Statut</label><select value={formData.statut_paiement} onChange={e => setFormData({ ...formData, statut_paiement: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm">{statuts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-gray-400 text-xs mb-1">Date</label><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" /></div><div><label className="block text-gray-400 text-xs mb-1">Échéance</label><input type="date" value={formData.date_echeance} onChange={e => setFormData({ ...formData, date_echeance: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" /></div></div><div><label className="block text-gray-400 text-xs mb-1">Notes</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm resize-none" /></div></div></div>
          <div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-5 py-2.5 bg-[#1A3A6B] text-white rounded-lg">Annuler</button><button onClick={saveDepense} className="px-5 py-2.5 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold">{modalMode === 'create' ? '✅ Créer' : '💾 Modifier'}</button></div>
        </div>
      </Modal>

      {/* MODAL TRANCHES */}
      <Modal isOpen={showTranchesModal} onClose={() => setShowTranchesModal(false)} title="💰 Paiement par tranches" size="medium">
        {selectedDepenseForTranches && (
          <div className="space-y-4">
            <div className="bg-[#0A1628] rounded-xl p-4 border border-[#1A3A6B]">
              <p className="text-white font-bold">{selectedDepenseForTranches.designation}</p>
              <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                <div><p className="text-[#F0C75E] text-lg font-bold">{selectedDepenseForTranches.montant?.toLocaleString()} DT</p><p className="text-gray-500 text-[10px]">Total</p></div>
                <div><p className="text-green-400 text-lg font-bold">{tranches.filter(t => t.statut === 'payee').reduce((s, t) => s + t.montant, 0).toLocaleString()} DT</p><p className="text-gray-500 text-[10px]">Payé</p></div>
                <div><p className="text-red-400 text-lg font-bold">{(selectedDepenseForTranches.montant - tranches.filter(t => t.statut === 'payee').reduce((s, t) => s + t.montant, 0)).toLocaleString()} DT</p><p className="text-gray-500 text-[10px]">Reste</p></div>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="number" step="0.001" placeholder="Montant" value={newTranche.montant} onChange={e => setNewTranche({ ...newTranche, montant: e.target.value })} className="flex-1 p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" />
              <input type="date" value={newTranche.date_prevue} onChange={e => setNewTranche({ ...newTranche, date_prevue: e.target.value })} className="p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" />
              <button onClick={addTranche} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-semibold">+</button>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {tranches.map(t => (
                <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${t.statut === 'payee' ? 'bg-green-500/10 border-green-500/30' : 'bg-[#0A1628] border-[#1A3A6B]'}`}>
                  <div className="flex items-center gap-3"><span className="text-[#F0C75E] font-bold text-sm">#{t.numero_tranche}</span><div><p className="text-white font-medium">{t.montant?.toLocaleString()} DT</p>{t.date_prevue && <p className="text-gray-500 text-[10px]">📅 {formatDateShort(t.date_prevue)}</p>}</div></div>
                  {t.statut === 'payee' ? <span className="text-green-400 text-xs">✅ Payée</span> : <div className="flex gap-1"><button onClick={() => payerTranche(t.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Payer</button><button onClick={() => deleteTranche(t.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">🗑️</button></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* MODALS FOURNISSEUR */}
      <Modal isOpen={showEtatFournisseur} onClose={() => setShowEtatFournisseur(false)} title="📄 État fournisseur" size="xlarge"><EtatFournisseurPDF fournisseurId={selectedFournisseurId} onClose={() => setShowEtatFournisseur(false)} /></Modal>
      <Modal isOpen={showFournisseurModal} onClose={() => setShowFournisseurModal(false)} title={fournisseurForm.id ? '✏️ Modifier' : '➕ Nouveau'} size="medium"><div className="space-y-3"><div><label className="block text-gray-400 text-xs mb-1">Nom *</label><input type="text" value={fournisseurForm.nom} onChange={e => setFournisseurForm({ ...fournisseurForm, nom: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-gray-400 text-xs mb-1">Contact</label><input type="text" value={fournisseurForm.contact} onChange={e => setFournisseurForm({ ...fournisseurForm, contact: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div><div><label className="block text-gray-400 text-xs mb-1">Téléphone</label><input type="tel" value={fournisseurForm.telephone} onChange={e => setFournisseurForm({ ...fournisseurForm, telephone: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div></div><div><label className="block text-gray-400 text-xs mb-1">Email</label><input type="email" value={fournisseurForm.email} onChange={e => setFournisseurForm({ ...fournisseurForm, email: e.target.value })} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div><div><label className="block text-gray-400 text-xs mb-1">Adresse</label><textarea value={fournisseurForm.adresse} onChange={e => setFournisseurForm({ ...fournisseurForm, adresse: e.target.value })} rows={2} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white resize-none" /></div><div className="flex justify-end gap-3 pt-2"><button onClick={() => setShowFournisseurModal(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg">Annuler</button><button onClick={saveFournisseur} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold">{fournisseurForm.id ? 'Enregistrer' : 'Créer'}</button></div></div></Modal>

      <ConfirmDialog isOpen={confirmFournisseurDialog.open} onClose={() => setConfirmFournisseurDialog({ open: false, id: null })} onConfirm={() => deleteFournisseur(confirmFournisseurDialog.id)} title="🗑️ Supprimer" message="Supprimer ce fournisseur ?" confirmText="Supprimer" />
      <ConfirmDialog isOpen={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, id: null })} onConfirm={() => deleteDepense(confirmDialog.id)} title="Supprimer" message="Supprimer cette dépense ?" confirmText="Supprimer" />
    </div>
  );
}