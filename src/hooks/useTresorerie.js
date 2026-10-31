// src/hooks/useTresorerie.js
import { useState, useEffect, useCallback } from 'react';
import { supabaseErp } from '../lib/supabaseErp';

export function useTresorerie() {
  const [stats, setStats] = useState({
    soldeActuel: 0,
    revenusMois: 0,
    depensesMois: 0,
    prevision: 0,
    fluxMensuels: [],
    topClients: [],
    topFournisseurs: []
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // 1. Solde actuel
      const { data: solde } = await supabaseErp.rpc('erp_solde_a_date', { p_date: now.toISOString().split('T')[0] });

      // 2. Revenus du mois (depuis journal caisse + commandes payées)
      const { data: revenus } = await supabaseErp
        .from('erp_journal_caisse')
        .select('montant')
        .eq('type', 'revenue')
        .gte('date', debutMois)
        .lte('date', finMois);

      // 3. Dépenses du mois
      const { data: depenses } = await supabaseErp
        .from('erp_journal_caisse')
        .select('montant')
        .eq('type', 'expense')
        .gte('date', debutMois)
        .lte('date', finMois);

      // 4. Top clients (depuis commandes)
      const { data: topClients } = await supabaseErp
        .from('erp_commandes')
        .select('client_id, total_ttc, erp_clients(nom, prenom, entreprise)')
        .eq('status', 'paye')
        .order('total_ttc', { ascending: false })
        .limit(5);

      // 5. Top fournisseurs (depuis dépenses)
      const { data: topFournisseurs } = await supabaseErp
        .from('erp_depenses')
        .select('fournisseur_id, montant, erp_fournisseurs(nom)')
        .order('montant', { ascending: false })
        .limit(5);

      // 6. Flux mensuels (6 derniers mois)
      const fluxMensuels = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const { data: statsMensuelles } = await supabaseErp.rpc('erp_stats_mensuelles', {
          p_annee: date.getFullYear(),
          p_mois: date.getMonth() + 1
        });
        fluxMensuels.push({
          mois: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          ...statsMensuelles
        });
      }

      setStats({
        soldeActuel: solde || 0,
        revenusMois: (revenus || []).reduce((s, r) => s + (r.montant || 0), 0),
        depensesMois: (depenses || []).reduce((s, d) => s + (d.montant || 0), 0),
        prevision: (solde || 0) + (revenus || []).reduce((s, r) => s + (r.montant || 0), 0) - (depenses || []).reduce((s, d) => s + (d.montant || 0), 0),
        fluxMensuels,
        topClients: topClients || [],
        topFournisseurs: topFournisseurs || []
      });

    } catch (error) {
      console.error('❌ Erreur stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return { stats, loading, refresh: loadStats };
}