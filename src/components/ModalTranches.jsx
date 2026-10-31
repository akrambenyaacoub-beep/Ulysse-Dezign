// src/components/ModalTranches.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import Modal from './Modal';
import { showAlert } from './AlertModal';

export default function ModalTranches({ isOpen, onClose, depense, fournisseur, onSave }) {
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [montantRestant, setMontantRestant] = useState(0);
  const [newTranche, setNewTranche] = useState({
    montant: '', date_prevue: '', mode_paiement: 'especes'
  });

  useEffect(() => {
    if (depense) {
      loadTranches();
      const paye = (depense.tranches || []).reduce((s, t) => s + (t.statut === 'payee' ? t.montant : 0), 0);
      setMontantRestant(depense.montant - paye);
    }
  }, [depense]);

  async function loadTranches() {
    setLoading(true);
    const { data } = await supabaseErp
      .from('erp_tranches_paiement')
      .select('*')
      .eq('depense_id', depense.id)
      .order('numero_tranche');
    setTranches(data || []);
    setLoading(false);
  }

  async function addTranche() {
    if (!newTranche.montant || parseFloat(newTranche.montant) <= 0) {
      showAlert('error', 'Montant obligatoire');
      return;
    }

    const totalDeja = tranches.reduce((s, t) => s + parseFloat(t.montant), 0);
    const nouveauTotal = totalDeja + parseFloat(newTranche.montant);

    if (nouveauTotal > depense.montant) {
      showAlert('error', `Le total des tranches (${nouveauTotal.toFixed(3)} DT) dépasse le montant de la dette (${depense.montant?.toFixed(3)} DT)`);
      return;
    }

    const { error } = await supabaseErp.from('erp_tranches_paiement').insert([{
      depense_id: depense.id,
      fournisseur_id: depense.fournisseur_id,
      numero_tranche: tranches.length + 1,
      montant: parseFloat(newTranche.montant),
      date_prevue: newTranche.date_prevue || null,
      mode_paiement: newTranche.mode_paiement,
      statut: 'en_attente'
    }]);

    if (error) { showAlert('error', error.message); return; }

    showAlert('success', '✅ Tranche ajoutée');
    setNewTranche({ montant: '', date_prevue: '', mode_paiement: 'especes' });
    loadTranches();
    if (onSave) onSave();
  }

  async function payerTranche(trancheId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabaseErp
      .from('erp_tranches_paiement')
      .update({ statut: 'payee', date_paiement: today })
      .eq('id', trancheId);

    if (error) { showAlert('error', error.message); return; }
    showAlert('success', '✅ Tranche payée');

    // Vérifier si toutes les tranches sont payées
    const { data: allTranches } = await supabaseErp
      .from('erp_tranches_paiement')
      .select('*')
      .eq('depense_id', depense.id);

    const totalPaye = (allTranches || []).filter(t => t.statut === 'payee').reduce((s, t) => s + t.montant, 0);
    
    if (Math.abs(totalPaye - depense.montant) < 0.001) {
      await supabaseErp.from('erp_depenses').update({ statut_paiement: 'paye' }).eq('id', depense.id);
      showAlert('success', '🎉 Dette entièrement payée !');
    } else if (totalPaye > 0) {
      await supabaseErp.from('erp_depenses').update({ statut_paiement: 'partiel' }).eq('id', depense.id);
    }

    loadTranches();
    if (onSave) onSave();
  }

  async function deleteTranche(trancheId) {
    const { error } = await supabaseErp
      .from('erp_tranches_paiement')
      .delete()
      .eq('id', trancheId)
      .eq('statut', 'en_attente'); // Seulement les non payées

    if (error) { showAlert('error', 'Impossible de supprimer une tranche payée'); return; }
    showAlert('success', '✅ Tranche supprimée');
    loadTranches();
    if (onSave) onSave();
  }

  const totalTranches = tranches.reduce((s, t) => s + parseFloat(t.montant), 0);
  const totalPaye = tranches.filter(t => t.statut === 'payee').reduce((s, t) => s + t.montant, 0);
  const resteAPayer = depense.montant - totalPaye;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💰 Paiement par tranches" size="large">
      <div className="space-y-4">
        {/* Résumé */}
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#1A3A6B]">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏢</span>
            <div>
              <p className="text-white font-bold">{fournisseur?.nom || 'Fournisseur'}</p>
              <p className="text-gray-400 text-sm">{depense?.designation}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[#F0C75E] text-lg font-bold">{depense?.montant?.toLocaleString()} DT</p>
              <p className="text-gray-500 text-[10px]">Montant total</p>
            </div>
            <div>
              <p className="text-green-400 text-lg font-bold">{totalPaye.toLocaleString()} DT</p>
              <p className="text-gray-500 text-[10px]">Déjà payé</p>
            </div>
            <div>
              <p className="text-red-400 text-lg font-bold">{resteAPayer.toLocaleString()} DT</p>
              <p className="text-gray-500 text-[10px]">Reste à payer</p>
            </div>
          </div>
          {/* Barre de progression */}
          <div className="mt-3 w-full h-3 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min((totalPaye / (depense?.montant || 1)) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Ajouter une tranche */}
        <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
          <h4 className="text-white text-sm font-semibold mb-3">➕ Nouvelle tranche</h4>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" step="0.001" placeholder="Montant" value={newTranche.montant}
              onChange={e => setNewTranche({ ...newTranche, montant: e.target.value })}
              className="p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" />
            <input type="date" value={newTranche.date_prevue}
              onChange={e => setNewTranche({ ...newTranche, date_prevue: e.target.value })}
              className="p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm" />
            <button onClick={addTranche} className="p-2 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-semibold">
              Ajouter
            </button>
          </div>
          <p className="text-gray-500 text-[10px] mt-1">Reste disponible : {(depense?.montant - totalTranches).toFixed(3)} DT</p>
        </div>

        {/* Liste des tranches */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {tranches.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Aucune tranche</p>
          ) : (
            tranches.map((t, i) => (
              <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                t.statut === 'payee' ? 'bg-green-500/10 border-green-500/30' :
                t.statut === 'en_retard' ? 'bg-red-500/10 border-red-500/30' :
                'bg-[#0A1628] border-[#1A3A6B]'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-[#F0C75E] font-bold text-sm">#{t.numero_tranche}</span>
                  <div>
                    <p className="text-white font-medium">{t.montant?.toLocaleString()} DT</p>
                    {t.date_prevue && <p className="text-gray-500 text-[10px]">📅 {new Date(t.date_prevue).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.statut === 'payee' ? (
                    <span className="text-green-400 text-xs">✅ Payée le {new Date(t.date_paiement).toLocaleDateString('fr-FR')}</span>
                  ) : (
                    <>
                      <button onClick={() => payerTranche(t.id)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600">
                        💰 Payer
                      </button>
                      <button onClick={() => deleteTranche(t.id)} className="p-1 text-red-400 hover:text-red-300 text-xs">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}