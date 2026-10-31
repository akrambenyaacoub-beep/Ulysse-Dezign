// src/pages/Commandes.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showAlert } from '../components/AlertModal';
import BonATirer from '../components/BonATirer';

function Commandes() {
  const { profile } = useAuth();
  const role = profile?.role;
  const { isDark } = useTheme();
  
  const isDesigner = role === 'designer';
  const isImprimeur = role === 'imprimeur';
  const isReadOnly = role === 'agent_financier';
  const canEdit = role === 'admin' || role === 'gestionnaire' || role === 'commercial' || role === 'designer' || role === 'imprimeur';
  const canDelete = role === 'admin' || role === 'gestionnaire';
  
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showBAT, setShowBAT] = useState(false);
  const [selectedBATCommande, setSelectedBATCommande] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newClientData, setNewClientData] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '',
    type_client: 'particulier', matricule_fiscale: '', entreprise: '',
    piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: ''
  });
  
  const [formData, setFormData] = useState({
    client_id: '',
    numero: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    status: 'en_attente',
    description: '',
    lignes: [{ produit_id: '', quantite: 1, prix_unitaire: 0, description: '' }]
  });

  // ✅ Validation
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

  useEffect(() => { loadData(); }, []);

  // ============================================================
  // CHARGEMENT
  // ============================================================
  async function loadData() {
    try {
      setLoading(true);
      
      const [commandesRes, clientsRes, produitsRes] = await Promise.all([
        supabaseErp.from('erp_commandes').select('*').order('created_at', { ascending: false }),
        supabaseErp.from('erp_clients').select('*').order('nom'),
        supabaseErp.from('erp_produits').select('*').order('nom')
      ]);
      
      const clientsData = clientsRes.data || [];
      const commandesWithClients = (commandesRes.data || []).map(cmd => ({
        ...cmd,
        erp_clients: clientsData.find(c => c.id === cmd.client_id) || null
      }));
      
      setCommandes(commandesWithClients);
      setClients(clientsData);
      setProduits(produitsRes.data || []);
    } catch (error) {
      console.error('❌ Erreur loadData:', error);
      showAlert('error', 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }

  async function loadLignes(commandeId) {
    const { data } = await supabaseErp.from('erp_lignes_commande').select('*').eq('commande_id', commandeId);
    return data || [];
  }

  // ============================================================
  // CRÉATION TÂCHES (AVEC INFOS CLIENT)
  // ============================================================
  async function createTasksFromCommande(commandeId, lignes, commandeNumero) {
    try {
      const { data: allProduits } = await supabaseErp.from('erp_produits').select('*');
      const { data: equipes } = await supabaseErp.from('erp_equipes').select('*');
      
      const { data: commande } = await supabaseErp
        .from('erp_commandes')
        .select('client_id')
        .eq('id', commandeId)
        .single();
      
      let clientInfo = '';
      if (commande?.client_id) {
        const { data: client } = await supabaseErp
          .from('erp_clients')
          .select('*')
          .eq('id', commande.client_id)
          .single();
        
        if (client) {
          if (client.type_client === 'entreprise') {
            clientInfo = `🏢 ${client.entreprise || client.nom}`;
          } else if (client.type_client === 'passager') {
            clientInfo = `🧳 ${client.nom} ${client.prenom || ''}`;
          } else {
            clientInfo = `👤 ${client.nom} ${client.prenom || ''}`;
          }
        }
      }
      
      const equipeMapping = {
        'impression': 'Impression', 'design': 'Design',
        'signaletique': 'Pose', 'textile': 'Extras',
        'goodies': 'Extras', 'service': 'Design'
      };
      const verbes = {
        'impression': 'Imprimer', 'design': 'Concevoir',
        'signaletique': 'Installer', 'textile': 'Fabriquer',
        'goodies': 'Produire', 'service': 'Réaliser'
      };
      
      let tasksCreated = 0;
      
      for (const ligne of lignes) {
        const produit = allProduits?.find(p => p.id == ligne.produit_id);
        const produitNom = produit?.nom || 'Produit';
        const categorie = produit?.categorie || 'service';
        const verbe = verbes[categorie] || 'Traiter';
        const equipeNom = equipeMapping[categorie] || 'Extras';
        const equipe = equipes?.find(e => e.nom === equipeNom);
        
        const descriptionParts = [
          `📋 Commande: ${commandeNumero}`,
        ];
        
        if (clientInfo) {
          descriptionParts.push(`👤 Client: ${clientInfo.trim()}`);
        }
        
        descriptionParts.push(`🛍️ Produit: ${produitNom}`);
        descriptionParts.push(`📦 Quantité: ${ligne.quantite}`);
        
        if (ligne.description && ligne.description.trim() !== '') {
          descriptionParts.push(`📝 Détails: ${ligne.description}`);
        }
        
        const description = descriptionParts.join('\n');
        
        const { error } = await supabaseErp.from('erp_taches').insert([{
          commande_id: commandeId,
          titre: `${verbe} ${produitNom}`,
          description: description,
          status: 'a_faire',
          priorite: 'normale',
          equipe_id: equipe?.id || null
        }]);
        
        if (!error) tasksCreated++;
      }
      
      if (tasksCreated > 0) showAlert('success', `✅ ${tasksCreated} tâche(s) créée(s) dans Équipage`);
    } catch (error) {
      console.error('❌ Erreur création tâches:', error);
    }
  }

  // ============================================================
  // SYNCHRONISER LES TÂCHES (MODIFICATION)
  // ============================================================
  async function syncTasksWithCommande(commandeId, nouvellesLignes, commandeNumero) {
    try {
      console.log('🔄 Synchronisation des tâches pour:', commandeNumero);
      
      const { data: allProduits } = await supabaseErp.from('erp_produits').select('*');
      const { data: equipes } = await supabaseErp.from('erp_equipes').select('*');
      
      const { data: commande } = await supabaseErp
        .from('erp_commandes')
        .select('client_id')
        .eq('id', commandeId)
        .single();
      
      let clientInfo = '';
      if (commande?.client_id) {
        const { data: client } = await supabaseErp
          .from('erp_clients')
          .select('*')
          .eq('id', commande.client_id)
          .single();
        
        if (client) {
          if (client.type_client === 'entreprise') {
            clientInfo = `🏢 ${client.entreprise || client.nom}`;
          } else if (client.type_client === 'passager') {
            clientInfo = `🧳 ${client.nom} ${client.prenom || ''}`;
          } else {
            clientInfo = `👤 ${client.nom} ${client.prenom || ''}`;
          }
        }
      }
      
      const { data: existingTasks } = await supabaseErp
        .from('erp_taches')
        .select('*')
        .eq('commande_id', commandeId);
      
      const existingTasksList = existingTasks || [];
      
      const equipeMapping = {
        'impression': 'Impression', 'design': 'Design',
        'signaletique': 'Pose', 'textile': 'Extras',
        'goodies': 'Extras', 'service': 'Design'
      };
      const verbes = {
        'impression': 'Imprimer', 'design': 'Concevoir',
        'signaletique': 'Installer', 'textile': 'Fabriquer',
        'goodies': 'Produire', 'service': 'Réaliser'
      };
      
      const nouveauxProduits = nouvellesLignes.map(l => {
        const produit = allProduits?.find(p => p.id == l.produit_id);
        return {
          produit_id: l.produit_id,
          produitNom: produit?.nom || 'Produit',
          categorie: produit?.categorie || 'service',
          quantite: l.quantite || 1,
          description: l.description || ''
        };
      });
      
      // 1. SUPPRIMER LES TÂCHES OBSOLÈTES
      for (const task of existingTasksList) {
        const taskProductName = task.titre?.replace(
          /^(Imprimer|Concevoir|Installer|Fabriquer|Produire|Réaliser|Traiter)\s+/, ''
        );
        
        const produitExiste = nouveauxProduits.some(p => 
          p.produitNom === taskProductName ||
          task.titre?.includes(p.produitNom)
        );
        
        if (!produitExiste) {
          console.log('🗑️ Suppression tâche obsolète:', task.titre);
          await supabaseErp.from('erp_taches').delete().eq('id', task.id);
        }
      }
      
      // 2. CRÉER LES NOUVELLES TÂCHES
      const { data: remainingTasks } = await supabaseErp
        .from('erp_taches')
        .select('*')
        .eq('commande_id', commandeId);
      
      const remainingTaskProducts = new Set(
        (remainingTasks || []).map(t => {
          const match = t.titre?.match(
            /^(Imprimer|Concevoir|Installer|Fabriquer|Produire|Réaliser|Traiter)\s+(.+)/
          );
          return match ? match[2] : t.titre;
        })
      );
      
      let tasksCreated = 0;
      
      for (const produit of nouveauxProduits) {
        if (!remainingTaskProducts.has(produit.produitNom)) {
          const verbe = verbes[produit.categorie] || 'Traiter';
          const equipeNom = equipeMapping[produit.categorie] || 'Extras';
          const equipe = equipes?.find(e => e.nom === equipeNom);
          
          const titre = `${verbe} ${produit.produitNom}`;
          
          const descriptionParts = [
            `📋 Commande: ${commandeNumero}`,
          ];
          if (clientInfo) {
            descriptionParts.push(`👤 Client: ${clientInfo.trim()}`);
          }
          descriptionParts.push(`🛍️ Produit: ${produit.produitNom}`);
          descriptionParts.push(`📦 Quantité: ${produit.quantite}`);
          if (produit.description && produit.description.trim() !== '') {
            descriptionParts.push(`📝 Détails: ${produit.description}`);
          }
          const description = descriptionParts.join('\n');
          
          const { error } = await supabaseErp.from('erp_taches').insert([{
            commande_id: commandeId,
            titre,
            description,
            status: 'a_faire',
            priorite: 'normale',
            equipe_id: equipe?.id || null
          }]);
          
          if (!error) {
            tasksCreated++;
            console.log('✅ Nouvelle tâche créée:', titre);
          }
        }
      }
      
      // 3. METTRE À JOUR LES TÂCHES EXISTANTES
      const { data: finalTasks } = await supabaseErp
        .from('erp_taches')
        .select('*')
        .eq('commande_id', commandeId);
      
      for (const task of (finalTasks || [])) {
        const match = task.titre?.match(
          /^(Imprimer|Concevoir|Installer|Fabriquer|Produire|Réaliser|Traiter)\s+(.+)/
        );
        const taskProductName = match ? match[2] : '';
        
        const produitCorrespondant = nouveauxProduits.find(p => p.produitNom === taskProductName);
        
        if (produitCorrespondant) {
          const verbe = verbes[produitCorrespondant.categorie] || 'Traiter';
          const equipeNom = equipeMapping[produitCorrespondant.categorie] || 'Extras';
          const equipe = equipes?.find(e => e.nom === equipeNom);
          
          const newTitre = `${verbe} ${produitCorrespondant.produitNom}`;
          
          const descriptionParts = [
            `📋 Commande: ${commandeNumero}`,
          ];
          if (clientInfo) {
            descriptionParts.push(`👤 Client: ${clientInfo.trim()}`);
          }
          descriptionParts.push(`🛍️ Produit: ${produitCorrespondant.produitNom}`);
          descriptionParts.push(`📦 Quantité: ${produitCorrespondant.quantite}`);
          if (produitCorrespondant.description && produitCorrespondant.description.trim() !== '') {
            descriptionParts.push(`📝 Détails: ${produitCorrespondant.description}`);
          }
          const newDescription = descriptionParts.join('\n');
          
          if (task.titre !== newTitre || 
              task.description !== newDescription || 
              task.equipe_id !== (equipe?.id || null)) {
            
            await supabaseErp.from('erp_taches').update({
              titre: newTitre,
              description: newDescription,
              equipe_id: equipe?.id || null
            }).eq('id', task.id);
            
            console.log('🔄 Tâche mise à jour:', newTitre);
          }
        }
      }
      
      if (tasksCreated > 0) {
        showAlert('success', `✅ ${tasksCreated} nouvelle(s) tâche(s) ajoutée(s)`);
      }
      
      console.log('✅ Synchronisation terminée');
      
    } catch (error) {
      console.error('❌ Erreur syncTasks:', error);
    }
  }

  // ============================================================
  // CRÉATION CLIENT
  // ============================================================
  async function createNewClient() {
    if (!validateFields({ nom: newClientData.nom }, { nom: 'Nom' })) return;

    if (newClientData.type_client === 'entreprise' && !newClientData.entreprise) {
      showAlert('error', '❌ Le nom de l\'entreprise est obligatoire');
      return;
    }

    if (newClientData.type_client === 'passager') {
      if (!newClientData.piece_identite || !newClientData.num_piece) {
        showAlert('error', '❌ Pièce d\'identité et numéro obligatoires');
        return;
      }
    }

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

      console.log('📤 Création client:', clientData);

      const { data, error } = await supabaseErp
        .from('erp_clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur:', error);
        if (error.code === 'PGRST204') {
          showAlert('error', `❌ Colonne manquante: ${error.message}. Exécutez le SQL d'ajout de colonnes.`);
        } else {
          throw error;
        }
        return;
      }

      showAlert('success', `✅ Client "${data.nom}" créé (${newClientData.type_client})`);
      setShowNewClientModal(false);
      setNewClientData({ 
        nom: '', prenom: '', email: '', telephone: '', adresse: '',
        type_client: 'particulier', matricule_fiscale: '', entreprise: '',
        piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: ''
      });
      
      const { data: clientsData } = await supabaseErp.from('erp_clients').select('*').order('nom');
      setClients(clientsData || []);
      setFormData({ ...formData, client_id: data.id });
      
    } catch (error) {
      console.error('❌ Erreur création client:', error);
      showAlert('error', '❌ ' + error.message);
    }
  }

  // ============================================================
  // NUMÉROTATION SÉQUENTIELLE
  // ============================================================
  async function generateNumero() {
    const year = new Date().getFullYear();
    
    const { data } = await supabaseErp
      .from('erp_commandes')
      .select('numero')
      .like('numero', `CMD-${year}-%`)
      .order('numero', { ascending: false })
      .limit(1);
    
    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].numero.split('-')[2]) || 0;
      nextNumber = lastNum + 1;
    }
    
    return `CMD-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  // ============================================================
  // MODALS
  // ============================================================
  async function openCreateModal() {
    setModalMode('create');
    setSelectedCommande(null);
    const numero = await generateNumero();
    setFormData({
      client_id: '',
      numero,
      date_commande: new Date().toISOString().split('T')[0],
      date_livraison_prevue: '',
      status: 'en_attente',
      description: '',
      lignes: [{ produit_id: '', quantite: 1, prix_unitaire: 0, description: '' }]
    });
    setModalOpen(true);
  }

  async function openEditModal(commande) {
    setModalMode('edit');
    setSelectedCommande(commande);
    const lignes = await loadLignes(commande.id);
    setFormData({
      client_id: commande.client_id || '',
      numero: commande.numero || '',
      date_commande: commande.date_commande?.split('T')[0] || '',
      date_livraison_prevue: commande.date_livraison_prevue?.split('T')[0] || '',
      status: commande.status || 'en_attente',
      description: commande.description || '',
      lignes: lignes.length > 0 ? lignes.map(l => ({
        id: l.id,
        produit_id: l.produit_id || '',
        quantite: l.quantite || 1,
        prix_unitaire: l.prix_unitaire || 0,
        description: l.description || ''
      })) : [{ produit_id: '', quantite: 1, prix_unitaire: 0, description: '' }]
    });
    setModalOpen(true);
  }

  async function openViewModal(commande) {
    setModalMode('view');
    setSelectedCommande(commande);
    const lignes = await loadLignes(commande.id);
    setFormData({ 
      ...commande, 
      lignes: lignes.length > 0 ? lignes : [{ produit_id: '', quantite: 0, prix_unitaire: 0, description: '' }] 
    });
    setModalOpen(true);
  }

  function openBAT(commande) {
    setSelectedBATCommande(commande);
    setShowBAT(true);
  }

  // ============================================================
  // LIGNES
  // ============================================================
  function addLigne() {
    setFormData({ ...formData, lignes: [...formData.lignes, { produit_id: '', quantite: 1, prix_unitaire: 0, description: '' }] });
  }

  function removeLigne(index) {
    setFormData({ ...formData, lignes: formData.lignes.filter((_, i) => i !== index) });
  }

  function updateLigne(index, field, value) {
    const newLignes = [...formData.lignes];
    newLignes[index][field] = value ?? '';
    
    if (field === 'produit_id' && value) {
      const produit = produits.find(p => p.id == value);
      if (produit) newLignes[index].prix_unitaire = produit.prix_vente || 0;
    }
    
    setFormData({ ...formData, lignes: newLignes });
  }

  // ============================================================
  // SAUVEGARDE
  // ============================================================
  async function saveCommande() {
    if (!validateFields({ client_id: formData.client_id }, { client_id: 'Client' })) return;
    
    const hasProduit = formData.lignes.some(l => l.produit_id);
    if (!hasProduit) {
      showAlert('error', '❌ Ajoutez au moins un produit');
      return;
    }

    setSaving(true);
    try {
      const total_ht = formData.lignes.reduce((s, l) => s + (l.quantite || 0) * (l.prix_unitaire || 0), 0);
      const tva = total_ht * 0.19;
      const total_ttc = total_ht + tva;

      const commandeData = {
        client_id: formData.client_id,
        numero: formData.numero,
        date_commande: formData.date_commande,
        date_livraison_prevue: formData.date_livraison_prevue || null,
        status: formData.status,
        description: formData.description || null,
        total_ht, tva, total_ttc
      };

      let commandeId;

      if (modalMode === 'create') {
        const { data, error } = await supabaseErp.from('erp_commandes').insert([commandeData]).select();
        if (error) throw error;
        commandeId = data[0].id;

        const lignesValides = formData.lignes.filter(l => l.produit_id);
        if (lignesValides.length > 0) {
          await supabaseErp.from('erp_lignes_commande').insert(
            lignesValides.map(l => ({
              commande_id: commandeId,
              produit_id: l.produit_id,
              quantite: l.quantite || 1,
              prix_unitaire: l.prix_unitaire || 0,
              total: (l.quantite || 1) * (l.prix_unitaire || 0)
            }))
          );
          await createTasksFromCommande(commandeId, lignesValides, formData.numero);
        }
        if (formData.status === 'paye') {
          const client = clients.find(c => c.id == formData.client_id);
          await supabaseErp.from('erp_journal_caisse').insert([{
            date: formData.date_commande,
            type: 'revenue',
            montant: total_ttc,
            designation: `Commande ${formData.numero}`,
            category: 'commande',
            note: `Client: ${client?.nom || 'N/A'} ${client?.prenom || ''}`,
            commande_id: commandeId,
            client_id: formData.client_id
          }]);
        }
      } else {
        commandeId = selectedCommande.id;
        
        await supabaseErp.from('erp_commandes').update(commandeData).eq('id', commandeId);
        await supabaseErp.from('erp_lignes_commande').delete().eq('commande_id', commandeId);
        
        const lignesValides = formData.lignes.filter(l => l.produit_id);
        if (lignesValides.length > 0) {
          await supabaseErp.from('erp_lignes_commande').insert(
            lignesValides.map(l => ({
              commande_id: commandeId,
              produit_id: l.produit_id,
              quantite: l.quantite || 1,
              prix_unitaire: l.prix_unitaire || 0,
              total: (l.quantite || 1) * (l.prix_unitaire || 0)
            }))
          );
        }

        await syncTasksWithCommande(commandeId, lignesValides, formData.numero);
      }

      showAlert('success', `✅ Commande ${modalMode === 'create' ? 'créée' : 'modifiée'}`);
      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert('error', '❌ ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCommande(id) {
    try {
      await supabaseErp.from('erp_taches').delete().eq('commande_id', id);
      await supabaseErp.from('erp_lignes_commande').delete().eq('commande_id', id);
      await supabaseErp.from('erp_commandes').delete().eq('id', id);
      
      showAlert('success', '✅ Commande et tâches liées supprimées');
      loadData();
    } catch (error) {
      showAlert('error', '❌ ' + error.message);
    }
    setConfirmDialog({ open: false, id: null });
  }

  // ============================================================
  // BADGES
  // ============================================================
  const getStatusBadge = (status) => {
    const config = {
      en_attente: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
      en_cours: { label: 'En cours', color: 'bg-blue-500/20 text-blue-400' },
      paye: { label: 'Payé', color: 'bg-green-500/20 text-green-400' },
      annule: { label: 'Annulé', color: 'bg-red-500/20 text-red-400' },
      termine: { label: 'Terminé', color: 'bg-emerald-500/20 text-emerald-400' }
    };
    const c = config[status] || config.en_attente;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
      </div>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`font-['Playfair_Display'] text-2xl lg:text-3xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Commandes
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Gérez toutes vos commandes clients
          </p>
        </div>
        <button onClick={openCreateModal} className="px-5 py-2.5 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span> Nouvelle commande
        </button>
      </div>

      {/* Tableau */}
      <div className={`${isDark ? 'bg-[#0D1F3C]/80 border-[#1A3A6B]' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-[#071325] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} border-b`}>
              <tr>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">N°</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Client</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Date</th>
                {!isDesigner && <th className="text-left px-5 py-4 text-gray-400 text-sm">Total TTC</th>}
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Statut</th>
                <th className="text-center px-5 py-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1A3A6B]' : 'divide-gray-100'}`}>
              {commandes.length === 0 ? (
                <tr><td colSpan={isDesigner ? 5 : 6} className="text-center py-12 text-gray-500">Aucune commande</td></tr>
              ) : (
                commandes.map((cmd) => (
                  <tr key={cmd.id} className={`${isDark ? 'hover:bg-[#1A3A6B]/20' : 'hover:bg-gray-50'} transition duration-200`}>
                    <td className="px-5 py-4"><span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{cmd.numero}</span></td>
                    <td className="px-5 py-4">
                      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {cmd.erp_clients?.nom || '-'} {cmd.erp_clients?.prenom || ''}
                        {cmd.erp_clients?.type_client === 'passager' && ' 🧳'}
                        {cmd.erp_clients?.entreprise && ` (${cmd.erp_clients.entreprise})`}
                      </div>
                    </td>
                    <td className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(cmd.date_commande).toLocaleDateString('fr-FR')}
                    </td>
                    {!isDesigner && (
                      <td className={`px-5 py-4 font-semibold ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>
                        {cmd.total_ttc?.toLocaleString()} DT
                      </td>
                    )}
                    <td className="px-5 py-4">{getStatusBadge(cmd.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openViewModal(cmd)} className={`p-2 rounded-lg ${isDark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'}`} title="Voir">👁️</button>
                        {!isReadOnly && (
                          <button onClick={() => openBAT(cmd)} className={`p-2 rounded-lg ${isDark ? 'text-purple-400 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-50'}`} title="Bon À Tirer">📋</button>
                        )}
                        {canEdit && (
                          <button onClick={() => openEditModal(cmd)} className={`p-2 rounded-lg ${isDark ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-yellow-600 hover:bg-yellow-50'}`} title="Modifier">✏️</button>
                        )}
                        {canDelete && (
                          <button onClick={() => setConfirmDialog({ open: true, id: cmd.id })} className={`p-2 rounded-lg ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`} title="Supprimer">🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal BAT */}
      {showBAT && (
        <Modal isOpen={showBAT} onClose={() => setShowBAT(false)} title="Bon À Tirer" size="xlarge">
          <BonATirer commandeId={selectedBATCommande?.id} onClose={() => setShowBAT(false)} />
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL COMMANDE */}
      {/* ============================================================ */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalMode === 'create' ? 'Nouvelle commande' : modalMode === 'edit' ? 'Modifier la commande' : 'Détails de la commande'} 
        size="large"
        icon="shopping_cart"
        iconColor="text-[#F0C75E]"
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} p-3 rounded-lg border`}>
                <p className="text-gray-400 text-xs">Client</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {selectedCommande?.erp_clients?.nom} {selectedCommande?.erp_clients?.prenom || ''}
                  {selectedCommande?.erp_clients?.type_client === 'passager' && ' 🧳'}
                </p>
              </div>
              <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} p-3 rounded-lg border`}>
                <p className="text-gray-400 text-xs">Statut</p>
                {getStatusBadge(formData.status)}
              </div>
            </div>
            <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-lg border overflow-hidden`}>
              <table className="w-full">
                <thead className={`${isDark ? 'bg-[#071325]' : 'bg-gray-100'}`}>
                  <tr>
                    <th className="text-left p-3 text-gray-400 text-xs">Produit</th>
                    <th className="text-center p-3 text-gray-400 text-xs">Qté</th>
                    <th className="text-right p-3 text-gray-400 text-xs">Prix</th>
                    <th className="text-right p-3 text-gray-400 text-xs">Total</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#1A3A6B]' : 'divide-gray-100'}`}>
                  {formData.lignes?.map((ligne, idx) => (
                    <tr key={idx}>
                      <td className={`p-3 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {produits.find(p => p.id == ligne.produit_id)?.nom || '-'}
                      </td>
                      <td className={`p-3 text-sm text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>{ligne.quantite}</td>
                      <td className={`p-3 text-sm text-right ${isDark ? 'text-white' : 'text-gray-800'}`}>{ligne.prix_unitaire} DT</td>
                      <td className={`p-3 text-sm text-right font-semibold ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>
                        {((ligne.quantite || 0) * (ligne.prix_unitaire || 0)).toFixed(2)} DT
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className={`${isDark ? 'bg-[#071325] border-[#1A3A6B]' : 'bg-gray-100 border-gray-200'} border-t`}>
                  <tr><td colSpan="3" className={`p-3 text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total HT</td><td className={`p-3 text-right text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{formData.total_ht?.toFixed(2)} DT</td></tr>
                  <tr><td colSpan="3" className={`p-3 text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>TVA (19%)</td><td className={`p-3 text-right text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{formData.tva?.toFixed(2)} DT</td></tr>
                  <tr className={`border-t ${isDark ? 'border-[#1A3A6B]' : 'border-gray-200'}`}>
                    <td colSpan="3" className={`p-3 text-right font-bold text-sm ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>Total TTC</td>
                    <td className={`p-3 text-right font-bold text-lg ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>{formData.total_ttc?.toFixed(2)} DT</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Détails de la commande */}
            <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
              <h4 className={`text-xs uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="material-symbols-outlined text-sm">assignment</span> Détails
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>📅 Date commande</label>
                  <input type="date" value={formData.date_commande || ''} onChange={(e) => setFormData({ ...formData, date_commande: e.target.value })} className={`w-full p-2 rounded-lg border text-sm focus:ring-2 focus:ring-[#F0C75E]/50 ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>🚚 Livraison prévue</label>
                  <input type="date" value={formData.date_livraison_prevue || ''} onChange={(e) => setFormData({ ...formData, date_livraison_prevue: e.target.value })} className={`w-full p-2 rounded-lg border text-sm focus:ring-2 focus:ring-[#F0C75E]/50 ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>📊 Statut</label>
                  <select value={formData.status || 'en_attente'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`w-full p-2 rounded-lg border text-sm focus:ring-2 focus:ring-[#F0C75E]/50 ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}>
                    <option value="en_attente">⏳ En attente</option>
                    <option value="en_cours">🔄 En cours</option>
                    <option value="termine">✅ Terminé</option>
                    <option value="paye">💰 Payé</option>
                    <option value="annule">❌ Annulé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Produits */}
            <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-3 border`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>🛍️ Produits ({produits?.length || 0})</span>
                <button type="button" onClick={addLigne} className={`text-xs hover:underline flex items-center gap-0.5 ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>➕ Ajouter</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formData.lignes.map((ligne, idx) => (
                  <div key={idx} className={`${isDark ? 'bg-[#0D1F3C] border-[#1A3A6B] hover:border-[#F0C75E]/30' : 'bg-white border-gray-200 hover:border-[#d4aa3a]/30'} rounded-lg p-2 border transition group`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold w-5 text-center ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>{idx + 1}</span>
                      <select value={ligne.produit_id || ''} onChange={(e) => updateLigne(idx, 'produit_id', e.target.value)} className={`flex-1 min-w-[80px] p-1.5 rounded border text-xs focus:ring-1 focus:ring-[#F0C75E] ${
                        isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}>
                        <option value="">🔍 Produit</option>
                        {(produits || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                      </select>
                      <input type="number" value={ligne.quantite || 1} onChange={(e) => updateLigne(idx, 'quantite', parseInt(e.target.value) || 1)} className={`w-14 p-1.5 rounded border text-xs text-center focus:ring-1 focus:ring-[#F0C75E] ${
                        isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`} min="1" placeholder="Qté" />
                      {!isDesigner && (
                        <>
                          <input type="number" step="0.01" value={ligne.prix_unitaire || 0} onChange={(e) => updateLigne(idx, 'prix_unitaire', parseFloat(e.target.value) || 0)} className={`w-20 p-1.5 rounded border text-xs text-center focus:ring-1 focus:ring-[#F0C75E] ${
                            isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                          }`} placeholder="0.00" />
                          <div className={`text-xs font-semibold w-14 text-right ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>
                            {((ligne.quantite || 0) * (ligne.prix_unitaire || 0)).toLocaleString()} DT
                          </div>
                        </>
                      )}
                      <button onClick={() => removeLigne(idx)} className={`text-xs w-6 text-center transition ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} opacity-0 group-hover:opacity-100`}>✕</button>
                    </div>
                    <div className="mt-1.5">
                      <input type="text" value={ligne.description || ''} onChange={(e) => updateLigne(idx, 'description', e.target.value)} className={`w-full p-1.5 rounded border text-xs focus:ring-1 focus:ring-[#F0C75E] ${
                        isDark ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                      }`} placeholder="📝 Description (optionnelle)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`text-xs uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="material-symbols-outlined text-sm">person</span> Client
                  </h4>
                  <button onClick={() => setShowNewClientModal(true)} className={`text-sm hover:underline ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>+ Nouveau</button>
                </div>
                <select value={formData.client_id || ''} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} className={`w-full p-2 rounded-lg border text-sm focus:ring-2 focus:ring-[#F0C75E]/50 ${
                  isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}>
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>)}
                </select>
              </div>

              <div className={`${isDark ? 'bg-[#0A1628] border-[#1A3A6B]' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
                <h4 className={`text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📝 Description</h4>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className={`w-full p-2 rounded-lg border text-sm resize-none focus:ring-2 focus:ring-[#F0C75E]/50 ${
                  isDark ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`} placeholder="Optionnel" />
              </div>

              {!isDesigner && (
                <div className={`${isDark ? 'bg-gradient-to-br from-[#0A1628] to-[#0D1F3C] border-[#F0C75E]/20' : 'bg-gradient-to-br from-gray-50 to-white border-[#d4aa3a]/20'} rounded-xl p-4 border`}>
                  <h4 className={`text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>💰 Récapitulatif</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sous-total HT</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {formData.lignes.reduce((s, l) => s + (l.quantite || 0) * (l.prix_unitaire || 0), 0).toLocaleString()} DT
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>TVA (19%)</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {(formData.lignes.reduce((s, l) => s + (l.quantite || 0) * (l.prix_unitaire || 0), 0) * 0.19).toLocaleString()} DT
                      </span>
                    </div>
                    <div className={`flex justify-between text-base font-bold pt-2 border-t ${isDark ? 'border-[#1A3A6B]' : 'border-gray-200'}`}>
                      <span className={isDark ? 'text-white' : 'text-gray-800'}>Total TTC</span>
                      <span className={`text-xl font-bold font-mono ${isDark ? 'text-[#F0C75E]' : 'text-[#d4aa3a]'}`}>
                        {(formData.lignes.reduce((s, l) => s + (l.quantite || 0) * (l.prix_unitaire || 0), 0) * 1.19).toLocaleString()} DT
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button onClick={saveCommande} disabled={saving} className={`w-full py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] hover:shadow-lg' 
                    : 'bg-gradient-to-r from-[#d4aa3a] to-[#b8922f] text-white hover:shadow-lg'
                }`}>
                  {saving ? '⏳ Enregistrement...' : modalMode === 'create' ? '🚀 Créer la commande' : '💾 Enregistrer'}
                </button>
                <button onClick={() => setModalOpen(false)} className={`w-full py-2 rounded-xl transition ${
                  isDark ? 'border border-[#1A3A6B] text-gray-400 hover:bg-[#1A3A6B]' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL NOUVEAU CLIENT */}
      {/* ============================================================ */}
      <Modal 
        isOpen={showNewClientModal} 
        onClose={() => {
          setShowNewClientModal(false);
          setNewClientData({ 
            nom: '', prenom: '', email: '', telephone: '', adresse: '',
            type_client: 'particulier', matricule_fiscale: '', entreprise: '',
            piece_identite: '', num_piece: '', date_arrivee: '', date_depart: '', nationalite: ''
          });
        }} 
        title="Nouveau client" 
        size="large"
        icon="person_add"
        iconColor="text-[#F0C75E]"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type de client *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'particulier', label: '👤 Particulier', desc: 'Client individuel' },
                { id: 'entreprise', label: '🏢 Entreprise', desc: 'Société / Organisation' },
                { id: 'passager', label: '🧳 Passager', desc: 'Client occasionnel' }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setNewClientData({ ...newClientData, type_client: type.id })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    newClientData.type_client === type.id 
                      ? 'border-[#F0C75E] bg-[#F0C75E]/10 shadow-lg scale-105'
                      : isDark ? 'border-[#1A3A6B] bg-[#071325] hover:border-[#F0C75E]/40' : 'border-gray-200 bg-white hover:border-[#d4aa3a]/40'
                  }`}
                >
                  <span className="text-2xl">{type.label.split(' ')[0]}</span>
                  <p className={`text-sm font-semibold ${newClientData.type_client === type.id ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {type.label.split(' ')[1]}
                  </p>
                  <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {newClientData.type_client === 'entreprise' && (
            <div className={`${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'} rounded-lg p-3 space-y-3 border`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Entreprise *</label>
                  <input type="text" value={newClientData.entreprise || ''} onChange={(e) => setNewClientData({ ...newClientData, entreprise: e.target.value })} className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} placeholder="Raison sociale" />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Matricule fiscale</label>
                  <input type="text" value={newClientData.matricule_fiscale || ''} onChange={(e) => setNewClientData({ ...newClientData, matricule_fiscale: e.target.value })} className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} placeholder="1234567/X/A/000" />
                </div>
              </div>
            </div>
          )}

          {newClientData.type_client === 'passager' && (
            <div className={`${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'} rounded-lg p-3 space-y-3 border`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pièce d'identité *</label>
                  <select value={newClientData.piece_identite || ''} onChange={(e) => setNewClientData({ ...newClientData, piece_identite: e.target.value })} className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}>
                    <option value="">Sélectionner</option>
                    <option value="cin">🪪 CIN</option>
                    <option value="passeport">🛂 Passeport</option>
                    <option value="carte_sejour">🏠 Carte de séjour</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Numéro pièce *</label>
                  <input type="text" value={newClientData.num_piece || ''} onChange={(e) => setNewClientData({ ...newClientData, num_piece: e.target.value })} className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} placeholder="Numéro" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date d'arrivée</label>
                  <input type="date" value={newClientData.date_arrivee || ''} onChange={(e) => setNewClientData({ ...newClientData, date_arrivee: e.target.value })} className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date de départ</label>
                  <input type="date" value={newClientData.date_depart || ''} onChange={(e) => setNewClientData({ ...newClientData, date_depart: e.target.value })} className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nationalité</label>
                <input type="text" value={newClientData.nationalite || ''} onChange={(e) => setNewClientData({ ...newClientData, nationalite: e.target.value })} className={`w-full p-2 rounded-lg border ${
                  isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
                }`} placeholder="Ex: Tunisienne" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {newClientData.type_client === 'entreprise' ? 'Contact *' : 'Nom *'}
              </label>
              <input type="text" value={newClientData.nom || ''} onChange={(e) => setNewClientData({ ...newClientData, nom: e.target.value })} className={`w-full p-2 rounded-lg border ${
                isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
              }`} placeholder={newClientData.type_client === 'entreprise' ? 'Nom du contact' : 'Nom'} />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Prénom</label>
              <input type="text" value={newClientData.prenom || ''} onChange={(e) => setNewClientData({ ...newClientData, prenom: e.target.value })} className={`w-full p-2 rounded-lg border ${
                isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
              }`} placeholder="Prénom" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
              <input type="email" value={newClientData.email || ''} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} className={`w-full p-2 rounded-lg border ${
                isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
              }`} placeholder="email@exemple.com" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Téléphone</label>
              <input type="tel" value={newClientData.telephone || ''} onChange={(e) => setNewClientData({ ...newClientData, telephone: e.target.value })} className={`w-full p-2 rounded-lg border ${
                isDark ? 'bg-[#071325] border-[#1A3A6B] text-white' : 'bg-white border-gray-300 text-gray-800'
              }`} placeholder="+216 XX XXX XXX" />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Adresse</label>
            <textarea value={newClientData.adresse || ''} onChange={(e) => setNewClientData({ ...newClientData, adresse: e.target.value })} rows={2} className={`w-full p-2 rounded-lg border resize-none ${
              isDark ? 'bg-[#071325] border-[#1A3A6B] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
            }`} placeholder="Adresse..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1A3A6B]">
            <button onClick={() => setShowNewClientModal(false)} className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-[#1A3A6B] text-white hover:bg-[#2A4A6B]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>Annuler</button>
            <button onClick={createNewClient} className="px-4 py-2 bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#071325] rounded-lg font-semibold">Créer le client</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, id: null })} onConfirm={() => deleteCommande(confirmDialog.id)} title="Supprimer" message="Supprimer cette commande ?" confirmText="Supprimer" />
    </div>
  );
}

export default Commandes;