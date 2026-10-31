// src/components/BonATirer.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';

export default function BonATirer({ commandeId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [commande, setCommande] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [client, setClient] = useState(null);
  const [batHtml, setBatHtml] = useState('');
  const [mode, setMode] = useState('classic'); // 'classic' | 'ai' | 'premium'
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (commandeId) loadData();
  }, [commandeId]);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Charger la commande
      const { data: cmd } = await supabaseErp
        .from('erp_commandes')
        .select('*')
        .eq('id', commandeId)
        .single();

      // 2. Charger les lignes
      const { data: lignesData } = await supabaseErp
        .from('erp_lignes_commande')
        .select('*')
        .eq('commande_id', commandeId);

      // ✅ 3. Déclarer produitsData ICI
      let produitsData = [];
      
      if (lignesData && lignesData.length > 0) {
        const produitIds = lignesData.map(l => l.produit_id).filter(Boolean);
        
        if (produitIds.length > 0) {
          const { data: produits } = await supabaseErp
            .from('erp_produits')
            .select('*')
            .in('id', produitIds);
          
          produitsData = produits || []; // ✅ Stocker dans la variable
        }
        
        // Associer les produits aux lignes
        const lignesWithProduits = lignesData.map(ligne => ({
          ...ligne,
          erp_produits: produitsData.find(p => p.id == ligne.produit_id) || null
        }));
        
        setLignes(lignesWithProduits);
      } else {
        setLignes([]);
      }

      // 4. Charger le client
      const { data: clientData } = cmd?.client_id ? await supabaseErp
        .from('erp_clients')
        .select('*')
        .eq('id', cmd.client_id)
        .single() : { data: null };

      setCommande(cmd);
      setClient(clientData);
      
      // ✅ Maintenant produitsData est défini
      generateClassicBAT(cmd, lignesData, clientData);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  }
  console.log('🔑 Clé API présente :', import.meta.env.VITE_OPENAI_API_KEY ? 'OUI ✅' : 'NON ❌');
console.log('🔑 Premiers caractères :', import.meta.env.VITE_OPENAI_API_KEY?.substring(0, 10) + '...');


  // ============================================================
  // 🎨 BAT CLASSIQUE (Design pro)
  // ============================================================
  function generateClassicBAT(cmd, lignesData, clientData) {
    const totalHT = (lignesData || []).reduce((s, l) => s + (l.quantite * l.prix_unitaire), 0);
    const tva = totalHT * 0.19;
    const totalTTC = totalHT + tva;
    const dateBAT = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const clientName = clientData?.entreprise || `${clientData?.nom || ''} ${clientData?.prenom || ''}`.trim();

    const html = generateHTMLTemplate(cmd, lignesData, clientData, totalHT, tva, totalTTC, dateBAT, clientName);
    setBatHtml(html);
    setMode('classic');
  }

  // ============================================================
  // 🤖 BAT AVEC IA (OpenAI)
  // ============================================================
  // Remplace la fonction generateWithAI par celle-ci :

async function generateWithAI() {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      showAlert('error', 'Clé API OpenAI non configurée');
      generateClassicBAT(commande, lignes, client);
      return;
    }

    setGenerating(true);
    console.log('🤖 Début génération IA...');
    
    try {
      const totalHT = lignes.reduce((s, l) => s + (l.quantite * l.prix_unitaire), 0);
      const tva = totalHT * 0.19;
      const totalTTC = totalHT + tva;

      // ✅ Construire le prompt
      const lignesText = lignes.map(l => 
        `- ${l.erp_produits?.nom || 'Produit'} | Qté: ${l.quantite} | Prix: ${l.prix_unitaire?.toFixed(3)} DT | Total: ${(l.quantite * l.prix_unitaire).toFixed(3)} DT`
      ).join('\n');

      const prompt = `Génère un Bon À Tirer HTML pour une imprimerie.

INFO:
- N°: ${commande.numero}
- Client: ${client?.entreprise || `${client?.nom || ''} ${client?.prenom || ''}`}
- Date: ${new Date().toLocaleDateString('fr-FR')}

PRODUITS:
${lignesText}

TOTAUX: HT=${totalHT.toFixed(3)} DT | TVA(19%)=${tva.toFixed(3)} DT | TTC=${totalTTC.toFixed(3)} DT

RETOURNE UNIQUEMENT LE CODE HTML (pas de markdown, pas d'explication).
Utilise du CSS inline, design pro, couleurs noir/blanc/doré (#c9a84c).`;

      console.log('📤 Envoi à OpenAI...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',  // ✅ Moins cher et plus rapide
          messages: [
            { 
              role: 'system', 
              content: 'Tu es un générateur de BAT HTML. Tu réponds UNIQUEMENT avec du code HTML valide, sans markdown, sans explication.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 3000
        })
      });

      console.log('📥 Réponse reçue, status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.error?.message || 'Erreur API');
      }

      const data = await response.json();
      console.log('✅ Données IA:', data);
      
      let aiContent = data.choices?.[0]?.message?.content || '';
      console.log('📝 Contenu IA brut:', aiContent.substring(0, 200) + '...');

      // ✅ Nettoyer le HTML
      let html = aiContent;
      
      // Supprimer les balises markdown ```html ... ```
      html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
      
      // Si le contenu commence par du texte (pas du HTML), chercher <div ou <table ou <!
      if (!html.trim().startsWith('<') && !html.trim().startsWith('<!DOCTYPE')) {
        const htmlStart = html.search(/<div|<table|<!DOCTYPE/i);
        if (htmlStart > 0) {
          html = html.substring(htmlStart);
        }
      }

      // Si pas de structure HTML complète, l'envelopper
      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>BAT ${commande.numero}</title></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5;">
