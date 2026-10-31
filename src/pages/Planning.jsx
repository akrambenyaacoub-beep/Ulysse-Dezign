// src/pages/Planning.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabaseErp, supabaseAdmin } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday as isTodayFn, 
  isWeekend, 
  addMonths, 
  subMonths, 
  getDay, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  differenceInDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Planning() {
  const { profile } = useAuth();
  const userRole = profile?.role;
  const isAdmin = userRole === 'admin' || userRole === 'gerant';
  const currentUserId = profile?.id;

  // États principaux
  const [plannings, setPlannings] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedEmploye, setSelectedEmploye] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [selectedDayPlannings, setSelectedDayPlannings] = useState([]);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ total: 0, upcoming: 0 });

  // États du formulaire
  const [formData, setFormData] = useState({
    employe_id: '',
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    heure_debut: '08:00',
    heure_fin: '17:00',
    type: 'travail',
    statut: 'planifie',
    tache_id: null,
    couleur: '#3B82F6',
    recurrence: 'aucune',
    lieu: '',
    notes: ''
  });

  // Configuration des types avec plus de détails
  const typeConfig = {
    travail: { bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300', icon: '💼', label: 'Travail', dot: 'bg-blue-500', gradient: 'from-blue-500/30 via-blue-600/10 to-transparent', glow: 'shadow-blue-500/20' },
    pause: { bg: 'bg-gray-500/20 border-gray-500/40 text-gray-300', icon: '☕', label: 'Pause', dot: 'bg-gray-500', gradient: 'from-gray-500/30 via-gray-600/10 to-transparent', glow: 'shadow-gray-500/20' },
    formation: { bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300', icon: '📚', label: 'Formation', dot: 'bg-purple-500', gradient: 'from-purple-500/30 via-purple-600/10 to-transparent', glow: 'shadow-purple-500/20' },
    reunion: { bg: 'bg-orange-500/20 border-orange-500/40 text-orange-300', icon: '🤝', label: 'Réunion', dot: 'bg-orange-500', gradient: 'from-orange-500/30 via-orange-600/10 to-transparent', glow: 'shadow-orange-500/20' },
    conges: { bg: 'bg-green-500/20 border-green-500/40 text-green-300', icon: '🌴', label: 'Congés', dot: 'bg-green-500', gradient: 'from-green-500/30 via-green-600/10 to-transparent', glow: 'shadow-green-500/20' },
    autre: { bg: 'bg-pink-500/20 border-pink-500/40 text-pink-300', icon: '📌', label: 'Autre', dot: 'bg-pink-500', gradient: 'from-pink-500/30 via-pink-600/10 to-transparent', glow: 'shadow-pink-500/20' }
  };

  const statutConfig = {
    planifie: { bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '📋', label: 'Planifié' },
    confirme: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '✅', label: 'Confirmé' },
    termine: { bg: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '✔️', label: 'Terminé' },
    annule: { bg: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '❌', label: 'Annulé' }
  };

  const typeOptions = [
    { value: 'travail', label: '💼 Travail' },
    { value: 'pause', label: '☕ Pause' },
    { value: 'formation', label: '📚 Formation' },
    { value: 'reunion', label: '🤝 Réunion' },
    { value: 'conges', label: '🌴 Congés' },
    { value: 'autre', label: '📌 Autre' }
  ];

  const statutOptions = [
    { value: 'planifie', label: '📋 Planifié' },
    { value: 'confirme', label: '✅ Confirmé' },
    { value: 'termine', label: '✔️ Terminé' },
    { value: 'annule', label: '❌ Annulé' }
  ];

  const recurrenceOptions = [
    { value: 'aucune', label: 'Aucune' },
    { value: 'quotidien', label: 'Quotidien' },
    { value: 'hebdomadaire', label: 'Hebdomadaire' },
    { value: 'mensuel', label: 'Mensuel' }
  ];

  // Chargement
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const client = supabaseAdmin || supabaseErp;

      const [employesRes, planningsRes, tachesRes] = await Promise.all([
        client.from('erp_profiles').select('id, full_name, role, avatar_url').order('full_name'),
        client.from('erp_plannings').select('*, erp_profiles(full_name, role, avatar_url)').order('date_debut', { ascending: true }),
        client.from('erp_taches').select('id, titre, status, priorite').eq('archivee', false).order('priorite', { ascending: false })
      ]);

      setEmployes(employesRes.data || []);
      setPlannings(planningsRes.data || []);
      setTaches(tachesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      showAlert('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }

  // Filtrage
  const filteredPlannings = useMemo(() => {
    let filtered = plannings;

    if (selectedEmploye !== 'all') {
      filtered = filtered.filter(p => p.employe_id === selectedEmploye);
    } else if (!isAdmin) {
      filtered = filtered.filter(p => p.employe_id === currentUserId);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.titre?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.lieu?.toLowerCase().includes(term) ||
        p.erp_profiles?.full_name?.toLowerCase().includes(term)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    if (filterStatut !== 'all') {
      filtered = filtered.filter(p => p.statut === filterStatut);
    }

    return filtered;
  }, [plannings, selectedEmploye, searchTerm, isAdmin, currentUserId, filterType, filterStatut]);

  // Statistiques
  const stats = useMemo(() => {
    const total = filteredPlannings.length;
    const planifie = filteredPlannings.filter(p => p.statut === 'planifie').length;
    const confirme = filteredPlannings.filter(p => p.statut === 'confirme').length;
    const termine = filteredPlannings.filter(p => p.statut === 'termine').length;
    const annule = filteredPlannings.filter(p => p.statut === 'annule').length;
    
    const byType = {};
    Object.keys(typeConfig).forEach(key => {
      byType[key] = filteredPlannings.filter(p => p.type === key).length;
    });

    const today = new Date();
    const nextWeek = addDays(today, 7);
    const upcoming = filteredPlannings.filter(p => {
      const pStart = parseISO(p.date_debut);
      return pStart >= today && pStart <= nextWeek && p.statut !== 'termine' && p.statut !== 'annule';
    });

    return { total, planifie, confirme, termine, annule, byType, upcoming };
  }, [filteredPlannings]);

  // ✅ Animation des compteurs
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = stats.total / steps;
    const upcomingIncrement = stats.upcoming.length / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setAnimatedStats({
        total: Math.min(Math.round(increment * current), stats.total),
        upcoming: Math.min(Math.round(upcomingIncrement * current), stats.upcoming.length)
      });
      if (current >= steps) clearInterval(timer);
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [stats.total, stats.upcoming.length]);

  // Navigation
  const navigate = (direction) => {
    if (viewMode === 'month') {
      setCurrentViewDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    } else if (viewMode === 'week') {
      setCurrentViewDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentViewDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentViewDate(new Date());
    setSelectedDate(new Date());
  };

  const getPlanningsForDate = (date) => {
    return filteredPlannings.filter(p => {
      const pStart = parseISO(p.date_debut);
      const pEnd = p.date_fin ? parseISO(p.date_fin) : pStart;
      const startDate = new Date(pStart.getFullYear(), pStart.getMonth(), pStart.getDate());
      const endDate = new Date(pEnd.getFullYear(), pEnd.getMonth(), pEnd.getDate());
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  // CRUD
  const openCreateModal = (date = null) => {
    setModalMode('create');
    setSelectedPlanning(null);
    const now = new Date();
    const dateStr = date ? format(date, 'yyyy-MM-dd') : format(now, 'yyyy-MM-dd');
    const employeId = !isAdmin ? currentUserId : '';
    
    setFormData({
      employe_id: employeId,
      titre: '',
      description: '',
      date_debut: dateStr,
      date_fin: dateStr,
      heure_debut: '08:00',
      heure_fin: '17:00',
      type: 'travail',
      statut: 'planifie',
      tache_id: null,
      couleur: '#3B82F6',
      recurrence: 'aucune',
      lieu: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (planning) => {
    setModalMode('edit');
    setSelectedPlanning(planning);
    setFormData({
      employe_id: planning.employe_id || '',
      titre: planning.titre || '',
      description: planning.description || '',
      date_debut: planning.date_debut?.split('T')[0] || '',
      date_fin: planning.date_fin?.split('T')[0] || '',
      heure_debut: planning.heure_debut || '08:00',
      heure_fin: planning.heure_fin || '17:00',
      type: planning.type || 'travail',
      statut: planning.statut || 'planifie',
      tache_id: planning.tache_id || null,
      couleur: planning.couleur || '#3B82F6',
      recurrence: planning.recurrence || 'aucune',
      lieu: planning.lieu || '',
      notes: planning.notes || ''
    });
    setModalOpen(true);
  };

  const openDayModal = (date) => {
    const planningsForDay = getPlanningsForDate(date);
    setSelectedDayPlannings(planningsForDay);
    setSelectedDate(date);
    setDayModalOpen(true);
  };

  const savePlanning = async () => {
    if (!formData.titre.trim()) {
      showAlert('error', '❌ Le titre est obligatoire');
      return;
    }
    if (!formData.employe_id) {
      showAlert('error', '❌ Veuillez sélectionner un employé');
      return;
    }
    if (!formData.date_debut) {
      showAlert('error', '❌ La date de début est obligatoire');
      return;
    }

    setIsSubmitting(true);

    try {
      const planningData = {
        employe_id: formData.employe_id,
        titre: formData.titre.trim(),
        description: formData.description?.trim() || null,
        date_debut: `${formData.date_debut}T${formData.heure_debut || '08:00'}:00`,
        date_fin: formData.date_fin ? `${formData.date_fin}T${formData.heure_fin || '17:00'}:00` : null,
        type: formData.type,
        statut: formData.statut,
        tache_id: formData.tache_id || null,
        couleur: formData.couleur || '#3B82F6',
        recurrence: formData.recurrence || 'aucune',
        lieu: formData.lieu?.trim() || null,
        notes: formData.notes?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const client = supabaseAdmin || supabaseErp;

      if (modalMode === 'create') {
        const { error } = await client.from('erp_plannings').insert([planningData]);
        if (error) throw error;
        showAlert('success', '✅ Planning créé avec succès');
      } else {
        const { error } = await client.from('erp_plannings').update(planningData).eq('id', selectedPlanning.id);
        if (error) throw error;
        showAlert('success', '✅ Planning mis à jour');
      }

      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', '❌ ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePlanning = async (id) => {
    try {
      const client = supabaseAdmin || supabaseErp;
      const { error } = await client
        .from('erp_plannings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showAlert('success', '✅ Planning supprimé avec succès');
      await loadData();
      
      if (dayModalOpen) {
        setDayModalOpen(false);
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showAlert('error', '❌ ' + error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  // ✅ CARTE D'ÉVÉNEMENT ULTRA DESIGN
  const EventCard = ({ planning, compact = false }) => {
    const type = typeConfig[planning.type] || typeConfig.autre;
    const statut = statutConfig[planning.statut] || statutConfig.planifie;
    const startTime = format(parseISO(planning.date_debut), 'HH:mm');
    const endTime = planning.date_fin ? format(parseISO(planning.date_fin), 'HH:mm') : '';

    const pStart = parseISO(planning.date_debut);
    const pEnd = planning.date_fin ? parseISO(planning.date_fin) : pStart;
    const dayCount = differenceInDays(pEnd, pStart) + 1;

    if (compact) {
      return (
        <div
          onClick={(e) => { e.stopPropagation(); openEditModal(planning); }}
          className={`
            relative group cursor-pointer transition-all duration-300 ease-out
            p-3 rounded-xl
            bg-gradient-to-r ${type.gradient}
            border border-[#1A3A6B]/50 hover:border-[#F0C75E]/50 
            hover:shadow-lg hover:shadow-[#F0C75E]/10 hover:scale-[1.03]
            backdrop-blur-sm overflow-hidden
          `}
          style={{ borderLeft: `3px solid ${planning.couleur || '#3B82F6'}` }}
        >
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center gap-2">
            <span className="text-base">{type.icon}</span>
            <span className="text-xs font-bold text-white truncate flex-1 tracking-tight">{planning.titre}</span>
            {dayCount > 1 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F0C75E]/20 text-[#F0C75E] font-bold">
                {dayCount}j
              </span>
            )}
          </div>
          <div className="relative flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-gray-300 font-mono font-medium">{startTime}</span>
            {endTime && <span className="text-[10px] text-gray-400">→ {endTime}</span>}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`
          relative group cursor-pointer transition-all duration-500 ease-out
          p-5 rounded-2xl
          bg-gradient-to-br ${type.gradient}
          border border-[#1A3A6B]/50 hover:border-[#F0C75E]/50 
          hover:shadow-2xl hover:shadow-[#F0C75E]/10 hover:scale-[1.01]
          backdrop-blur-sm overflow-hidden
        `}
        style={{ borderLeft: `4px solid ${planning.couleur || '#3B82F6'}` }}
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0" onClick={() => openEditModal(planning)}>
            {/* Titre + Type */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="text-2xl">{type.icon}</span>
              <h3 className="font-bold text-lg text-white truncate tracking-tight">
                {planning.titre}
              </h3>
              {dayCount > 1 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0C75E]/20 text-[#F0C75E] font-bold">
                  {dayCount} jours
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statut.bg} backdrop-blur-sm`}>
                {statut.icon} {statut.label}
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#0A1628]/60 text-gray-300 border border-[#1A3A6B]/50 backdrop-blur-sm font-medium">
                🕐 {startTime}{endTime && ` → ${endTime}`}
              </span>
              {planning.lieu && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#0A1628]/60 text-gray-400 border border-[#1A3A6B]/50 backdrop-blur-sm font-medium">
                  📍 {planning.lieu}
                </span>
              )}
            </div>

            {/* Assigné */}
            {planning.erp_profiles && (
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1359A9] to-[#1E7AC4] flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {planning.erp_profiles.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 font-medium">
                  {planning.erp_profiles.full_name}
                </span>
              </div>
            )}

            {/* Description */}
            {planning.description && (
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mt-3 pt-3 border-t border-[#1A3A6B]/30">
                {planning.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); openEditModal(planning); }}
              className="w-9 h-9 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-all duration-300 hover:scale-110 flex items-center justify-center border border-blue-500/20 hover:border-blue-500/50"
              title="Modifier"
            >
              ✏️
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDialog({ open: true, id: planning.id }); }}
              className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all duration-300 hover:scale-110 flex items-center justify-center border border-red-500/20 hover:border-red-500/50"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ DASHBOARD COMPACT ET ÉLÉGANT
const renderDashboard = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
    {/* Total */}
    <div className="group relative bg-gradient-to-br from-[#0D1F3C] to-[#0A1628] rounded-xl p-4 border border-[#1A3A6B] hover:border-[#F0C75E]/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#F0C75E]/5 rounded-full blur-2xl group-hover:bg-[#F0C75E]/10 transition-all" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0C75E]/20 to-[#F0C75E]/5 flex items-center justify-center border border-[#F0C75E]/20 flex-shrink-0">
          <span className="text-lg">📊</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-white leading-tight font-['Playfair_Display']">
            {animatedStats.total}
          </p>
        </div>
      </div>
      <div className="relative flex gap-2 text-[10px] font-semibold mt-3 flex-wrap">
        <span className="text-yellow-400">📋 {stats.planifie}</span>
        <span className="text-blue-400">✅ {stats.confirme}</span>
        <span className="text-green-400">✔️ {stats.termine}</span>
        <span className="text-red-400">❌ {stats.annule}</span>
      </div>
    </div>

    {/* À venir */}
    <div className="group relative bg-gradient-to-br from-[#0D1F3C] to-[#0A1628] rounded-xl p-4 border border-[#1A3A6B] hover:border-[#F0C75E]/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#F0C75E]/5 rounded-full blur-2xl group-hover:bg-[#F0C75E]/10 transition-all" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0C75E]/20 to-[#F0C75E]/5 flex items-center justify-center border border-[#F0C75E]/20 flex-shrink-0">
          <span className="text-lg">⏰</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">À venir</p>
          <p className="text-2xl font-bold text-[#F0C75E] leading-tight font-['Playfair_Display']">
            {animatedStats.upcoming}
          </p>
        </div>
      </div>
      <p className="relative text-[10px] text-gray-500 font-medium mt-3">7 prochains jours</p>
    </div>

    {/* Par type */}
    <div className="group relative bg-gradient-to-br from-[#0D1F3C] to-[#0A1628] rounded-xl p-4 border border-[#1A3A6B] hover:border-[#F0C75E]/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#1359A9]/5 rounded-full blur-2xl group-hover:bg-[#1359A9]/10 transition-all" />
      <div className="relative flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1359A9]/20 to-[#1359A9]/5 flex items-center justify-center border border-[#1359A9]/20 flex-shrink-0">
          <span className="text-lg">📌</span>
        </div>
        <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Par type</p>
      </div>
      <div className="relative flex flex-wrap gap-1">
        {Object.entries(stats.byType).filter(([_, count]) => count > 0).map(([key, count]) => (
          <span key={key} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1A3A6B]/60 text-gray-300 font-semibold">
            {typeConfig[key]?.icon} {count}
          </span>
        ))}
        {stats.total === 0 && (
          <span className="text-[10px] text-gray-500 italic">Aucun</span>
        )}
      </div>
    </div>

    {/* Répartition */}
    <div className="group relative bg-gradient-to-br from-[#0D1F3C] to-[#0A1628] rounded-xl p-4 border border-[#1A3A6B] hover:border-[#F0C75E]/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#F0C75E]/5 rounded-full blur-2xl group-hover:bg-[#F0C75E]/10 transition-all" />
      <div className="relative flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0C75E]/20 to-[#F0C75E]/5 flex items-center justify-center border border-[#F0C75E]/20 flex-shrink-0">
          <span className="text-lg">📈</span>
        </div>
        <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Répartition</p>
      </div>
      <div className="relative flex gap-0.5 h-2 w-full rounded-full overflow-hidden bg-[#0A1628]/50 mb-2">
        {stats.total > 0 ? (
          <>
            <div className="bg-yellow-400 transition-all duration-1000" style={{ width: `${(stats.planifie / stats.total) * 100}%` }} />
            <div className="bg-blue-400 transition-all duration-1000" style={{ width: `${(stats.confirme / stats.total) * 100}%` }} />
            <div className="bg-green-400 transition-all duration-1000" style={{ width: `${(stats.termine / stats.total) * 100}%` }} />
            <div className="bg-red-400 transition-all duration-1000" style={{ width: `${(stats.annule / stats.total) * 100}%` }} />
          </>
        ) : (
          <div className="bg-gray-700 rounded-full w-full" />
        )}
      </div>
      <p className="relative text-[10px] text-gray-500 font-medium">
        {stats.total > 0 ? `${Math.round((stats.termine / stats.total) * 100)}% terminé` : 'Aucun événement'}
      </p>
    </div>
  </div>
);

  // ✅ VUE MOIS ULTRA DESIGN
  const renderMonthView = () => {
    const start = startOfMonth(currentViewDate);
    const end = endOfMonth(currentViewDate);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonth = getDay(start);
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const paddedDays = [];
    const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < startPadding; i++) paddedDays.push(null);
    paddedDays.push(...days.map(date => ({ date, plannings: getPlanningsForDate(date) })));

    const weeks = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    return (
      <div className="bg-gradient-to-br from-[#0D1F3C] via-[#0A1628] to-[#0D1F3C] rounded-3xl border border-[#1A3A6B] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071325] via-[#0A1628] to-[#071325] px-6 md:px-8 py-5 md:py-6 border-b border-[#1A3A6B] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl text-white font-bold capitalize tracking-tight">
              {format(currentViewDate, 'MMMM yyyy', { locale: fr })}
            </h3>
            <div className="flex gap-1 bg-[#0A1628]/70 rounded-xl p-1 border border-[#1A3A6B]/30">
              <button onClick={() => navigate('prev')} className="px-3 py-2 rounded-lg hover:bg-[#1A3A6B] text-gray-400 hover:text-white transition-all duration-200 hover:scale-105">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button onClick={goToToday} className="px-5 py-2 rounded-lg bg-[#F0C75E]/15 text-[#F0C75E] text-sm font-semibold hover:bg-[#F0C75E]/25 transition-all duration-200 hover:scale-105">
                📅 Aujourd'hui
              </button>
              <button onClick={() => navigate('next')} className="px-3 py-2 rounded-lg hover:bg-[#1A3A6B] text-gray-400 hover:text-white transition-all duration-200 hover:scale-105">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0A1628]/70 rounded-xl p-1 border border-[#1A3A6B]/30">
            {[
              { id: 'month', label: '📅 Mois' },
              { id: 'week', label: '📊 Semaine' },
              { id: 'day', label: '📋 Jour' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setViewMode(m.id)} 
                className={`px-4 md:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  viewMode === m.id 
                    ? 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] shadow-lg shadow-[#F0C75E]/20 scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1A3A6B]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-gray-400 text-xs md:text-sm font-bold py-3 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Grille */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {weeks.map((week, weekIndex) => (
              week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={`empty-${weekIndex}-${dayIndex}`} className="min-h-[120px] md:min-h-[150px] bg-[#0A1628]/20 rounded-2xl border border-transparent" />;
                }

                const isToday = isTodayFn(day.date);
                const isWeekendDay = isWeekend(day.date);
                const hasPlannings = day.plannings.length > 0;

                return (
                  <div
                    key={day.date.toISOString()}
                    onClick={() => openDayModal(day.date)}
                    className={`
                      min-h-[120px] md:min-h-[150px] p-3 rounded-2xl cursor-pointer 
                      transition-all duration-300 ease-out
                      ${isToday ? 'ring-2 ring-[#F0C75E] shadow-xl shadow-[#F0C75E]/20 bg-[#F0C75E]/5' : ''}
                      ${isWeekendDay ? 'bg-[#0A1628]/50' : 'bg-[#0A1628]/30 hover:bg-[#1A3A6B]/30'}
                      ${hasPlannings ? 'border-2 border-[#1A3A6B]/50' : 'border-2 border-transparent'}
                      relative group hover:scale-[1.03] hover:z-10 hover:shadow-xl hover:border-[#F0C75E]/30
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-base md:text-lg font-bold ${isToday ? 'text-[#F0C75E]' : 'text-white'}`}>
                        {format(day.date, 'd')}
                      </span>
                      {hasPlannings && (
                        <span className="text-[10px] md:text-xs font-black bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] min-w-[22px] h-[22px] rounded-full shadow-lg flex items-center justify-center px-1.5">
                          {day.plannings.length}
                        </span>
                      )}
                    </div>

                    {hasPlannings && (
                      <div className="space-y-1.5 max-h-[90px] md:max-h-[110px] overflow-y-auto custom-scrollbar">
                        {day.plannings.slice(0, 3).map(plan => {
                          const type = typeConfig[plan.type] || typeConfig.autre;
                          return (
                            <div
                              key={plan.id}
                              onClick={(e) => { e.stopPropagation(); openEditModal(plan); }}
                              className={`text-[10px] md:text-xs px-2 py-1.5 rounded-lg bg-gradient-to-r ${type.gradient} border border-[#1A3A6B]/50 truncate cursor-pointer hover:scale-105 transition-all duration-200 font-medium backdrop-blur-sm`}
                              style={{ borderLeft: `2px solid ${plan.couleur || '#3B82F6'}` }}
                            >
                              <span className="text-white/95">{type.icon} {plan.titre}</span>
                            </div>
                          );
                        })}
                        {day.plannings.length > 3 && (
                          <div className="text-center text-[10px] md:text-xs text-gray-400 font-bold bg-[#0A1628]/70 rounded-lg py-1 backdrop-blur-sm">
                            +{day.plannings.length - 3} autres
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bouton + */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); openCreateModal(day.date); }}
                        className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] text-sm font-black flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg shadow-[#F0C75E]/30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ✅ VUE SEMAINE ULTRA DESIGN
  const renderWeekView = () => {
    const start = startOfWeek(currentViewDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentViewDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const hours = Array.from({ length: 12 }, (_, i) => i + 6);

    return (
      <div className="bg-gradient-to-br from-[#0D1F3C] via-[#0A1628] to-[#0D1F3C] rounded-3xl border border-[#1A3A6B] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#071325] via-[#0A1628] to-[#071325] px-6 md:px-8 py-5 md:py-6 border-b border-[#1A3A6B] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <h3 className="font-['Playfair_Display'] text-xl md:text-2xl text-white font-bold tracking-tight">
              Semaine du {format(start, 'd MMM', { locale: fr })} au {format(end, 'd MMM yyyy', { locale: fr })}
            </h3>
            <div className="flex gap-1 bg-[#0A1628]/70 rounded-xl p-1 border border-[#1A3A6B]/30">
              <button onClick={() => navigate('prev')} className="px-3 py-2 rounded-lg hover:bg-[#1A3A6B] text-gray-400 hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button onClick={goToToday} className="px-5 py-2 rounded-lg bg-[#F0C75E]/15 text-[#F0C75E] text-sm font-semibold hover:bg-[#F0C75E]/25 transition-all">
                📅 Aujourd'hui
              </button>
              <button onClick={() => navigate('next')} className="px-3 py-2 rounded-lg hover:bg-[#1A3A6B] text-gray-400 hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0A1628]/70 rounded-xl p-1 border border-[#1A3A6B]/30">
            {[
              { id: 'month', label: '📅 Mois' },
              { id: 'week', label: '📊 Semaine' },
              { id: 'day', label: '📋 Jour' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setViewMode(m.id)} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  viewMode === m.id 
                    ? 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1A3A6B]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto p-4 md:p-6">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 gap-2 border-b-2 border-[#1A3A6B] pb-3 mb-2">
              <div className="p-3 text-center text-gray-400 text-sm font-bold uppercase tracking-wider">Heure</div>
              {days.map(day => {
                const isToday = isTodayFn(day);
                return (
                  <div key={day.toISOString()} className={`p-3 text-center rounded-2xl transition-all duration-300 ${isToday ? 'bg-gradient-to-b from-[#F0C75E]/15 to-transparent border-2 border-[#F0C75E]/30' : ''}`}>
                    <div className={`text-sm font-bold uppercase tracking-wider ${isToday ? 'text-[#F0C75E]' : 'text-gray-400'}`}>
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-2xl font-black mt-1 ${isToday ? 'text-[#F0C75E]' : 'text-white'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-2 border-b border-[#1A3A6B]/20 hover:bg-[#1A3A6B]/10 transition-colors duration-200 rounded-xl">
                <div className="p-3 text-center text-gray-400 text-sm font-mono font-bold">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {days.map(day => {
                  const planningsAtHour = filteredPlannings.filter(p => {
                    const pStart = parseISO(p.date_debut);
                    return isSameDay(day, pStart) && pStart.getHours() === hour;
                  });

                  return (
                    <div key={`${day.toISOString()}-${hour}`} className="p-1.5 min-h-[70px]">
                      <div
                        onClick={() => {
                          const date = new Date(day);
                          date.setHours(hour, 0, 0, 0);
                          openCreateModal(date);
                        }}
                        className="w-full h-full rounded-xl hover:bg-[#1A3A6B]/30 transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[70px] border border-transparent hover:border-[#F0C75E]/20"
                      >
                        {planningsAtHour.length > 0 ? (
                          <div className="w-full space-y-1">
                            {planningsAtHour.slice(0, 2).map(plan => (
                              <EventCard key={plan.id} planning={plan} compact={true} />
                            ))}
                            {planningsAtHour.length > 2 && (
                              <div className="text-center text-[10px] text-gray-400 font-bold">+{planningsAtHour.length - 2}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs opacity-0 hover:opacity-100 transition-opacity">+</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ✅ VUE JOUR ULTRA DESIGN
  const renderDayView = () => {
    const dayPlannings = getPlanningsForDate(currentViewDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-gradient-to-br from-[#0D1F3C] via-[#0A1628] to-[#0D1F3C] rounded-3xl border border-[#1A3A6B] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#071325] via-[#0A1628] to-[#071325] px-6 md:px-8 py-5 md:py-6 border-b border-[#1A3A6B] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl text-white font-bold capitalize tracking-tight">
              {format(currentViewDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h3>
            <div className="flex gap-1 bg-[#0A1628]/70 rounded-xl p-1 border border-[#1A3A6B]/30">
              <button onClick={() => navigate('prev')} className="px-3 py-2 rounded-lg hover:bg-[#1A3A6B] text-gray-400 hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button onClick={goToToday} className="px-5 py-2 rounded-lg bg-[#F0C75E]/15 text-[#F0C75E] text-sm font-semibold hover:bg-[#F0C75E]/25 transition-all">
                📅 Aujourd'hui
              </button>
              <button onClick={() => navigate('next')} className="px-3 py-2 rounded-lg hover:bg-[#1A3A6B] text-gray-400 hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0A1628]/70 rounded-xl p-1 border border-[#1A3A6B]/30">
            {[
              { id: 'month', label: '📅 Mois' },
              { id: 'week', label: '📊 Semaine' },
              { id: 'day', label: '📋 Jour' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setViewMode(m.id)} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  viewMode === m.id 
                    ? 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1A3A6B]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 max-h-[650px] overflow-y-auto custom-scrollbar">
          {hours.map(hour => {
            const planningsAtHour = dayPlannings.filter(p => {
              const pStart = parseISO(p.date_debut);
              return pStart.getHours() === hour;
            });

            const isCurrentHour = new Date().getHours() === hour && isTodayFn(currentViewDate);

            return (
              <div 
                key={hour} 
                className={`
                  flex items-start gap-4 md:gap-6 border-b border-[#1A3A6B]/20 py-3 md:py-4 
                  hover:bg-[#1A3A6B]/10 transition-all duration-200 group rounded-xl
                  ${isCurrentHour ? 'bg-gradient-to-r from-[#F0C75E]/10 to-transparent border-l-4 border-l-[#F0C75E]' : ''}
                `}
              >
                <div className="w-20 md:w-24 text-right text-gray-400 text-sm md:text-base font-mono font-bold pt-1">
                  {String(hour).padStart(2, '0')}:00
                  {isCurrentHour && (
                    <span className="block text-[10px] text-[#F0C75E] font-bold animate-pulse mt-1">
                      ● maintenant
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-[60px]">
                  <div
                    onClick={() => {
                      const date = new Date(currentViewDate);
                      date.setHours(hour, 0, 0, 0);
                      openCreateModal(date);
                    }}
                    className="w-full h-full rounded-xl hover:bg-[#1A3A6B]/30 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[60px] border border-transparent hover:border-[#F0C75E]/20"
                  >
                    {planningsAtHour.length > 0 ? (
                      <div className="w-full space-y-2 md:space-y-3">
                        {planningsAtHour.map(plan => (
                          <EventCard key={plan.id} planning={plan} compact={false} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        Cliquez pour ajouter
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F0C75E]/20 border-t-[#F0C75E]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl animate-pulse">📅</span>
          </div>
        </div>
        <p className="text-gray-300 text-lg font-semibold tracking-wide">Chargement du planning...</p>
        <div className="w-48 h-1 bg-[#1A3A6B] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-4 md:px-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-7 pb-7 border-b border-[#1A3A6B]/50">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-white font-black tracking-tight">
            📅 Planning
          </h1>
          <p className="text-gray-400 text-base mt-2 font-medium">
            Gérez vos plannings et suivez vos événements
          </p>
        </div>
        <button 
          onClick={() => openCreateModal()} 
          className="group px-6 md:px-7 py-3.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-2xl font-bold text-base hover:shadow-2xl hover:shadow-[#F0C75E]/30 transition-all duration-300 flex items-center gap-2.5 hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">add_circle</span>
          <span>Nouveau planning</span>
        </button>
      </div>

      {/* Dashboard */}
      {renderDashboard()}

      {/* Filtres */}
      <div className="bg-gradient-to-br from-[#0D1F3C] via-[#0A1628] to-[#0D1F3C] rounded-2xl p-5 md:p-6 mb-7 border border-[#1A3A6B] shadow-lg">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {isAdmin && (
            <select
              value={selectedEmploye}
              onChange={(e) => setSelectedEmploye(e.target.value)}
              className="p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm font-medium min-w-[200px] focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200 hover:border-[#F0C75E]/50"
            >
              <option value="all">👥 Tous les employés</option>
              {employes.map(e => (
                <option key={e.id} value={e.id}>
                  {e.full_name} {e.role === 'imprimeur' ? '🖨️' : ''}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm font-medium min-w-[160px] focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200 hover:border-[#F0C75E]/50"
          >
            <option value="all">📋 Tous les types</option>
            {typeOptions.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm font-medium min-w-[160px] focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200 hover:border-[#F0C75E]/50"
          >
            <option value="all">📌 Tous les statuts</option>
            {statutOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm font-medium min-w-[200px] focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 placeholder-gray-500 transition-all duration-200 hover:border-[#F0C75E]/50"
          />

          <div className="flex items-center gap-3 ml-auto">
            {Object.entries(typeConfig).slice(0, 3).map(([key, config]) => (
              <span key={key} className="flex items-center gap-1.5 text-xs font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${config.dot} shadow-lg`}></span>
                <span className="text-gray-400">{config.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vue calendrier */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Modal Création/Édition */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? '📅 Nouveau planning' : '✏️ Modifier le planning'}
        size="large"
        icon="event_note"
        iconColor="text-[#F0C75E]"
      >
        <div className="space-y-5">
          {/* Section Informations */}
          <div className="bg-[#0A1628]/60 rounded-2xl p-5 border border-[#1A3A6B]/50">
            <h4 className="text-[#F0C75E] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">info</span> Informations principales
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Employé <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.employe_id}
                  onChange={(e) => setFormData({ ...formData, employe_id: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                  disabled={!isAdmin}
                >
                  <option value="">Sélectionner un employé</option>
                  {employes.map(e => (
                    <option key={e.id} value={e.id}>{e.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                >
                  {typeOptions.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Titre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 placeholder-gray-500 transition-all duration-200"
                placeholder="Titre du planning..."
              />
            </div>
          </div>

          {/* Section Dates */}
          <div className="bg-[#0A1628]/60 rounded-2xl p-5 border border-[#1A3A6B]/50">
            <h4 className="text-[#F0C75E] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">schedule</span> Dates et heures
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Date début <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Date fin</label>
                <input
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Heure début</label>
                <input
                  type="time"
                  value={formData.heure_debut}
                  onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Heure fin</label>
                <input
                  type="time"
                  value={formData.heure_fin}
                  onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Section Statut */}
          <div className="bg-[#0A1628]/60 rounded-2xl p-5 border border-[#1A3A6B]/50">
            <h4 className="text-[#F0C75E] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">settings</span> Statut et options
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                >
                  {statutOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Récurrence</label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                >
                  {recurrenceOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section Localisation */}
          <div className="bg-[#0A1628]/60 rounded-2xl p-5 border border-[#1A3A6B]/50">
            <h4 className="text-[#F0C75E] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">location_on</span> Localisation et couleur
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Lieu</label>
                <input
                  type="text"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 placeholder-gray-500 transition-all duration-200"
                  placeholder="📍 Adresse ou lieu..."
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Couleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-2 border-[#1A3A6B] hover:border-[#F0C75E] transition-all duration-200 hover:scale-105"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-sm font-mono font-bold">{formData.couleur}</span>
                    <span className="text-gray-500 text-xs">Cliquez pour changer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="bg-[#0A1628]/60 rounded-2xl p-5 border border-[#1A3A6B]/50">
            <h4 className="text-[#F0C75E] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">description</span> Description et notes
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 resize-none placeholder-gray-500 transition-all duration-200"
                  placeholder="Description détaillée..."
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Tâche liée</label>
                <select
                  value={formData.tache_id || ''}
                  onChange={(e) => setFormData({ ...formData, tache_id: e.target.value || null })}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 transition-all duration-200"
                >
                  <option value="">Aucune tâche liée</option>
                  {taches.map(t => (
                    <option key={t.id} value={t.id}>{t.titre} ({t.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] focus:ring-2 focus:ring-[#F0C75E]/20 resize-none placeholder-gray-500 transition-all duration-200"
                  placeholder="Notes supplémentaires..."
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-5 border-t border-[#1A3A6B]">
            <button 
              onClick={() => setModalOpen(false)} 
              className="px-7 py-3.5 bg-[#1A3A6B] text-white rounded-xl hover:bg-[#2A4A6B] transition-all duration-300 font-semibold text-sm hover:scale-105 active:scale-95"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              onClick={savePlanning} 
              className="px-7 py-3.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-bold text-sm hover:shadow-2xl hover:shadow-[#F0C75E]/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-[#071325] border-t-transparent rounded-full"></span>
                  En cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    {modalMode === 'create' ? 'add_circle' : 'save'}
                  </span>
                  {modalMode === 'create' ? 'Créer le planning' : 'Mettre à jour'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Jour */}
      <Modal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={`📋 ${format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}`}
        size="large"
        icon="calendar_today"
        iconColor="text-[#F0C75E]"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#0A1628] via-[#0D1F3C] to-[#0A1628] rounded-2xl border border-[#1A3A6B]/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F0C75E]/20 to-[#F0C75E]/5 flex items-center justify-center border border-[#F0C75E]/20">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg capitalize">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-gray-400 text-sm font-medium">
                  {selectedDayPlannings.length} événement(s) ce jour
                </p>
              </div>
            </div>
            <button
              onClick={() => { setDayModalOpen(false); openCreateModal(selectedDate); }}
              className="px-6 py-3 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-bold text-sm hover:shadow-2xl hover:shadow-[#F0C75E]/30 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Ajouter
            </button>
          </div>

          {selectedDayPlannings.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-7xl block mb-6 opacity-50">📭</span>
              <p className="text-gray-400 text-lg font-semibold mb-6">Aucun planning pour cette journée</p>
              <button
                onClick={() => { setDayModalOpen(false); openCreateModal(selectedDate); }}
                className="px-7 py-3.5 bg-[#F0C75E] text-[#071325] rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 hover:scale-105"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Créer un planning
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {selectedDayPlannings.map(plan => (
                <EventCard key={plan.id} planning={plan} compact={false} />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={() => deletePlanning(confirmDialog.id)}
        title="🗑️ Supprimer le planning"
        message="Êtes-vous sûr de vouloir supprimer ce planning ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* ✅ Styles globaux pour le scroll */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #F0C75E, #d4aa3a);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d4aa3a, #F0C75E);
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        /* ✅ Animation des cartes */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}