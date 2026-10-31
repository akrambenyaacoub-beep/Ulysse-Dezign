// src/pages/JournalCaisse.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';

export default function JournalCaisse() {
  const { profile } = useAuth();
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'revenue',
    montant: '',
    designation: '',
    category: 'autre',
    note: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    id: null, 
    designation: '' 
  });
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { loadData(); }, [selectedMonth, selectedYear]);

  async function loadData() {
    setLoading(true);
    try {
      const debutMois = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const finMois = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      const { data } = await supabaseErp
        .from('erp_journal_caisse')
        .select('*')
        .gte('date', debutMois)
        .lte('date', finMois)
        .order('date', { ascending: true })
        .order('id', { ascending: true });

      setEntries(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('error', 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const fondCaisse = entries.find(e => e.category === 'fond_caisse');
  const revenusSansFond = entries.filter(e => e.type === 'revenue' && e.category !== 'fond_caisse');
  const depenses = entries.filter(e => e.type === 'expense');
  
  const totalRevenus = revenusSansFond.reduce((s, e) => s + (e.montant || 0), 0) + (fondCaisse?.montant || 0);
  const totalDepenses = depenses.reduce((s, e) => s + (e.montant || 0), 0);
  const fondInitial = fondCaisse?.montant || 0;
  const soldeFinal = fondInitial + totalRevenus - totalDepenses;

  const joursDansMois = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const joursTravailles = 22;
  
  const moyenneRevenusParJour = totalRevenus / joursDansMois;
  const moyenneDepensesParJour = totalDepenses / joursDansMois;
  const moyenneFluxNetParJour = (totalRevenus - totalDepenses) / joursDansMois;
  const moyenneFluxParJourOuvrable = (totalRevenus - totalDepenses) / joursTravailles;
  
  const fluxParJour = {};
  
  if (fondCaisse) {
    const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
    if (!fluxParJour[firstDay]) fluxParJour[firstDay] = { revenus: 0, depenses: 0 };
    fluxParJour[firstDay].revenus += fondCaisse.montant || 0;
  }
  
  entries.forEach(e => {
    const day = e.date;
    if (!fluxParJour[day]) fluxParJour[day] = { revenus: 0, depenses: 0 };
    if (e.type === 'revenue' && e.category !== 'fond_caisse') {
      fluxParJour[day].revenus += e.montant || 0;
    }
    if (e.type === 'expense') {
      fluxParJour[day].depenses += e.montant || 0;
    }
  });

  let meilleurJour = null;
  let pireJour = null;
  Object.keys(fluxParJour).forEach(day => {
    const net = fluxParJour[day].revenus - fluxParJour[day].depenses;
    if (!meilleurJour || net > meilleurJour.net) {
      meilleurJour = { date: day, net, revenus: fluxParJour[day].revenus, depenses: fluxParJour[day].depenses };
    }
    if (!pireJour || net < pireJour.net) {
      pireJour = { date: day, net, revenus: fluxParJour[day].revenus, depenses: fluxParJour[day].depenses };
    }
  });

  const previsionFinMois = soldeFinal + (moyenneFluxNetParJour * (joursDansMois - new Date().getDate()));
  
  const entriesByDate = {};
  let soldeCumul = fondInitial;
  
  if (fondCaisse) {
    const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
    if (!entriesByDate[firstDay]) {
      entriesByDate[firstDay] = { 
        date: firstDay, 
        revenus: [], 
        depenses: [], 
        totalRevenus: 0, 
        totalDepenses: 0,
        soldeJour: 0,
        fondInclus: true
      };
    }
    entriesByDate[firstDay].revenus.push({ ...fondCaisse, isFond: true });
    entriesByDate[firstDay].totalRevenus += fondCaisse.montant || 0;
    entriesByDate[firstDay].soldeJour += fondCaisse.montant || 0;
  }

  entries.forEach(e => {
    const dateKey = e.date;
    if (!entriesByDate[dateKey]) {
      entriesByDate[dateKey] = { 
        date: dateKey, 
        revenus: [], 
        depenses: [], 
        totalRevenus: 0, 
        totalDepenses: 0,
        soldeJour: 0 
      };
    }
    if (e.type === 'revenue' && e.category !== 'fond_caisse') {
      entriesByDate[dateKey].revenus.push(e);
      entriesByDate[dateKey].totalRevenus += e.montant || 0;
      entriesByDate[dateKey].soldeJour += e.montant || 0;
    } else if (e.type === 'expense') {
      entriesByDate[dateKey].depenses.push(e);
      entriesByDate[dateKey].totalDepenses += e.montant || 0;
      entriesByDate[dateKey].soldeJour -= e.montant || 0;
    }
  });

  const datesTriees = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));
  datesTriees.forEach(date => {
    soldeCumul += entriesByDate[date].soldeJour;
    entriesByDate[date].soldeCumul = soldeCumul;
  });

  const revenusByCat = {};
  if (fondCaisse) {
    revenusByCat['fond_caisse'] = { total: fondCaisse.montant || 0, count: 1 };
  }
  revenusSansFond.forEach(e => {
    const cat = e.category || 'autre';
    if (!revenusByCat[cat]) revenusByCat[cat] = { total: 0, count: 0 };
    revenusByCat[cat].total += e.montant || 0;
    revenusByCat[cat].count += 1;
  });

  const depensesByCat = {};
  depenses.forEach(e => {
    const cat = e.category || 'autre';
    if (!depensesByCat[cat]) depensesByCat[cat] = { total: 0, count: 0 };
    depensesByCat[cat].total += e.montant || 0;
    depensesByCat[cat].count += 1;
  });

  const fluxByDay = {};
  if (fondCaisse) {
    const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
    if (!fluxByDay[firstDay]) fluxByDay[firstDay] = { revenus: 0, depenses: 0, solde: 0, entries: [], isFondDay: true };
    fluxByDay[firstDay].revenus += fondCaisse.montant || 0;
    fluxByDay[firstDay].entries.push({ ...fondCaisse, isFond: true });
  }
  entries.forEach(e => {
    const day = e.date;
    if (!fluxByDay[day]) fluxByDay[day] = { revenus: 0, depenses: 0, solde: 0, entries: [] };
    if (e.type === 'revenue' && e.category !== 'fond_caisse') {
      fluxByDay[day].revenus += e.montant || 0;
    }
    if (e.type === 'expense') {
      fluxByDay[day].depenses += e.montant || 0;
    }
    fluxByDay[day].entries.push(e);
  });
  Object.keys(fluxByDay).forEach(day => {
    fluxByDay[day].solde = fluxByDay[day].revenus - fluxByDay[day].depenses;
  });

  // ============================================================
  // SAUVEGARDE
  // ============================================================
  const handleSaveEntry = async () => {
    setErrors({});
    const newErrors = {};
    
    if (!formData.designation || formData.designation.trim() === '') {
      newErrors.designation = 'La désignation est obligatoire';
    }
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0';
    }
    if (formData.montant && isNaN(parseFloat(formData.montant))) {
      newErrors.montant = 'Le montant doit être un nombre valide';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).join(' • ');
      showAlert('error', `❌ ${errorMessages}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const entryData = {
        date: formData.date,
        type: formData.type,
        montant: parseFloat(formData.montant),
        designation: formData.designation.trim(),
        category: formData.category || 'autre',
        note: formData.note?.trim() || null
      };

      const { error } = await supabaseErp
        .from('erp_journal_caisse')
        .insert([entryData]);

      if (error) throw error;

      showAlert('success', '✅ Entrée ajoutée avec succès');
      setModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'revenue',
        montant: '',
        designation: '',
        category: 'autre',
        note: ''
      });
      setErrors({});
      await loadData();
    } catch (error) {
      console.error('❌ Erreur saveEntry:', error);
      showAlert('error', '❌ ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (errors[field]) {
      setErrors({...errors, [field]: undefined});
    }
  };

  const openDeleteConfirm = (id, designation) => {
    setConfirmDialog({ 
      open: true, 
      id: id, 
      designation: designation || 'cette entrée' 
    });
  };

  const closeConfirm = () => {
    setConfirmDialog({ open: false, id: null, designation: '' });
  };

  const deleteEntry = async () => {
    const { id } = confirmDialog;
    try {
      const { error } = await supabaseErp
        .from('erp_journal_caisse')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showAlert('success', '✅ Entrée supprimée');
      await loadData();
    } catch (error) {
      showAlert('error', 'Erreur: ' + error.message);
    }
    closeConfirm();
  };

  const moisLabel = new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const moisPrecedent = () => { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); } else setSelectedMonth(selectedMonth - 1); };
  const moisSuivant = () => { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); } else setSelectedMonth(selectedMonth + 1); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">Journal de Caisse</h1>
          <p className="text-gray-400 text-sm mt-1">Suivi quotidien de votre trésorerie</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              setModalOpen(true);
              setErrors({});
              setFormData({
                date: new Date().toISOString().split('T')[0],
                type: 'revenue',
                montant: '',
                designation: '',
                category: 'autre',
                note: ''
              });
            }} 
            className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ➕ Nouvelle entrée
          </button>
        </div>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-5 bg-[#0D1F3C] rounded-xl p-3 border border-[#1A3A6B]">
        <button onClick={moisPrecedent} className="p-2 rounded-lg bg-[#1A3A6B] text-white hover:bg-[#F0C75E] hover:text-[#071325] transition">◀</button>
        <h3 className="text-white font-bold text-lg capitalize">{moisLabel}</h3>
        <button onClick={moisSuivant} className="p-2 rounded-lg bg-[#1A3A6B] text-white hover:bg-[#F0C75E] hover:text-[#071325] transition">▶</button>
      </div>

      {/* Dashboard résumé */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { v: `${fondInitial.toLocaleString()} DT`, l: 'Fond de caisse', c: 'text-blue-400', bg: 'bg-blue-500/10', icon: '🏦' },
          { v: `${totalRevenus.toLocaleString()} DT`, l: 'Revenus du mois', c: 'text-green-400', bg: 'bg-green-500/10', icon: '📈' },
          { v: `${totalDepenses.toLocaleString()} DT`, l: 'Dépenses du mois', c: 'text-red-400', bg: 'bg-red-500/10', icon: '📉' },
          { v: `${soldeFinal.toLocaleString()} DT`, l: 'Solde final', c: soldeFinal >= 0 ? 'text-[#F0C75E]' : 'text-red-400', bg: soldeFinal >= 0 ? 'bg-[#F0C75E]/10' : 'bg-red-500/10', icon: '💰' },
          { v: entries.length, l: 'Opérations', c: 'text-purple-400', bg: 'bg-purple-500/10', icon: '📊' }
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-[#1A3A6B] text-center`}>
            <span className="text-2xl">{s.icon}</span>
            <p className={`text-lg font-bold ${s.c} mt-2`}>{s.v}</p>
            <p className="text-[10px] text-gray-400 mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* STATISTIQUES DE FLUX MOYEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
          <p className="text-blue-400 text-xs uppercase tracking-wider">📊 Revenus moyen / jour</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{moyenneRevenusParJour.toFixed(2)} DT</p>
          <p className="text-gray-500 text-[10px] mt-1">Sur {joursDansMois} jours (inclut fond de caisse)</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-4 border border-red-500/20">
          <p className="text-red-400 text-xs uppercase tracking-wider">📊 Dépenses moyen / jour</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{moyenneDepensesParJour.toFixed(2)} DT</p>
          <p className="text-gray-500 text-[10px] mt-1">Sur {joursDansMois} jours</p>
        </div>
        <div className="bg-gradient-to-br from-[#F0C75E]/10 to-yellow-600/5 rounded-xl p-4 border border-[#F0C75E]/20">
          <p className="text-[#F0C75E] text-xs uppercase tracking-wider">📊 Flux net moyen / jour</p>
          <p className="text-2xl font-bold text-[#F0C75E] mt-1">{moyenneFluxNetParJour.toFixed(2)} DT</p>
          <p className="text-gray-500 text-[10px] mt-1">{moyenneFluxParJourOuvrable.toFixed(2)} DT / jour ouvrable</p>
        </div>
      </div>

      {/* MEILLEUR / PIRE JOUR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {meilleurJour && (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/20">
            <p className="text-green-400 text-xs uppercase tracking-wider">🏆 Meilleur jour</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-white font-bold text-lg">
                  {new Date(meilleurJour.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-gray-400 text-xs">📈 +{meilleurJour.revenus.toFixed(2)} DT • 📉 -{meilleurJour.depenses.toFixed(2)} DT</p>
              </div>
              <p className="text-green-400 text-2xl font-bold">+{meilleurJour.net.toFixed(2)} DT</p>
            </div>
          </div>
        )}
        {pireJour && (
          <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs uppercase tracking-wider">📉 Pire jour</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-white font-bold text-lg">
                  {new Date(pireJour.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-gray-400 text-xs">📈 +{pireJour.revenus.toFixed(2)} DT • 📉 -{pireJour.depenses.toFixed(2)} DT</p>
              </div>
              <p className="text-red-400 text-2xl font-bold">{pireJour.net.toFixed(2)} DT</p>
            </div>
          </div>
        )}
      </div>

      {/* PRÉVISION FIN DE MOIS */}
      <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 rounded-xl p-4 border border-purple-500/20 mb-5">
        <p className="text-purple-400 text-xs uppercase tracking-wider">🔮 Prévision fin de mois</p>
        <div className="flex items-center justify-between mt-1">
          <div>
            <p className="text-gray-400 text-sm">Basé sur la moyenne actuelle</p>
            <p className="text-gray-500 text-xs">Solde actuel: {soldeFinal.toFixed(2)} DT</p>
          </div>
          <p className={`text-2xl font-bold ${previsionFinMois >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {previsionFinMois.toFixed(2)} DT
          </p>
        </div>
        <div className="mt-2 w-full h-1.5 bg-[#1A3A6B] rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((soldeFinal / (previsionFinMois || 1)) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: 'journal', label: '📋 Journal' },
          { id: 'revenus', label: '📈 Revenus' },
          { id: 'depenses', label: '📉 Dépenses' },
          { id: 'synthese', label: '📊 Synthèse' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#F0C75E] text-[#071325] shadow-lg' : 'bg-[#0D1F3C] text-gray-400 border border-[#1A3A6B] hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* JOURNAL - TABLEAU REVENUS | DÉPENSES (2 COLONNES) */}
      {/* ============================================================ */}
      {activeTab === 'journal' && (
        <div className="space-y-2">
          
          {/* Filtre type */}
          <div className="flex gap-2 mb-4">
            {[{ v: 'all', l: '📋 Tout' }, { v: 'revenue', l: '📈 Revenus' }, { v: 'expense', l: '📉 Dépenses' }].map(f => (
              <button key={f.v} onClick={() => setFilterType(f.v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === f.v ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#071325] text-gray-400 hover:text-white'}`}>
                {f.l}
              </button>
            ))}
          </div>

          {/* Tableau 2 colonnes : Revenus | Dépenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* ========== COLONNE REVENUS ========== */}
            {(filterType === 'all' || filterType === 'revenue') && (
              <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] overflow-hidden">
                <div className="bg-green-500/10 px-5 py-3 border-b border-green-500/20 flex items-center justify-between">
                  <h3 className="text-green-400 font-bold text-lg">📈 Revenus</h3>
                  <span className="text-green-400 text-xl font-black">{totalRevenus.toLocaleString()} DT</span>
                </div>
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {datesTriees.map(date => {
                    const dayData = entriesByDate[date];
                    if (dayData.revenus.length === 0) return null;
                    const dateObj = new Date(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    const hasFond = dayData.revenus.some(e => e.isFond);
                    
                    return (
                      <div key={`rev-${date}`} className={`border-b border-[#1A3A6B]/30 last:border-0 ${isToday ? 'bg-[#F0C75E]/5' : ''}`}>
                        <div className="flex items-center justify-between px-4 py-2 bg-[#0A1628]/50">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-black ${isToday ? 'text-[#F0C75E]' : 'text-white'}`}>
                              {String(dateObj.getDate()).padStart(2, '0')}
                            </span>
                            <span className="text-gray-400 text-sm capitalize">{dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                            {isToday && <span className="text-[10px] text-[#F0C75E] bg-[#F0C75E]/20 px-2 py-0.5 rounded-full">Auj.</span>}
                            {hasFond && <span className="text-[10px] text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">🏦 Fond</span>}
                          </div>
                          <span className="text-[#F0C75E] text-base font-black">+{dayData.totalRevenus.toLocaleString()} DT</span>
                        </div>
                        {dayData.revenus.sort((a, b) => (a.id || 0) - (b.id || 0)).map((e, i) => (
                          <div key={i} className={`flex items-center justify-between px-5 py-2.5 hover:bg-[#1A3A6B]/20 transition group ${e.isFond ? 'bg-blue-500/5' : ''}`}>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${e.isFond ? 'text-blue-400' : 'text-white'}`}>
                                {e.designation}
                                {e.isFond && ' 🏦'}
                              </span>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-gray-500 text-xs">{e.category}</span>
                                {e.note && <span className="text-gray-600 text-xs truncate">• {e.note}</span>}
                              </div>
                            </div>
                            <span className={`text-sm font-semibold ml-3 flex-shrink-0 ${e.isFond ? 'text-blue-400' : 'text-green-400'}`}>
                              +{e.montant?.toLocaleString()}
                            </span>
                            {!e.isFond && (
                              <button 
                                onClick={() => openDeleteConfirm(e.id, e.designation)} 
                                className="ml-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs flex-shrink-0"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========== COLONNE DÉPENSES ========== */}
            {(filterType === 'all' || filterType === 'expense') && (
              <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] overflow-hidden">
                <div className="bg-red-500/10 px-5 py-3 border-b border-red-500/20 flex items-center justify-between">
                  <h3 className="text-red-400 font-bold text-lg">📉 Dépenses</h3>
                  <span className="text-red-400 text-xl font-black">{totalDepenses.toLocaleString()} DT</span>
                </div>
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {datesTriees.map(date => {
                    const dayData = entriesByDate[date];
                    if (dayData.depenses.length === 0) return null;
                    const dateObj = new Date(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <div key={`dep-${date}`} className={`border-b border-[#1A3A6B]/30 last:border-0 ${isToday ? 'bg-[#F0C75E]/5' : ''}`}>
                        <div className="flex items-center justify-between px-4 py-2 bg-[#0A1628]/50">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-black ${isToday ? 'text-[#F0C75E]' : 'text-white'}`}>
                              {String(dateObj.getDate()).padStart(2, '0')}
                            </span>
                            <span className="text-gray-400 text-sm capitalize">{dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                            {isToday && <span className="text-[10px] text-[#F0C75E] bg-[#F0C75E]/20 px-2 py-0.5 rounded-full">Auj.</span>}
                          </div>
                          <span className="text-orange-400 text-base font-black">-{dayData.totalDepenses.toLocaleString()} DT</span>
                        </div>
                        {dayData.depenses.sort((a, b) => (a.id || 0) - (b.id || 0)).map((e, i) => (
                          <div key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-[#1A3A6B]/20 transition group">
                            <div className="flex-1 min-w-0">
                              <span className="text-white text-sm">{e.designation}</span>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-gray-500 text-xs">{e.category}</span>
                                {e.note && <span className="text-gray-600 text-xs truncate">• {e.note}</span>}
                              </div>
                            </div>
                            <span className="text-red-400 text-sm font-semibold ml-3 flex-shrink-0">-{e.montant?.toLocaleString()}</span>
                            <button 
                              onClick={() => openDeleteConfirm(e.id, e.designation)} 
                              className="ml-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REVENUS PAR CATÉGORIE */}
      {/* ============================================================ */}
      {activeTab === 'revenus' && (
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg">📈 Revenus par catégorie</h3>
          {Object.entries(revenusByCat).sort(([,a], [,b]) => b.total - a.total).map(([cat, data]) => (
            <div key={cat} className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium capitalize">
                  {cat === 'fond_caisse' ? '🏦 Fond de caisse' : cat}
                </span>
                <span className="text-green-400 font-bold">{data.total.toLocaleString()} DT</span>
              </div>
              <div className="w-full h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${cat === 'fond_caisse' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`} 
                  style={{ width: `${Math.min((data.total / (totalRevenus || 1)) * 100, 100)}%` }} />
              </div>
              <p className="text-gray-500 text-[10px] mt-1">{data.count} opérations • {((data.total / (totalRevenus || 1)) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* DÉPENSES PAR CATÉGORIE */}
      {/* ============================================================ */}
      {activeTab === 'depenses' && (
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg">📉 Dépenses par catégorie</h3>
          {Object.entries(depensesByCat).sort(([,a], [,b]) => b.total - a.total).map(([cat, data]) => (
            <div key={cat} className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium capitalize">{cat}</span>
                <span className="text-red-400 font-bold">{data.total.toLocaleString()} DT</span>
              </div>
              <div className="w-full h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${Math.min((data.total / (totalDepenses || 1)) * 100, 100)}%` }} />
              </div>
              <p className="text-gray-500 text-[10px] mt-1">{data.count} opérations • {((data.total / (totalDepenses || 1)) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* SYNTHÈSE */}
      {/* ============================================================ */}
      {activeTab === 'synthese' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
              <h3 className="text-white font-bold text-lg mb-4">📈 Top revenus</h3>
              <div className="space-y-2">
                {revenusSansFond.sort((a, b) => b.montant - a.montant).slice(0, 10).map((e, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0A1628] rounded-lg p-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#F0C75E] text-xs font-bold w-5">{i+1}</span>
                      <span className="text-white text-xs truncate">{e.designation}</span>
                    </div>
                    <span className="text-green-400 text-xs font-semibold ml-2">+{e.montant?.toLocaleString()} DT</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
              <h3 className="text-white font-bold text-lg mb-4">📉 Top dépenses</h3>
              <div className="space-y-2">
                {depenses.sort((a, b) => b.montant - a.montant).slice(0, 10).map((e, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0A1628] rounded-lg p-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#F0C75E] text-xs font-bold w-5">{i+1}</span>
                      <span className="text-white text-xs truncate">{e.designation}</span>
                    </div>
                    <span className="text-red-400 text-xs font-semibold ml-2">-{e.montant?.toLocaleString()} DT</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé flux quotidien */}
          <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
            <h3 className="text-white font-bold text-lg mb-4">📅 Flux quotidien</h3>
            <div className="space-y-2">
              {Object.entries(fluxByDay).sort().map(([day, data]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-16">{new Date(day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  <div className="flex-1 h-6 bg-[#0A1628] rounded-lg overflow-hidden flex">
                    {data.revenus > 0 && (
                      <div className="h-full bg-green-500/30 flex items-center justify-end px-2 text-[10px] text-green-400 font-bold"
                        style={{ width: `${Math.min((data.revenus / (totalRevenus || 1)) * 100, 100)}%` }}>
                        +{data.revenus.toLocaleString()}
                      </div>
                    )}
                    {data.depenses > 0 && (
                      <div className="h-full bg-red-500/30 flex items-center justify-start px-2 text-[10px] text-red-400 font-bold"
                        style={{ width: `${Math.min((data.depenses / (totalDepenses || 1)) * 100, 100)}%` }}>
                        -{data.depenses.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold w-16 text-right ${data.solde >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.solde >= 0 ? '+' : ''}{data.solde.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL AJOUT ENTRÉE */}
      {/* ============================================================ */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="➕ Nouvelle entrée" size="medium">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Date</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => handleFieldChange('date', e.target.value)} 
                className={`w-full p-2.5 rounded-lg bg-[#071325] border text-white text-sm focus:ring-2 focus:ring-[#F0C75E] ${
                  errors.date ? 'border-red-500' : 'border-[#1A3A6B]'
                }`} 
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Type</label>
              <select 
                value={formData.type} 
                onChange={e => handleFieldChange('type', e.target.value)} 
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:ring-2 focus:ring-[#F0C75E]"
              >
                <option value="revenue">📈 Revenu</option>
                <option value="expense">📉 Dépense</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs mb-1">
              Désignation <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={formData.designation} 
              onChange={e => handleFieldChange('designation', e.target.value)} 
              className={`w-full p-2.5 rounded-lg bg-[#071325] border text-white focus:ring-2 focus:ring-[#F0C75E] ${
                errors.designation ? 'border-red-500' : 'border-[#1A3A6B]'
              }`} 
              placeholder="Ex: Vente de produits, Achat de matériel..."
            />
            {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Montant <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                step="0.001" 
                value={formData.montant} 
                onChange={e => handleFieldChange('montant', e.target.value)} 
                className={`w-full p-2.5 rounded-lg bg-[#071325] border text-white focus:ring-2 focus:ring-[#F0C75E] ${
                  errors.montant ? 'border-red-500' : 'border-[#1A3A6B]'
                }`} 
                placeholder="0.000"
              />
              {errors.montant && <p className="text-red-400 text-xs mt-1">{errors.montant}</p>}
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Catégorie</label>
              <select 
                value={formData.category} 
                onChange={e => handleFieldChange('category', e.target.value)} 
                className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:ring-2 focus:ring-[#F0C75E]"
              >
                <option value="commande">Commande</option>
                <option value="impression">Impression</option>
                <option value="design">Design</option>
                <option value="textile">Textile</option>
                <option value="signaletique">Signalétique</option>
                <option value="goodies">Goodies</option>
                <option value="achat_materiel">Achat matériel</option>
                <option value="electricite">Électricité</option>
                <option value="loyer">Loyer</option>
                <option value="transport">Transport</option>
                <option value="fond_caisse">Fond de caisse</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs mb-1">Note (optionnelle)</label>
            <input 
              type="text" 
              value={formData.note} 
              onChange={e => handleFieldChange('note', e.target.value)} 
              className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white focus:ring-2 focus:ring-[#F0C75E]" 
              placeholder="Informations supplémentaires..."
            />
          </div>
          
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <p className="text-red-400 text-xs">
                ⚠️ Veuillez corriger les champs en rouge
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2 border-t border-[#1A3A6B]">
            <button 
              type="button"
              onClick={() => {
                setModalOpen(false);
                setErrors({});
              }} 
              className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition"
            >
              Annuler
            </button>
            <button 
              type="button"
              onClick={handleSaveEntry}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-[#071325] border-t-transparent rounded-full"></span>
                  Enregistrement...
                </>
              ) : (
                '💾 Enregistrer'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ConfirmDialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.open} 
        onClose={closeConfirm}
        onConfirm={deleteEntry} 
        title="Confirmer la suppression" 
        message={`Supprimer définitivement "${confirmDialog.designation}" ?`} 
      />
    </div>
  );
}