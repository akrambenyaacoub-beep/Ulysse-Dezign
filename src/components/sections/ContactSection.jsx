// src/components/sections/ContactSection.jsx
import { useState } from 'react';

const whatsappNumber = "21699477391";

const ContactSection = () => {
  const [clientInfo, setClientInfo] = useState({
    nom: '', telephone: '', email: '', dateSouhaitee: '', livraison: 'a_emporter', notes: ''
  });

  const [produits, setProduits] = useState([
    { id: Date.now(), nom: '', quantite: '1', description: '' }
  ]);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleProduitChange = (id, field, value) => {
    setProduits(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const ajouterProduit = () => {
    setProduits([...produits, { id: Date.now(), nom: '', quantite: '1', description: '' }]);
  };

  const supprimerProduit = (id) => {
    if (produits.length > 1) {
      setProduits(produits.filter(p => p.id !== id));
    } else {
      alert('Vous devez avoir au moins un produit');
    }
  };

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

    setClientInfo({ nom: '', telephone: '', email: '', dateSouhaitee: '', livraison: 'a_emporter', notes: '' });
    setProduits([{ id: Date.now(), nom: '', quantite: '1', description: '' }]);
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-[#071325]" id="contact">
      
      {/* --- DÉCORATIONS DE FOND HOMOGÈNES --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* --- EN-TÊTE --- */}
        <div className="text-center md:text-left mb-12">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="w-8 md:w-12 h-px bg-[#F0C75E]"></span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">Prêt à commander ?</span>
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight leading-tight">
            Lançons votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">Projet</span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 mt-4 font-['Montserrat'] font-light max-w-xl mx-auto md:mx-0">
            Remplissez ce formulaire et notre équipe vous répondra immédiatement sur WhatsApp pour établir votre devis.
          </p>
        </div>

        {/* --- FORMULAIRE "GLASSMORPHISM" --- */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* LIGNE 1 : Nom & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">Nom complet *</label>
                <input 
                  type="text" 
                  name="nom"
                  value={clientInfo.nom}
                  onChange={handleClientChange}
                  className="w-full p-4 rounded-xl bg-[#0D1F3C]/50 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] focus:ring-1 focus:ring-[#F0C75E]/50 placeholder:text-white/20 font-['Montserrat'] text-sm transition-all duration-300" 
                  placeholder="Votre nom" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">Téléphone *</label>
                <input 
                  type="tel" 
                  name="telephone"
                  value={clientInfo.telephone}
                  onChange={handleClientChange}
                  className="w-full p-4 rounded-xl bg-[#0D1F3C]/50 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] focus:ring-1 focus:ring-[#F0C75E]/50 placeholder:text-white/20 font-['Montserrat'] text-sm transition-all duration-300" 
                  placeholder="+216 XX XXX XXX" 
                />
              </div>
            </div>

            {/* LIGNE 2 : Email */}
            <div className="space-y-2">
              <label className="block text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">Email (Optionnel)</label>
              <input 
                type="email" 
                name="email"
                value={clientInfo.email}
                onChange={handleClientChange}
                className="w-full p-4 rounded-xl bg-[#0D1F3C]/50 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] focus:ring-1 focus:ring-[#F0C75E]/50 placeholder:text-white/20 font-['Montserrat'] text-sm transition-all duration-300" 
                placeholder="votre@email.com" 
              />
            </div>

            {/* LIGNE 3 : Produits */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">📦 Produits / Services</label>
                <button 
                  type="button" 
                  onClick={ajouterProduit} 
                  className="text-[#F0C75E] text-xs font-bold uppercase tracking-wider hover:text-[#fce8aa] transition-all flex items-center gap-1"
                >
                  + Ajouter
                </button>
              </div>
              
              <div className="space-y-4">
                {produits.map((produit) => (
                  <div key={produit.id} className="bg-[#0D1F3C]/30 rounded-2xl p-4 border border-white/5 transition-all duration-300 hover:border-[#F0C75E]/30 relative group">
                    {produits.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => supprimerProduit(produit.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <input 
                          type="text" 
                          value={produit.nom}
                          onChange={(e) => handleProduitChange(produit.id, 'nom', e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#F0C75E] focus:outline-none transition-all" 
                          placeholder="Nom du produit *" 
                        />
                      </div>
                      <div>
                        <input 
                          type="number" 
                          value={produit.quantite}
                          onChange={(e) => handleProduitChange(produit.id, 'quantite', e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#F0C75E] focus:outline-none transition-all" 
                          placeholder="Qté" 
                          min="1" 
                        />
                      </div>
                    </div>
                    <textarea 
                      value={produit.description}
                      onChange={(e) => handleProduitChange(produit.id, 'description', e.target.value)}
                      className="w-full mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#F0C75E] focus:outline-none transition-all" 
                      rows="2" 
                      placeholder="Détails (format, couleurs, finition...)"
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>

            {/* LIGNE 4 : Date & Livraison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">📅 Date souhaitée</label>
                <input 
                  type="date" 
                  name="dateSouhaitee"
                  value={clientInfo.dateSouhaitee}
                  onChange={handleClientChange}
                  className="w-full p-4 rounded-xl bg-[#0D1F3C]/50 border border-white/10 text-white font-['Montserrat'] text-sm focus:border-[#F0C75E] focus:outline-none transition-all [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">🚚 Livraison</label>
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center gap-2 text-white/60 text-sm font-['Montserrat'] cursor-pointer hover:text-white transition-all">
                    <input 
                      type="radio" 
                      name="livraison" 
                      value="a_emporter" 
                      checked={clientInfo.livraison === 'a_emporter'}
                      onChange={handleClientChange}
                      className="accent-[#F0C75E] w-4 h-4" 
                    /> À emporter
                  </label>
                  <label className="flex items-center gap-2 text-white/60 text-sm font-['Montserrat'] cursor-pointer hover:text-white transition-all">
                    <input 
                      type="radio" 
                      name="livraison" 
                      value="livraison" 
                      checked={clientInfo.livraison === 'livraison'}
                      onChange={handleClientChange}
                      className="accent-[#F0C75E] w-4 h-4" 
                    /> Livraison
                  </label>
                </div>
              </div>
            </div>

            {/* LIGNE 5 : Notes */}
            <div className="space-y-2">
              <label className="block text-white/70 text-xs uppercase tracking-wider font-['Montserrat']">📝 Notes supplémentaires</label>
              <textarea 
                name="notes"
                value={clientInfo.notes}
                onChange={handleClientChange}
                rows={3} 
                className="w-full p-4 rounded-xl bg-[#0D1F3C]/50 border border-white/10 text-white focus:outline-none focus:border-[#F0C75E] placeholder:text-white/20 font-['Montserrat'] text-sm transition-all duration-300" 
                placeholder="Informations complémentaires..."
              ></textarea>
            </div>

            {/* BOUTON D'ENVOI PREMIUM */}
            <div className="pt-4">
              <button 
                type="button" 
                onClick={envoyerCommande}
                className="group relative w-full py-4 rounded-full bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0D1F3C] font-bold text-sm uppercase tracking-[0.15em] overflow-hidden shadow-[0_0_40px_-10px_rgba(240,199,94,0.6)] hover:shadow-[0_0_60px_-10px_rgba(240,199,94,0.8)] transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Envoyer sur WhatsApp
                  <span className="material-symbols-outlined text-lg">send</span>
                </span>
                {/* Effet de brillance */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></span>
              </button>
            </div>
          </form>
          
          <p className="text-center text-white/30 text-[10px] mt-6 font-['Montserrat'] uppercase tracking-widest">
            Aucun compte nécessaire • Réponse immédiate sur WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;