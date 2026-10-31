import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUTS = [
  { value: 'devis_cree', label: 'Devis créé' },
  { value: 'devis_envoye', label: 'Devis envoyé' },
  { value: 'acompte_recu', label: 'Acompte reçu' },
  { value: 'en_production', label: 'En production' },
  { value: 'pret', label: 'Prêt' },
  { value: 'livre', label: 'Livré' },
  { value: 'paye', label: 'Payé' },
  { value: 'annule', label: 'Annulé' },
]

export default function CommandeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [clients, setClients] = useState([])
  const [produits, setProduits] = useState([])
  const [fichier, setFichier] = useState(null)

  const [formData, setFormData] = useState({
    client_id: '',
    status: 'devis_cree',
    total_ht: 0,
    tva: 0,
    total_ttc: 0,
    deadline: '',
    notes_internes: '',
    notes_client: '',
    fichier_url: '',
    fichier_nom: '',
  })

  // Lignes de produits/services
  const [lignes, setLignes] = useState([
    { produit_id: '', description: '', type: 'produit', quantite: 1, prix_unitaire: 0, machine_id: '' },
  ])

  // Tranches de paiement
  const [tranches, setTranches] = useState([
    { description: 'Acompte à la commande', montant: 0, pourcentage: 50, paye: false, date_prevue: '', ordre: 1 },
    { description: 'Solde à la livraison', montant: 0, pourcentage: 50, paye: false, date_prevue: '', ordre: 2 },
  ])

  useEffect(() => {
    loadClients()
    loadProduits()
    if (isEdit) loadCommande()
  }, [id])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id, nom, entreprise').order('nom')
    setClients(data || [])
  }

  async function loadProduits() {
    const { data } = await supabase.from('produits').select('*, machines(nom)').eq('actif', true).order('nom')
    setProduits(data || [])
  }

  async function loadCommande() {
    const { data } = await supabase.from('commandes').select('*').eq('id', id).single()
    if (data) {
      setFormData({
        client_id: data.client_id || '',
        status: data.status || 'devis_cree',
        total_ht: data.total_ht || 0,
        tva: data.tva || 0,
        total_ttc: data.total_ttc || 0,
        deadline: data.deadline || '',
        notes_internes: data.notes_internes || '',
        notes_client: data.notes_client || '',
        fichier_url: data.fichier_url || '',
        fichier_nom: data.fichier_nom || '',
      })

      // Charger les lignes
      const { data: lignesData } = await supabase
        .from('lignes_commande')
        .select('*')
        .eq('commande_id', id)
        .order('ordre')
      
      if (lignesData && lignesData.length > 0) {
  setLignes(lignesData.map(l => ({
    produit_id: l.produit_id || '',
    description: l.description || '',
    type: l.type || 'produit',
    quantite: l.quantite || 1,
    prix_unitaire: l.prix_unitaire || 0,
    machine_id: l.machine_id || '',
  })))
}

      // Charger les tranches
      const { data: tranchesData } = await supabase
        .from('tranches_paiement')
        .select('*')
        .eq('commande_id', id)
        .order('ordre')
      
      if (tranchesData && tranchesData.length > 0) {
        setTranches(tranchesData.map(t => ({
          id: t.id,
          description: t.description,
          montant: t.montant,
          pourcentage: t.pourcentage,
          paye: t.paye,
          date_prevue: t.date_prevue || '',
          ordre: t.ordre,
        })))
      }
    }
  }

  // === GESTION LIGNES PRODUITS/SERVICES ===
  function handleLigneChange(index, field, value) {
    setLignes(prev => {
      const newLignes = [...prev]
      newLignes[index] = { ...newLignes[index], [field]: value }
      
      // Si on change le prix ou la quantité, recalculer le total
      if (field === 'prix_unitaire' || field === 'quantite') {
        recalculerTotal(newLignes)
      }
      
      return newLignes
    })
  }

  function ajouterLigne() {
    setLignes(prev => [...prev, { produit_id: '', description: '', type: 'produit', quantite: 1, prix_unitaire: 0, machine_id: '' }])
  }

  function supprimerLigne(index) {
    setLignes(prev => {
      const newLignes = prev.filter((_, i) => i !== index)
      recalculerTotal(newLignes)
      return newLignes
    })
  }

  function selectionnerProduit(index, produitId) {
    if (!produitId) {
      // Si on choisit l'option vide, réinitialiser la ligne
      setLignes(prev => {
        const newLignes = [...prev]
        newLignes[index] = {
          produit_id: '',
          description: '',
          type: 'produit',
          quantite: 1,
          prix_unitaire: 0,
          machine_id: '',
        }
        recalculerTotal(newLignes)
        return newLignes
      })
      return
    }
    
    const produit = produits.find(p => p.id === produitId)
    if (produit) {
      setLignes(prev => {
        const newLignes = [...prev]
        newLignes[index] = {
          ...newLignes[index],
          produit_id: produitId,
          type: produit.type,
          prix_unitaire: produit.prix_standard || 0,
          machine_id: produit.machine_id || '',
          // On garde la description existante (ne pas écraser si déjà remplie manuellement)
        }
        recalculerTotal(newLignes)
        return newLignes
      })
    }
  }

  function recalculerTotal(lignesActuelles) {
    const totalHT = lignesActuelles.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0)
    const tva = Math.round(totalHT * 0.19 * 100) / 100
    const totalTTC = totalHT + tva
    
    setFormData(prev => ({
      ...prev,
      total_ht: totalHT,
      tva: tva,
      total_ttc: totalTTC,
    }))

    // Recalculer les tranches
    setTranches(prev => prev.map(t => ({
      ...t,
      montant: Math.round(totalTTC * (t.pourcentage || 0) / 100 * 100) / 100
    })))
  }

  // === GESTION TRANCHES ===
  function handleTrancheChange(index, field, value) {
    setTranches(prev => {
      const newTranches = [...prev]
      newTranches[index] = { ...newTranches[index], [field]: value }
      if (field === 'pourcentage') {
        newTranches[index].montant = Math.round(formData.total_ttc * Number(value) / 100 * 100) / 100
      }
      return newTranches
    })
  }

  function ajouterTranche() {
    setTranches(prev => [...prev, {
      description: '', montant: 0, pourcentage: 0, paye: false, date_prevue: '', ordre: prev.length + 1
    }])
  }

  function supprimerTranche(index) {
    setTranches(prev => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, ordre: i + 1 })))
  }

  // === UPLOAD FICHIER ===
  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileName = `${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('fichiers_commandes').upload(fileName, file)
      if (error) throw error

      const { data: urlData } = supabase.storage.from('fichiers_commandes').getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, fichier_url: urlData.publicUrl, fichier_nom: file.name }))
      setFichier(file)
    } catch (error) {
      alert('Erreur upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // === SAUVEGARDE ===
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      let commandeId = id

      const dataToSave = {
        status: formData.status,
        total_ht: formData.total_ht,
        tva: formData.tva,
        total_ttc: formData.total_ttc,
      }
      if (formData.client_id) dataToSave.client_id = formData.client_id
      if (formData.deadline) dataToSave.deadline = formData.deadline
      if (formData.fichier_url) dataToSave.fichier_url = formData.fichier_url
      if (formData.fichier_nom) dataToSave.fichier_nom = formData.fichier_nom
      if (formData.notes_internes) dataToSave.notes_internes = formData.notes_internes
      if (formData.notes_client) dataToSave.notes_client = formData.notes_client

      console.log('Données à sauver:', dataToSave)

      if (isEdit) {
        const { error } = await supabase.from('commandes').update(dataToSave).eq('id', id)
        if (error) throw error
        await supabase.from('lignes_commande').delete().eq('commande_id', id)
        await supabase.from('tranches_paiement').delete().eq('commande_id', id)
      } else {
        const { data, error } = await supabase.from('commandes').insert(dataToSave).select('id').single()
        if (error) throw error
        commandeId = data.id
      }

      // Sauver les lignes
      if (commandeId && lignes.length > 0) {
       const lignesToInsert = lignes
  .filter(l => l.produit_id || l.description || l.prix_unitaire > 0)
  .map((l, i) => ({
    commande_id: commandeId,
    produit_id: l.produit_id || null,
    description: l.description || '',
    type: l.type || 'produit',
    quantite: l.quantite || 1,
    prix_unitaire: l.prix_unitaire || 0,
    machine_id: l.machine_id || null,
    ordre: i + 1,
  }))


        const { error: lignesError } = await supabase.from('lignes_commande').insert(lignesToInsert)
        if (lignesError) throw lignesError
      }

      // Sauver les tranches
      if (commandeId && tranches.length > 0) {
        const tranchesToInsert = tranches.map(t => ({
          commande_id: commandeId,
          description: t.description || 'Tranche',
          montant: t.montant || 0,
          pourcentage: t.pourcentage || 0,
          paye: t.paye || false,
          date_prevue: t.date_prevue || null,
          ordre: t.ordre,
        }))

        const { error: tranchesError } = await supabase.from('tranches_paiement').insert(tranchesToInsert)
        if (tranchesError) throw tranchesError
      }

      navigate('/commandes')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalLignes = lignes.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0)
  const totalPourcentage = tranches.reduce((sum, t) => sum + (t.pourcentage || 0), 0)
  const totalTranches = tranches.reduce((sum, t) => sum + t.montant, 0)

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/commandes')} className="text-gray-400 hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-3xl text-gray-100">
          {isEdit ? 'Modifier la commande' : 'Nouvelle commande'}
        </h1>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* INFORMATIONS GÉNÉRALES */}
          <div className="bg-[#0F1729] border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg text-ulysse-gold">📋 Informations générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Client <span className="text-red-400">*</span></label>
                <select name="client_id" value={formData.client_id} onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))} required
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold">
                  <option value="">Sélectionner un client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}{c.entreprise ? ` (${c.entreprise})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Statut</label>
                <select name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold">
                  {STATUTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">⏰ Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} 
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
              </div>
            </div>

            {/* Upload fichier */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">📎 Fichier joint (brief, maquette, référence)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 cursor-pointer hover:border-ulysse-gold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {uploading ? 'Upload...' : 'Choisir un fichier'}
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                {formData.fichier_nom && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-ulysse-gold">📄 {formData.fichier_nom}</span>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, fichier_url: '', fichier_nom: '' }))}
                      className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRODUITS & SERVICES */}
          <div className="bg-[#0F1729] border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ulysse-gold">📦 Produits & Services</h2>
              <span className="text-sm text-gray-400">Total HT: <span className="text-ulysse-gold font-bold">{totalLignes.toLocaleString()} DT</span></span>
            </div>

            <div className="space-y-3">
              {lignes.map((ligne, index) => (
  <div key={index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
      
      {/* Sélection produit */}
      <div className="md:col-span-4">
        <label className="block text-xs text-gray-500 mb-1">Produit/Service</label>
        <select
          value={ligne.produit_id || ''}
          onChange={(e) => selectionnerProduit(index, e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold"
        >
          <option value="">Sélectionner un produit...</option>
          <optgroup label="📦 Produits">
            {produits.filter(p => p.type === 'produit').map((p) => (
              <option key={p.id} value={p.id}>{p.nom} — {p.prix_standard} DT</option>
            ))}
          </optgroup>
          <optgroup label="🔧 Services">
            {produits.filter(p => p.type === 'service').map((p) => (
              <option key={p.id} value={p.id}>{p.nom} — {p.prix_standard} DT</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Description (manuelle) */}
      <div className="md:col-span-3">
        <label className="block text-xs text-gray-500 mb-1">Description</label>
        <input type="text" value={ligne.description}
          onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
          placeholder="Détails, dimensions, spécifications..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold" />
      </div>

      {/* Type */}
      <div className="md:col-span-2">
        <label className="block text-xs text-gray-500 mb-1">Type</label>
        <select value={ligne.type}
          onChange={(e) => handleLigneChange(index, 'type', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold">
          <option value="produit">📦 Produit</option>
          <option value="service">🔧 Service</option>
        </select>
      </div>

      {/* Quantité */}
      <div className="md:col-span-1">
        <label className="block text-xs text-gray-500 mb-1">Qté</label>
        <input type="number" value={ligne.quantite}
          onChange={(e) => handleLigneChange(index, 'quantite', Number(e.target.value))}
          min="1"
          className="w-full px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold" />
      </div>

      {/* Prix unitaire */}
      <div className="md:col-span-1">
        <label className="block text-xs text-gray-500 mb-1">Prix U. (DT)</label>
        <input type="number" value={ligne.prix_unitaire}
          onChange={(e) => handleLigneChange(index, 'prix_unitaire', Number(e.target.value))}
          min="0" step="0.01"
          className="w-full px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold" />
      </div>

      {/* Supprimer */}
      <div className="md:col-span-1 text-right">
        {lignes.length > 1 && (
          <button type="button" onClick={() => supprimerLigne(index)}
            className="text-red-400 hover:text-red-300 text-lg p-2">✕</button>
        )}
      </div>
    </div>
  </div>
))}
            </div>

            <button type="button" onClick={ajouterLigne}
              className="text-sm text-ulysse-gold hover:text-ulysse-gold/80 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un produit/service
            </button>
          </div>

          {/* MONTAINTS */}
          <div className="bg-[#0F1729] border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg text-ulysse-gold">💰 Résumé des montants</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Total HT</label>
                <input type="text" value={formData.total_ht.toLocaleString()} readOnly
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 font-bold cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">TVA 19%</label>
                <input type="text" value={formData.tva.toLocaleString()} readOnly
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Total TTC</label>
                <input type="text" value={formData.total_ttc.toLocaleString()} readOnly
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-ulysse-gold font-bold cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* TRANCHES */}
          <div className="bg-[#0F1729] border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ulysse-gold">💳 Tranches de paiement</h2>
              <span className={`text-sm ${totalPourcentage === 100 ? 'text-green-400' : 'text-red-400'}`}>
                Total : {totalPourcentage}% | {totalTranches.toLocaleString()} DT
              </span>
            </div>

            <div className="space-y-3">
              {tranches.map((tranche, index) => (
                <div key={index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input type="text" value={tranche.description}
                        onChange={(e) => handleTrancheChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">%</label>
                      <input type="number" value={tranche.pourcentage || ''}
                        onChange={(e) => handleTrancheChange(index, 'pourcentage', Number(e.target.value))}
                        min="0" max="100"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-ulysse-gold" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Montant (DT)</label>
                      <input type="text" value={tranche.montant.toLocaleString()} readOnly
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 text-sm cursor-not-allowed" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={tranche.paye}
                          onChange={(e) => handleTrancheChange(index, 'paye', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-ulysse-gold focus:ring-ulysse-gold" />
                        <span className="text-xs text-gray-400">Payé</span>
                      </label>
                      {tranches.length > 2 && (
                        <button type="button" onClick={() => supprimerTranche(index)}
                          className="text-red-400 hover:text-red-300 text-xs">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={ajouterTranche}
              className="text-sm text-ulysse-gold hover:text-ulysse-gold/80 flex items-center gap-1">
              + Ajouter une tranche
            </button>
          </div>

          {/* NOTES */}
          <div className="bg-[#0F1729] border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg text-ulysse-gold">📝 Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes internes</label>
                <textarea value={formData.notes_internes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes_internes: e.target.value }))}
                  rows={3} placeholder="Notes visibles uniquement par l'équipe..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes client</label>
                <textarea value={formData.notes_client}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes_client: e.target.value }))}
                  rows={3} placeholder="Notes visibles par le client..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold resize-none" />
              </div>
            </div>
          </div>

          {/* BOUTONS */}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading || uploading}
              className="px-6 py-2.5 bg-ulysse-gold text-ulysse-night font-semibold rounded-lg hover:bg-ulysse-gold/90 disabled:opacity-50">
              {loading ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer la commande'}
            </button>
            <button type="button" onClick={() => navigate('/commandes')}
              className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )
}