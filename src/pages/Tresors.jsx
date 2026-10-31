// src/pages/Tresors.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useTresorerie } from '../hooks/useTresorerie';
import { useAlertes } from '../hooks/useAlertes';
import PopupAlerte from '../components/PopupAlerte';
import Modal from '../components/Modal';
import { showAlert } from '../components/AlertModal';

export default function Tresors() {
  const { stats, loading, refresh } = useTresorerie();
  const { alertes, showPopup, currentAlerte, dismissAlerte, closePopup } = useAlertes();
  
  const [depenses, setDepenses] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [formData, setFormData] = useState({
    designation: '', montant: '', categorie: 'achat_materiel',
    fournisseur_id: '', statut_paiement: 'non_paye',
    date: new Date().toISOString().split('T')[0], date_echeance: '', notes: ''
  });

  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    loadDetails();
  }, []);

  async function loadDetails() {
    try {
      const [depensesRes, commandesRes, fournisseursRes] = await Promise.all([
        supabaseErp.from('erp_depenses').select('*, erp_fournisseurs(nom)').order('date', { ascending: false }).limit(20),
        supabaseErp.from('erp_commandes').select('*, erp_clients(nom, prenom, entreprise)').order('created_at', { ascending: false }).limit(10),
        supabaseErp.from('erp_fournisseurs').select('*').order('nom')
      ]);
      setDepenses(depensesRes.data || []);
      setCommandes(commandesRes.data || []);
      setFournisseurs(fournisseursRes.data || []);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  }

  async function saveDepense() {
    if (!formData.designation || !formData.montant) {
      showAlert('error', 'Désignation et montant obligatoires');
      return;
    }
    try {
      const { data, error } = await supabaseErp.from('erp_depenses').insert([{
        designation: formData.designation,
        montant: parseFloat(formData.montant),
        date: formData.date,
        categorie: formData.categorie,
        fournisseur_id: formData.fournisseur_id || null,
        statut_paiement: formData.statut_paiement,
        date_echeance: formData.date_echeance || null,
        notes: formData.notes
      }]).select().single();

      if (error) throw error;

      // Si payée, ajouter au journal de caisse
      if (formData.statut_paiement === 'paye') {
        await supabaseErp.from('erp_journal_caisse').insert([{
          date: formData.date,
          type: 'expense',
          montant: parseFloat(formData.montant),
          designation: formData.designation,
          category: formData.categorie,
          depense_id: data.id,
          fournisseur_id: formData.fournisseur_id || null
        }]);
      }

      showAlert('success', '✅ Dépense ajoutée');
      setModalOpen(false);
      setFormData({ designation: '', montant: '', categorie: 'achat_materiel', fournisseur_id: '', statut_paiement: 'non_paye', date: new Date().toISOString().split('T')[0], date_echeance: '', notes: '' });
      loadDetails();
      refresh();
    } catch (error) {
      showAlert('error', 'Erreur: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Popup Alerte */}
      {showPopup && currentAlerte && (
        <PopupAlerte 
          alerte={currentAlerte} 
          onClose={closePopup} 
          onDismiss={() => dismissAlerte(currentAlerte.titre)} 
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">Trésorerie</h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard financier global</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold">
          ➕ Nouvelle dépense
        </button>
      </div>

      {/* Alertes rapides */}
      {alertes.length > 0 && (
        <div className="mb-4 space-y-2">
          {alertes.map((alerte, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
              alerte.couleur === 'red' ? 'bg-red-500/10 border-red-500/30' :
              alerte.couleur === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <span className="text-xl">{alerte.type === 'danger' ? '🚨' : alerte.type === 'warning' ? '⚠️' : '💰'}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{alerte.titre}</p>
                <p className="text-gray-400 text-xs">{alerte.message?.substring(0, 100)}</p>
              </div>
              <button onClick={() => dismissAlerte(alerte.titre)} className="text-gray-400 hover:text-white text-xs">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'revenus', label: '💰 Revenus' },
          { id: 'depenses', label: '💸 Dépenses' },
          { id: 'flux', label: '📈 Flux' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#F0C75E] text-[#071325] shadow-lg' : 'bg-[#0D1F3C] text-gray-400 border border-[#1A3A6B] hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* DASHBOARD */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          
          {/* Cartes principales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { v: `${stats.soldeActuel.toLocaleString()} DT`, l: 'Solde actuel', c: stats.soldeActuel >= 0 ? 'text-green-400' : 'text-red-400', bg: 'bg-[#0D1F3C]', icon: '🏦' },
              { v: `${stats.revenusMois.toLocaleString()} DT`, l: 'Revenus ce mois', c: 'text-green-400', bg: 'bg-green-500/10', icon: '📈' },
              { v: `${stats.depensesMois.toLocaleString()} DT`, l: 'Dépenses ce mois', c: 'text-red-400', bg: 'bg-red-500/10', icon: '📉' },
              { v: `${stats.prevision.toLocaleString()} DT`, l: 'Prévision fin mois', c: 'text-[#F0C75E]', bg: 'bg-[#F0C75E]/10', icon: '🔮' },
              { v: stats.fluxMensuels.length, l: 'Mois analysés', c: 'text-blue-400', bg: 'bg-blue-500/10', icon: '📊' }
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-4 border border-[#1A3A6B] text-center`}>
                <span className="text-2xl">{s.icon}</span>
                <p className={`text-lg font-bold ${s.c} mt-2`}>{s.v}</p>
                <p className="text-[10px] text-gray-400 mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Graphique flux mensuels */}
          <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
            <h3 className="text-white font-bold text-lg mb-4">📈 Évolution sur 6 mois</h3>
            <div className="space-y-3">
              {stats.fluxMensuels.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-12">{m.mois}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-6 bg-[#0A1628] rounded-lg overflow-hidden flex">
                      <div className="h-full bg-green-500/30 flex items-center justify-end px-2 text-[10px] text-green-400 font-bold"
                        style={{ width: `${Math.min((m.total_revenus / (stats.revenusMois || 1)) * 100, 100)}%` }}>
                        {m.total_revenus > 0 ? `+${m.total_revenus.toLocaleString()}` : ''}
                      </div>
                      <div className="h-full bg-red-500/30 flex items-center justify-start px-2 text-[10px] text-red-400 font-bold"
                        style={{ width: `${Math.min((m.total_depenses / (stats.depensesMois || 1)) * 100, 100)}%` }}>
                        {m.total_depenses > 0 ? `-${m.total_depenses.toLocaleString()}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top clients + Top fournisseurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
              <h3 className="text-white font-bold text-lg mb-3">🏆 Top clients</h3>
              {stats.topClients?.length > 0 ? (
                <div className="space-y-2">
                  {stats.topClients.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0A1628] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#F0C75E] font-bold">{i+1}</span>
                        <span className="text-white text-sm">{c.erp_clients?.entreprise || `${c.erp_clients?.nom || ''} ${c.erp_clients?.prenom || ''}`}</span>
                      </div>
                      <span className="text-[#F0C75E] font-semibold text-sm">{c.total_ttc?.toLocaleString()} DT</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">Aucune donnée</p>}
            </div>

            <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
              <h3 className="text-white font-bold text-lg mb-3">🏢 Top fournisseurs</h3>
              {stats.topFournisseurs?.length > 0 ? (
                <div className="space-y-2">
                  {stats.topFournisseurs.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0A1628] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#F0C75E] font-bold">{i+1}</span>
                        <span className="text-white text-sm">{f.erp_fournisseurs?.nom || 'N/A'}</span>
                      </div>
                      <span className="text-red-400 font-semibold text-sm">{f.montant?.toLocaleString()} DT</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">Aucune donnée</p>}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REVENUS */}
      {/* ============================================================ */}
      {activeTab === 'revenus' && (
        <div className="bg-[#0D1F3C] border border-[#1A3A6B] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#071325]"><tr>
              <th className="p-3 text-left text-gray-400 text-xs">Date</th>
              <th className="p-3 text-left text-gray-400 text-xs">Commande</th>
              <th className="p-3 text-left text-gray-400 text-xs">Client</th>
              <th className="p-3 text-right text-gray-400 text-xs">Montant</th>
              <th className="p-3 text-left text-gray-400 text-xs">Statut</th>
            </tr></thead>
            <tbody className="divide-y divide-[#1A3A6B]">
              {commandes.map(c => (
                <tr key={c.id} className="hover:bg-[#1A3A6B]/20">
                  <td className="p-3 text-white text-xs">{new Date(c.date_commande).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 text-white text-sm font-mono">{c.numero}</td>
                  <td className="p-3 text-gray-300 text-xs">{c.erp_clients?.entreprise || `${c.erp_clients?.nom || ''} ${c.erp_clients?.prenom || ''}`}</td>
                  <td className="p-3 text-green-400 text-sm font-semibold text-right">+{c.total_ttc?.toLocaleString()} DT</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${c.status === 'paye' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* DÉPENSES */}
      {/* ============================================================ */}
      {activeTab === 'depenses' && (
        <div className="bg-[#0D1F3C] border border-[#1A3A6B] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#071325]"><tr>
              <th className="p-3 text-left text-gray-400 text-xs">Date</th>
              <th className="p-3 text-left text-gray-400 text-xs">Désignation</th>
              <th className="p-3 text-left text-gray-400 text-xs">Fournisseur</th>
              <th className="p-3 text-right text-gray-400 text-xs">Montant</th>
              <th className="p-3 text-left text-gray-400 text-xs">Statut</th>
            </tr></thead>
            <tbody className="divide-y divide-[#1A3A6B]">
              {depenses.map(d => (
                <tr key={d.id} className="hover:bg-[#1A3A6B]/20">
                  <td className="p-3 text-white text-xs">{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 text-white text-sm">{d.designation}</td>
                  <td className="p-3 text-gray-300 text-xs">{d.erp_fournisseurs?.nom || '-'}</td>
                  <td className="p-3 text-red-400 text-sm font-semibold text-right">-{d.montant?.toLocaleString()} DT</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${d.statut_paiement === 'paye' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{d.statut_paiement}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* FLUX */}
      {/* ============================================================ */}
      {activeTab === 'flux' && (
        <div className="bg-[#0D1F3C] rounded-xl p-5 border border-[#1A3A6B]">
          <h3 className="text-white font-bold text-lg mb-4">📈 Flux mensuels détaillés</h3>
          <div className="space-y-4">
            {stats.fluxMensuels.map((m, i) => (
              <div key={i} className="bg-[#0A1628] rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-bold capitalize">{m.mois}</h4>
                  <span className={`text-lg font-bold ${(m.total_revenus - m.total_depenses) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(m.total_revenus - m.total_depenses)?.toLocaleString()} DT
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-green-500/10 rounded-lg p-2">
                    <p className="text-green-400 font-bold">+{m.total_revenus?.toLocaleString()}</p>
                    <p className="text-gray-500">Revenus</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-2">
                    <p className="text-red-400 font-bold">-{m.total_depenses?.toLocaleString()}</p>
                    <p className="text-gray-500">Dépenses</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-2">
                    <p className="text-blue-400 font-bold">{m.nb_operations}</p>
                    <p className="text-gray-500">Opérations</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Dépense rapide */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="➕ Nouvelle dépense" size="medium">
        <div className="space-y-3">
          <div><label className="block text-gray-400 text-xs mb-1">Désignation *</label><input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-gray-400 text-xs mb-1">Montant *</label><input type="number" step="0.001" value={formData.montant} onChange={e => setFormData({...formData, montant: e.target.value})} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div>
            <div><label className="block text-gray-400 text-xs mb-1">Statut</label><select value={formData.statut_paiement} onChange={e => setFormData({...formData, statut_paiement: e.target.value})} className="w-full p-2.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm"><option value="non_paye">Non payé</option><option value="paye">Payé</option></select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg">Annuler</button><button onClick={saveDepense} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold">Enregistrer</button></div>
        </div>
      </Modal>
    </div>
  );
}