import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '', entreprise: '', email: '', phone: '',
    adresse: '', ville: '', code_postal: '', notes: '',
    status: 'actif', source: ''
  })

  useEffect(() => {
    if (isEdit) {
      supabase.from('clients').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setFormData({
          nom: data.nom || '', entreprise: data.entreprise || '',
          email: data.email || '', phone: data.phone || '',
          adresse: data.adresse || '', ville: data.ville || '',
          code_postal: data.code_postal || '', notes: data.notes || '',
          status: data.status || 'actif', source: data.source || ''
        })
      })
    }
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await supabase.from('clients').update(formData).eq('id', id)
      } else {
        await supabase.from('clients').insert([formData])
      }
      navigate('/clients')
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/clients')} className="text-gray-400 hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-3xl text-gray-100">{isEdit ? 'Modifier le client' : 'Nouveau client'}</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-[#0F1729] border border-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom complet <span className="text-red-400">*</span></label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Entreprise</label>
              <input type="text" name="entreprise" value={formData.entreprise} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Source</label>
              <select name="source" value={formData.source} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200">
                <option value="">Sélectionner...</option>
                <option value="bouche_a_oreille">Bouche à oreille</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="salon">Salon / Événement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Adresse</label>
            <input type="text" name="adresse" value={formData.adresse} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ville</label>
              <input type="text" name="ville" value={formData.ville} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Code postal</label>
              <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Statut</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200">
              <option value="actif">Actif</option>
              <option value="prospect">Prospect</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-ulysse-gold resize-none" />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-ulysse-gold text-ulysse-night font-semibold rounded-lg hover:bg-ulysse-gold/90 disabled:opacity-50">
              {loading ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le client'}
            </button>
            <button type="button" onClick={() => navigate('/clients')}
              className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )
}