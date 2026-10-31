// src/pages/Equipage.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';

export default function Equipage() {
  const { profile } = useAuth();
  const userRole = profile?.role;
  const isAdmin = userRole === 'admin' || userRole === 'gerant';
  
  const [taches, setTaches] = useState([]);
  const [tachesArchivees, setTachesArchivees] = useState([]);
  const [showArchives, setShowArchives] = useState(false);
  const [equipes, setEquipes] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Chargement des données...');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTache, setSelectedTache] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  
  // États Drag & Drop
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  // Filtres
  const [viewMode, setViewMode] = useState('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEquipe, setFilterEquipe] = useState('all');
  const [filterAssigne, setFilterAssigne] = useState('all'); // ✅ NOUVEAU FILTRE
  
  // ✅ État pour la vue calendrier
  const [displayMode, setDisplayMode] = useState('kanban');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarTasks, setCalendarTasks] = useState([]);
  
  // ✅ États pour l'autocomplétion des clients
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const clientSearchRef = useRef(null);
  
  const [formData, setFormData] = useState({
    client_id: '',
    commande_id: '',
    equipe_id: '',
    assigne_a: '',
    titre: '',
    description: '',
    status: 'a_faire',
    priorite: 'normale',
    date_fin_prevue: ''
  });

  const [newClientData, setNewClientData] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '',
    type_client: 'particulier', matricule_fiscale: '', entreprise: '',
    piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: ''
  });

  const statusColumns = [
    { id: 'a_faire', title: 'À faire', icon: '📋', color: 'yellow', borderColor: 'border-yellow-400', bgColor: 'bg-yellow-500/5', badgeColor: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'en_cours', title: 'En cours', icon: '🔄', color: 'blue', borderColor: 'border-blue-400', bgColor: 'bg-blue-500/5', badgeColor: 'bg-blue-500/20 text-blue-400' },
    { id: 'en_pause', title: 'En pause', icon: '⏸️', color: 'purple', borderColor: 'border-purple-400', bgColor: 'bg-purple-500/5', badgeColor: 'bg-purple-500/20 text-purple-400' },
    { id: 'termine', title: 'Terminé', icon: '✅', color: 'green', borderColor: 'border-green-400', bgColor: 'bg-green-500/5', badgeColor: 'bg-green-500/20 text-green-400' },
    { id: 'annule', title: 'Annulé', icon: '❌', color: 'red', borderColor: 'border-red-400', bgColor: 'bg-red-500/5', badgeColor: 'bg-red-500/20 text-red-400' }
  ];

  const priorites = [
    { value: 'basse', label: 'Basse', color: 'bg-gray-500/20 text-gray-400', icon: '🟢' },
    { value: 'normale', label: 'Normale', color: 'bg-blue-500/20 text-blue-400', icon: '🟡' },
    { value: 'haute', label: 'Haute', color: 'bg-orange-500/20 text-orange-400', icon: '🟠' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-500/20 text-red-400', icon: '🔴' }
  ];

  const isDueToday = (date) => {
    if (!date) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date); dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date); dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime() && dueDate.getTime() > 0;
  };

  // ✅ Clients filtrés pour l'autocomplétion
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return [];
    const term = clientSearchTerm.toLowerCase();
    return clients.filter(client => 
      client.nom?.toLowerCase().includes(term) ||
      client.prenom?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.telephone?.includes(term) ||
      client.entreprise?.toLowerCase().includes(term)
    ).slice(0, 10);
  }, [clients, clientSearchTerm]);

  useEffect(() => { 
    loadData(); 
    const interval = setInterval(() => {
      checkAndArchiveTasks();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Mettre à jour les tâches du calendrier
  useEffect(() => {
    updateCalendarTasks();
  }, [taches, currentMonth]);

  // ✅ Gestion du clic à l'extérieur pour fermer les suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target)) {
        setShowClientSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================
  // ✅ FONCTIONS DU CALENDRIER
  // ============================================================
  
  const updateCalendarTasks = () => {
    if (!taches.length) {
      setCalendarTasks([]);
      return;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const tasksForMonth = taches.filter(task => {
      if (!task.date_fin_prevue) return false;
      const taskDate = new Date(task.date_fin_prevue);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });

    setCalendarTasks(tasksForMonth);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (delta) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + delta);
      return newMonth;
    });
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return calendarTasks.filter(task => {
      const taskDate = task.date_fin_prevue?.split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getTaskColorForDate = (date) => {
    const tasks = getTasksForDate(date);
    if (tasks.length === 0) return null;
    
    const priorities = ['urgente', 'haute', 'normale', 'basse'];
    let highestPriority = 'basse';
    let hasCompleted = false;
    
    tasks.forEach(task => {
      if (task.status === 'termine') hasCompleted = true;
      const priorityIndex = priorities.indexOf(task.priorite);
      const currentIndex = priorities.indexOf(highestPriority);
      if (priorityIndex < currentIndex) {
        highestPriority = task.priorite;
      }
    });
    
    if (hasCompleted && tasks.every(t => t.status === 'termine')) {
      return 'bg-green-500/30 border-green-400';
    }
    
    const colors = {
      urgente: 'bg-red-500/40 border-red-400',
      haute: 'bg-orange-500/30 border-orange-400',
      normale: 'bg-blue-500/30 border-blue-400',
      basse: 'bg-gray-500/20 border-gray-400'
    };
    return colors[highestPriority] || 'bg-blue-500/20 border-blue-400';
  };

  const getStatusIcon = (status) => {
    const found = statusColumns.find(s => s.id === status);
    return found?.icon || '📋';
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================================
  // ✅ BADGE DE RÔLE
  // ============================================================
  const getRoleBadge = (role) => {
    const config = {
      admin: { label: '👑 Admin', color: 'bg-red-500/20 text-red-400' },
      gerant: { label: '📋 Gérant', color: 'bg-blue-500/20 text-blue-400' },
      agent_financier: { label: '💰 Agent Financier', color: 'bg-green-500/20 text-green-400' },
      designer: { label: '🎨 Designer', color: 'bg-purple-500/20 text-purple-400' },
      poseur: { label: '🔧 Poseur', color: 'bg-orange-500/20 text-orange-400' },
      imprimeur: { label: '🖨️ Imprimeur', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
      user: { label: '👤 Utilisateur', color: 'bg-gray-500/20 text-gray-400' }
    };
    const c = config[role] || config.user;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.color}`}>{c.label}</span>;
  };

  // ============================================================
  // CHARGEMENT
  // ============================================================
  async function loadData() {
    try {
      setLoading(true);
      setLoadingMessage('Chargement des équipes...');
      
      const [equipesRes, employesRes, commandesRes, clientsRes] = await Promise.all([
        supabaseErp.from('erp_equipes').select('*').order('nom', { ascending: true }),
        supabaseErp.from('erp_profiles').select('id, full_name, role').order('full_name', { ascending: true }),
        supabaseErp.from('erp_commandes').select('id, numero, status').order('created_at', { ascending: false }),
        supabaseErp.from('erp_clients').select('*').order('nom', { ascending: true })
      ]);
      
      setEquipes(equipesRes.data || []);
      setEmployes(employesRes.data || []);
      setCommandes(commandesRes.data || []);
      setClients(clientsRes.data || []);
      
      setLoadingMessage('Chargement des tâches...');
      
      const { data: tachesData } = await supabaseErp
        .from('erp_taches')
        .select('*, erp_commandes(numero), erp_equipes(nom), erp_profiles(full_name)')
        .eq('archivee', false)
        .order('priorite', { ascending: false })
        .order('created_at', { ascending: false });
      
      setTaches(tachesData || []);
      
      const { data: archivesData } = await supabaseErp
        .from('erp_taches')
        .select('*, erp_commandes(numero), erp_equipes(nom), erp_profiles(full_name)')
        .eq('archivee', true)
        .order('date_archivage', { ascending: false });
      
      setTachesArchivees(archivesData || []);
      
    } catch (error) {
      console.error('❌ Erreur loadData:', error);
      showAlert('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ARCHIVAGE
  // ============================================================
  async function checkAndArchiveTasks() {
    try {
      const { data, error } = await supabaseErp
        .from('erp_taches')
        .select('*')
        .eq('status', 'termine')
        .eq('archivee', false);
      
      if (error) throw error;
      if (!data || data.length === 0) return;
      
      const now = new Date();
      let archivedCount = 0;
      
      for (const task of data) {
        const dateFin = new Date(task.updated_at || task.created_at);
        const diffHours = (now - dateFin) / (1000 * 60 * 60);
        
        if (diffHours >= 24) {
          const { error: updateError } = await supabaseErp
            .from('erp_taches')
            .update({
              archivee: true,
              date_archivage: now.toISOString()
            })
            .eq('id', task.id);
          
          if (!updateError) archivedCount++;
        }
      }
      
      if (archivedCount > 0) {
        console.log(`✅ ${archivedCount} tâche(s) archivée(s) automatiquement`);
        await loadData();
      }
    } catch (error) {
      console.error('❌ Erreur archivage automatique:', error);
    }
  }

  async function archiverTache(id) {
    try {
      const { error } = await supabaseErp
        .from('erp_taches')
        .update({
          archivee: true,
          date_archivage: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      showAlert('success', '✅ Tâche archivée avec succès');
      await loadData();
    } catch (error) {
      console.error('❌ Erreur archivage:', error);
      showAlert('error', 'Erreur lors de l\'archivage');
    }
  }

  async function restaurerTache(id) {
    try {
      const { error } = await supabaseErp
        .from('erp_taches')
        .update({
          archivee: false,
          date_archivage: null
        })
        .eq('id', id);
      
      if (error) throw error;
      showAlert('success', '✅ Tâche restaurée avec succès');
      await loadData();
    } catch (error) {
      console.error('❌ Erreur restauration:', error);
      showAlert('error', 'Erreur lors de la restauration');
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateFields = (fields, labels) => {
    const errors = [];
    for (const [key, value] of Object.entries(fields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors.push(labels[key] || key);
      }
    }
    if (errors.length > 0) {
      showAlert('error', `❌ Champs obligatoires : ${errors.join(', ')}`);
      return false;
    }
    return true;
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================
  const handleDragStart = (e, tache) => {
    setDraggedTask(tache);
    e.dataTransfer.setData('text/plain', String(tache.id));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.transform = 'rotate(2deg) scale(0.97)';
    e.currentTarget.style.border = '2px dashed #F0C75E';
  };

  const handleDragEnd = (e) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
    e.currentTarget.style.border = '1px solid #1A3A6B';
    e.currentTarget.style.transition = 'all 0.3s ease';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const tache = taches.find(t => String(t.id) === String(taskId));
    if (!tache || tache.status === newStatus) return;

    setTaches(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, status: newStatus } : t
    ));

    supabaseErp
      .from('erp_taches')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          setTaches(prev => prev.map(t => 
            String(t.id) === String(taskId) ? { ...t, status: tache.status } : t
          ));
          showAlert('error', 'Erreur lors du déplacement');
        } else {
          showAlert('success', `✅ → ${statusColumns.find(c => c.id === newStatus)?.title}`);
        }
      });
    
    setDraggedTask(null);
  };

  // ============================================================
  // COULEURS UNIQUES
  // ============================================================
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-teal-500','bg-cyan-500','bg-indigo-500','bg-amber-500','bg-lime-500','bg-rose-500','bg-violet-500','bg-emerald-500','bg-sky-500','bg-fuchsia-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getAvatarTextColor = (name) => {
    if (!name) return 'text-gray-300';
    return ['bg-amber-500', 'bg-lime-500', 'bg-yellow-500'].includes(getAvatarColor(name)) ? 'text-gray-900' : 'text-white';
  };

  // ============================================================
  // ✅ FONCTIONS POUR L'AUTOCOMPLÉTION DES CLIENTS
  // ============================================================
  const handleClientSearch = (value) => {
    setClientSearchTerm(value);
    setShowClientSuggestions(true);
    
    // Si la valeur est vide, réinitialiser la sélection
    if (!value.trim()) {
      setSelectedClient(null);
      setFormData(prev => ({ ...prev, client_id: '' }));
    }
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearchTerm(client.nom + (client.prenom ? ` ${client.prenom}` : ''));
    setFormData(prev => ({ ...prev, client_id: client.id }));
    setShowClientSuggestions(false);
  };

  const getClientDisplayName = (client) => {
    if (!client) return '';
    let name = client.nom;
    if (client.prenom) name += ` ${client.prenom}`;
    if (client.entreprise) name += ` (${client.entreprise})`;
    if (client.telephone) name += ` - ${client.telephone}`;
    return name;
  };

  // ============================================================
  // ACTIONS
  // ============================================================
  async function addDefaultEquipes() {
    try {
      const defaultEquipes = [
        { nom: 'Design', description: '🎨 Équipe de design graphique' },
        { nom: 'Impression', description: '🖨️ Équipe d\'impression' },
        { nom: 'Pose', description: '🔧 Équipe de pose et installation' },
        { nom: 'Extras', description: '📦 Équipe pour les tâches diverses' },
        { nom: 'Finance', description: '💰 Équipe financière et comptable' }
      ];
      
      const { data: existing } = await supabaseErp.from('erp_equipes').select('nom');
      const existingNames = existing?.map(e => e.nom) || [];
      const toAdd = defaultEquipes.filter(e => !existingNames.includes(e.nom));
      
      if (toAdd.length === 0) { showAlert('warning', '⚠️ Toutes les équipes existent déjà'); return; }
      
      const { error } = await supabaseErp.from('erp_equipes').insert(toAdd);
      if (error) throw error;
      showAlert('success', `✅ ${toAdd.length} équipe(s) ajoutée(s)`);
      loadData();
    } catch (error) { console.error('Erreur ajout équipes:', error); showAlert('error', 'Erreur lors de l\'ajout des équipes'); }
  }

  function openCreateModal() {
    setModalMode('create'); 
    setSelectedTache(null); 
    setViewTask(null);
    setSelectedClient(null);
    setClientSearchTerm('');
    setFormData({ 
      client_id: '', 
      commande_id: '', 
      equipe_id: '', 
      assigne_a: profile?.id || '', 
      titre: '', 
      description: '', 
      status: 'a_faire', 
      priorite: 'normale', 
      date_fin_prevue: '' 
    });
    setModalOpen(true);
  }

  function openEditModal(tache) {
    setModalMode('edit'); 
    setSelectedTache(tache); 
    setViewTask(tache);
    
    // Pré-remplir la recherche client
    const client = clients.find(c => c.id === tache.client_id);
    if (client) {
      setSelectedClient(client);
      setClientSearchTerm(getClientDisplayName(client));
    } else {
      setSelectedClient(null);
      setClientSearchTerm('');
    }
    
    setFormData({ 
      client_id: tache.client_id || '', 
      commande_id: tache.commande_id || '', 
      equipe_id: tache.equipe_id || '', 
      assigne_a: tache.assigne_a || profile?.id || '', 
      titre: tache.titre || '', 
      description: tache.description || '', 
      status: tache.status || 'a_faire', 
      priorite: tache.priorite || 'normale', 
      date_fin_prevue: tache.date_fin_prevue?.split('T')[0] || '' 
    });
    setModalOpen(true);
  }

  function openViewModal(tache) {
    setModalMode('view'); 
    setSelectedTache(tache); 
    setViewTask(tache);
    setFormData({ 
      client_id: tache.client_id || '', 
      commande_id: tache.commande_id || '', 
      equipe_id: tache.equipe_id || '', 
      assigne_a: tache.assigne_a || '', 
      titre: tache.titre || '', 
      description: tache.description || '', 
      status: tache.status || 'a_faire', 
      priorite: tache.priorite || 'normale', 
      date_fin_prevue: tache.date_fin_prevue?.split('T')[0] || '' 
    });
    setModalOpen(true);
  }

  async function saveTache() {
    if (!validateFields({ titre: formData.titre }, { titre: 'Titre' })) return;
    try {
      const tacheData = { 
        client_id: formData.client_id || null, 
        commande_id: formData.commande_id || null, 
        equipe_id: formData.equipe_id || null, 
        assigne_a: formData.assigne_a || null, 
        titre: formData.titre.trim(), 
        description: formData.description || null, 
        status: formData.status, 
        priorite: formData.priorite, 
        date_fin_prevue: formData.date_fin_prevue || null,
        archivee: false
      };
      if (modalMode === 'create') {
        const { error } = await supabaseErp.from('erp_taches').insert([tacheData]);
        if (error) throw error;
        showAlert('success', '✅ Tâche créée');
      } else {
        const { error } = await supabaseErp.from('erp_taches').update({ ...tacheData, updated_at: new Date().toISOString() }).eq('id', selectedTache.id);
        if (error) throw error;
        showAlert('success', '✅ Tâche modifiée');
      }
      setModalOpen(false); 
      setViewTask(null); 
      setSelectedClient(null);
      setClientSearchTerm('');
      loadData();
    } catch (error) { console.error('Erreur sauvegarde:', error); showAlert('error', 'Erreur lors de la sauvegarde'); }
  }

  async function deleteTache(id) {
    try {
      const { error } = await supabaseErp.from('erp_taches').delete().eq('id', id);
      if (error) throw error;
      showAlert('success', '✅ Tâche supprimée'); loadData();
    } catch (error) { console.error('Erreur suppression:', error); showAlert('error', 'Erreur suppression'); }
    setConfirmDialog({ open: false, id: null });
  }

  async function createNewClient() {
    if (!newClientData.nom?.trim()) { showAlert('error', '❌ Le nom est obligatoire'); return; }
    if (newClientData.type_client === 'entreprise' && !newClientData.entreprise?.trim()) { showAlert('error', '❌ Le nom de l\'entreprise est obligatoire'); return; }
    if (newClientData.type_client === 'passager' && (!newClientData.piece_identite || !newClientData.num_piece?.trim())) { showAlert('error', '❌ Pièce d\'identité et numéro obligatoires'); return; }

    try {
      const clientData = { 
        nom: newClientData.nom.trim(), 
        prenom: newClientData.prenom?.trim() || null, 
        email: newClientData.email?.trim() || null, 
        telephone: newClientData.telephone?.trim() || null, 
        adresse: newClientData.adresse?.trim() || null, 
        type_client: newClientData.type_client || 'particulier', 
        status: 'actif' 
      };
      if (newClientData.type_client === 'entreprise') { 
        clientData.entreprise = newClientData.entreprise?.trim() || null; 
        clientData.matricule_fiscale = newClientData.matricule_fiscale?.trim() || null; 
      }
      if (newClientData.type_client === 'passager') { 
        clientData.piece_identite = newClientData.piece_identite || null; 
        clientData.num_piece = newClientData.num_piece?.trim() || null; 
        clientData.date_arrivee = newClientData.date_arrivee || null; 
        clientData.date_depart = newClientData.date_depart || null; 
        clientData.nationalite = newClientData.nationalite?.trim() || null; 
      }

      const { data, error } = await supabaseErp.from('erp_clients').insert([clientData]).select().single();
      if (error) throw error;

      showAlert('success', `✅ Client "${data.nom}" créé`);
      setShowNewClientModal(false);
      setNewClientData({ 
        nom: '', prenom: '', email: '', telephone: '', adresse: '', 
        type_client: 'particulier', matricule_fiscale: '', entreprise: '', 
        piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: '' 
      });
      
      const { data: clientsData } = await supabaseErp.from('erp_clients').select('*').order('nom');
      setClients(clientsData || []);
      
      // ✅ Sélectionner automatiquement le nouveau client
      if (data) {
        setSelectedClient(data);
        setClientSearchTerm(getClientDisplayName(data));
        setFormData(prev => ({ ...prev, client_id: data.id }));
      }
    } catch (error) { 
      console.error('❌ Erreur création client:', error); 
      showAlert('error', '❌ ' + error.message); 
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getTachesByStatus = (status) => {
    let filtered = taches;
    if (filterEquipe !== 'all') filtered = filtered.filter(t => t.equipe_id === parseInt(filterEquipe));
    if (filterAssigne !== 'all') filtered = filtered.filter(t => t.assigne_a === filterAssigne); // ✅ NOUVEAU FILTRE
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => t.titre?.toLowerCase().includes(term) || 
        t.description?.toLowerCase().includes(term) || 
        t.erp_commandes?.numero?.toLowerCase().includes(term) || 
        t.erp_equipes?.nom?.toLowerCase().includes(term) ||
        t.erp_profiles?.full_name?.toLowerCase().includes(term)); // ✅ RECHERCHE PAR NOM
    }
    return filtered.filter(t => t.status === status);
  };

  const getTachesByEquipe = (equipeId) => taches.filter(t => t.equipe_id === equipeId);
  const getPrioriteBadge = (priorite) => { 
    const p = priorites.find(p => p.value === priorite); 
    return p ? <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${p.color}`}>{p.icon} {p.label}</span> : null; 
  };
  const getEquipeName = (equipeId) => equipes.find(e => e.id === equipeId)?.nom || '-';
  const getEmployeName = (employeId) => employes.find(e => e.id === employeId)?.full_name || '-';

  const getEquipeIcon = (nom) => ({ 
    'Design': '🎨', 
    'Impression': '🖨️', 
    'Pose': '🔧', 
    'Extras': '📦', 
    'Finance': '💰' 
  })[nom] || '👥';
  
  const getEquipeColor = (nom) => ({ 
    'Design': 'from-purple-500/20 to-purple-900/20 border-purple-500/30', 
    'Impression': 'from-blue-500/20 to-blue-900/20 border-blue-500/30', 
    'Pose': 'from-orange-500/20 to-orange-900/20 border-orange-500/30', 
    'Extras': 'from-green-500/20 to-green-900/20 border-green-500/30', 
    'Finance': 'from-amber-500/20 to-amber-900/20 border-amber-500/30' 
  })[nom] || 'from-gray-500/20 to-gray-900/20 border-gray-500/30';

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
        <p className="text-gray-400 text-sm">{loadingMessage}</p>
      </div>
    );
  }

  // ============================================================
  // RENDU DU CALENDRIER
  // ============================================================
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      days.push({ day, date, isOtherMonth: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const tasksForDay = getTasksForDate(date);
      const taskCount = tasksForDay.length;
      const colorClass = taskCount > 0 ? getTaskColorForDate(date) : '';

      days.push({
        day: i,
        date,
        isToday,
        isSelected,
        taskCount,
        tasks: tasksForDay,
        colorClass,
        isOtherMonth: false
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ day: i, date, isOtherMonth: true });
    }

    const tasksForSelectedDate = selectedDate ? getTasksForDate(selectedDate) : [];

    return (
      <div className="bg-[#0D1F3C] rounded-xl border border-[#1A3A6B] overflow-hidden">
        <div className="bg-[#071325] px-4 py-3 border-b border-[#1A3A6B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-[#1A3A6B] transition text-gray-400 hover:text-white">◀</button>
            <h3 className="text-white font-semibold text-lg">{monthNames[month]} {year}</h3>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-[#1A3A6B] transition text-gray-400 hover:text-white">▶</button>
          </div>
          <button onClick={goToToday} className="px-3 py-1.5 rounded-lg bg-[#F0C75E]/10 text-[#F0C75E] text-sm hover:bg-[#F0C75E]/20 transition">📅 Aujourd'hui</button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(name => (
              <div key={name} className="text-center text-gray-500 text-xs font-semibold py-2">{name}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isClickable = !day.isOtherMonth;
              const hasTasks = day.taskCount > 0;

              return (
                <div
                  key={index}
                  onClick={() => isClickable && setSelectedDate(day.date)}
                  className={`
                    min-h-[80px] p-1.5 rounded-lg cursor-pointer transition-all duration-200 relative
                    ${day.isOtherMonth ? 'opacity-30' : 'hover:scale-[1.02]'}
                    ${day.isSelected ? 'ring-2 ring-[#F0C75E] shadow-lg shadow-[#F0C75E]/20' : ''}
                    ${day.isToday ? 'ring-2 ring-blue-400/50' : ''}
                    ${hasTasks ? day.colorClass : 'hover:bg-[#1A3A6B]/30'}
                    ${!isClickable ? 'cursor-default' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-medium ${day.isToday ? 'text-blue-400' : 'text-gray-300'}`}>{day.day}</span>
                    {hasTasks && (
                      <span className="text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded-full text-white">{day.taskCount}</span>
                    )}
                  </div>
                  
                  {hasTasks && (
                    <div className="mt-1 space-y-0.5">
                      {day.tasks.slice(0, 2).map((task, idx) => (
                        <div key={idx} className="text-[8px] truncate px-1 py-0.5 rounded bg-black/30 text-white/80" title={task.titre}>
                          {getStatusIcon(task.status)} {task.titre}
                        </div>
                      ))}
                      {day.taskCount > 2 && (
                        <div className="text-[8px] text-gray-400 text-center">+{day.taskCount - 2} autres</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="border-t border-[#1A3A6B] p-4 bg-[#071325]/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">📋 Tâches du {formatDateDisplay(selectedDate.toISOString())}</h4>
              <span className="text-sm text-gray-400">{tasksForSelectedDate.length} tâche(s)</span>
            </div>

            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">📭</span>
                <p>Aucune tâche pour cette date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                {tasksForSelectedDate.map(task => {
                  const pColor = { 
                    urgente: { bg: 'from-red-950 via-red-900/50 to-[#0A1628]', border: 'border-red-500/40' },
                    haute: { bg: 'from-orange-950 via-orange-900/30 to-[#0A1628]', border: 'border-orange-500/40' },
                    normale: { bg: 'from-blue-950 via-blue-900/30 to-[#0A1628]', border: 'border-blue-500/40' },
                    basse: { bg: 'from-gray-900 via-gray-800/30 to-[#0A1628]', border: 'border-gray-500/40' }
                  }[task.priorite] || { bg: 'from-blue-950 via-blue-900/30 to-[#0A1628]', border: 'border-blue-500/40' };

                  return (
                    <div key={task.id} onClick={() => openViewModal(task)} className={`bg-gradient-to-br ${pColor.bg} rounded-xl p-3 border ${pColor.border} cursor-pointer hover:scale-105 transition-all duration-200`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white/80 truncate flex-1">{task.titre}</span>
                        <span className="text-xs ml-1">{getStatusIcon(task.status)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">{task.erp_equipes?.nom || '-'}</span>
                        <span className="text-gray-400">{task.erp_profiles?.full_name || '-'}</span>
                      </div>
                      {task.priorite === 'urgente' && (
                        <div className="mt-1 text-red-400 text-[10px] font-bold animate-pulse">🔥 URGENT</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================
  return (
    <div className="max-w-full" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-4 border-b border-[#1A3A6B]">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl text-white">Équipage</h1>
          <p className="text-gray-400 text-sm">
            {displayMode === 'kanban' ? '🖱️ Glissez-déposez les tâches entre les colonnes' : '📅 Visualisez les tâches par date'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg overflow-hidden border border-[#1A3A6B]">
            <button onClick={() => setDisplayMode('kanban')} className={`px-3 py-2 text-sm font-medium transition ${displayMode === 'kanban' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}>📋 Kanban</button>
            <button onClick={() => setDisplayMode('calendar')} className={`px-3 py-2 text-sm font-medium transition ${displayMode === 'calendar' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white'}`}>📅 Calendrier</button>
          </div>

          <button onClick={() => setShowArchives(!showArchives)} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${showArchives ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#0D1F3C] text-gray-400 hover:text-white border border-[#1A3A6B]'}`}>
            📦 Archives ({tachesArchivees.length})
          </button>
          <button onClick={openCreateModal} className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span> Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Filtres */}
      {!showArchives && displayMode === 'kanban' && equipes.length > 0 && (
        <div className="bg-[#0D1F3C] rounded-xl p-4 mb-4 border border-[#1A3A6B]">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { setViewMode('global'); setFilterEquipe('all'); setFilterAssigne('all'); }} className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'global' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#071325] text-gray-400'}`}>📊 Globale</button>
            <button onClick={() => setViewMode('equipe')} className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'equipe' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#071325] text-gray-400'}`}>👥 Par équipe</button>
            {viewMode === 'equipe' && (<select value={filterEquipe} onChange={(e) => setFilterEquipe(e.target.value)} className="p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm"><option value="all">Toutes</option>{equipes.map(e => <option key={e.id} value={e.id}>{getEquipeIcon(e.nom)} {e.nom}</option>)}</select>)}
            
            {/* ✅ NOUVEAU : Filtre par assigné */}
            <select value={filterAssigne} onChange={(e) => setFilterAssigne(e.target.value)} className="p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm min-w-[150px]">
              <option value="all">👤 Tous les assignés</option>
              {employes.map(e => (
                <option key={e.id} value={e.id}>
                  {e.full_name} 
                  {e.role === 'imprimeur' ? ' 🖨️' : ''}
                  {e.role === 'admin' ? ' 👑' : ''}
                  {e.role === 'gerant' ? ' 📋' : ''}
                  {e.role === 'agent_financier' ? ' 💰' : ''}
                  {e.role === 'designer' ? ' 🎨' : ''}
                  {e.role === 'poseur' ? ' 🔧' : ''}
                </option>
              ))}
            </select>
            
            {filterAssigne !== 'all' && (
              <span className="text-xs text-[#F0C75E] bg-[#F0C75E]/10 px-2 py-1 rounded-full flex items-center gap-1">
                👤 {employes.find(e => e.id === filterAssigne)?.full_name}
                <button onClick={() => setFilterAssigne('all')} className="ml-1 text-gray-400 hover:text-white">✕</button>
              </span>
            )}
            
            <input type="text" placeholder="🔍 Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm min-w-[150px]" />
            <div className="flex gap-2 text-xs"><span className="text-yellow-400">📋{getTachesByStatus('a_faire').length}</span><span className="text-blue-400">⚙️{getTachesByStatus('en_cours').length}</span><span className="text-green-400">✅{getTachesByStatus('termine').length}</span></div>
            <button onClick={checkAndArchiveTasks} className="px-3 py-1.5 rounded-lg text-xs bg-[#1A3A6B] text-gray-300 hover:bg-[#2A4A6B] transition">🔄 Archiver maintenant</button>
          </div>
        </div>
      )}

      {/* Contenu */}
      {!showArchives ? (
        <>
          {displayMode === 'calendar' ? (
            renderCalendar()
          ) : (
            <>
              {equipes.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
                  <span className="text-5xl block mb-4">🏗️</span>
                  <h3 className="text-xl text-white mb-2">Aucune équipe</h3>
                  {isAdmin && <button onClick={addDefaultEquipes} className="px-6 py-2 bg-[#F0C75E] text-[#071325] rounded-lg">Ajouter les équipes</button>}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {equipes.map(equipe => { const total = getTachesByEquipe(equipe.id).length; return (
                      <div key={equipe.id} onClick={() => { setViewMode('equipe'); setFilterEquipe(String(equipe.id)); }} className={`bg-gradient-to-br ${getEquipeColor(equipe.nom)} rounded-xl p-2 border cursor-pointer hover:scale-105 transition ${filterEquipe === String(equipe.id) ? 'ring-2 ring-[#F0C75E]' : ''}`}>
                        <span className="text-xl">{getEquipeIcon(equipe.nom)}</span>
                        <p className="text-white text-xs font-semibold">{equipe.nom}</p>
                        <p className="text-gray-400 text-[10px]">{total} tâches</p>
                      </div>
                    );})}
                  </div>

                  {/* KANBAN */}
                  <div className="grid grid-cols-5 gap-2">
                    {statusColumns.map(column => {
                      const tasksInColumn = getTachesByStatus(column.id);
                      const isDragOver = dragOverColumn === column.id;
                      return (
                        <div key={column.id} className={`${column.bgColor} rounded-xl border-2 min-h-[400px] transition-all duration-200 ${isDragOver ? `${column.borderColor} border-dashed scale-[1.02] bg-opacity-30` : 'border-[#1A3A6B]'}`} 
                          onDragOver={(e) => { e.preventDefault(); setDragOverColumn(column.id); }} 
                          onDragEnter={(e) => { e.preventDefault(); setDragOverColumn(column.id); }} 
                          onDragLeave={(e) => { e.preventDefault(); setDragOverColumn(null); }} 
                          onDrop={(e) => handleDrop(e, column.id)}>
                          <div className={`p-2 border-b ${isDragOver ? 'border-dashed' : 'border-[#1A3A6B]'} flex items-center justify-between`}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">{column.icon}</span>
                              <h3 className="text-white font-semibold text-sm">{column.title}</h3>
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${column.badgeColor}`}>{tasksInColumn.length}</span>
                            </div>
                            {isDragOver && <span className="text-xs text-white font-bold animate-pulse bg-white/10 px-2 py-0.5 rounded-full">📥 DROP</span>}
                          </div>
                          <div className="p-2 space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            {tasksInColumn.length === 0 && (<div className={`text-center py-16 transition-all duration-200 ${isDragOver ? 'scale-110' : ''}`}>
                              <span className="text-4xl block mb-2">{isDragOver ? '📥' : '📭'}</span>
                              <p className={`text-sm ${isDragOver ? 'text-white font-bold' : 'text-gray-500'}`}>{isDragOver ? 'DÉPOSEZ ICI !' : 'Aucune tâche'}</p>
                            </div>)}
                            {tasksInColumn.map(tache => {
                              const dueToday = isDueToday(tache.date_fin_prevue);
                              const overdue = isOverdue(tache.date_fin_prevue);
                              const pColor = { 
                                urgente: { bg: 'from-red-950 via-red-900/50 to-[#0A1628]', bar: 'from-red-500 to-orange-500', badge: 'bg-red-500', text: 'text-red-400' }, 
                                haute: { bg: 'from-orange-950 via-orange-900/30 to-[#0A1628]', bar: 'from-orange-500 to-yellow-500', badge: 'bg-orange-500', text: 'text-orange-400' }, 
                                normale: { bg: 'from-blue-950 via-blue-900/30 to-[#0A1628]', bar: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500', text: 'text-blue-400' }, 
                                basse: { bg: 'from-gray-900 via-gray-800/30 to-[#0A1628]', bar: 'from-gray-500 to-gray-400', badge: 'bg-gray-500', text: 'text-gray-400' } 
                              }[tache.priorite] || { bg: 'from-blue-950 via-blue-900/30 to-[#0A1628]', bar: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500', text: 'text-blue-400' };
                              return (
                                <div key={tache.id} draggable={true} onDragStart={(e) => handleDragStart(e, tache)} onDragEnd={handleDragEnd} onClick={() => openViewModal(tache)}
                                  className={`group relative bg-gradient-to-br ${pColor.bg} rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:z-10 cursor-pointer ${dueToday ? 'border-[#F0C75E] shadow-[0_0_20px_rgba(240,199,94,0.15)]' : overdue ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-[#1A3A6B] hover:border-[#F0C75E]/30'}`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <div className={`h-1.5 w-full bg-gradient-to-r ${pColor.bar} ${tache.priorite === 'urgente' ? 'animate-pulse' : ''}`} />
                                  <div className="p-3.5">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${pColor.badge} ${tache.priorite === 'urgente' ? 'animate-ping' : ''}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${pColor.text}`}>{tache.priorite}</span>
                                        {tache.erp_equipes?.nom && (<div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10"><span className="text-xs">{getEquipeIcon(tache.erp_equipes.nom)}</span><span className="text-[9px] text-gray-400 font-medium hidden lg:inline">{tache.erp_equipes.nom}</span></div>)}
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        <button onClick={(e) => { e.stopPropagation(); openEditModal(tache); }} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/5 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 transition-all hover:scale-110">✏️</button>
                                        {tache.status === 'termine' && (
                                          <button onClick={(e) => { e.stopPropagation(); archiverTache(tache.id); }} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all hover:scale-110" title="Archiver">📦</button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setConfirmDialog({ open: true, id: tache.id }); }} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all hover:scale-110">🗑️</button>
                                      </div>
                                    </div>
                                    <h4 className="text-white font-bold text-sm leading-tight mb-2.5 line-clamp-2">{tache.titre}</h4>
                                    {tache.description && (<div className="mb-3"><p className="text-gray-400 text-[11px] leading-relaxed line-clamp-1 italic">{tache.description.split('\n').find(l => l.startsWith('👤'))?.replace('👤 Client: ', '') || tache.description.split('\n').find(l => l.startsWith('🏢'))?.replace('👤 Client: ', '') || tache.description.split('\n').find(l => l.startsWith('🧳'))?.replace('👤 Client: ', '') || tache.description.split('\n')[0]}</p></div>)}
                                    <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                                      <div className="flex items-center gap-2">
                                        {tache.erp_profiles?.full_name ? (
                                          <div className="flex items-center gap-2" title={tache.erp_profiles.full_name}>
                                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[9px] font-bold shadow-lg ring-2 ring-white/10 ${getAvatarColor(tache.erp_profiles.full_name)} ${getAvatarTextColor(tache.erp_profiles.full_name)}`}>
                                              {tache.erp_profiles.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden 2xl:block">
                                              <p className="text-white text-[10px] font-medium leading-none">{tache.erp_profiles.full_name.split(' ')[0]}</p>
                                              <p className="text-[8px] leading-none mt-0.5">
                                                {employes.find(e => e.full_name === tache.erp_profiles.full_name)?.role === 'imprimeur' ? (
                                                  <span className="text-red-400 font-bold">🖨️ Imprimeur</span>
                                                ) : (
                                                  <span className="text-gray-500">{employes.find(e => e.full_name === tache.erp_profiles.full_name)?.role || ''}</span>
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        ) : (<div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center text-[9px] text-gray-600 ring-2 ring-white/5">?</div>)}
                                      </div>
                                      <div className="flex flex-col items-end gap-0.5">
                                        {tache.erp_commandes?.numero && <span className="text-[9px] text-gray-500 font-mono bg-black/20 px-1.5 py-0.5 rounded-md">{tache.erp_commandes.numero}</span>}
                                        {tache.date_fin_prevue ? (<div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${dueToday ? 'bg-[#F0C75E]/15 text-[#F0C75E] ring-1 ring-[#F0C75E]/30' : overdue ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30' : 'bg-white/5 text-gray-400'}`}><span className="text-xs">{dueToday ? '🔔' : overdue ? '⚠️' : '📅'}</span><span>{dueToday ? 'Auj.' : overdue ? `-${Math.ceil((new Date() - new Date(tache.date_fin_prevue)) / (1000*60*60*24))}j` : new Date(tache.date_fin_prevue).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span></div>) : (<span className="text-[9px] text-gray-600 italic">--/--</span>)}
                                      </div>
                                    </div>
                                  </div>
                                  {(tache.priorite === 'urgente' || overdue) && (<div className="absolute -top-1 -right-1 z-20"><div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xl ${tache.priorite === 'urgente' ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500 text-white'}`}>{tache.priorite === 'urgente' ? '🔥' : '⚠️'}</div></div>)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="bg-[#0D1F3C] rounded-xl border border-[#1A3A6B] overflow-hidden">
          <div className="bg-[#071325] px-4 py-3 border-b border-[#1A3A6B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <h3 className="text-white font-semibold">Archives ({tachesArchivees.length})</h3>
            </div>
            <button onClick={() => setShowArchives(false)} className="text-sm text-blue-400 hover:text-blue-300 transition">← Retour aux tâches actives</button>
          </div>
          {tachesArchivees.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-gray-400">Aucune tâche archivée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A1628] border-b border-[#1A3A6B]">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-400 text-xs">Titre</th>
                    <th className="text-left px-4 py-3 text-gray-400 text-xs">Statut</th>
                    <th className="text-left px-4 py-3 text-gray-400 text-xs">Archivé le</th>
                    <th className="text-left px-4 py-3 text-gray-400 text-xs">Équipe</th>
                    <th className="text-center px-4 py-3 text-gray-400 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A3A6B]">
                  {tachesArchivees.map(tache => (
                    <tr key={tache.id} className="hover:bg-[#1A3A6B]/20 transition">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-sm">{tache.titre}</p>
                        {tache.description && <p className="text-gray-400 text-xs truncate">{tache.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tache.status === 'termine' ? 'bg-green-500/20 text-green-400' : tache.status === 'annule' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {tache.status === 'termine' ? '✅ Terminé' : tache.status === 'annule' ? '❌ Annulé' : tache.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-sm">
                          {tache.date_archivage ? new Date(tache.date_archivage).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-sm">{tache.erp_equipes?.nom || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => restaurerTache(tache.id)} className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition" title="Restaurer">🔄</button>
                          <button onClick={() => setConfirmDialog({ open: true, id: tache.id })} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition" title="Supprimer définitivement">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Tâche */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setViewTask(null); }} title={modalMode === 'view' ? '📋 Détails de la tâche' : modalMode === 'create' ? 'Nouvelle tâche' : 'Modifier tâche'} size={modalMode === 'view' ? 'large' : 'medium'} icon="assignment" iconColor="text-[#F0C75E]">
        {modalMode === 'view' ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-2"><span className="text-2xl">{statusColumns.find(s => s.id === formData.status)?.icon || '📋'}</span><h2 className="text-xl font-bold text-white">{formData.titre}</h2></div><div className="flex flex-wrap gap-2">{getPrioriteBadge(formData.priorite)}<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColumns.find(s => s.id === formData.status)?.badgeColor || 'bg-gray-500/20 text-gray-400'}`}>{statusColumns.find(s => s.id === formData.status)?.title || formData.status}</span></div></div></div>
            <div className="bg-[#0A1628] rounded-xl p-4 border border-[#1A3A6B]"><h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">📝 Description</h4>{formData.description ? (<div className="text-white text-sm whitespace-pre-line leading-relaxed">{formData.description.split('\n').map((line, i) => { let className = "py-0.5"; if (line.startsWith('📋')) className += " text-[#F0C75E] font-semibold"; else if (line.startsWith('👤')) className += " text-blue-400"; else if (line.startsWith('🛍️')) className += " text-green-400"; else if (line.startsWith('📦')) className += " text-orange-400"; else if (line.startsWith('📝')) className += " text-gray-400 italic"; else if (line.startsWith('ℹ️')) className += " text-purple-400"; return <div key={i} className={className}>{line}</div>; })}</div>) : (<p className="text-gray-500 text-sm italic">Aucune description</p>)}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A3A6B] text-center"><p className="text-gray-500 text-xs mb-1">📅 Échéance</p><p className={`text-sm font-semibold ${isDueToday(formData.date_fin_prevue) ? 'text-[#F0C75E]' : isOverdue(formData.date_fin_prevue) ? 'text-red-400' : 'text-white'}`}>{formData.date_fin_prevue ? new Date(formData.date_fin_prevue).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}</p></div>
              <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A3A6B] text-center"><p className="text-gray-500 text-xs mb-1">👥 Équipe</p><p className="text-white text-sm font-semibold">{getEquipeName(formData.equipe_id)}</p></div>
              <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A3A6B] text-center"><p className="text-gray-500 text-xs mb-1">👤 Assigné à</p><p className="text-white text-sm font-semibold">{getEmployeName(formData.assigne_a)}</p>
                {formData.assigne_a && employes.find(e => e.id === formData.assigne_a)?.role === 'imprimeur' && (
                  <p className="text-red-400 text-[10px] font-bold mt-0.5">🖨️ Imprimeur</p>
                )}
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A3A6B] text-center"><p className="text-gray-500 text-xs mb-1">📦 Commande</p><p className="text-white text-sm font-semibold">{commandes.find(c => c.id == formData.commande_id)?.numero || 'Aucune'}</p></div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-[#1A3A6B]"><button onClick={() => { setModalOpen(false); setViewTask(null); }} className="px-5 py-2.5 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition">Fermer</button><button onClick={() => { setModalMode('edit'); }} className="px-5 py-2.5 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold hover:shadow-lg transition">✏️ Modifier</button></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div><label className="block text-gray-400 text-sm mb-1">Titre *</label><input type="text" value={formData.titre || ''} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="Titre de la tâche" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-gray-400 text-sm mb-1">Priorité</label><select value={formData.priorite || 'normale'} onChange={(e) => setFormData({ ...formData, priorite: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white">{priorites.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
              <div><label className="block text-gray-400 text-sm mb-1">Statut</label><select value={formData.status || 'a_faire'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white">{statusColumns.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
              <div><label className="block text-gray-400 text-sm mb-1">Date fin</label><input type="date" value={formData.date_fin_prevue || ''} onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div>
              <div><label className="block text-gray-400 text-sm mb-1">Commande</label><select value={formData.commande_id || ''} onChange={(e) => setFormData({ ...formData, commande_id: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"><option value="">Aucune</option>{commandes.map(c => <option key={c.id} value={c.id}>{c.numero}</option>)}</select></div>
              <div><label className="block text-gray-400 text-sm mb-1">Équipe</label><select value={formData.equipe_id || ''} onChange={(e) => setFormData({ ...formData, equipe_id: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"><option value="">Sélectionner</option>{equipes.map(e => <option key={e.id} value={e.id}>{getEquipeIcon(e.nom)} {e.nom}</option>)}</select></div>
              <div><label className="block text-gray-400 text-sm mb-1">Assigner</label>
                <select value={formData.assigne_a || ''} onChange={(e) => setFormData({ ...formData, assigne_a: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white">
                  <option value="">Non assigné</option>
                  {employes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} 
                      {e.role === 'imprimeur' ? ' 🖨️' : ''}
                      {e.role === 'admin' ? ' 👑' : ''}
                      {e.role === 'gerant' ? ' 📋' : ''}
                      {e.role === 'agent_financier' ? ' 💰' : ''}
                      {e.role === 'designer' ? ' 🎨' : ''}
                      {e.role === 'poseur' ? ' 🔧' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">{employes.slice(0, 10).map(e => (
              <div key={e.id} onClick={() => setFormData({ ...formData, assigne_a: e.id })} 
                className={`w-8 h-8 rounded-full ${getAvatarColor(e.full_name)} ${getAvatarTextColor(e.full_name)} flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-all border-2 ${formData.assigne_a === e.id ? 'border-[#F0C75E] shadow-lg shadow-[#F0C75E]/30 scale-110' : 'border-transparent hover:border-white/30'} ${e.role === 'imprimeur' ? 'ring-2 ring-red-500/50' : ''}`} 
                title={e.full_name + (e.role === 'imprimeur' ? ' (Imprimeur)' : '')}>
                {e.full_name.charAt(0).toUpperCase()}
              </div>
            ))}</div>
            
            {/* ✅ SECTION CLIENT AVEC AUTOCOMPLÉTION */}
            <div className="bg-[#0A1628] rounded-xl p-4 border border-[#1A3A6B] space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span>👤</span> Client lié
                </h4>
                <button onClick={() => setShowNewClientModal(true)} className="text-[#F0C75E] text-xs hover:underline flex items-center gap-1">
                  <span>➕</span> Nouveau client
                </button>
              </div>
              
              {/* ✅ Champ de recherche avec autocomplétion */}
              <div className="relative" ref={clientSearchRef}>
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  onFocus={() => {
                    if (clientSearchTerm.trim()) {
                      setShowClientSuggestions(true);
                    }
                  }}
                  placeholder="Rechercher un client..."
                  className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:outline-none focus:border-[#F0C75E] transition"
                />
                
                {/* ✅ Liste des suggestions */}
                {showClientSuggestions && filteredClients.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[#0D1F3C] border border-[#1A3A6B] rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredClients.map(client => (
                      <div
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className="flex items-center justify-between px-3 py-2 hover:bg-[#1A3A6B] cursor-pointer transition border-b border-[#1A3A6B]/30 last:border-b-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">
                            {client.nom}{client.prenom ? ` ${client.prenom}` : ''}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {client.entreprise && `🏢 ${client.entreprise}`}
                            {client.telephone && ` • 📞 ${client.telephone}`}
                          </span>
                        </div>
                        {client.type_client && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-[#1A3A6B] text-gray-300">
                            {client.type_client === 'entreprise' ? '🏢' : client.type_client === 'passager' ? '🧳' : '👤'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {showClientSuggestions && filteredClients.length === 0 && clientSearchTerm.trim() && (
                  <div className="absolute z-50 w-full mt-1 bg-[#0D1F3C] border border-[#1A3A6B] rounded-lg shadow-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Aucun client trouvé</p>
                    <button 
                      onClick={() => setShowNewClientModal(true)}
                      className="mt-2 text-[#F0C75E] text-sm hover:underline"
                    >
                      ➕ Créer un nouveau client
                    </button>
                  </div>
                )}
              </div>
              
              {/* ✅ Client sélectionné */}
              {selectedClient && (
                <div className="flex items-center gap-2 p-2 bg-[#071325] rounded-lg border border-[#F0C75E]/30">
                  <span className="text-lg">
                    {selectedClient.type_client === 'entreprise' ? '🏢' : 
                     selectedClient.type_client === 'passager' ? '🧳' : '👤'}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {selectedClient.nom}{selectedClient.prenom ? ` ${selectedClient.prenom}` : ''}
                  </span>
                  {selectedClient.entreprise && (
                    <span className="text-gray-400 text-xs">({selectedClient.entreprise})</span>
                  )}
                  {selectedClient.telephone && (
                    <span className="text-gray-400 text-xs ml-auto">📞 {selectedClient.telephone}</span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setClientSearchTerm('');
                      setFormData(prev => ({ ...prev, client_id: '' }));
                    }}
                    className="text-red-400 hover:text-red-300 text-xs ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* ✅ Select fallback (caché mais conservé pour compatibilité) */}
              <select 
                value={formData.client_id || ''} 
                onChange={(e) => {
                  const clientId = e.target.value;
                  setFormData({ ...formData, client_id: clientId });
                  const client = clients.find(c => c.id === clientId);
                  if (client) {
                    setSelectedClient(client);
                    setClientSearchTerm(getClientDisplayName(client));
                  }
                }} 
                className="hidden w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm"
              >
                <option value="">Aucun client lié</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type_client === 'entreprise' ? '🏢' : c.type_client === 'passager' ? '🧳' : '👤'} 
                    {c.nom} {c.prenom || ''}{c.entreprise ? ` (${c.entreprise})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div><label className="block text-gray-400 text-sm mb-1">Description</label><textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white resize-none" placeholder="Description..." /></div>
            <div className="flex justify-end gap-3 pt-2"><button onClick={() => { setModalOpen(false); setViewTask(null); }} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg">Annuler</button><button onClick={saveTache} className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold">Enregistrer</button></div>
          </div>
        )}
      </Modal>

      {/* Modal Nouveau Client */}
      <Modal isOpen={showNewClientModal} onClose={() => { setShowNewClientModal(false); setNewClientData({ nom: '', prenom: '', email: '', telephone: '', adresse: '', type_client: 'particulier', matricule_fiscale: '', entreprise: '', piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: '' }); }} title="Nouveau client" size="large" icon="person_add" iconColor="text-[#F0C75E]">
        <div className="space-y-4">
          <div><label className="block text-gray-400 text-sm font-medium mb-2">Type de client *</label><div className="grid grid-cols-3 gap-3">{[{ id: 'particulier', label: '👤 Particulier', desc: 'Client individuel' },{ id: 'entreprise', label: '🏢 Entreprise', desc: 'Société / Organisation' },{ id: 'passager', label: '🧳 Passager', desc: 'Client occasionnel' }].map((type) => (<button key={type.id} type="button" onClick={() => setNewClientData({ ...newClientData, type_client: type.id })} className={`p-3 rounded-xl border-2 transition-all ${newClientData.type_client === type.id ? 'border-[#F0C75E] bg-[#F0C75E]/10 shadow-lg scale-105' : 'border-[#1A3A6B] bg-[#071325] hover:border-[#F0C75E]/40'}`}><span className="text-2xl">{type.label.split(' ')[0]}</span><p className={`text-sm font-semibold ${newClientData.type_client === type.id ? 'text-white' : 'text-gray-400'}`}>{type.label.split(' ')[1]}</p><p className="text-[10px] text-gray-500">{type.desc}</p></button>))}</div></div>
          {newClientData.type_client === 'entreprise' && (<div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="block text-gray-400 text-sm mb-1">Entreprise *</label><input type="text" value={newClientData.entreprise || ''} onChange={(e) => setNewClientData({ ...newClientData, entreprise: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="Raison sociale" /></div><div><label className="block text-gray-400 text-sm mb-1">Matricule fiscale</label><input type="text" value={newClientData.matricule_fiscale || ''} onChange={(e) => setNewClientData({ ...newClientData, matricule_fiscale: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="1234567/X/A/000" /></div></div></div>)}
          {newClientData.type_client === 'passager' && (<div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="block text-gray-400 text-sm mb-1">Pièce d'identité *</label><select value={newClientData.piece_identite || ''} onChange={(e) => setNewClientData({ ...newClientData, piece_identite: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white"><option value="">Sélectionner</option><option value="cin">🪪 CIN</option><option value="passeport">🛂 Passeport</option><option value="carte_sejour">🏠 Carte de séjour</option></select></div><div><label className="block text-gray-400 text-sm mb-1">Numéro pièce *</label><input type="text" value={newClientData.num_piece || ''} onChange={(e) => setNewClientData({ ...newClientData, num_piece: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="Numéro" /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-gray-400 text-sm mb-1">Date d'arrivée</label><input type="date" value={newClientData.date_arrivee || ''} onChange={(e) => setNewClientData({ ...newClientData, date_arrivee: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div><div><label className="block text-gray-400 text-sm mb-1">Date de départ</label><input type="date" value={newClientData.date_depart || ''} onChange={(e) => setNewClientData({ ...newClientData, date_depart: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" /></div></div><div><label className="block text-gray-400 text-sm mb-1">Nationalité</label><input type="text" value={newClientData.nationalite || ''} onChange={(e) => setNewClientData({ ...newClientData, nationalite: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="Ex: Tunisienne" /></div></div>)}
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-gray-400 text-sm mb-1">{newClientData.type_client === 'entreprise' ? 'Contact *' : 'Nom *'}</label><input type="text" value={newClientData.nom || ''} onChange={(e) => setNewClientData({ ...newClientData, nom: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder={newClientData.type_client === 'entreprise' ? 'Nom du contact' : 'Nom'} /></div><div><label className="block text-gray-400 text-sm mb-1">Prénom</label><input type="text" value={newClientData.prenom || ''} onChange={(e) => setNewClientData({ ...newClientData, prenom: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="Prénom" /></div><div><label className="block text-gray-400 text-sm mb-1">Email</label><input type="email" value={newClientData.email || ''} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="email@exemple.com" /></div><div><label className="block text-gray-400 text-sm mb-1">Téléphone</label><input type="tel" value={newClientData.telephone || ''} onChange={(e) => setNewClientData({ ...newClientData, telephone: e.target.value })} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white" placeholder="+216 XX XXX XXX" /></div></div>
          <div><label className="block text-gray-400 text-sm mb-1">Adresse</label><textarea value={newClientData.adresse || ''} onChange={(e) => setNewClientData({ ...newClientData, adresse: e.target.value })} rows={2} className="w-full p-2 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white resize-none" placeholder="Adresse..." /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1A3A6B]"><button onClick={() => setShowNewClientModal(false)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg">Annuler</button><button onClick={createNewClient} className="px-4 py-2 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-lg font-semibold">Créer le client</button></div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, id: null })} onConfirm={() => deleteTache(confirmDialog.id)} title="Supprimer" message="Supprimer cette tâche ?" confirmText="Supprimer" />
    </div>
  );
}