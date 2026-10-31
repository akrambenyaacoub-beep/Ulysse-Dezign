// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// ============================================================
// COMPOSANT SKELETON
// ============================================================
function SkeletonCard() {
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B] animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-3 w-20 bg-[#1A3A6B] rounded mb-2"></div>
          <div className="h-7 w-16 bg-[#1A3A6B] rounded"></div>
        </div>
        <div className="w-10 h-10 bg-[#1A3A6B] rounded-lg"></div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT STAT CARD
// ============================================================
function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B] hover:border-[#F0C75E]/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#F0C75E]/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value || 0}</p>
          {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color || 'text-gray-400'}`}>
          {icon || '📊'}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function Dashboard() {
  const { profile } = useAuth();
  const role = profile?.role || 'admin';

  // ============================================================
  // ÉTATS
  // ============================================================
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // États pour Designer
  const [mesTaches, setMesTaches] = useState([]);
  const [tachesUrgentes, setTachesUrgentes] = useState([]);
  const [tachesParEquipe, setTachesParEquipe] = useState({});
  const [tachesParPriorite, setTachesParPriorite] = useState({ basse: 0, normale: 0, haute: 0, urgente: 0 });
  const [tachesStats, setTachesStats] = useState({ total: 0, a_faire: 0, en_cours: 0, en_pause: 0, termine: 0 });
  const [recentCommandes, setRecentCommandes] = useState([]);
  const [recentActivites, setRecentActivites] = useState([]);
  
  // États pour Admin / Gérant / Agent Financier
  const [commandes, setCommandes] = useState({ total: 0, en_attente: 0, en_cours: 0, termine: 0, paye: 0, annule: 0 });
  const [clients, setClients] = useState({ total: 0, particulier: 0, entreprise: 0, passager: 0, actif: 0, inactif: 0 });
  const [produits, setProduits] = useState({ total: 0, categories: {} });
  const [tresorerie, setTresorerie] = useState({ revenus: 0, depenses: 0, balance: 0, fond_caisse: 0 });
  const [caissier, setCaissier] = useState({ mois: [], revenus: [], depenses: [] });
  const [topClients, setTopClients] = useState([]);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState([]);
  const [commandesParMois, setCommandesParMois] = useState([]);
  const [chiffreAffaires, setChiffreAffaires] = useState(0);
  const [panierMoyen, setPanierMoyen] = useState(0);
  const [tauxConversion, setTauxConversion] = useState(0);
  const [depensesParCategorie, setDepensesParCategorie] = useState({});
  const [revenusParCategorie, setRevenusParCategorie] = useState({});

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    loadDashboardData();
  }, []);

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  async function loadDashboardData() {
    try {
      setLoading(true);

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // ============================================================
      // RÉCUPÉRATION DES DONNÉES COMMUNES
      // ============================================================
      const [
        commandesResult,
        clientsResult,
        tachesResult,
        produitsResult,
        caisseResult
      ] = await Promise.all([
        supabaseErp.from('erp_commandes').select('*'),
        supabaseErp.from('erp_clients').select('*'),
        supabaseErp.from('erp_taches').select('*'),
        supabaseErp.from('erp_produits').select('*'),
        // 🔥 SEULEMENT POUR ADMIN/GERANT/AGENT_FINANCIER
        role !== 'designer' ? supabaseErp.from('erp_journal_caisse')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate) : Promise.resolve({ data: [] })
      ]);

      const commandesData = commandesResult.data || [];
      const clientsData = clientsResult.data || [];
      const tachesData = tachesResult.data || [];
      const produitsData = produitsResult.data || [];
      const caisseData = role !== 'designer' ? (caisseResult.data || []) : [];

      // ============================================================
      // STATISTIQUES COMMUNES
      // ============================================================
      const commandesStats = {
        total: commandesData.length,
        en_attente: commandesData.filter(c => c.status === 'en_attente').length,
        en_cours: commandesData.filter(c => c.status === 'en_cours').length,
        termine: commandesData.filter(c => c.status === 'termine').length,
        paye: commandesData.filter(c => c.status === 'paye').length,
        annule: commandesData.filter(c => c.status === 'annule').length
      };

      const clientsStats = {
        total: clientsData.length,
        particulier: clientsData.filter(c => c.type_client === 'particulier').length,
        entreprise: clientsData.filter(c => c.type_client === 'entreprise').length,
        passager: clientsData.filter(c => c.type_client === 'passager').length,
        actif: clientsData.filter(c => c.status === 'actif').length,
        inactif: clientsData.filter(c => c.status === 'inactif').length
      };

      const tachesStatsCalc = {
        total: tachesData.length,
        a_faire: tachesData.filter(t => t.status === 'a_faire').length,
        en_cours: tachesData.filter(t => t.status === 'en_cours').length,
        en_pause: tachesData.filter(t => t.status === 'en_pause').length,
        termine: tachesData.filter(t => t.status === 'termine').length
      };

      // ============================================================
      // STATISTIQUES SPÉCIFIQUES DESIGNER
      // ============================================================
      if (role === 'designer') {
        // Tâches par équipe
        const { data: equipes } = await supabaseErp.from('erp_equipes').select('*');
        const equipeStats = {};
        (equipes || []).forEach(equipe => {
          const tachesEquipe = tachesData.filter(t => t.equipe_id === equipe.id);
          equipeStats[equipe.nom] = {
            total: tachesEquipe.length,
            a_faire: tachesEquipe.filter(t => t.status === 'a_faire').length,
            en_cours: tachesEquipe.filter(t => t.status === 'en_cours').length,
            termine: tachesEquipe.filter(t => t.status === 'termine').length
          };
        });
        setTachesParEquipe(equipeStats);

        // Tâches par priorité
        const prioriteStats = { basse: 0, normale: 0, haute: 0, urgente: 0 };
        tachesData.forEach(t => {
          if (t.priorite && prioriteStats[t.priorite] !== undefined) {
            prioriteStats[t.priorite]++;
          }
        });
        setTachesParPriorite(prioriteStats);

        // Tâches urgentes
        const { data: urgentTasks } = await supabaseErp
          .from('erp_taches')
          .select('*')
          .eq('priorite', 'urgente')
          .in('status', ['a_faire', 'en_cours'])
          .order('created_at', { ascending: false })
          .limit(5);
        setTachesUrgentes(urgentTasks || []);

        // Mes tâches
        const { data: myTasks } = await supabaseErp
          .from('erp_taches')
          .select('*')
          .eq('assignee_id', profile?.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setMesTaches(myTasks || []);

        setTachesStats(tachesStatsCalc);
      }

      // ============================================================
      // STATISTIQUES POUR ADMIN / GERANT / AGENT FINANCIER
      // ============================================================
      if (role !== 'designer') {
        // Trésorerie
        let revenus = 0, depenses = 0, fondCaisse = 0;
        caisseData.forEach(entry => {
          if (entry.type === 'revenue') {
            if (entry.category === 'fond_caisse') fondCaisse += entry.montant || 0;
            else revenus += entry.montant || 0;
          } else {
            depenses += entry.montant || 0;
          }
        });
        setTresorerie({ revenus, depenses, balance: revenus - depenses, fond_caisse: fondCaisse });

        // Dernières commandes
        const { data: recentCmd } = await supabaseErp
          .from('erp_commandes')
          .select('*, erp_clients(nom, prenom)')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentCommandes(recentCmd || []);

        // Top clients
        const clientMap = {};
        commandesData.forEach(cmd => {
          if (cmd.client_id) {
            if (!clientMap[cmd.client_id]) {
              const client = clientsData.find(c => c.id === cmd.client_id);
              clientMap[cmd.client_id] = {
                nom: client?.nom || 'Inconnu',
                prenom: client?.prenom || '',
                total: 0,
                count: 0
              };
            }
            clientMap[cmd.client_id].total += cmd.total_ttc || 0;
            clientMap[cmd.client_id].count += 1;
          }
        });
        setTopClients(Object.values(clientMap).sort((a, b) => b.total - a.total).slice(0, 5));

        // Évolution mensuelle (pour Agent Financier)
        if (role === 'agent_financier' || role === 'admin') {
          const evol = [];
          for (let i = 5; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const ms = m.toISOString().split('T')[0];
            const me = new Date(m.getFullYear(), m.getMonth() + 1, 0).toISOString().split('T')[0];
            
            const { data: monthEntries } = await supabaseErp
              .from('erp_journal_caisse')
              .select('*')
              .gte('date', ms)
              .lte('date', me);
            
            let rev = 0, dep = 0;
            (monthEntries || []).forEach(e => {
              if (e.type === 'revenue' && e.category !== 'fond_caisse') rev += e.montant || 0;
              else if (e.type === 'expense') dep += e.montant || 0;
            });
            
            evol.push({
              mois: m.toLocaleString('fr-FR', { month: 'short' }),
              revenus: rev,
              depenses: dep,
              solde: rev - dep
            });
          }
          setEvolutionMensuelle(evol);
          setCaissier({ 
            mois: evol.map(e => e.mois), 
            revenus: evol.map(e => e.revenus), 
            depenses: evol.map(e => e.depenses) 
          });
        }

        // Commandes par mois (pour Gérant)
        if (role === 'gerant' || role === 'admin') {
          const cmdMois = [];
          for (let i = 5; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const ms = m.toISOString().split('T')[0];
            const me = new Date(m.getFullYear(), m.getMonth() + 1, 0).toISOString().split('T')[0];
            
            const { data: monthCmd } = await supabaseErp
              .from('erp_commandes')
              .select('*')
              .gte('date_commande', ms)
              .lte('date_commande', me);
            
            cmdMois.push({
              mois: m.toLocaleString('fr-FR', { month: 'short' }),
              total: monthCmd?.length || 0
            });
          }
          setCommandesParMois(cmdMois);

          const ca = commandesData.reduce((sum, c) => sum + (c.total_ttc || 0), 0);
          setChiffreAffaires(ca);
          setPanierMoyen(commandesData.length > 0 ? ca / commandesData.length : 0);
          setTauxConversion(commandesData.length > 0 ? (commandesStats.termine / commandesData.length) * 100 : 0);
        }

        // Dépenses/Revenus par catégorie
        if (role === 'agent_financier' || role === 'admin' || role === 'gerant') {
          const depCat = {};
          const revCat = {};
          caisseData.forEach(entry => {
            if (entry.type === 'expense') {
              const cat = entry.category || 'divers';
              depCat[cat] = (depCat[cat] || 0) + (entry.montant || 0);
            } else if (entry.type === 'revenue' && entry.category !== 'fond_caisse') {
              const cat = entry.category || 'autre';
              revCat[cat] = (revCat[cat] || 0) + (entry.montant || 0);
            }
          });
          setDepensesParCategorie(depCat);
          setRevenusParCategorie(revCat);
        }
      }

      // ============================================================
      // ACTIVITÉS RÉCENTES (communes)
      // ============================================================
      const activities = [];
      
      // Dernières commandes pour tous
      const { data: allRecentCmd } = await supabaseErp
        .from('erp_commandes')
        .select('*, erp_clients(nom, prenom)')
        .order('created_at', { ascending: false })
        .limit(3);
      
      (allRecentCmd || []).forEach(cmd => {
        activities.push({
          type: 'commande',
          date: cmd.created_at,
          message: `📦 Commande ${cmd.numero} - ${cmd.erp_clients?.nom || 'Client inconnu'}`,
          icon: '📦',
          color: 'text-blue-400'
        });
      });

      // Dernières tâches pour Designer
      if (role === 'designer') {
        const { data: lastTaches } = await supabaseErp
          .from('erp_taches')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        (lastTaches || []).forEach(tache => {
          activities.push({
            type: 'tache',
            date: tache.created_at,
            message: `👷 Tâche "${tache.titre}" - ${tache.status}`,
            icon: '👷',
            color: 'text-purple-400'
          });
        });
      }

      // Dernières entrées caisse (pour non-designer)
      if (role !== 'designer') {
        const { data: lastCaisse } = await supabaseErp
          .from('erp_journal_caisse')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        (lastCaisse || []).forEach(entry => {
          activities.push({
            type: entry.type,
            date: entry.created_at,
            message: `${entry.type === 'revenue' ? '💰' : '💸'} ${entry.designation} - ${(entry.montant || 0).toFixed(2)} DT`,
            icon: entry.type === 'revenue' ? '💰' : '💸',
            color: entry.type === 'revenue' ? 'text-green-400' : 'text-red-400'
          });
        });
      }

      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivites(activities.slice(0, 10));

      // ============================================================
      // MISE À JOUR DES ÉTATS COMMUNS
      // ============================================================
      setCommandes(commandesStats);
      setClients(clientsStats);
      setProduits({ total: produitsData.length, categories: {} });

      setLoading(false);
      setIsFirstLoad(false);

    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
      setLoading(false);
      setIsFirstLoad(false);
    }
  }

  // ============================================================
  // RENDU SKELETON
  // ============================================================
  if (isFirstLoad && loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-[#1A3A6B] rounded"></div>
            <div className="h-4 w-64 bg-[#1A3A6B] rounded mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU DESIGNER (SANS FINANCES)
  // ============================================================
  if (role === 'designer') {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">
              🎨 Bonjour, {profile?.full_name || 'Designer'}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">📊 Vue d'ensemble de vos tâches</p>
          </div>
          <button 
            onClick={loadDashboardData} 
            disabled={loading} 
            className="px-4 py-2 bg-[#0D1F3C] border border-[#1A3A6B] rounded-lg text-gray-400 hover:text-white hover:border-[#F0C75E]/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Rafraîchir
          </button>
        </div>

        {/* Stats clés Designer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Mes tâches" value={mesTaches.length} icon="📋" color="text-purple-400" />
          <StatCard title="À faire" value={tachesStats.a_faire} icon="⏳" color="text-yellow-400" />
          <StatCard title="En cours" value={tachesStats.en_cours} icon="🔄" color="text-blue-400" />
          <StatCard title="Terminées" value={tachesStats.termine} icon="✅" color="text-green-400" />
        </div>

        {/* Tâches par équipe + Priorités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TachesParEquipeCard data={tachesParEquipe} />
          <TachesParPrioriteCard data={tachesParPriorite} />
        </div>

        {/* Tâches urgentes + Mes tâches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TachesUrgentesCard data={tachesUrgentes} />
          <MesTachesCard data={mesTaches} />
        </div>

        {/* Activités récentes (sans finances) */}
        <ActivitesRecentesCard data={recentActivites} />
        
        {/* Quick Links */}
        <QuickLinks />
      </div>
    );
  }

  // ============================================================
  // RENDU AGENT FINANCIER (AVEC FINANCES)
  // ============================================================
  if (role === 'agent_financier') {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">
              💰 Bonjour, {profile?.full_name || 'Agent Financier'}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">📊 Gestion financière du mois</p>
          </div>
          <button onClick={loadDashboardData} disabled={loading} className="px-4 py-2 bg-[#0D1F3C] border border-[#1A3A6B] rounded-lg text-gray-400 hover:text-white hover:border-[#F0C75E]/40 transition-all flex items-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Rafraîchir
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Fond de caisse" value={`${tresorerie.fond_caisse.toFixed(2)} DT`} icon="🏦" color="text-[#F0C75E]" />
          <StatCard title="Revenus" value={`+ ${tresorerie.revenus.toFixed(2)} DT`} icon="📈" color="text-green-400" />
          <StatCard title="Dépenses" value={`- ${tresorerie.depenses.toFixed(2)} DT`} icon="📉" color="text-red-400" />
          <StatCard title="Solde" value={`${tresorerie.balance >= 0 ? '+' : ''}${tresorerie.balance.toFixed(2)} DT`} icon="⚖️" color={tresorerie.balance >= 0 ? 'text-[#F0C75E]' : 'text-red-400'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EvolutionMensuelleCard data={evolutionMensuelle} />
          </div>
          <div className="space-y-4">
            <DepensesParCategorieCard data={depensesParCategorie} />
            <RevenusParCategorieCard data={revenusParCategorie} />
          </div>
        </div>

        <ActivitesRecentesCard data={recentActivites} />
        <QuickLinks />
      </div>
    );
  }

  // ============================================================
  // RENDU GÉRANT
  // ============================================================
  if (role === 'gerant') {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">
              📋 Bonjour, {profile?.full_name || 'Gérant'}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">📊 Vue commerciale de l'activité</p>
          </div>
          <button onClick={loadDashboardData} disabled={loading} className="px-4 py-2 bg-[#0D1F3C] border border-[#1A3A6B] rounded-lg text-gray-400 hover:text-white hover:border-[#F0C75E]/40 transition-all flex items-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Rafraîchir
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Chiffre d'affaires" value={`${chiffreAffaires.toFixed(2)} DT`} icon="💰" color="text-[#F0C75E]" />
          <StatCard title="Commandes" value={commandes.total} icon="📦" color="text-blue-400" subtitle={`${commandes.termine} terminées`} />
          <StatCard title="Panier moyen" value={`${panierMoyen.toFixed(2)} DT`} icon="🛒" color="text-green-400" />
          <StatCard title="Taux conversion" value={`${tauxConversion.toFixed(1)}%`} icon="📊" color="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CommandesParMoisCard data={commandesParMois} />
          <TopClientsCard data={topClients} />
        </div>

        <DernieresCommandesCard data={recentCommandes} />
        <ActivitesRecentesCard data={recentActivites} />
        <QuickLinks />
      </div>
    );
  }

  // ============================================================
  // RENDU ADMIN (Vue complète)
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl text-white">
            👋 Bonjour, {profile?.full_name || 'Admin'}!
          </h1>
          <p className="text-gray-400 text-sm mt-1">📊 Vue complète de l'activité</p>
        </div>
        <button onClick={loadDashboardData} disabled={loading} className="px-4 py-2 bg-[#0D1F3C] border border-[#1A3A6B] rounded-lg text-gray-400 hover:text-white hover:border-[#F0C75E]/40 transition-all flex items-center gap-2 disabled:opacity-50">
          <span className="material-symbols-outlined text-lg">refresh</span>
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Commandes" value={commandes.total} icon="📦" color="text-blue-400" subtitle={`${commandes.en_cours} en cours`} />
        <StatCard title="Clients" value={clients.total} icon="👥" color="text-green-400" subtitle={`${clients.actif} actifs`} />
        <StatCard title="Tâches" value={tachesStats.total} icon="✅" color="text-purple-400" subtitle={`${tachesStats.a_faire} à faire`} />
        <StatCard title="Produits" value={produits.total} icon="🛍️" color="text-[#F0C75E]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TresorerieCard data={{ tresorerie, caissier }} />
        </div>
        <CommandesParStatut data={commandes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TachesParEquipeCard data={tachesParEquipe} />
        <TachesParPrioriteCard data={tachesParPriorite} />
        <ClientsParType data={clients} />
      </div>

      <ActivitesRecentesCard data={recentActivites} />
      <QuickLinks />
    </div>
  );
}

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

function ProgressBar({ label, value, total, color = '#F0C75E' }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value || 0}</span>
      </div>
      <div className="w-full h-1.5 bg-[#1A3A6B] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function TresorerieCard({ data }) {
  const { tresorerie, caissier } = data;
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider">💰 Trésorerie du mois</h3>
        <Link to="/journal-caisse" className="text-[#F0C75E] text-xs hover:underline">Voir tout →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0A1628] rounded-lg p-3 text-center border border-[#F0C75E]/20">
          <p className="text-gray-400 text-xs">Fond de caisse</p>
          <p className="text-lg font-bold text-[#F0C75E]">{tresorerie.fond_caisse.toFixed(2)} DT</p>
        </div>
        <div className="bg-[#0A1628] rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">Revenus</p>
          <p className="text-lg font-bold text-green-400">+ {tresorerie.revenus.toFixed(2)} DT</p>
        </div>
        <div className="bg-[#0A1628] rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">Dépenses</p>
          <p className="text-lg font-bold text-red-400">- {tresorerie.depenses.toFixed(2)} DT</p>
        </div>
        <div className="bg-[#0A1628] rounded-lg p-3 text-center border border-[#F0C75E]/20">
          <p className="text-gray-400 text-xs">Solde</p>
          <p className={`text-lg font-bold ${tresorerie.balance >= 0 ? 'text-[#F0C75E]' : 'text-red-400'}`}>
            {tresorerie.balance >= 0 ? '+' : ''}{tresorerie.balance.toFixed(2)} DT
          </p>
        </div>
      </div>
      {caissier.mois && caissier.mois.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1A3A6B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Évolution des 6 derniers mois</span>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Revenus</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Dépenses</span>
            </div>
          </div>
          <div className="flex items-end h-16 gap-1">
            {caissier.mois.map((label, idx) => {
              const maxValue = Math.max(...caissier.revenus, ...caissier.depenses, 1);
              const revHeight = (caissier.revenus[idx] / maxValue) * 100;
              const depHeight = (caissier.depenses[idx] / maxValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex gap-0.5 items-end h-12">
                    <div className="flex-1 bg-green-400/70 rounded-t transition-all duration-700" style={{ height: `${Math.max(revHeight, 2)}%`, minHeight: '2px' }} />
                    <div className="flex-1 bg-red-400/70 rounded-t transition-all duration-700" style={{ height: `${Math.max(depHeight, 2)}%`, minHeight: '2px' }} />
                  </div>
                  <span className="text-[8px] text-gray-500">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CommandesParStatut({ data }) {
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📊 Commandes par statut</h3>
      <ProgressBar label="✅ Terminées" value={data.termine} total={data.total} color="#22c55e" />
      <ProgressBar label="🔄 En cours" value={data.en_cours} total={data.total} color="#3b82f6" />
      <ProgressBar label="⏳ En attente" value={data.en_attente} total={data.total} color="#eab308" />
      <ProgressBar label="💰 Payées" value={data.paye} total={data.total} color="#8b5cf6" />
      <ProgressBar label="❌ Annulées" value={data.annule} total={data.total} color="#ef4444" />
      <div className="mt-3 pt-3 border-t border-[#1A3A6B] flex justify-between text-xs">
        <span className="text-gray-500">Total: {data.total}</span>
        <Link to="/commandes" className="text-[#F0C75E] hover:underline">Voir tout</Link>
      </div>
    </div>
  );
}

function TachesParEquipeCard({ data }) {
  const entries = Object.entries(data || {});
  if (entries.length === 0) {
    return (
      <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">👷 Tâches par équipe</h3>
        <p className="text-gray-500 text-sm text-center py-4">Aucune tâche</p>
      </div>
    );
  }
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">👷 Tâches par équipe</h3>
      <div className="space-y-2">
        {entries.map(([nom, values]) => (
          <div key={nom} className="flex items-center justify-between p-2 bg-[#0A1628] rounded-lg">
            <span className="text-white text-sm">{nom}</span>
            <div className="flex gap-2 text-xs">
              <span className="text-yellow-400">📋{values.a_faire || 0}</span>
              <span className="text-blue-400">🔄{values.en_cours || 0}</span>
              <span className="text-green-400">✅{values.termine || 0}</span>
              <span className="text-gray-400 font-bold">{values.total || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TachesParPrioriteCard({ data }) {
  const colors = { basse: 'text-green-400', normale: 'text-blue-400', haute: 'text-orange-400', urgente: 'text-red-400' };
  const icons = { basse: '🟢', normale: '🔵', haute: '🟠', urgente: '🔴' };
  const entries = Object.entries(data || {});
  if (entries.length === 0) {
    return (
      <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">⚠️ Tâches par priorité</h3>
        <p className="text-gray-500 text-sm text-center py-4">Aucune tâche</p>
      </div>
    );
  }
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">⚠️ Tâches par priorité</h3>
      <div className="space-y-2">
        {entries.map(([priorite, count]) => (
          <div key={priorite} className="flex items-center justify-between p-2 bg-[#0A1628] rounded-lg">
            <span className={`text-sm ${colors[priorite] || 'text-gray-400'}`}>{icons[priorite]} {priorite.charAt(0).toUpperCase() + priorite.slice(1)}</span>
            <span className="text-white font-bold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TachesUrgentesCard({ data }) {
  const list = data || [];
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>🚨 Tâches urgentes</span>
        <span className="text-[10px] text-red-400 animate-pulse">{list.length}</span>
      </h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">✅ Aucune tâche urgente</p>
      ) : (
        <div className="space-y-2">
          {list.map((tache, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">{tache.titre}</p>
                <p className="text-gray-400 text-[10px]">{tache.status}</p>
              </div>
              <Link to="/equipage" className="text-[#F0C75E] text-xs hover:underline">Voir</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MesTachesCard({ data }) {
  const list = data || [];
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📋 Mes tâches récentes</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Aucune tâche assignée</p>
      ) : (
        <div className="space-y-2">
          {list.slice(0, 5).map((tache, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-[#0A1628] rounded-lg">
              <div>
                <p className="text-white text-sm">{tache.titre}</p>
                <p className="text-gray-400 text-[10px]">{tache.status}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                tache.status === 'termine' ? 'bg-green-500/20 text-green-400' :
                tache.status === 'en_cours' ? 'bg-blue-500/20 text-blue-400' :
                tache.status === 'en_pause' ? 'bg-purple-500/20 text-purple-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {tache.status === 'termine' ? '✅' :
                 tache.status === 'en_cours' ? '🔄' :
                 tache.status === 'en_pause' ? '⏸️' : '📋'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientsParType({ data }) {
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">👤 Clients par type</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">👤 Particuliers</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[#1A3A6B] rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-1000" style={{ width: `${data.total > 0 ? (data.particulier / data.total) * 100 : 0}%` }} />
            </div>
            <span className="text-white font-medium text-sm">{data.particulier}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">🏢 Entreprises</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[#1A3A6B] rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${data.total > 0 ? (data.entreprise / data.total) * 100 : 0}%` }} />
            </div>
            <span className="text-white font-medium text-sm">{data.entreprise}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">🧳 Passagers</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[#1A3A6B] rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full transition-all duration-1000" style={{ width: `${data.total > 0 ? (data.passager / data.total) * 100 : 0}%` }} />
            </div>
            <span className="text-white font-medium text-sm">{data.passager}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[#1A3A6B] flex justify-between text-xs">
        <span className="text-gray-500">Total: {data.total} clients</span>
        <span className="text-gray-500">{data.actif} actifs / {data.inactif} inactifs</span>
      </div>
    </div>
  );
}