${html}
</body></html>`;
      }

      console.log('✅ HTML final prêt');
      setBatHtml(html);
      setMode('ai');
      
    } catch (error) {
      console.error('❌ Erreur IA:', error.message);
      showAlert('warning', 'IA indisponible, utilisation du template classique');
      generateClassicBAT(commande, lignes, client);
    } finally {
      setGenerating(false);
    }
  }
  // ============================================================
  // 🖨️ IMPRESSION
  // ============================================================
  function handlePrint() {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(batHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }

  // ============================================================
  // 📥 TÉLÉCHARGER HTML
  // ============================================================
  function handleDownload() {
    const blob = new Blob([batHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BAT_${commande.numero}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F0C75E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      {/* Barre d'actions */}
      <div className="bg-[#0D1F3C] px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-white font-semibold text-sm">📋 BAT - {commande?.numero}</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => generateClassicBAT(commande, lignes, client)} 
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${mode === 'classic' ? 'bg-[#F0C75E] text-[#071325]' : 'bg-[#1A3A6B] text-white'}`}>
            📄 Classique
          </button>
          <button onClick={generateWithAI} disabled={generating}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition disabled:opacity-50">
            🤖 {generating ? 'Génération...' : 'IA Design'}
          </button>
          <button onClick={handlePrint} className="px-3 py-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-xs font-semibold">
            🖨️ Imprimer
          </button>
          <button onClick={handleDownload} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs">
            📥 HTML
          </button>
          <button onClick={onClose} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs">
            ✕
          </button>
        </div>
      </div>

      {/* Prévisualisation */}
      <div className="p-4">
        <iframe 
          srcDoc={batHtml}
          style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px', background: '#fff' }}
          title="BAT Preview"
        />
      </div>
    </div>
  );
}

