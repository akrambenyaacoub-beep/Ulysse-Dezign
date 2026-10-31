// src/hooks/useAlertes.js
import { useState, useEffect, useCallback } from 'react';
import { supabaseErp } from '../lib/supabaseErp';

export function useAlertes() {
  const [alertes, setAlertes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentAlerte, setCurrentAlerte] = useState(null);
  const [dismissedAlertes, setDismissedAlertes] = useState(new Set());

  const loadAlertes = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dans7Jours = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Échéances proches
      const { data: echeancesProches } = await supabaseErp
        .from('erp_depenses')
        .select('*, erp_fournisseurs(nom)')
        .in('statut_paiement', ['non_paye', 'partiel'])
        .lte('date_echeance', dans7Jours)
        .order('date_echeance');

      // Échéances dépassées
      const { data: echeancesDepassees } = await supabaseErp
        .from('erp_depenses')
        .select('*, erp_fournisseurs(nom)')
        .in('statut_paiement', ['non_paye', 'partiel'])
        .lt('date_echeance', today)
        .order('date_echeance');

      // Dépenses élevées (> 5000 DT)
      const { data: grossesDepenses } = await supabaseErp
        .from('erp_depenses')
        .select('*, erp_fournisseurs(nom)')
        .gte('montant', 5000)
        .order('date', { ascending: false })
        .limit(5);

      const newAlertes = [];

      if (echeancesDepassees?.length > 0) {
        newAlertes.push({
          type: 'danger',
          titre: `🚨 ${echeancesDepassees.length} échéance(s) dépassée(s) !`,
          message: `${echeancesDepassees.map(d => `${d.designation} (${d.montant} DT)`).join(', ')}`,
          depenses: echeancesDepassees,
          couleur: 'red'
        });
      }

      if (echeancesProches?.length > 0) {
        newAlertes.push({
          type: 'warning',
          titre: `⚠️ ${echeancesProches.length} échéance(s) dans 7 jours`,
          message: `${echeancesProches.map(d => `${d.designation} (${d.montant} DT)`).join(', ')}`,
          depenses: echeancesProches,
          couleur: 'orange'
        });
      }

      if (grossesDepenses?.length > 0) {
        newAlertes.push({
          type: 'info',
          titre: `💰 ${grossesDepenses.length} dépense(s) > 5000 DT ce mois`,
          message: `${grossesDepenses.map(d => `${d.designation} (${d.montant} DT)`).join(', ')}`,
          depenses: grossesDepenses,
          couleur: 'blue'
        });
      }

      setAlertes(newAlertes);

      // Afficher popup pour la première alerte non dismissée
      const first = newAlertes.find(a => !dismissedAlertes.has(a.titre));
      if (first && !showPopup) {
        setCurrentAlerte(first);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  }, [dismissedAlertes, showPopup]);

  useEffect(() => {
    loadAlertes();
    const interval = setInterval(loadAlertes, 60000); // Vérifier chaque minute
    return () => clearInterval(interval);
  }, [loadAlertes]);

  const dismissAlerte = (titre) => {
    setDismissedAlertes(prev => new Set([...prev, titre]));
    setShowPopup(false);
    const next = alertes.find(a => !dismissedAlertes.has(a.titre) && a.titre !== titre);
    if (next) {
      setCurrentAlerte(next);
      setShowPopup(true);
    }
  };

  const closePopup = () => setShowPopup(false);

  return { alertes, showPopup, currentAlerte, dismissAlerte, closePopup, loadAlertes };
}