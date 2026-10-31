// src/components/EtatFournisseurPDF.jsx
import { useState, useEffect, useRef } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import Modal from '../components/Modal';

export default function EtatFournisseurPDF({ fournisseurId, onClose }) {
  const [fournisseur, setFournisseur] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('all'); // all | mois | annee
  const printRef = useRef(null);

  useEffect(() => {
    if (fournisseurId) loadData();
  }, [fournisseurId, periode]);

  async function loadData() {
    setLoading(true);
    try {
      // Fournisseur
      const { data: fournisseurData } = await supabaseErp
        .from('erp_fournisseurs')
        .select('*')
        .eq('id', fournisseurId)
        .single();

      // Dépenses du fournisseur
      let query = supabaseErp
        .from('erp_depenses')
        .select('*')
        .eq('fournisseur_id', fournisseurId)
        .order('date', { ascending: false });

      // Filtrer par période
      const now = new Date();
      if (periode === 'mois') {
        query = query.gte('date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      } else if (periode === 'annee') {
        query = query.gte('date', new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
      }

      const { data: depensesData } = await query;
      
      setFournisseur(fournisseurData);
      setDepenses(depensesData || []);

      // Simuler des paiements (journal caisse)
      const { data: journalData } = await supabaseErp
        .from('erp_journal_caisse')
        .select('*')
        .eq('type', 'expense')
        .order('date', { ascending: false });

      setPaiements(journalData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculs
  const totalDepenses = depenses.reduce((s, d) => s + (d.montant || 0), 0);
  const totalPaye = depenses.filter(d => d.statut_paiement === 'paye').reduce((s, d) => s + (d.montant || 0), 0);
  const totalRestant = depenses.filter(d => d.statut_paiement !== 'paye').reduce((s, d) => s + (d.montant || 0), 0);
  const nbDepenses = depenses.length;
  const nbEnRetard = depenses.filter(d => {
    if (!d.date_echeance || d.statut_paiement === 'paye') return false;
    return new Date(d.date_echeance) < new Date();
  }).length;

  // Par catégorie
  const categories = {};
  depenses.forEach(d => {
    const cat = d.categorie || 'autre';
    if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
    categories[cat].total += d.montant || 0;
    categories[cat].count += 1;
  });

  // Par mois (6 derniers)
  const moisStats = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    moisStats[key] = { mois: key, total: 0, count: 0, label: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) };
  }
  depenses.forEach(d => {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (moisStats[key]) {
      moisStats[key].total += d.montant || 0;
      moisStats[key].count += 1;
    }
  });

  function handlePrint() {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const content = document.getElementById('etat-fournisseur-print')?.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>État ${fournisseur?.nom}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;color:#1a1a1a}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #ddd;padding:8px;font-size:11px;text-align:left}th{background:#f5f5f5}.text-right{text-align:right}.text-center{text-align:center}.total{font-weight:bold;background:#fffde7}.header{display:flex;justify-content:space-between;margin-bottom:20px}h1{color:#b8860b}h2{font-size:16px}.badge{padding:2px 8px;border-radius:12px;font-size:10px}.paye{background:#e8f5e9;color:#2e7d32}.non_paye{background:#ffebee;color:#c62828}.bar{height:8px;background:#e0e0e0;border-radius:4px;margin:4px 0}.bar-fill{height:100%;background:#b8860b;border-radius:4px}@media print{body{print-color-adjust:exact}}</style>
      </head><body>${content}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F0C75E] border-t-transparent"></div></div>;
  }

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          {[{v:'all',l:'Tout'},{v:'annee',l:'Cette année'},{v:'mois',l:'Ce mois'}].map(p => (
            <button key={p.v} onClick={() => setPeriode(p.v)}
              className={`px-3 py-1.5 rounded-lg text-xs ${periode===p.v?'bg-[#F0C75E] text-[#071325]':'bg-[#1A3A6B] text-white'}`}>
              {p.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="px-3 py-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-xs font-semibold">🖨️ Imprimer PDF</button>
          <button onClick={onClose} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs">✕</button>
        </div>
      </div>

      {/* Contenu imprimable */}
      <div id="etat-fournisseur-print" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px', background: '#fff', color: '#1a1a1a' }}>
        
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '3px solid #b8860b', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#b8860b', margin: '0 0 5px' }}>ÉTAT FOURNISSEUR</h1>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Date : {new Date().toLocaleDateString('fr-FR')}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>Période : {periode === 'all' ? 'Tout l\'historique' : periode === 'annee' ? 'Cette année' : 'Ce mois'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px' }}>{fournisseur?.nom}</h2>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{fournisseur?.contact || ''}</p>
            <p style={{ fontSize: '11px', color: '#666', margin: '2px 0' }}>{fournisseur?.telephone || ''} | {fournisseur?.email || ''}</p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{fournisseur?.adresse || ''}</p>
          </div>
        </div>

        {/* Résumé */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total dépenses', value: `${totalDepenses.toLocaleString()} DT`, color: '#b8860b' },
            { label: 'Total payé', value: `${totalPaye.toLocaleString()} DT`, color: '#2e7d32' },
            { label: 'Reste à payer', value: `${totalRestant.toLocaleString()} DT`, color: '#c62828' },
            { label: 'Nb dépenses', value: nbDepenses, color: '#1565c0' },
            { label: 'En retard', value: nbEnRetard, color: '#e65100' }
          ].map((s, i) => (
            <div key={i} style={{ flex: '1', minWidth: '100px', background: '#fafafa', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Graphique évolution mensuelle */}
        <div style={{ marginBottom: '20px', background: '#fafafa', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: '#333', margin: '0 0 10px' }}>📊 Évolution mensuelle (6 derniers mois)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {Object.values(moisStats).map((m, i) => {
              const maxTotal = Math.max(...Object.values(moisStats).map(x => x.total), 1);
              const height = (m.total / maxTotal) * 100;
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '50px', height: `${height}%`, background: 'linear-gradient(to top, #b8860b, #f0c75e)', borderRadius: '4px 4px 0 0', minHeight: m.total > 0 ? '8px' : '0', transition: 'all 0.3s' }} title={`${m.total.toLocaleString()} DT`} />
                  </div>
                  <p style={{ fontSize: '9px', color: '#999', margin: '4px 0 0' }}>{m.label}</p>
                  <p style={{ fontSize: '9px', color: '#b8860b', fontWeight: 'bold', margin: 0 }}>{m.total > 0 ? `${m.total.toLocaleString()}` : '-'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau des dépenses */}
        <h3 style={{ fontSize: '14px', color: '#333', margin: '0 0 10px' }}>📋 Détail des dépenses ({depenses.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '8px', fontSize: '10px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '8px', fontSize: '10px', textAlign: 'left' }}>Désignation</th>
              <th style={{ padding: '8px', fontSize: '10px', textAlign: 'left' }}>Catégorie</th>
              <th style={{ padding: '8px', fontSize: '10px', textAlign: 'right' }}>Montant</th>
              <th style={{ padding: '8px', fontSize: '10px', textAlign: 'center' }}>Statut</th>
              <th style={{ padding: '8px', fontSize: '10px', textAlign: 'left' }}>Échéance</th>
            </tr>
          </thead>
          <tbody>
            {depenses.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '6px 8px', fontSize: '10px' }}>{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding: '6px 8px', fontSize: '10px' }}>
                  <span style={{ fontWeight: 500 }}>{d.designation}</span>
                  {d.notes && <span style={{ display: 'block', fontSize: '8px', color: '#999' }}>{d.notes.substring(0, 60)}</span>}
                </td>
                <td style={{ padding: '6px 8px', fontSize: '10px' }}>{d.categorie}</td>
                <td style={{ padding: '6px 8px', fontSize: '10px', textAlign: 'right', fontWeight: 'bold' }}>{d.montant?.toLocaleString()} DT</td>
                <td style={{ padding: '6px 8px', fontSize: '10px', textAlign: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '9px', background: d.statut_paiement === 'paye' ? '#e8f5e9' : d.statut_paiement === 'non_paye' ? '#ffebee' : '#fff8e1', color: d.statut_paiement === 'paye' ? '#2e7d32' : d.statut_paiement === 'non_paye' ? '#c62828' : '#f57f17' }}>
                    {d.statut_paiement === 'paye' ? 'Payé' : d.statut_paiement === 'non_paye' ? 'Non payé' : 'Partiel'}
                  </span>
                </td>
                <td style={{ padding: '6px 8px', fontSize: '10px' }}>
                  {d.date_echeance ? new Date(d.date_echeance).toLocaleDateString('fr-FR') : '-'}
                  {d.date_echeance && d.statut_paiement !== 'paye' && new Date(d.date_echeance) < new Date() && (
                    <span style={{ display: 'block', fontSize: '8px', color: '#c62828' }}>⚠️ En retard</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#fffde7', fontWeight: 'bold' }}>
              <td colSpan="3" style={{ padding: '8px', fontSize: '11px', textAlign: 'right' }}>TOTAL</td>
              <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right', color: '#b8860b' }}>{totalDepenses.toLocaleString()} DT</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>

        {/* Pied de page */}
        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '9px', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <p style={{ margin: 0 }}>Ulysse DeZign - État fournisseur généré le {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}