// src/pages/EquipageStats.jsx
import { useState, useEffect, useMemo } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/Modal';
import { showAlert } from '../components/AlertModal';

export default function EquipageStats() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const userRole = profile?.role;
  const isAdmin = userRole === 'admin' || userRole === 'gerant';

  // États principaux
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [periode, setPeriode] = useState('mois');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailType, setDetailType] = useState('');

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    parStatut: {},
    parPriorite: {},
    parEquipe: {},
    parEmploye: {},
    parRole: {},
    evolution: [],
    delais: { respecte: 0, enRetard: 0, sansEcheance: 0 },
    performance: { total: 0, terminees: 0, tauxCompletion: 0, avgDuree: 0 },
    chargeParEmploye: {},
    tendance: { hausse: 0, baisse: 0, stable: 0 }
  });

  useEffect(() => {
    if (!isAdmin) {
      showAlert('error', 'Accès réservé aux administrateurs');
      return;
    }
    loadData();
  }, [periode]);

  async function loadData() {
    try {
      setLoading(true);

      const [equipesRes, employesRes, tachesRes] = await Promise.all([
        supabaseErp.from('erp_equipes').select('*').order('nom'),
        supabaseErp.from('erp_profiles').select('id, full_name, role').order('full_name'),
        supabaseErp.from('erp_taches')
          .select('*, erp_equipes(nom), erp_profiles(full_name), erp_commandes(numero)')
          .order('created_at', { ascending: false })
      ]);

      setEquipes(equipesRes.data || []);
      setEmployes(employesRes.data || []);
      setTaches(tachesRes.data || []);

      calculateStats(tachesRes.data || [], equipesRes.data || [], employesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur loadData:', error);
      showAlert('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(tachesData, equipesData, employesData) {
    const total = tachesData.length;

    // Par statut
    const parStatut = {};
    tachesData.forEach(t => { parStatut[t.status] = (parStatut[t.status] || 0) + 1; });

    // Par priorité
    const parPriorite = {};
    tachesData.forEach(t => { parPriorite[t.priorite] = (parPriorite[t.priorite] || 0) + 1; });

    // Par équipe
    const parEquipe = {};
    tachesData.forEach(t => {
      const nom = t.erp_equipes?.nom || 'Sans équipe';
      if (!parEquipe[nom]) parEquipe[nom] = { total: 0, terminees: 0, enCours: 0, enPause: 0, aFaire: 0 };
      parEquipe[nom].total++;
      if (t.status === 'termine') parEquipe[nom].terminees++;
      if (t.status === 'en_cours') parEquipe[nom].enCours++;
      if (t.status === 'en_pause') parEquipe[nom].enPause++;
      if (t.status === 'a_faire') parEquipe[nom].aFaire++;
    });

    // Par employé
    const parEmploye = {};
    const chargeParEmploye = {};
    tachesData.forEach(t => {
      const nom = t.erp_profiles?.full_name || 'Non assigné';
      if (!parEmploye[nom]) parEmploye[nom] = { total: 0, terminees: 0, enCours: 0 };
      if (!chargeParEmploye[nom]) chargeParEmploye[nom] = { total: 0, terminees: 0, enCours: 0, aFaire: 0 };
      parEmploye[nom].total++;
      chargeParEmploye[nom].total++;
      if (t.status === 'termine') { parEmploye[nom].terminees++; chargeParEmploye[nom].terminees++; }
      if (t.status === 'en_cours') { parEmploye[nom].enCours++; chargeParEmploye[nom].enCours++; }
      if (t.status === 'a_faire') chargeParEmploye[nom].aFaire++;
    });

    // Par rôle
    const parRole = {};
    tachesData.forEach(t => {
      const emp = employesData.find(e => e.full_name === t.erp_profiles?.full_name);
      const role = emp?.role || 'user';
      parRole[role] = (parRole[role] || 0) + 1;
    });

    // Délais
    const maintenant = new Date();
    let delais = { respecte: 0, enRetard: 0, sansEcheance: 0 };
    tachesData.forEach(t => {
      if (!t.date_fin_prevue) { delais.sansEcheance++; return; }
      const dateFin = new Date(t.date_fin_prevue);
      if (t.status === 'termine' || dateFin >= maintenant) delais.respecte++;
      else delais.enRetard++;
    });

    // Performance
    const terminees = tachesData.filter(t => t.status === 'termine').length;
    const tauxCompletion = total > 0 ? Math.round((terminees / total) * 100) : 0;

    // Évolution
    const evolution = {};
    tachesData.filter(t => t.status === 'termine' && t.updated_at).forEach(t => {
      const date = new Date(t.updated_at).toISOString().split('T')[0];
      evolution[date] = (evolution[date] || 0) + 1;
    });

    // Durée moyenne
    let totalDuree = 0, countDuree = 0;
    tachesData.filter(t => t.status === 'termine' && t.created_at && t.updated_at).forEach(t => {
      const duree = (new Date(t.updated_at) - new Date(t.created_at)) / (1000 * 60 * 60);
      if (duree > 0) { totalDuree += duree; countDuree++; }
    });

    setStats({
      total,
      parStatut,
      parPriorite,
      parEquipe,
      parEmploye,
      parRole,
      chargeParEmploye,
      evolution: Object.entries(evolution).sort((a, b) => a[0].localeCompare(b[0])),
      delais,
      performance: {
        total,
        terminees,
        tauxCompletion,
        avgDuree: countDuree > 0 ? Math.round(totalDuree / countDuree) : 0
      },
      tendance: { hausse: 0, baisse: 0, stable: 0 }
    });
  }

  // Configurations
  const statusConfig = {
    a_faire: { label: 'À faire', color: 'bg-yellow-500/20 text-yellow-400', icon: '⏳', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    en_cours: { label: 'En cours', color: 'bg-blue-500/20 text-blue-400', icon: '🔄', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    en_pause: { label: 'En pause', color: 'bg-purple-500/20 text-purple-400', icon: '⏸️', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    termine: { label: 'Terminé', color: 'bg-green-500/20 text-green-400', icon: '✅', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    annule: { label: 'Annulé', color: 'bg-red-500/20 text-red-400', icon: '❌', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  };

  const prioriteConfig = {
    basse: { label: 'Basse', color: 'bg-gray-500/20 text-gray-400', icon: '🟢' },
    normale: { label: 'Normale', color: 'bg-blue-500/20 text-blue-400', icon: '🟡' },
    haute: { label: 'Haute', color: 'bg-orange-500/20 text-orange-400', icon: '🟠' },
    urgente: { label: 'Urgente', color: 'bg-red-500/20 text-red-400', icon: '🔴' }
  };

  const roleConfig = {
    admin: { label: '👑 Admin', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    gerant: { label: '📋 Gérant', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    agent_financier: { label: '💰 Agent Financier', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    designer: { label: '🎨 Designer', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    poseur: { label: '🔧 Poseur', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    imprimeur: { label: '🖨️ Imprimeur', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
    user: { label: '👤 Utilisateur', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/30' }
  };

  const COLORS = ['#F0C75E', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

  const getRoleIcon = (nom) => {
    const emp = employes.find(e => e.full_name === nom);
    const icons = { admin: '👑', gerant: '📋', agent_financier: '💰', designer: '🎨', poseur: '🔧', imprimeur: '🖨️', user: '👤' };
    return icons[emp?.role || 'user'] || '👤';
  };

  // Ouvrir le modal de détails
  const openDetailModal = (type, data) => {
    setDetailType(type);
    setDetailData(data);
    setShowDetailModal(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-white mb-2">Accès restreint</h2>
          <p className="text-gray-400">Cette page est réservée aux administrateurs</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
        <p className="text-gray-400 text-sm">Analyse des données...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`font-['Playfair_Display'] text-2xl lg:text-3xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            📊 Statistiques Équipage
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Analyse approfondie de la performance de votre équipe
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
            } text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C75E]`}
          >
            <option value="semaine">📅 Cette semaine</option>
            <option value="mois">📅 Ce mois</option>
            <option value="trimestre">📅 Ce trimestre</option>
            <option value="annee">📅 Cette année</option>
          </select>
          <button
            onClick={() => loadData()}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-[#0D1F3C] border-[#1A3A6B] text-gray-300 hover:text-white hover:bg-[#1A3A6B]' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            } text-sm transition`}
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KPI CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-4 border text-center hover:border-[#F0C75E]/40 transition cursor-pointer`} onClick={() => openDetailModal('total', { total: stats.total, parStatut: stats.parStatut })}>
          <span className="text-2xl">📋</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total tâches</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-[#F0C75E] rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-4 border text-center hover:border-green-500/40 transition cursor-pointer`} onClick={() => openDetailModal('terminees', { terminees: stats.performance.terminees, total: stats.total })}>
          <span className="text-2xl">✅</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.performance.terminees}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tâches terminées</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.performance.tauxCompletion}%` }} />
          </div>
        </div>
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-4 border text-center hover:border-[#F0C75E]/40 transition cursor-pointer`} onClick={() => openDetailModal('completion', { taux: stats.performance.tauxCompletion, total: stats.total })}>
          <span className="text-2xl">📈</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>{stats.performance.tauxCompletion}%</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Taux de complétion</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-[#F0C75E] rounded-full" style={{ width: `${Math.min(stats.performance.tauxCompletion, 100)}%` }} />
          </div>
        </div>
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-4 border text-center hover:border-blue-500/40 transition cursor-pointer`} onClick={() => openDetailModal('duree', { avgDuree: stats.performance.avgDuree })}>
          <span className="text-2xl">⏱️</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>{stats.performance.avgDuree}h</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Durée moyenne</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((stats.performance.avgDuree / 24) * 100, 100)}%` }} />
          </div>
        </div>
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-4 border text-center hover:border-red-500/40 transition cursor-pointer`} onClick={() => openDetailModal('retard', { enRetard: stats.delais.enRetard, total: stats.total })}>
          <span className="text-2xl">⚠️</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{stats.delais.enRetard}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tâches en retard</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.delais.enRetard / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STATUTS & PRIORITÉS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Statuts */}
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            📊 Répartition par statut
          </h3>
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = stats.parStatut[key] || 0;
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={key} className="cursor-pointer hover:opacity-80 transition" onClick={() => openDetailModal('statut', { key, config, count, percentage, total: stats.total })}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span>{config.icon}</span> {config.label}
                    </span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1A3A6B] rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${percentage}%`,
                      background: percentage > 0 ? `linear-gradient(to right, ${config.color.split(' ')[0].replace('bg-', '').replace('/20', '')}, ${config.color.split(' ')[0].replace('bg-', '').replace('/20', '')}88)` : 'transparent'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priorités */}
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            🎯 Répartition par priorité
          </h3>
          <div className="space-y-3">
            {Object.entries(prioriteConfig).map(([key, config]) => {
              const count = stats.parPriorite[key] || 0;
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={key} className="cursor-pointer hover:opacity-80 transition" onClick={() => openDetailModal('priorite', { key, config, count, percentage, total: stats.total })}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{config.icon} {config.label}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1A3A6B] rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${percentage}%`,
                      background: percentage > 0 ? `linear-gradient(to right, ${config.color.split(' ')[0].replace('bg-', '').replace('/20', '')}, ${config.color.split(' ')[0].replace('bg-', '').replace('/20', '')}88)` : 'transparent'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PERFORMANCE PAR ÉQUIPE */}
      {/* ============================================================ */}
      <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border mt-4`}>
        <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          👥 Performance par équipe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.parEquipe).map(([nom, data], index) => (
            <div key={nom} className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border cursor-pointer hover:border-[#F0C75E]/40 transition`} onClick={() => openDetailModal('equipe', { nom, data })}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{nom}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{data.total} tâches</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>✅ Terminées</span>
                  <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{data.terminees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>🔄 En cours</span>
                  <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{data.enCours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>⏸️ En pause</span>
                  <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{data.enPause || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>⏳ À faire</span>
                  <span className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{data.aFaire || 0}</span>
                </div>
              </div>
              <div className="mt-2 w-full h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${data.total > 0 ? Math.round((data.terminees / data.total) * 100) : 0}%`,
                  backgroundColor: COLORS[index % COLORS.length]
                }} />
              </div>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Taux: {data.total > 0 ? Math.round((data.terminees / data.total) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RÉPARTITION PAR RÔLE (AVEC IMPRIMEUR) */}
      {/* ============================================================ */}
      <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border mt-4`}>
        <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          👥 Répartition par rôle
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(roleConfig).map(([key, config]) => {
            const count = stats.parRole?.[key] || 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={key} className={`${config.bg} border ${config.border} rounded-xl p-3 text-center cursor-pointer hover:scale-105 transition`} onClick={() => openDetailModal('role', { key, config, count, percentage, total: stats.total })}>
                <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{config.label}</p>
                <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{percentage}%</p>
                <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: `linear-gradient(to right, ${config.color.split(' ')[0].replace('text-', '')}, ${config.color.split(' ')[0].replace('text-', '')}88)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOP PERFORMERS */}
      {/* ============================================================ */}
      <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border mt-4`}>
        <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          🏆 Top performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.parEmploye)
            .sort(([, a], [, b]) => b.terminees - a.terminees)
            .slice(0, 6)
            .map(([nom, data], index) => (
              <div key={nom} className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border flex items-center gap-4 cursor-pointer hover:border-[#F0C75E]/40 transition`} onClick={() => openDetailModal('employe', { nom, data })}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${index === 0 ? 'bg-[#F0C75E] text-[#071325]' : index === 1 ? 'bg-gray-300 text-gray-700' : index === 2 ? 'bg-amber-600 text-white' : 'bg-[#1A3A6B] text-white'}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {getRoleIcon(nom)} {nom}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>✅ {data.terminees} terminées</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>📋 {data.total} total</span>
                  </div>
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>
                  {data.total > 0 ? Math.round((data.terminees / data.total) * 100) : 0}%
                </div>
              </div>
            ))}
        </div>
        {Object.keys(stats.parEmploye).length === 0 && (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aucune donnée disponible</p>
        )}
      </div>

      {/* ============================================================ */}
      {/* ANALYSE DES DÉLAIS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className={`${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} rounded-xl p-4 border text-center cursor-pointer hover:scale-105 transition`} onClick={() => openDetailModal('delais', { type: 'respecte', count: stats.delais.respecte, total: stats.total })}>
          <span className="text-2xl">✅</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.delais.respecte}</p>
          <p className={`text-xs ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>Délais respectés</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.delais.respecte / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className={`${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} rounded-xl p-4 border text-center cursor-pointer hover:scale-105 transition`} onClick={() => openDetailModal('delais', { type: 'retard', count: stats.delais.enRetard, total: stats.total })}>
          <span className="text-2xl">⚠️</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{stats.delais.enRetard}</p>
          <p className={`text-xs ${isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>En retard</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.delais.enRetard / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border text-center cursor-pointer hover:scale-105 transition`} onClick={() => openDetailModal('delais', { type: 'sansEcheance', count: stats.delais.sansEcheance, total: stats.total })}>
          <span className="text-2xl">📅</span>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.delais.sansEcheance}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400/70' : 'text-gray-600/70'}`}>Sans échéance</p>
          <div className="mt-1 w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
            <div className="h-full bg-gray-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.delais.sansEcheance / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ÉVOLUTION */}
      {/* ============================================================ */}
      {stats.evolution.length > 0 && (
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border mt-4`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            📈 Évolution des tâches terminées
          </h3>
          <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
            {stats.evolution.slice(-30).map(([date, count]) => {
              const max = Math.max(...stats.evolution.map(([, c]) => c), 1);
              const height = Math.round((count / max) * 100);
              const displayDate = new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
              return (
                <div key={date} className="flex flex-col items-center flex-shrink-0 cursor-pointer hover:scale-110 transition" style={{ minWidth: '24px' }} onClick={() => openDetailModal('evolution', { date, count, total: stats.total })}>
                  <div className="w-4 rounded-t transition-all duration-500 hover:scale-110" style={{
                    height: `${Math.max(height, 4)}%`,
                    background: `linear-gradient(to top, #F0C75E, #d4aa3a)`,
                    minHeight: '4px'
                  }} />
                  <span className={`text-[8px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{displayDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CHARGE PAR EMPLOYÉ */}
      {/* ============================================================ */}
      {Object.keys(stats.chargeParEmploye).length > 0 && (
        <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border mt-4`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            📊 Charge de travail par employé
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.chargeParEmploye)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([nom, data]) => {
                const total = data.total || 1;
                const terminees = data.terminees || 0;
                const enCours = data.enCours || 0;
                const aFaire = data.aFaire || 0;
                const termineesPct = Math.round((terminees / total) * 100);
                const enCoursPct = Math.round((enCours / total) * 100);
                const aFairePct = Math.round((aFaire / total) * 100);
                
                return (
                  <div key={nom} className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border cursor-pointer hover:border-[#F0C75E]/40 transition`} onClick={() => openDetailModal('charge', { nom, data })}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{getRoleIcon(nom)} {nom}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{total} tâches</span>
                    </div>
                    <div className="w-full h-3 bg-[#1A3A6B] rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${termineesPct}%` }} />
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${enCoursPct}%` }} />
                      <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${aFairePct}%` }} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {terminees}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {enCours}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> {aFaire}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RÉSUMÉ GLOBAL */}
      {/* ============================================================ */}
      <div className={`${isDark ? 'bg-gradient-to-br from-[#0D1F3C] to-[#0A1628] border-[#1A3A6B]' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} rounded-xl p-5 border mt-4`}>
        <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          📋 Résumé global
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border text-center`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total tâches</span>
            <p className={`font-bold text-2xl ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
          </div>
          <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border text-center`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Taux complétion</span>
            <p className={`font-bold text-2xl ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>{stats.performance.tauxCompletion}%</p>
          </div>
          <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border text-center`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tâches en retard</span>
            <p className={`font-bold text-2xl ${isDark ? 'text-red-400' : 'text-red-600'}`}>{stats.delais.enRetard}</p>
          </div>
          <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border text-center`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Durée moyenne</span>
            <p className={`font-bold text-2xl ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>{stats.performance.avgDuree}h</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL DE DÉTAILS ÉLÉGANT */}
      {/* ============================================================ */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`📊 Détails - ${detailType === 'statut' ? detailData?.config?.label || '' : detailType === 'priorite' ? detailData?.config?.label || '' : detailType === 'role' ? detailData?.config?.label || '' : detailType === 'equipe' ? detailData?.nom || '' : detailType === 'employe' ? detailData?.nom || '' : 'Analyse'}`}
        size="medium"
        icon="analytics"
        iconColor="text-[#F0C75E]"
      >
        {detailData && (
          <div className="space-y-4">
            {/* En-tête avec icône */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#F0C75E]/10 to-transparent border border-[#F0C75E]/20">
              <div className="w-14 h-14 rounded-full bg-[#F0C75E]/20 flex items-center justify-center text-3xl">
                {detailType === 'statut' && '📊'}
                {detailType === 'priorite' && '🎯'}
                {detailType === 'role' && '👥'}
                {detailType === 'equipe' && '👥'}
                {detailType === 'employe' && '👤'}
                {detailType === 'charge' && '📊'}
                {detailType === 'delais' && '⏱️'}
                {detailType === 'evolution' && '📈'}
                {detailType === 'total' && '📋'}
                {detailType === 'terminees' && '✅'}
                {detailType === 'completion' && '📈'}
                {detailType === 'duree' && '⏱️'}
                {detailType === 'retard' && '⚠️'}
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">
                  {detailType === 'statut' && `Statut: ${detailData.config?.label}`}
                  {detailType === 'priorite' && `Priorité: ${detailData.config?.label}`}
                  {detailType === 'role' && `Rôle: ${detailData.config?.label}`}
                  {detailType === 'equipe' && `Équipe: ${detailData.nom}`}
                  {detailType === 'employe' && `Employé: ${detailData.nom}`}
                  {detailType === 'charge' && `Charge: ${detailData.nom}`}
                  {detailType === 'delais' && `Délais: ${detailData.type === 'respecte' ? 'Respectés' : detailData.type === 'retard' ? 'En retard' : 'Sans échéance'}`}
                  {detailType === 'evolution' && `Journée du ${new Date(detailData.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                  {detailType === 'total' && 'Vue d\'ensemble'}
                  {detailType === 'terminees' && 'Tâches terminées'}
                  {detailType === 'completion' && 'Taux de complétion'}
                  {detailType === 'duree' && 'Durée moyenne'}
                  {detailType === 'retard' && 'Tâches en retard'}
                </h4>
                <p className="text-gray-400 text-sm">
                  {detailType === 'statut' && `${detailData.count} tâches (${detailData.percentage}% du total)`}
                  {detailType === 'priorite' && `${detailData.count} tâches (${detailData.percentage}% du total)`}
                  {detailType === 'role' && `${detailData.count} tâches (${detailData.percentage}% du total)`}
                  {detailType === 'equipe' && `${detailData.data.total} tâches - ${Math.round((detailData.data.terminees / detailData.data.total) * 100)}% complétées`}
                  {detailType === 'employe' && `${detailData.data.total} tâches - ${detailData.data.terminees} terminées`}
                  {detailType === 'charge' && `${detailData.data.total} tâches - ${detailData.data.terminees} terminées`}
                  {detailType === 'delais' && `${detailData.count} tâches sur ${detailData.total}`}
                  {detailType === 'evolution' && `${detailData.count} tâches terminées ce jour`}
                  {detailType === 'total' && `${detailData.total} tâches au total`}
                  {detailType === 'terminees' && `${detailData.terminees} terminées sur ${detailData.total}`}
                  {detailType === 'completion' && `${detailData.taux}% de complétion`}
                  {detailType === 'duree' && `${detailData.avgDuree} heures en moyenne`}
                  {detailType === 'retard' && `${detailData.enRetard} tâches en retard sur ${detailData.total}`}
                </p>
              </div>
            </div>

            {/* Contenu détaillé */}
            <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
              {detailType === 'statut' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Tâches</span>
                    <span className="text-white font-bold">{detailData.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Pourcentage</span>
                    <span className="text-[#F0C75E] font-bold">{detailData.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F0C75E] rounded-full" style={{ width: `${detailData.percentage}%` }} />
                  </div>
                </div>
              )}

              {detailType === 'equipe' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <p className="text-green-400 text-xl font-bold">{detailData.data.terminees}</p>
                      <p className="text-gray-500 text-xs">Terminées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 text-xl font-bold">{detailData.data.enCours}</p>
                      <p className="text-gray-500 text-xs">En cours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-400 text-xl font-bold">{detailData.data.enPause || 0}</p>
                      <p className="text-gray-500 text-xs">En pause</p>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-400 text-xl font-bold">{detailData.data.aFaire || 0}</p>
                      <p className="text-gray-500 text-xs">À faire</p>
                    </div>
                  </div>
                </div>
              )}

              {detailType === 'employe' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Total</span>
                    <span className="text-white font-bold">{detailData.data.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Terminées</span>
                    <span className="text-green-400 font-bold">{detailData.data.terminees}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>En cours</span>
                    <span className="text-blue-400 font-bold">{detailData.data.enCours}</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${detailData.data.total > 0 ? (detailData.data.terminees / detailData.data.total) * 100 : 0}%` }} />
                  </div>
                </div>
              )}

              {detailType === 'delais' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Tâches concernées</span>
                    <span className="text-white font-bold">{detailData.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Pourcentage</span>
                    <span className="text-[#F0C75E] font-bold">{Math.round((detailData.count / detailData.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${detailData.type === 'respecte' ? 'bg-green-500' : detailData.type === 'retard' ? 'bg-red-500' : 'bg-gray-500'}`} style={{ width: `${Math.round((detailData.count / detailData.total) * 100)}%` }} />
                  </div>
                </div>
              )}

              {detailType === 'total' && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(stats.parStatut).map(([key, count]) => (
                    <div key={key} className="text-center">
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{count}</p>
                      <p className="text-gray-500 text-xs">{statusConfig[key]?.label || key}</p>
                    </div>
                  ))}
                </div>
              )}

              {detailType === 'completion' && (
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke={isDark ? '#1A3A6B' : '#e5e7eb'} strokeWidth="12" />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#F0C75E" strokeWidth="12" strokeDasharray={`${detailData.taux * 3.52} 352`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#F0C75E]">{detailData.taux}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Taux de complétion</p>
                </div>
              )}

              {detailType === 'evolution' && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#F0C75E]">{detailData.count}</p>
                  <p className="text-gray-400 text-sm">Tâches terminées ce jour</p>
                </div>
              )}
            </div>

            {/* Bouton de fermeture */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-lg font-semibold hover:shadow-lg transition"
              >
                ✨ Fermer les détails
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}