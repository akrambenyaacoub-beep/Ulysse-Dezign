// src/pages/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseWeb } from '../lib/supabaseWeb';

export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [commandes, setCommandes] = useState([]);
  const [stats, setStats] = useState({
    actives: 0,
    enValidation: 0,
    livres: 0
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    produit: '',
    quantite: 1,
    description: '',
    date_souhaitee: '',
    notes: ''
  });
  const navigate = useNavigate();

  const whatsappNumber = "21699477391";

  useEffect(() => {
    const session = sessionStorage.getItem('client_session');
    if (!session) {
      navigate('/client/login');
      return;
    }
    const clientData = JSON.parse(session);
    setClient(clientData);
    loadCommandes(clientData.id); // ← Correction: passer clientData.id
    setLoading(false);
  }, [navigate]);

  const loadCommandes = async (clientId) => {
    try {
      // Récupérer les commandes du client depuis web_commandes
      const { data, error } = await supabaseWeb
        .from('web_commandes')
        .select(`
          *,
          web_produits (*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setCommandes(data);
        
        // Calculer les statistiques
        const actives = data.filter(c => c.statut === 'en_attente' || c.statut === 'en_cours').length;
        const enValidation = data.filter(c => c.statut === 'validation').length;
        const livres = data.filter(c => c.statut === 'livre' || c.statut === 'termine').length;
        
        setStats({
          actives,
          enValidation,
          livres
        });
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      // Données mockées en cas d'erreur
      const mockCommandes = [
        {
          id: 1,
          numero: "CMD-001",
          reference: "CMD-001",
          projet: "Logo Re-design Luxury",
          date: "28 Sept 2024",
          statut: "production",
          statutLabel: "En Production",
          icon: "brand_awareness",
          created_at: "2024-09-28"
        },
        {
          id: 2,
          numero: "CMD-002",
          reference: "CMD-002",
          projet: "Landing Page Minimaliste",
          date: "15 Sept 2024",
          statut: "validation",
          statutLabel: "En Validation",
          icon: "web",
          created_at: "2024-09-15"
        },
        {
          id: 3,
          numero: "CMD-003",
          reference: "CMD-003",
          projet: "Social Media Kit Gold",
          date: "02 Sept 2024",
          statut: "livre",
          statutLabel: "Livré",
          icon: "auto_awesome",
          created_at: "2024-09-02"
        }
      ];
      setCommandes(mockCommandes);
      setStats({
        actives: 1,
        enValidation: 1,
        livres: 1
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('client_session');
    navigate('/client/login');
  };

  const handleNewOrder = () => {
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendOrderToWhatsApp = () => {
    if (!formData.produit) {
      alert('Veuillez indiquer le produit/service');
      return;
    }

    const today = new Date().toLocaleDateString('fr-FR');
    const message = `
NOUVELLE COMMANDE
----------------
INFORMATIONS CLIENT
• Nom: ${client?.nom} ${client?.prenom || ''}
• Email: ${client?.email}
• Téléphone: ${client?.telephone}

DETAILS DE LA COMMANDE
• Date: ${today}
• Produit: ${formData.produit}
• Quantité: ${formData.quantite}
• Description: ${formData.description || 'Non spécifiée'}

Date souhaitée: ${formData.date_souhaitee || 'Non spécifiée'}

Notes: ${formData.notes || 'Aucune'}
    `.trim();

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    
    setModalOpen(false);
    setFormData({ produit: '', quantite: 1, description: '', date_souhaitee: '', notes: '' });
  };

  const getStatutBadge = (statut, label) => {
    let styles = '';
    if (statut === 'production' || statut === 'en_cours' || statut === 'en_attente') {
      styles = 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    } else if (statut === 'validation') {
      styles = 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    } else {
      styles = 'bg-green-500/10 text-green-500 border-green-500/30';
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles}`}>
        {label || statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a3a] via-[#0d1f3c] to-[#0a1628] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F0C75E]"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a3a] via-[#0d1f3c] to-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Session expirée</p>
          <Link to="/client/login" className="text-[#F0C75E] hover:underline">Se reconnecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a3a] via-[#0d2040] to-[#0a1628] font-['Inter']">
      
      {/* Navigation */}
      <nav className="bg-[#0a1628]/80 backdrop-blur-md border-b border-[#1A3A6B] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-['Playfair_Display'] font-bold text-white">
            Ulysse <span className="text-[#F0C75E]">DeZign</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-medium transition ${activeTab === 'dashboard' ? 'text-[#F0C75E] border-b-2 border-[#F0C75E] pb-1' : 'text-gray-400 hover:text-white'}`}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('commandes')} className={`text-sm font-medium transition ${activeTab === 'commandes' ? 'text-[#F0C75E] border-b-2 border-[#F0C75E] pb-1' : 'text-gray-400 hover:text-white'}`}>
              Commandes
            </button>
            <button onClick={() => setActiveTab('profil')} className={`text-sm font-medium transition ${activeTab === 'profil' ? 'text-[#F0C75E] border-b-2 border-[#F0C75E] pb-1' : 'text-gray-400 hover:text-white'}`}>
              Profil
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleNewOrder} className="bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0a1628] px-5 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
              + Nouvelle Commande
            </button>
            <button onClick={handleLogout} className="text-red-400 text-sm hover:text-red-300 transition">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-['Playfair_Display'] font-bold text-white mb-2">
                Bonjour, {client?.prenom || client?.nom || 'Client'} 👋
              </h1>
              <p className="text-gray-400">Voici l'aperçu de vos projets en cours.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#0D1F3C]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#1A3A6B] hover:border-[#F0C75E]/30 transition hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#1359A9]/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#F0C75E]">pending_actions</span>
                </div>
                <h3 className="text-gray-400 text-sm uppercase tracking-wider">Commandes Actives</h3>
                <p className="text-3xl font-bold text-white mt-1">{stats.actives}</p>
              </div>
              
              <div className="bg-[#0D1F3C]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#1A3A6B] hover:border-[#F0C75E]/30 transition hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#1359A9]/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#F0C75E]">fact_check</span>
                </div>
                <h3 className="text-gray-400 text-sm uppercase tracking-wider">En Validation</h3>
                <p className="text-3xl font-bold text-white mt-1">{stats.enValidation}</p>
              </div>
              
              <div className="bg-[#0D1F3C]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#1A3A6B] hover:border-[#F0C75E]/30 transition hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#1359A9]/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#F0C75E]">check_circle</span>
                </div>
                <h3 className="text-gray-400 text-sm uppercase tracking-wider">Livrés</h3>
                <p className="text-3xl font-bold text-white mt-1">{stats.livres}</p>
              </div>
            </div>

            <div className="bg-[#0D1F3C]/80 backdrop-blur-sm rounded-2xl border border-[#1A3A6B] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1A3A6B] flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Commandes Récentes</h2>
                  <p className="text-gray-400 text-sm">Suivez l'évolution de vos projets</p>
                </div>
                <button onClick={() => setActiveTab('commandes')} className="text-[#F0C75E] text-sm hover:underline">
                  Voir tout
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A1628]/50 border-b border-[#1A3A6B]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A3A6B]">
                    {commandes.slice(0, 5).map((commande) => (
                      <tr key={commande.id} className="hover:bg-[#0A1628]/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1359A9]/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[#F0C75E]">description</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{commande.reference || `Commande #${commande.id}`}</p>
                              <p className="text-gray-500 text-xs">{new Date(commande.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          {getStatutBadge(commande.statut, commande.statut)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-[#F0C75E] transition">
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Commandes Tab */}
        {activeTab === 'commandes' && (
          <div className="bg-[#0D1F3C]/80 backdrop-blur-sm rounded-2xl border border-[#1A3A6B] p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Toutes les commandes</h2>
                <p className="text-gray-400 text-sm">Historique complet de vos commandes</p>
              </div>
              <button onClick={handleNewOrder} className="bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0a1628] px-5 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition">
                + Nouvelle Commande
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A1628]/50 border-b border-[#1A3A6B]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Référence</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A3A6B]">
                  {commandes.map((commande) => (
                    <tr key={commande.id} className="hover:bg-[#0A1628]/30 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{commande.reference || `CMD-${commande.id}`}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        {getStatutBadge(commande.statut, commande.statut)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-gray-400 hover:text-[#F0C75E] transition">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profil Tab */}
        {activeTab === 'profil' && (
          <div className="bg-[#0D1F3C]/80 backdrop-blur-sm rounded-2xl border border-[#1A3A6B] p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Mes informations</h2>
            <div className="space-y-4 max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nom</label>
                  <p className="text-white font-medium">{client?.nom || '-'}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Prénom</label>
                  <p className="text-white font-medium">{client?.prenom || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <p className="text-white font-medium">{client?.email || '-'}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Téléphone</label>
                <p className="text-white font-medium">{client?.telephone || '-'}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Adresse</label>
                <p className="text-white font-medium">{client?.adresse || 'Non renseignée'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nouvelle Commande */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Nouvelle commande</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Produit / Service *</label>
                  <input
                    type="text"
                    name="produit"
                    value={formData.produit}
                    onChange={handleInputChange}
                    placeholder="Ex: Cartes de visite, Flyers, Logo..."
                    className="w-full px-4 py-2 bg-[#0A1628] border border-[#1A3A6B] rounded-lg text-white focus:ring-2 focus:ring-[#F0C75E] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Quantité</label>
                  <input
                    type="number"
                    name="quantite"
                    value={formData.quantite}
                    onChange={handleInputChange}
                    min="1"
                    className="w-32 px-4 py-2 bg-[#0A1628] border border-[#1A3A6B] rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Format, couleurs, finition..."
                    className="w-full px-4 py-2 bg-[#0A1628] border border-[#1A3A6B] rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Date souhaitée</label>
                  <input
                    type="date"
                    name="date_souhaitee"
                    value={formData.date_souhaitee}
                    onChange={handleInputChange}
                    className="w-48 px-4 py-2 bg-[#0A1628] border border-[#1A3A6B] rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Notes supplémentaires</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Informations complémentaires..."
                    className="w-full px-4 py-2 bg-[#0A1628] border border-[#1A3A6B] rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={sendOrderToWhatsApp} className="flex-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition">
                  Envoyer par WhatsApp
                </button>
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-[#1A3A6B] text-gray-400 rounded-lg hover:bg-[#0A1628] transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}