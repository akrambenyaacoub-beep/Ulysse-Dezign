// src/pages/Clients.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';
import ClientDataModal from '../components/ClientDataModal';

// ============================================================
// COULEURS PRÉDÉFINIES POUR LES DOSSIERS
// ============================================================
const DOSSIER_COLORS = [
  { name: 'Rose', value: '#EC4899', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { name: 'Bleu', value: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { name: 'Violet', value: '#8B5CF6', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { name: 'Vert', value: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { name: 'Rouge', value: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { name: 'Cyan', value: '#06B6D4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { name: 'Ambre', value: '#D97706', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { name: 'Gris', value: '#6B7280', bg: 'bg-gray-500/10', border: 'border-gray-500/30' }
];

// ============================================================
// ICÔNES DISPONIBLES POUR LES DOSSIERS
// ============================================================
const DOSSIER_ICONS = [
  '📁', '📂', '📄', '📊', '📋', '📝', '📎', '📌', '📐', '📏',
  '🖼️', '🎨', '💳', '🏷️', '📦', '📨', '📩', '📤', '📥', '📮'
];

export default function Clients() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const role = profile?.role;


  // ============================================================
  // PERMISSIONS
  // ============================================================
  const isDesigner = role === 'designer';
  const isAdmin = role === 'admin';
  const isGestionnaire = role === 'gestionnaire';
  const isCommercial = role === 'commercial';
  const isAgentFinancier = role === 'agent_financier';
  const isImprimeur = role === 'imprimeur';

  const canEdit = isAdmin || isGestionnaire || isCommercial;
  const canDelete = isAdmin || isGestionnaire;
  const canCreate = isAdmin || isGestionnaire || isCommercial || isDesigner || isImprimeur;

  // ============================================================
  // ÉTATS PRINCIPAUX
  // ============================================================
  const [clients, setClients] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // ============================================================
  // ÉTATS DATA CLIENTS
  // ============================================================
  const [dataSearch, setDataSearch] = useState('');
  const [dataFilter, setDataFilter] = useState('all');
  const [expandedClients, setExpandedClients] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [uploading, setUploading] = useState({});
  
  // ============================================================
  // MODALS DOSSIERS
  // ============================================================
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({
    client_id: '',
    nom: '',
    couleur: '#3B82F6',
    icon: '📁'
  });
  
  // ============================================================
  // MODALS CLIENTS
  // ============================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  
  // ============================================================
  // MODAL DATA CLIENTS
  // ============================================================
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // ============================================================
  // FORMULAIRES
  // ============================================================
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '',
    type_client: 'particulier', matricule_fiscale: '', entreprise: '',
    piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '',
    nationalite: '', status: 'actif'
  });

  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '',
    type_client: 'particulier', matricule_fiscale: '', entreprise: '',
    piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: ''
  });
  const [showPassagerForm, setShowPassagerForm] = useState(false);
  const [selectedPassagerId, setSelectedPassagerId] = useState('');
  const [passagerForm, setPassagerForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '',
    piece_identite: '', num_piece: '', nationalite: '', date_arrivee: ''
  });

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const [stats, setStats] = useState({
    total: 0, particulier: 0, entreprise: 0, passager: 0,
    actif: 0, inactif: 0, topClient: null, topTraffic: null, clientsActifs: []
  });

  // ============================================================
  // DOSSIERS SPÉCIFIQUES (pour DATA Clients)
  // ============================================================
  const [clientFolders, setClientFolders] = useState({});

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => { loadAllData(); }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [clientsRes, commandesRes, fichiersRes] = await Promise.all([
        supabaseErp.from('erp_clients').select('*').order('nom'),
        supabaseErp.from('erp_commandes').select('*').order('created_at', { ascending: false }),
        supabaseErp.from('erp_fichiers_clients').select('*').order('date_upload', { ascending: false })
      ]);
      
      const clientsData = clientsRes.data || [];
      const commandesData = commandesRes.data || [];
      const fichiersData = fichiersRes.data || [];
      
      setClients(clientsData);
      setCommandes(commandesData);
      setFichiers(fichiersData);
      
      // ✅ Organiser les fichiers par client et dossier personnalisé
      const folders = {};
      fichiersData.forEach(f => {
        const clientId = f.client_id;
        const dossier = f.dossier || 'autre';
        if (!folders[clientId]) folders[clientId] = {};
        if (!folders[clientId][dossier]) folders[clientId][dossier] = [];
        folders[clientId][dossier].push(f);
      });
      setClientFolders(folders);
      
      calculateStats(clientsData, commandesData, fichiersData);
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // CALCUL STATISTIQUES
  // ============================================================
  function calculateStats(clientsData, commandesData, fichiersData) {
    const total = clientsData.length;
    const particulier = clientsData.filter(c => c.type_client === 'particulier').length;
    const entreprise = clientsData.filter(c => c.type_client === 'entreprise').length;
    const passager = clientsData.filter(c => c.type_client === 'passager').length;
    const actif = clientsData.filter(c => c.status === 'actif').length;
    const inactif = clientsData.filter(c => c.status === 'inactif').length;

    const clientCommandCount = {};
    commandesData.forEach(cmd => {
      if (cmd.client_id) clientCommandCount[cmd.client_id] = (clientCommandCount[cmd.client_id] || 0) + 1;
    });
    
    let topClientId = null, maxCommandes = 0;
    Object.entries(clientCommandCount).forEach(([id, count]) => {
      if (count > maxCommandes) { maxCommandes = count; topClientId = id; }
    });
    const topClient = topClientId ? clientsData.find(c => c.id == topClientId) : null;

    const clientFileCount = {};
    fichiersData.forEach(f => {
      if (f.client_id) clientFileCount[f.client_id] = (clientFileCount[f.client_id] || 0) + 1;
    });
    
    let topTrafficId = null, maxFiles = 0;
    Object.entries(clientFileCount).forEach(([id, count]) => {
      if (count > maxFiles) { maxFiles = count; topTrafficId = id; }
    });
    const topTraffic = topTrafficId ? clientsData.find(c => c.id == topTrafficId) : null;

    const sortedClients = Object.entries(clientCommandCount)
      .sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([id, count]) => ({ client: clientsData.find(c => c.id == id), commandes: count }));

    setStats({ total, particulier, entreprise, passager, actif, inactif,
      topClient: topClient ? { ...topClient, commandes: maxCommandes } : null,
      topTraffic: topTraffic ? { ...topTraffic, fichiers: maxFiles } : null,
      clientsActifs: sortedClients
    });
  }

  // ============================================================
  // HELPERS FICHIERS
  // ============================================================
  const getClientFiles = useCallback((clientId) => {
    return fichiers.filter(f => f.client_id === clientId);
  }, [fichiers]);

  const getClientCommandes = useCallback((clientId) => {
    return commandes.filter(c => c.client_id === clientId).length;
  }, [commandes]);

  const getClientFolderKeys = useCallback((clientId) => {
    const folders = clientFolders[clientId] || {};
    return Object.keys(folders);
  }, [clientFolders]);

  const getFolderFiles = useCallback((clientId, folderName) => {
    const folders = clientFolders[clientId] || {};
    return folders[folderName] || [];
  }, [clientFolders]);

  const getFolderColor = useCallback((clientId, folderName) => {
    const folderData = clientFolders[clientId]?.[folderName] || [];
    if (folderData.length > 0 && folderData[0].dossier_couleur) {
      return folderData[0].dossier_couleur;
    }
    return '#6B7280';
  }, [clientFolders]);

  const getFolderIcon = useCallback((clientId, folderName) => {
    const folderData = clientFolders[clientId]?.[folderName] || [];
    if (folderData.length > 0 && folderData[0].dossier_icone) {
      return folderData[0].dossier_icone;
    }
    return '📁';
  }, [clientFolders]);

  const toggleClient = useCallback((clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  }, []);

  const toggleFolder = useCallback((clientId, folder) => {
    const key = `${clientId}-${folder}`;
    setExpandedFolders(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const isClientExpanded = useCallback((clientId) => {
    return expandedClients[clientId] || false;
  }, [expandedClients]);

  const isFolderExpanded = useCallback((clientId, folder) => {
    const key = `${clientId}-${folder}`;
    return expandedFolders[key] || false;
  }, [expandedFolders]);

  // ============================================================
  // OUVRIR MODAL DATA CLIENTS
  // ============================================================
  const openDataModal = (client) => {
    setSelectedClientData(client);
    setIsDataModalOpen(true);
  };

  // ============================================================
  // CRÉATION DE DOSSIER MANUEL
  // ============================================================
  function openNewFolderModal(clientId) {
    setEditingFolder(null);
    setFolderForm({
      client_id: clientId,
      nom: '',
      couleur: '#3B82F6',
      icon: '📁'
    });
    setShowNewFolderModal(true);
  }

  async function saveFolder() {
    if (!folderForm.nom.trim()) {
      showAlert('error', 'Le nom du dossier est obligatoire');
      return;
    }

    try {
      const folderName = folderForm.nom.trim();
      
      const { error } = await supabaseErp.from('erp_fichiers_clients').insert({
        client_id: folderForm.client_id,
        nom_fichier: `.folder_${folderName}`,
        categorie: 'dossier',
        dossier: folderName,
        dossier_couleur: folderForm.couleur || '#3B82F6',
        dossier_icone: folderForm.icon || '📁',
        url_fichier: '',
        taille_fichier: 0,
        type_mime: 'folder'
      });

      if (error) throw error;
      
      showAlert('success', `✅ Dossier "${folderName}" créé avec succès`);
      setShowNewFolderModal(false);
      setFolderForm({
        client_id: '',
        nom: '',
        couleur: '#3B82F6',
        icon: '📁'
      });
      loadAllData();
    } catch (error) {
      console.error('❌ Erreur saveFolder:', error);
      showAlert('error', 'Erreur lors de la création du dossier: ' + error.message);
    }
  }

  // ============================================================
  // FORMATAGE
  // ============================================================
  const formatTaille = (b) => {
    if (!b) return 'N/A';
    const s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${s[i]}`;
  };

  const getTypeBadge = (type) => {
    const config = {
      particulier: { label: '👤 Particulier', color: 'bg-green-500/20 text-green-400' },
      entreprise: { label: '🏢 Entreprise', color: 'bg-blue-500/20 text-blue-400' },
      passager: { label: '🧳 Passager', color: 'bg-purple-500/20 text-purple-400' }
    };
    const c = config[type] || config.particulier;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.color}`}>{c.label}</span>;
  };

  const getStatusBadge = (status) => {
    const config = {
      actif: { label: '✅ Actif', color: 'bg-green-500/20 text-green-400' },
      inactif: { label: '⛔ Inactif', color: 'bg-red-500/20 text-red-400' }
    };
    const c = config[status] || config.actif;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.color}`}>{c.label}</span>;
  };

  const detecterCategorie = (nom) => {
    const n = (nom || '').toLowerCase();
    if (n.includes('logo')) return 'logo';
    if (n.includes('carte') || n.includes('visite')) return 'carte_visite';
    if (n.includes('flyer') || n.includes('depliant')) return 'flyer';
    if (n.includes('affiche') || n.includes('poster')) return 'affiche';
    if (n.includes('brochure') || n.includes('catalogue')) return 'brochure';
    if (n.includes('commande') || n.includes('cmd')) return 'commandes';
    if (n.includes('facture') || n.includes('invoice')) return 'factures';
    if (n.includes('contrat') || n.includes('convention')) return 'contrat';
    return 'autre';
  };

  const extraireTags = (nom) => {
    const tags = [];
    const sansExt = (nom || '').replace(/\.[^/.]+$/, '');
    sansExt.split(/[-_\s]+/).forEach(m => {
      if (m.length > 2 && isNaN(m)) tags.push(m.toLowerCase());
    });
    return tags;
  };

  // ============================================================
  // CRUD CLIENT
  // ============================================================
  async function saveClient(e) {
    e?.preventDefault?.();
    try {
      setIsSubmitting(true);
      
      if (formData.type_client === 'passager' && selectedPassagerId) {
        const passager = clients.find(c => c.id === selectedPassagerId);
        if (passager) {
          const updateData = {
            nom: passager.nom,
            prenom: passager.prenom,
            email: formData.email || passager.email,
            telephone: formData.telephone || passager.telephone,
            adresse: formData.adresse || passager.adresse,
          };
          if (modalMode === 'edit') {
            await supabaseErp.from('erp_clients').update(updateData).eq('id', selectedPassagerId);
            showAlert('success', '✅ Passager mis à jour');
          } else {
            showAlert('info', '📌 Passager déjà existant');
          }
        }
        setModalOpen(false);
        resetForm();
        loadAllData();
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.nom?.trim()) {
        showAlert('error', 'Le nom est obligatoire');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.type_client === 'entreprise' && !formData.entreprise?.trim()) {
        showAlert('error', 'Le nom de l\'entreprise est obligatoire');
        setIsSubmitting(false);
        return;
      }

      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom?.trim() || null,
        email: formData.email?.trim() || null,
        telephone: formData.telephone?.trim() || null,
        adresse: formData.adresse?.trim() || null,
        type_client: formData.type_client,
        matricule_fiscale: formData.matricule_fiscale?.trim() || null,
        entreprise: formData.entreprise?.trim() || null,
        piece_identite: formData.piece_identite?.trim() || null,
        num_piece: formData.num_piece?.trim() || null,
        date_arrivee: formData.date_arrivee || null,
        date_depart: formData.date_depart || null,
        nationalite: formData.nationalite?.trim() || null,
        status: formData.status || 'actif'
      };

      if (modalMode === 'create') {
        await supabaseErp.from('erp_clients').insert([clientData]);
        showAlert('success', `✅ Client ${formData.type_client === 'passager' ? 'passager' : ''} créé`);
      } else {
        await supabaseErp.from('erp_clients').update(clientData).eq('id', selectedClient.id);
        showAlert('success', '✅ Client modifié');
      }
      
      setModalOpen(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('error', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteClient(id) {
    if (!canDelete) {
      showAlert('error', 'Vous n\'avez pas les droits pour supprimer un client');
      return;
    }
    try {
      await supabaseErp.from('erp_clients').delete().eq('id', id);
      showAlert('success', '✅ Client supprimé');
      loadAllData();
    } catch (error) {
      showAlert('error', 'Erreur suppression');
    }
    setConfirmDialog({ open: false, id: null });
  }

  function openCreateModal() {
    if (!canCreate) {
      showAlert('error', 'Vous n\'avez pas les droits pour créer un client');
      return;
    }
    setModalMode('create');
    setSelectedClient(null);
    setSelectedPassagerId('');
    setShowPassagerForm(false);
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(client) {
    if (!canEdit) {
      showAlert('error', 'Vous n\'avez pas les droits pour modifier un client');
      return;
    }
    setModalMode('edit');
    setSelectedClient(client);
    setSelectedPassagerId(client.type_client === 'passager' ? client.id : '');
    setShowPassagerForm(false);
    setFormData({
      nom: client.nom || '',
      prenom: client.prenom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      type_client: client.type_client || 'particulier',
      matricule_fiscale: client.matricule_fiscale || '',
      entreprise: client.entreprise || '',
      piece_identite: client.piece_identite || '',
      num_piece: client.num_piece || '',
      date_arrivee: client.date_arrivee || '',
      date_depart: client.date_depart || '',
      nationalite: client.nationalite || '',
      status: client.status || 'actif'
    });
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      nom: '', prenom: '', email: '', telephone: '', adresse: '',
      type_client: 'particulier',
      matricule_fiscale: '', entreprise: '',
      piece_identite: '', num_piece: '',
      date_arrivee: '', date_depart: '',
      nationalite: '', status: 'actif'
    });
    setSelectedPassagerId('');
    setShowPassagerForm(false);
  }

  // ============================================================
  // CRUD PASSAGER RAPIDE
  // ============================================================
  async function savePassagerRapide(e) {
    e.preventDefault();
    if (!passagerForm.nom?.trim() || !passagerForm.prenom?.trim()) {
      showAlert('error', 'Le nom et le prénom sont obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabaseErp
        .from('erp_clients')
        .insert([{
          nom: passagerForm.nom.trim(),
          prenom: passagerForm.prenom.trim(),
          email: passagerForm.email?.trim() || null,
          telephone: passagerForm.telephone?.trim() || null,
          adresse: passagerForm.adresse?.trim() || null,
          piece_identite: passagerForm.piece_identite || null,
          num_piece: passagerForm.num_piece || null,
          nationalite: passagerForm.nationalite || null,
          date_arrivee: passagerForm.date_arrivee || null,
          type_client: 'passager',
          status: 'actif'
        }])
        .select();

      if (error) throw error;
      showAlert('success', '✅ Passager créé');
      setShowPassagerForm(false);
      setPassagerForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '', piece_identite: '', num_piece: '', nationalite: '', date_arrivee: '' });
      loadAllData();
      
      if (data && data[0]) {
        setSelectedPassagerId(data[0].id);
        setFormData(prev => ({
          ...prev,
          nom: data[0].nom,
          prenom: data[0].prenom,
          email: data[0].email || '',
          telephone: data[0].telephone || '',
          adresse: data[0].adresse || '',
        }));
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('error', 'Erreur lors de la création du passager');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================
  // UPLOAD / GESTION FICHIERS
  // ============================================================
  async function handleUpload(e, clientId, folderName = null) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showAlert('error', 'Fichier trop volumineux (max 50MB)');
      e.target.value = '';
      return;
    }

    setUploading(prev => ({ ...prev, [clientId]: true }));
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      let publicUrl = URL.createObjectURL(file);
      
      try {
        const { error: uploadError } = await supabaseErp.storage
          .from('fichiers_clients')
          .upload(`fichiers/${fileName}`, file);
        if (!uploadError) {
          const { data: urlData } = supabaseErp.storage
            .from('fichiers_clients')
            .getPublicUrl(`fichiers/${fileName}`);
          publicUrl = urlData.publicUrl;
        }
      } catch (e) { console.log('Storage non disponible, URL locale'); }

      const categorie = detecterCategorie(file.name);
      await supabaseErp.from('erp_fichiers_clients').insert({
        client_id: clientId,
        nom_fichier: file.name,
        categorie: categorie,
        dossier: folderName || 'autre',
        url_fichier: publicUrl,
        taille_fichier: file.size,
        type_mime: file.type
      });

      showAlert('success', '✅ Fichier uploadé');
      loadAllData();
      e.target.value = '';
    } catch (error) {
      console.error('Erreur upload:', error);
      showAlert('error', 'Erreur upload: ' + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [clientId]: false }));
    }
  }

  async function handleDeleteFile() {
    if (!deleteFile) return;
    try {
      await supabaseErp.from('erp_fichiers_clients').delete().eq('id', deleteFile.id);
      showAlert('success', '✅ Fichier supprimé');
      loadAllData();
    } catch (error) {
      showAlert('error', 'Erreur suppression');
    }
    setDeleteFile(null);
  }

  const handleCopyLink = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const i = document.createElement('input');
      i.value = url;
      document.body.appendChild(i);
      i.select();
      document.execCommand('copy');
      document.body.removeChild(i);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = async (url, fileName) => {
    try {
      if (url.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur de téléchargement');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showAlert('error', 'Erreur lors du téléchargement');
    }
  };

  // ============================================================
  // FILTRES
  // ============================================================
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchSearch = (client.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.entreprise || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && (filterType === 'all' || client.type_client === filterType);
    });
  }, [clients, searchTerm, filterType]);

  const filteredClientsForData = useMemo(() => {
    return clients.filter(client => {
      const matchSearch = (client.nom || '').toLowerCase().includes(dataSearch.toLowerCase()) ||
        (client.prenom || '').toLowerCase().includes(dataSearch.toLowerCase()) ||
        (client.entreprise || '').toLowerCase().includes(dataSearch.toLowerCase());
      
      const hasFiles = getClientFiles(client.id).length > 0;
      if (dataFilter === 'with_files') return matchSearch && hasFiles;
      if (dataFilter === 'without_files') return matchSearch && !hasFiles;
      return matchSearch;
    });
  }, [clients, dataSearch, dataFilter, getClientFiles]);

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`font-['Playfair_Display'] text-2xl lg:text-3xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Clients
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Gérez vos clients et leurs données
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>👤</span> Nouveau client
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* TABS */}
      {/* ============================================================ */}
      <div className="flex gap-2 mb-5">
        {['clients', 'data', 'stats'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#F0C75E] text-[#071325] shadow-lg'
                : isDark
                  ? 'bg-[#0D1F3C] text-gray-400 hover:text-white border border-[#1A3A6B]'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
            }`}
          >
            {tab === 'clients' ? '👥 Liste' : tab === 'data' ? '📊 DATA Clients' : '📈 Statistiques'}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1 : LISTE CLIENTS - VUE GRILLE 3 COLONNES */}
      {/* ============================================================ */}
      {activeTab === 'clients' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { v: stats.total, l: 'Total', c: 'text-white' },
              { v: stats.particulier, l: '👤 Particuliers', c: 'text-green-400' },
              { v: stats.entreprise, l: '🏢 Entreprises', c: 'text-blue-400' },
              { v: stats.passager, l: '🧳 Passagers', c: 'text-purple-400' }
            ].map((s, i) => (
              <div key={i} className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-3 border text-center`}>
                <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                <p className="text-[10px] text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="🔍 Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg text-sm ${
                isDark
                  ? 'bg-[#071325] border-[#1A3A6B] text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              } border focus:outline-none focus:ring-2 focus:ring-[#F0C75E]`}
            />
            {['all', 'particulier', 'entreprise', 'passager'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  filterType === t
                    ? 'bg-[#F0C75E] text-[#071325]'
                    : isDark
                      ? 'bg-[#071325] text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
              >
                {t === 'all' ? '📊 Tous' : t === 'particulier' ? '👤' : t === 'entreprise' ? '🏢' : '🧳'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => {
              const nbCmd = getClientCommandes(client.id);
              const nbFiles = getClientFiles(client.id).length;
              const nbFolders = getClientFolderKeys(client.id).length;
              
              let displayName = '';
              let subInfo = '';
              let icon = '';
              
              if (client.type_client === 'entreprise') {
                displayName = client.entreprise || client.nom;
                subInfo = client.nom && client.entreprise ? `Contact: ${client.nom}` : '';
                icon = '🏢';
              } else if (client.type_client === 'passager') {
                displayName = `${client.prenom || ''} ${client.nom}`;
                icon = '🧳';
              } else {
                displayName = `${client.prenom || ''} ${client.nom}`;
                icon = '👤';
              }
              
              return (
                <div
                  key={client.id}
                  className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-2xl border p-4 hover:border-[#F0C75E]/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        client.type_client === 'entreprise' ? 'bg-blue-500/20 text-blue-400' :
                        client.type_client === 'passager' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {icon}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'} line-clamp-1`}>
                          {displayName}
                        </p>
                        {subInfo && (
                          <p className="text-gray-400 text-[10px]">{subInfo}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(client)}
                          className={`p-1.5 rounded-lg transition ${
                            isDark ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDialog({ open: true, id: client.id })}
                          className={`p-1.5 rounded-lg transition ${
                            isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">📧</span>
                      <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {client.email || 'Non renseigné'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">📱</span>
                      <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {client.telephone || 'Non renseigné'}
                      </span>
                    </div>
                    {client.adresse && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">📍</span>
                        <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {client.adresse}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1A3A6B]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(client.type_client)}
                      {getStatusBadge(client.status)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        📦 {nbCmd}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        📊 {nbFiles}
                        {nbFolders > 0 && ` 📁${nbFolders}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-8 text-center border`}>
              <span className="text-4xl block mb-3">👤</span>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'Aucun client correspondant' : 'Aucun client dans la liste'}
              </p>
              {canCreate && (
                <button
                  onClick={openCreateModal}
                  className="mt-3 px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-medium hover:shadow-lg transition"
                >
                  ➕ Ajouter un client
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2 : DATA CLIENTS - AVEC MODAL CLICABLE */}
      {/* ============================================================ */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-3 border flex flex-wrap items-center gap-3`}>
            <div className="flex-1 min-w-[180px] relative">
              <input
                type="text"
                placeholder="🔍 Rechercher un client..."
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                  isDark
                    ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'with_files', 'without_files'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setDataFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    dataFilter === filter
                      ? 'bg-[#F0C75E] text-[#071325]'
                      : isDark
                        ? 'bg-[#071325] text-gray-400 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filter === 'all' ? '📊 Tous' : filter === 'with_files' ? '📁 Avec' : '📭 Sans'}
                </button>
              ))}
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {filteredClientsForData.length} client{filteredClientsForData.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredClientsForData.length === 0 ? (
            <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-12 text-center border`}>
              <span className="text-6xl block mb-4">📂</span>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {dataSearch ? 'Aucun client correspondant' : 'Aucune donnée client disponible'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClientsForData.map(client => {
                const clientFiles = getClientFiles(client.id);
                const folderKeys = getClientFolderKeys(client.id);
                const totalFiles = clientFiles.length;
                
                let displayName = '';
                let subInfo = '';
                let icon = '';
                
                if (client.type_client === 'entreprise') {
                  displayName = client.entreprise || client.nom;
                  subInfo = client.nom && client.entreprise ? `Contact: ${client.nom}` : '';
                  icon = '🏢';
                } else if (client.type_client === 'passager') {
                  displayName = `${client.prenom || ''} ${client.nom}`;
                  icon = '🧳';
                } else {
                  displayName = `${client.prenom || ''} ${client.nom}`;
                  icon = '👤';
                }
                
                return (
                  <div
                    key={client.id}
                    className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-2xl border p-5 hover:border-[#F0C75E]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group`}
                  >
                    {/* En-tête de la carte - CLICABLE POUR OUVRIR LE MODAL */}
                    <div
                      className={`flex items-start justify-between mb-4 cursor-pointer transition ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      } rounded-xl p-2 -m-2`}
                      onClick={() => openDataModal(client)}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                          client.type_client === 'entreprise' ? 'bg-blue-500/20 text-blue-400' :
                          client.type_client === 'passager' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'} truncate`}>
                            {displayName}
                          </p>
                          {subInfo && (
                            <p className="text-gray-400 text-sm truncate">{subInfo}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-400 text-sm">{totalFiles} fichier{totalFiles > 1 ? 's' : ''}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            <span className="text-gray-400 text-sm">{folderKeys.length} dossier{folderKeys.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewFolderModal(client.id);
                          }}
                          className="px-3 py-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5"
                          title="Nouveau dossier"
                        >
                          📁 Nouveau
                        </button>
                        <label
                          className="cursor-pointer px-3 py-1.5 bg-[#0D1F3C] border border-[#1A3A6B] text-gray-300 rounded-lg text-sm font-medium hover:border-[#F0C75E] transition flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                          title="Uploader un fichier"
                        >
                          📤
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUpload(e, client.id)}
                            accept="image/*,.pdf,.ai,.psd,.eps,.cdr"
                            disabled={uploading[client.id]}
                          />
                        </label>
                        {uploading[client.id] && (
                          <div className="w-5 h-5 border-2 border-[#F0C75E] border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>

                    {/* Dossiers */}
                    {folderKeys.length > 0 ? (
                      <div className="space-y-3 mt-3">
                        {folderKeys.slice(0, 4).map(folder => {
                          const files = getFolderFiles(client.id, folder);
                          const folderColor = getFolderColor(client.id, folder);
                          const folderIcon = getFolderIcon(client.id, folder);
                          const isOpen = isFolderExpanded(client.id, folder);
                          
                          return (
                            <div
                              key={folder}
                              className={`rounded-xl border ${isDark ? 'border-[#1A3A6B]/50' : 'border-gray-200'} overflow-hidden transition-all duration-200 ${
                                isOpen ? 'bg-[#F0C75E]/5' : ''
                              }`}
                              style={{ borderLeftColor: folderColor, borderLeftWidth: '4px' }}
                            >
                              <div
                                className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition ${
                                  isOpen
                                    ? isDark ? 'bg-white/5' : 'bg-gray-100/50'
                                    : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => toggleFolder(client.id, folder)}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-xl flex-shrink-0">{folderIcon}</span>
                                  <span className={`font-medium text-base truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {folder}
                                  </span>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                                    isDark ? 'bg-[#1A3A6B] text-gray-400' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {files.length}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <label
                                    className="cursor-pointer text-sm opacity-0 group-hover:opacity-100 transition"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    📤
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => handleUpload(e, client.id, folder)}
                                      accept="image/*,.pdf,.ai,.psd,.eps,.cdr"
                                    />
                                  </label>
                                  <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                  </span>
                                </div>
                              </div>

                              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className={`px-4 py-3 border-t ${isDark ? 'border-[#1A3A6B]/50' : 'border-gray-200/50'}`}>
                                  <div className="grid grid-cols-3 gap-2">
                                    {files.slice(0, 6).map(f => (
                                      <div
                                        key={f.id}
                                        className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-lg p-2 border hover:border-[#F0C75E]/40 transition-all duration-200 cursor-pointer group relative`}
                                        onClick={() => setPreviewFile(f)}
                                      >
                                        <div className={`h-16 flex items-center justify-center ${isDark ? 'bg-[#071325]' : 'bg-gray-50'} rounded`}>
                                          {f.type_mime?.startsWith('image/') ?
                                            <img src={f.url_fichier} alt={f.nom_fichier} className="max-w-full max-h-full object-contain" /> :
                                            <span className="text-2xl">📄</span>
                                          }
                                        </div>
                                        <p className={`text-xs truncate font-medium ${isDark ? 'text-white' : 'text-gray-800'} mt-1`}>
                                          {f.nom_fichier}
                                        </p>
                                        <div className="flex items-center justify-between mt-0.5">
                                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {formatTaille(f.taille_fichier)}
                                          </span>
                                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {new Date(f.date_upload).toLocaleDateString('fr-FR')}
                                          </span>
                                        </div>
                                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); downloadFile(f.url_fichier, f.nom_fichier); }}
                                            className="w-5 h-5 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white text-[8px] flex items-center justify-center shadow-md transition"
                                            title="Télécharger"
                                          >
                                            ⬇️
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleCopyLink(f.url_fichier, f.id); }}
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${
                                              copiedId === f.id ? 'bg-green-500 text-white' : isDark ? 'bg-[#1A3A6B] text-gray-300' : 'bg-white/90 text-gray-600 shadow-md'
                                            }`}
                                            title="Copier le lien"
                                          >
                                            {copiedId === f.id ? '✅' : '📋'}
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteFile(f); }}
                                            className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-600 text-white text-[8px] flex items-center justify-center shadow-md transition"
                                            title="Supprimer"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    {files.length > 6 && (
                                      <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-lg p-2 border flex items-center justify-center text-sm text-gray-400 font-medium`}>
                                        +{files.length - 6}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {folderKeys.length > 4 && (
                          <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} pt-1`}>
                            + {folderKeys.length - 4} autre{folderKeys.length - 4 > 1 ? 's' : ''} dossier{folderKeys.length - 4 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <span className="text-4xl block mb-2">📭</span>
                        <p className={`text-base ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Aucun dossier
                        </p>
                        <button
                          onClick={() => openNewFolderModal(client.id)}
                          className="mt-2 px-4 py-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-medium hover:shadow-lg transition"
                        >
                          📁 Créer un dossier
                        </button>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#1A3A6B]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(client.type_client)}
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          📦 {getClientCommandes(client.id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <button
                            onClick={() => openEditModal(client)}
                            className={`p-1.5 rounded-lg transition ${
                              isDark ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title="Modifier le client"
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDialog({ open: true, id: client.id })}
                            className={`p-1.5 rounded-lg transition ${
                              isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                            }`}
                            title="Supprimer le client"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3 : STATISTIQUES */}
      {/* ============================================================ */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${isDark ? 'bg-gradient-to-br from-[#0D1F3C] to-[#1A3A6B]/30 border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border`}>
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">🏆 Client le plus actif</h3>
              {stats.topClient ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F0C75E] to-[#d4aa3a] flex items-center justify-center text-2xl font-bold text-[#071325]">
                    {stats.topClient.nom?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {stats.topClient.nom} {stats.topClient.prenom || ''}
                    </p>
                    {stats.topClient.entreprise && <p className="text-gray-400 text-sm">{stats.topClient.entreprise}</p>}
                    <p className="text-[#F0C75E] text-sm font-semibold mt-1">{stats.topClient.commandes} commandes</p>
                  </div>
                </div>
              ) : <p className="text-gray-500">Aucune commande</p>}
            </div>
            <div className={`${isDark ? 'bg-gradient-to-br from-[#0D1F3C] to-[#1A3A6B]/30 border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border`}>
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📁 Plus de fichiers</h3>
              {stats.topTraffic ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                    {stats.topTraffic.nom?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {stats.topTraffic.nom} {stats.topTraffic.prenom || ''}
                    </p>
                    {stats.topTraffic.entreprise && <p className="text-gray-400 text-sm">{stats.topTraffic.entreprise}</p>}
                    <p className="text-blue-400 text-sm font-semibold mt-1">{stats.topTraffic.fichiers} fichiers</p>
                  </div>
                </div>
              ) : <p className="text-gray-500">Aucun fichier</p>}
            </div>
          </div>
          <div className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B]' : 'bg-white border-gray-200'} rounded-xl p-5 border`}>
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">📊 Top 5 clients les plus actifs</h3>
            {stats.clientsActifs.length > 0 ? (
              <div className="space-y-3">
                {stats.clientsActifs.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[#F0C75E] font-bold text-lg w-6">{i + 1}</span>
                    <div className={`flex-1 ${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} rounded-lg p-3 flex items-center justify-between`}>
                      <div>
                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {item.client?.nom} {item.client?.prenom || ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#F0C75E] text-sm font-semibold">{item.commandes} cmd</span>
                        <div className="w-24 h-2 bg-[#1A3A6B] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#F0C75E] rounded-full"
                            style={{ width: `${(item.commandes / stats.clientsActifs[0].commandes) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune commande</p>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DATA CLIENTS */}
      {/* ============================================================ */}
      <ClientDataModal
        isOpen={isDataModalOpen}
        onClose={() => {
          setIsDataModalOpen(false);
          setSelectedClientData(null);
        }}
        client={selectedClientData}
        fichiers={fichiers}
        onRefresh={loadAllData}
      />

      {/* ============================================================ */}
      {/* MODAL NOUVEAU DOSSIER */}
      {/* ============================================================ */}
      <Modal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title="📁 Nouveau dossier"
        size="medium"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nom du dossier *
            </label>
            <input
              type="text"
              value={folderForm.nom}
              onChange={(e) => setFolderForm({ ...folderForm, nom: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                isDark
                  ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
              placeholder="Ex: Logo, Factures, etc."
              autoFocus
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Couleur
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DOSSIER_COLORS.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFolderForm({ ...folderForm, couleur: color.value })}
                  className={`w-10 h-10 rounded-full transition-all ${
                    folderForm.couleur === color.value
                      ? 'ring-2 ring-[#F0C75E] ring-offset-2 ring-offset-[#071325] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Icône
            </label>
            <div className="grid grid-cols-8 gap-1">
              {DOSSIER_ICONS.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFolderForm({ ...folderForm, icon })}
                  className={`p-2 rounded-lg text-lg transition-all ${
                    folderForm.icon === icon
                      ? 'bg-[#F0C75E] text-[#071325]'
                      : isDark
                        ? 'hover:bg-white/5'
                        : 'hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1A3A6B]">
            <button
              onClick={() => setShowNewFolderModal(false)}
              className={`px-5 py-2.5 rounded-lg font-medium transition ${
                isDark
                  ? 'bg-[#1A3A6B] text-gray-300 hover:bg-[#2A4A6B]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={saveFolder}
              className="px-6 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <span>📁</span> Créer le dossier
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL NOUVEAU CLIENT */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? '👤 Nouveau client' : '✏️ Modifier'}
        size="large"
      >
        <form onSubmit={saveClient} className="space-y-5">
          {/* Type de client */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Type de client <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['particulier', 'entreprise', 'passager'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, type_client: type });
                    setShowPassagerForm(false);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.type_client === type
                      ? 'border-[#F0C75E] bg-[#F0C75E]/10'
                      : isDark
                        ? 'border-[#1A3A6B] bg-[#071325]'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-2xl block text-center">
                    {type === 'particulier' ? '👤' : type === 'entreprise' ? '🏢' : '🧳'}
                  </span>
                  <span className={`text-xs block text-center mt-1 ${
                    formData.type_client === type ? 'text-[#F0C75E]' : 'text-gray-400'
                  }`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Passager sélecteur */}
          {formData.type_client === 'passager' && (
            <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-300 bg-purple-50/50'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                🧳 Sélectionner un passager
              </p>
              {!showPassagerForm ? (
                <div className="flex gap-3">
                  <select
                    value={selectedPassagerId}
                    onChange={(e) => {
                      setSelectedPassagerId(e.target.value);
                      const passager = clients.find(c => c.id === e.target.value);
                      if (passager) {
                        setFormData(prev => ({
                          ...prev,
                          nom: passager.nom,
                          prenom: passager.prenom,
                          email: passager.email || '',
                          telephone: passager.telephone || '',
                          adresse: passager.adresse || '',
                        }));
                      }
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                      isDark
                        ? 'bg-[#071325] border-[#1A3A6B] text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="">-- Sélectionner --</option>
                    {clients.filter(c => c.type_client === 'passager').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom} {p.telephone ? `- ${p.telephone}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassagerForm(true);
                      setPassagerForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '', piece_identite: '', num_piece: '', nationalite: '', date_arrivee: '' });
                    }}
                    className="px-4 py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition"
                  >
                    ➕ Nouveau
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={passagerForm.nom}
                        onChange={(e) => setPassagerForm({ ...passagerForm, nom: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                          isDark
                            ? 'bg-[#071325] border-[#1A3A6B] text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-800'
                        }`}
                        placeholder="Dupont"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={passagerForm.prenom}
                        onChange={(e) => setPassagerForm({ ...passagerForm, prenom: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                          isDark
                            ? 'bg-[#071325] border-[#1A3A6B] text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-800'
                        }`}
                        placeholder="Jean"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={savePassagerRapide}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-[#F0C75E] text-[#071325] rounded-lg font-semibold hover:bg-[#d4aa3a] transition"
                    >
                      {isSubmitting ? '⏳' : '💾'} Créer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassagerForm(false);
                        setPassagerForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '', piece_identite: '', num_piece: '', nationalite: '', date_arrivee: '' });
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        isDark
                          ? 'bg-[#1A3A6B] text-gray-300 hover:bg-[#2A4A6B]'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Champs communs */}
          {!(formData.type_client === 'passager' && selectedPassagerId) && formData.type_client !== 'passager' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                      isDark
                        ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder="Dupont"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                      isDark
                        ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder="Jean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                      isDark
                        ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                      isDark
                        ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Adresse
                </label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] resize-none ${
                    isDark
                      ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                  }`}
                  placeholder="Adresse complète"
                />
              </div>

              {formData.type_client === 'entreprise' && (
                <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-300 bg-blue-50/50'}`}>
                  <p className={`text-sm font-medium mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    🏢 Informations entreprise
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nom de l'entreprise *
                      </label>
                      <input
                        type="text"
                        value={formData.entreprise}
                        onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                          isDark
                            ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                        }`}
                        placeholder="Ma Société"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Matricule fiscale
                      </label>
                      <input
                        type="text"
                        value={formData.matricule_fiscale}
                        onChange={(e) => setFormData({ ...formData, matricule_fiscale: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F0C75E] ${
                          isDark
                            ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500'
                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                        }`}
                        placeholder="1234567/X"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className={`pt-3 border-t ${isDark ? 'border-[#1A3A6B]' : 'border-gray-200'}`}>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setShowPassagerForm(false);
                }}
                className={`px-5 py-2.5 rounded-lg font-medium transition ${
                  isDark
                    ? 'bg-[#1A3A6B] text-gray-300 hover:bg-[#2A4A6B]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-lg font-semibold text-[#071325] bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] hover:shadow-lg transition flex items-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-[#071325] border-t-transparent rounded-full"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* PREVIEW MODAL */}
      {/* ============================================================ */}
      {previewFile && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          title={previewFile.nom_fichier}
          size="medium"
        >
          {previewFile.type_mime?.startsWith('image/') ? (
            <img
              src={previewFile.url_fichier}
              alt={previewFile.nom_fichier}
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
            />
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">📄</span>
              <a
                href={previewFile.url_fichier}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F0C75E] hover:underline block mt-4"
              >
                📥 Télécharger
              </a>
            </div>
          )}
        </Modal>
      )}

      {/* ============================================================ */}
      {/* CONFIRM DIALOGS */}
      {/* ============================================================ */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={() => deleteClient(confirmDialog.id)}
        title="Supprimer"
        message="Supprimer ce client ?"
        confirmText="Supprimer"
      />

      <ConfirmDialog
        isOpen={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={handleDeleteFile}
        title="Supprimer"
        message={`Supprimer "${deleteFile?.nom_fichier}" ?`}
        confirmText="Supprimer"
      />
    </div>
  );
}