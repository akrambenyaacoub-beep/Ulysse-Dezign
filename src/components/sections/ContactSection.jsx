// src/components/sections/ContactSection.jsx
import { useState } from 'react';

const whatsappNumber = "21699477391";

const ContactSection = () => {
  // 1. État pour les informations du client
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    telephone: '',
    email: '',
    dateSouhaitee: '',
    livraison: 'a_emporter',
    notes: ''
  });

  // 2. État pour la liste des produits (on commence avec 1 produit vide)
  const [produits, setProduits] = useState([
    { id: Date.now(), nom: '', quantite: '1', description: '' }
  ]);

  // 3. Gestion des changements dans le formulaire client
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));
  };

  // 4. Gestion des changements dans les produits
  const handleProduitChange = (id, field, value) => {
    setProduits(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // 5. Ajouter un produit
  const ajouterProduit = () => {
    setProduits([...produits, { id: Date.now(), nom: '', quantite: '1', description: '' }]);
  };

  // 6. Supprimer un produit
  const supprimerProduit = (id) => {
    if (produits.length > 1) {
      setProduits(produits.filter(p => p.id !== id));
    } else {
      alert('Vous devez avoir au moins un produit');
    }
  };

  // 7. Envoyer la commande sur WhatsApp
  const envoyerCommande = () => {
    if (!clientInfo.nom.trim() || !clientInfo.telephone.trim()) {
      alert('Veuillez remplir votre nom et votre téléphone');
      return;
    }

    const produitsValides = produits.filter(p => p.nom.trim() !== '');
    if (produitsValides.length === 0) {
      alert('Veuillez ajouter au moins un nom de produit');
      return;
    }

    const dateFormatted = clientInfo.dateSouhaitee 
      ? new Date(clientInfo.dateSouhaitee).toLocaleDateString('fr-FR') 
      : 'Non spécifiée';

    let produitsText = '';
    produitsValides.forEach((p, idx) => {
      produitsText += `  ${idx + 1}. ${p.nom}`;
      if (p.quantite > 1) produitsText += ` x ${p.quantite}`;
      if (p.description) produitsText += `\n     📝 ${p.description}`;
      produitsText += '\n';
    });

    const message = `
🆕 NOUVELLE COMMANDE (Site Web)
━━━━━━━━━━━━━━━━━━━━━

👤 INFORMATIONS CLIENT
• Nom: ${clientInfo.nom}
• Téléphone: ${clientInfo.telephone}
${clientInfo.email ? `• Email: ${clientInfo.email}` : ''}

📦 PRODUITS/SERVICES (${produitsValides.length} article${produitsValides.length > 1 ? 's' : ''})
${produitsText}
📅 Date souhaitée: ${dateFormatted}
🚚 Livraison: ${clientInfo.livraison === 'a_emporter' ? 'À emporter (atelier)' : 'Livraison à domicile'}

📝 Notes supplémentaires:
${clientInfo.notes || 'Aucune'}

━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    // Réinitialiser le formulaire après l'envoi
    setClientInfo({
      nom: '', telephone: '', email: '', dateSouhaitee: '', livraison: 'a_emporter', notes: ''
    });
    setProduits([{ id: Date.now(), nom: '', quantite: '1', description: '' }]);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-[#0D1F3C] text-white" id="contact">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-8 sm:mb-12 reveal-on-scroll">
          <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Prêt à commander ?</h2>
          <p className="text-sm sm:text-base text-white/50 font-['Montserrat'] font-light">Remplissez ce formulaire et recevez un devis rapide sur WhatsApp</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 reveal-on-scroll">
          <form className="space-y-4 sm:space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* LIGNE 1 : Nom & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">Nom complet *</label>
                <input 
                  type="text" 
                  name="nom"
                  value={clientInfo.nom}
                  onChange={handleClientChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" 
                  placeholder="Votre nom" 
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">Téléphone *</label>
                <input 
                  type="tel" 
                  name="telephone"
                  value={clientInfo.telephone}
                  onChange={handleClientChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" 
                  placeholder="+216 XX XXX XXX" 
                />
              </div>
            </div>

            {/* LIGNE 2 : Email */}
            <div>
              <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">Email</label>
              <input 
                type="email" 
                name="email"
                value={clientInfo.email}
                onChange={handleClientChange}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" 
                placeholder="votre@email.com" 
              />
            </div>

            {/* LIGNE 3 : Produits (Dynamique) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/60 text-xs sm:text-sm font-semibold font-['Montserrat']">📦 Produits / Services</label>
                <button 
                  type="button" 
                  onClick={ajouterProduit} 
                  className="text-[#F0C75E] text-xs sm:text-sm hover:underline font-['Montserrat'] transition-all duration-500"
                >
                  + Ajouter un produit
                </button>
              </div>
              
              <div className="space-y-3">
                {produits.map((produit, index) => (
                  <div key={produit.id} className="bg-white/5 rounded-lg p-3 border border-white/10 transition-all duration-500 hover:border-[#F0C75E]/30">
                    {produits.length > 1 && (
                      <div className="flex justify-end mb-2">
                        <button 
                          type="button" 
                          onClick={() => supprimerProduit(produit.id)}
                          className="text-red-400 text-xs hover:text-red-300 transition transform hover:scale-110"
                        >
                          ✕ Supprimer
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        value={produit.nom}
                        onChange={(e) => handleProduitChange(produit.id, 'nom', e.target.value)}
                        className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#F0C75E] focus:outline-none transition-all duration-500" 
                        placeholder="Nom du produit *" 
                      />
                      <input 
                        type="number" 
                        value={produit.quantite}
                        onChange={(e) => handleProduitChange(produit.id, 'quantite', e.target.value)}
                        className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#F0C75E] focus:outline-none transition-all duration-500" 
                        placeholder="Quantité" 
                        min="1" 
                      />
                    </div>
                    <textarea 
                      value={produit.description}
                      onChange={(e) => handleProduitChange(produit.id, 'description', e.target.value)}
                      className="w-full mt-2 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#F0C75E] focus:outline-none transition-all duration-500" 
                      rows="2" 
                      placeholder="Description (format, couleurs, finition...)"
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>

            {/* LIGNE 4 : Date & Livraison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">📅 Date souhaitée</label>
                <input 
                  type="date" 
                  name="dateSouhaitee"
                  value={clientInfo.dateSouhaitee}
                  onChange={handleClientChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white font-['Montserrat'] text-sm focus:border-[#F0C75E] focus:outline-none transition-all duration-500" 
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">🚚 Livraison</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-white/60 text-xs sm:text-sm font-['Montserrat'] cursor-pointer hover:text-white transition-all duration-500">
                    <input 
                      type="radio" 
                      name="livraison" 
                      value="a_emporter" 
                      checked={clientInfo.livraison === 'a_emporter'}
                      onChange={handleClientChange}
                      className="accent-[#F0C75E]" 
                    /> À emporter
                  </label>
                  <label className="flex items-center gap-2 text-white/60 text-xs sm:text-sm font-['Montserrat'] cursor-pointer hover:text-white transition-all duration-500">
                    <input 
                      type="radio" 
                      name="livraison" 
                      value="livraison" 
                      checked={clientInfo.livraison === 'livraison'}
                      onChange={handleClientChange}
                      className="accent-[#F0C75E]" 
                    /> Livraison
                  </label>
                </div>
              </div>
            </div>

            {/* LIGNE 5 : Notes */}
            <div>
              <label className="block text-white/60 text-xs sm:text-sm mb-1.5 font-['Montserrat']">📝 Notes supplémentaires</label>
              <textarea 
                name="notes"
                value={clientInfo.notes}
                onChange={handleClientChange}
                rows={2} 
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/30 font-['Montserrat'] text-sm transition-all duration-500" 
                placeholder="Informations complémentaires..."
              ></textarea>
            </div>

            {/* BOUTON D'ENVOI */}
            <button 
              type="button" 
              onClick={envoyerCommande}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Envoyer la commande
            </button>
          </form>
          
          <p className="text-center text-white/30 text-xs mt-4 font-['Montserrat']">📱 Aucun compte nécessaire. Notre équipe vous répondra directement sur WhatsApp</p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;