// ============================================================
// TEMPLATE HTML CLASSIQUE
// ============================================================
function generateHTMLTemplate(cmd, lignesData, clientData, totalHT, tva, totalTTC, dateBAT, clientName) {
  const mockups = {
    impression: '🖨️', design: '🎨', signaletique: '🚩', textile: '👕', goodies: '🎁', service: '⚙️', default: '📄'
  };

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>BAT ${cmd.numero}</title></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
<div style="max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

<div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px;">
<div>
<h1 style="font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 3px; color: #1a1a1a;">BON À TIRER</h1>
<p style="font-size: 12px; color: #666; margin: 5px 0;">BAT N° ${cmd.numero}</p>
<p style="font-size: 12px; color: #666; margin: 0;">Date : ${dateBAT}</p>
</div>
<div style="text-align: right;">
<h2 style="font-size: 22px; font-weight: 700; margin: 0; color: #c9a84c;">ULYSSE DeZign</h2>
<p style="font-size: 11px; color: #666;">Imprimerie & Design Graphique</p>
</div>
</div>

<div style="display: flex; gap: 20px; margin-bottom: 25px;">
<div style="flex: 1; background: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee;">
<h3 style="font-size: 11px; color: #999; text-transform: uppercase; margin: 0 0 8px;">Client</h3>
<p style="font-size: 14px; font-weight: 600; margin: 0;">${clientName || 'Client'}</p>
${clientData?.telephone ? `<p style="font-size: 12px; color: #666; margin: 2px 0;">📞 ${clientData.telephone}</p>` : ''}
${clientData?.email ? `<p style="font-size: 12px; color: #666; margin: 0;">✉️ ${clientData.email}</p>` : ''}
</div>
<div style="flex: 1; background: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee;">
<h3 style="font-size: 11px; color: #999; text-transform: uppercase; margin: 0 0 8px;">Commande</h3>
<p style="font-size: 14px; font-weight: 600; margin: 0;">${cmd.numero}</p>
<p style="font-size: 12px; color: #666; margin: 2px 0;">📅 ${dateBAT}</p>
<p style="font-size: 12px; color: #666; margin: 0;">🚚 ${cmd.date_livraison_prevue ? new Date(cmd.date_livraison_prevue).toLocaleDateString('fr-FR') : 'À déterminer'}</p>
</div>
</div>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
<thead>
<tr style="background: #1a1a1a; color: #fff;">
<th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; width: 60px;"></th>
<th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase;">Produit</th>
<th style="padding: 10px; text-align: center; font-size: 11px; width: 70px;">Qté</th>
<th style="padding: 10px; text-align: right; font-size: 11px; width: 100px;">Prix U.</th>
<th style="padding: 10px; text-align: right; font-size: 11px; width: 110px;">Total</th>
</tr>
</thead>
<tbody>
${(lignesData || []).map((l, i) => `
<tr style="border-bottom: 1px solid #eee; ${i % 2 === 0 ? 'background: #fafafa;' : ''}">
<td style="padding: 10px; text-align: center;">
<div style="width: 45px; height: 45px; border-radius: 6px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto;">
${mockups[l.erp_produits?.categorie] || mockups.default}
</div>
</td>
<td style="padding: 10px 12px;">
<p style="font-size: 13px; font-weight: 600; margin: 0;">${l.erp_produits?.nom || 'Produit'}</p>
<p style="font-size: 10px; color: #999; margin: 2px 0 0;">${l.erp_produits?.categorie || ''}</p>
</td>
<td style="padding: 10px; text-align: center; font-size: 13px;">${l.quantite}</td>
<td style="padding: 10px; text-align: right; font-size: 13px;">${l.prix_unitaire?.toFixed(3)} DT</td>
<td style="padding: 10px; text-align: right; font-size: 13px; font-weight: 600;">${(l.quantite * l.prix_unitaire).toFixed(3)} DT</td>
</tr>`).join('')}
</tbody>
<tfoot>
<tr><td colspan="4" style="padding: 8px 12px; text-align: right; font-size: 11px; color: #666;">Total HT</td><td style="padding: 8px 12px; text-align: right; font-size: 13px;">${totalHT.toFixed(3)} DT</td></tr>
<tr><td colspan="4" style="padding: 8px 12px; text-align: right; font-size: 11px; color: #666;">TVA (19%)</td><td style="padding: 8px 12px; text-align: right; font-size: 13px;">${tva.toFixed(3)} DT</td></tr>
<tr style="border-top: 2px solid #1a1a1a;"><td colspan="4" style="padding: 10px 12px; text-align: right; font-size: 14px; font-weight: 700;">Total TTC</td><td style="padding: 10px 12px; text-align: right; font-size: 16px; font-weight: 800; color: #c9a84c;">${totalTTC.toFixed(3)} DT</td></tr>
</tfoot>
</table>

${cmd.description ? `<div style="background: #fafafa; padding: 15px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #eee;"><h3 style="font-size: 11px; color: #999; text-transform: uppercase; margin: 0 0 8px;">Notes</h3><p style="font-size: 13px; color: #444; margin: 0;">${cmd.description}</p></div>` : ''}

<div style="display: flex; gap: 40px; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;">
<div style="flex: 1; text-align: center;"><div style="border-bottom: 1px solid #1a1a1a; width: 180px; margin: 0 auto 8px; height: 40px;"></div><p style="font-size: 11px; color: #666; margin: 0;">Client</p><p style="font-size: 10px; color: #999;">(Bon pour accord)</p></div>
<div style="flex: 1; text-align: center;"><div style="border-bottom: 1px solid #1a1a1a; width: 180px; margin: 0 auto 8px; height: 40px;"></div><p style="font-size: 11px; color: #666; margin: 0;">Ulysse DeZign</p><p style="font-size: 10px; color: #999;">Date : __/__/____</p></div>
</div>

<div style="margin-top: 30px; text-align: center; font-size: 10px; color: #bbb; border-top: 1px solid #eee; padding-top: 15px;">
<p style="margin: 0;">Ulysse DeZign - Imprimerie & Design Graphique</p>
<p style="margin: 2px 0 0;">Ce BAT doit être signé avant lancement en production.</p>
</div>

</div>
</body>
</html>`;
}