function TopClientsCard({ data }) {
  const list = data || [];
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">🏆 Top 5 Clients</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Aucun client</p>
      ) : (
        <div className="space-y-2">
          {list.map((client, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-[#0A1628] rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-[#F0C75E] text-[#071325]' : idx === 1 ? 'bg-gray-400 text-[#071325]' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-[#1A3A6B] text-gray-400'}`}>
                  {idx + 1}
                </span>
                <span className="text-white text-sm">{client.nom} {client.prenom}</span>
              </div>
              <div className="text-right">
                <p className="text-[#F0C75E] text-sm font-semibold">{client.total.toFixed(2)} DT</p>
                <p className="text-[10px] text-gray-500">{client.count} commandes</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DernieresCommandesCard({ data }) {
  const list = data || [];
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📋 Dernières commandes</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Aucune commande récente</p>
      ) : (
        <div className="space-y-2">
          {list.map((cmd) => (
            <Link key={cmd.id} to="/commandes" className="block p-2 bg-[#0A1628] rounded-lg hover:bg-[#1A3A6B]/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{cmd.numero}</p>
                  <p className="text-gray-500 text-xs">{cmd.erp_clients?.nom || 'Client inconnu'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#F0C75E] text-sm font-semibold">{cmd.total_ttc?.toFixed(2)} DT</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    cmd.status === 'termine' ? 'bg-green-500/20 text-green-400' :
                    cmd.status === 'en_cours' ? 'bg-blue-500/20 text-blue-400' :
                    cmd.status === 'en_attente' ? 'bg-yellow-500/20 text-yellow-400' :
                    cmd.status === 'paye' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {cmd.status === 'termine' ? '✅ Terminé' :
                     cmd.status === 'en_cours' ? '🔄 En cours' :
                     cmd.status === 'en_attente' ? '⏳ En attente' :
                     cmd.status === 'paye' ? '💰 Payé' : '❌ Annulé'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EvolutionMensuelleCard({ data }) {
  const list = data || [];
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📈 Évolution mensuelle</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Aucune donnée</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-[#1A3A6B]">
              <tr>
                <th className="text-left py-2">Mois</th>
                <th className="text-right py-2">Revenus</th>
                <th className="text-right py-2">Dépenses</th>
                <th className="text-right py-2">Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3A6B]">
              {list.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 text-white">{item.mois}</td>
                  <td className="py-2 text-right text-green-400">+ {item.revenus.toFixed(2)} DT</td>
                  <td className="py-2 text-right text-red-400">- {item.depenses.toFixed(2)} DT</td>
                  <td className={`py-2 text-right font-semibold ${item.solde >= 0 ? 'text-[#F0C75E]' : 'text-red-400'}`}>
                    {item.solde >= 0 ? '+' : ''}{item.solde.toFixed(2)} DT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DepensesParCategorieCard({ data }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return (
      <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">💸 Dépenses par catégorie</h3>
        <p className="text-gray-500 text-sm text-center py-4">Aucune dépense</p>
      </div>
    );
  }
  const total = entries.reduce((sum, [, val]) => sum + val, 0);
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">💸 Dépenses par catégorie</h3>
      <div className="space-y-2">
        {entries.slice(0, 5).map(([cat, montant]) => {
          const percent = total > 0 ? (montant / total) * 100 : 0;
          return (
            <div key={cat}>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">{cat}</span>
                <span className="text-red-400">{montant.toFixed(2)} DT</span>
              </div>
              <div className="w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-red-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RevenusParCategorieCard({ data }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return (
      <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">💰 Revenus par catégorie</h3>
        <p className="text-gray-500 text-sm text-center py-4">Aucun revenu</p>
      </div>
    );
  }
  const total = entries.reduce((sum, [, val]) => sum + val, 0);
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">💰 Revenus par catégorie</h3>
      <div className="space-y-2">
        {entries.slice(0, 5).map(([cat, montant]) => {
          const percent = total > 0 ? (montant / total) * 100 : 0;
          return (
            <div key={cat}>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">{cat}</span>
                <span className="text-green-400">{montant.toFixed(2)} DT</span>
              </div>
              <div className="w-full h-1 bg-[#1A3A6B] rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-green-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommandesParMoisCard({ data }) {
  const list = data || [];
  const maxVal = Math.max(...list.map(c => c.total || 0), 1);
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📊 Évolution des commandes</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Aucune donnée</p>
      ) : (
        <div className="flex items-end h-24 gap-2">
          {list.map((item, idx) => {
            const height = (item.total / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-8 bg-blue-400/70 rounded-t transition-all duration-700" style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }} />
                </div>
                <span className="text-[8px] text-gray-500">{item.mois}</span>
                <span className="text-[8px] text-white font-bold">{item.total}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivitesRecentesCard({ data }) {
  const list = data || [];
  return (
    <div className="bg-[#0D1F3C] rounded-xl p-4 border border-[#1A3A6B]">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>🔄 Activités récentes</span>
        <span className="text-[10px] text-gray-500">({list.length})</span>
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {list.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucune activité récente</p>
        ) : (
          list.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-[#0A1628] rounded-lg hover:bg-[#1A3A6B]/30 transition">
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.message}</p>
                <p className="text-gray-500 text-[10px]">
                  {new Date(activity.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className={`text-xs ${activity.color}`}>
                {activity.type === 'commande' ? '📦 Commande' :
                 activity.type === 'revenue' ? '💰 Revenue' :
                 activity.type === 'expense' ? '💸 Dépense' : '👷 Tâche'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuickLinks() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Link to="/commandes" className="bg-[#0D1F3C] rounded-xl p-3 border border-[#1A3A6B] hover:border-[#F0C75E]/40 hover:scale-[1.02] transition-all duration-300 flex items-center gap-3">
        <span className="text-2xl">📦</span>
        <div>
          <p className="text-white text-sm font-medium">Commandes</p>
          <p className="text-gray-400 text-xs">Gérer les commandes</p>
        </div>
      </Link>
      <Link to="/clients" className="bg-[#0D1F3C] rounded-xl p-3 border border-[#1A3A6B] hover:border-[#F0C75E]/40 hover:scale-[1.02] transition-all duration-300 flex items-center gap-3">
        <span className="text-2xl">👤</span>
        <div>
          <p className="text-white text-sm font-medium">Clients</p>
          <p className="text-gray-400 text-xs">Carnet d'adresses</p>
        </div>
      </Link>
      {/* 🔥 Pour Designer - Pas de lien Caisse */}
      <Link to="/equipage" className="bg-[#0D1F3C] rounded-xl p-3 border border-[#1A3A6B] hover:border-[#F0C75E]/40 hover:scale-[1.02] transition-all duration-300 flex items-center gap-3">
        <span className="text-2xl">⚙️</span>
        <div>
          <p className="text-white text-sm font-medium">Équipage</p>
          <p className="text-gray-400 text-xs">Suivi des tâches</p>
        </div>
      </Link>
      <Link to="/catalogue" className="bg-[#0D1F3C] rounded-xl p-3 border border-[#1A3A6B] hover:border-[#F0C75E]/40 hover:scale-[1.02] transition-all duration-300 flex items-center gap-3">
        <span className="text-2xl">📚</span>
        <div>
          <p className="text-white text-sm font-medium">Catalogue</p>
          <p className="text-gray-400 text-xs">Produits</p>
        </div>
      </Link>
    </div>
  );
}