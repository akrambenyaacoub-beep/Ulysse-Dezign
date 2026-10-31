// src/components/ClientDataModal.jsx
import { useState, useEffect } from 'react';
import { supabaseErp } from '../lib/supabaseErp';
import { showAlert } from './AlertModal';

const DOSSIER_COLORS = [
  { name: 'Rose', value: '#EC4899' },
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Ambre', value: '#D97706' },
  { name: 'Gris', value: '#6B7280' }
];

const DOSSIER_ICONS = [
  '📁', '📂', '📄', '📊', '📋', '📝', '📎', '📌', '📐', '📏',
  '🖼️', '🎨', '💳', '🏷️', '📦', '📨', '📩', '📤', '📥', '📮'
];

export default function ClientDataModal({ isOpen, onClose, client, fichiers, onRefresh }) {
  const [folders, setFolders] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderForm, setFolderForm] = useState({ nom: '', couleur: '#3B82F6', icon: '📁' });

  useEffect(() => {
    if (client && fichiers) {
      const clientFiles = fichiers.filter(f => f.client_id === client.id);
      const folderMap = {};
      clientFiles.forEach(f => {
        const dossier = f.dossier || 'autre';
        if (!folderMap[dossier]) folderMap[dossier] = [];
        folderMap[dossier].push(f);
      });
      setFolders(folderMap);
    }
  }, [client, fichiers]);

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const isFolderOpen = (folderName) => {
    return expandedFolders[folderName] || false;
  };

  const formatTaille = (b) => {
    if (!b) return 'N/A';
    const s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${s[i]}`;
  };

  const getFolderColor = (folderName) => {
    const files = folders[folderName] || [];
    if (files.length > 0 && files[0].dossier_couleur) {
      return files[0].dossier_couleur;
    }
    return '#6B7280';
  };

  const getFolderIcon = (folderName) => {
    const files = folders[folderName] || [];
    if (files.length > 0 && files[0].dossier_icone) {
      return files[0].dossier_icone;
    }
    return '📁';
  };

  const handleUpload = async (e, folderName = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showAlert('error', 'Fichier trop volumineux (max 50MB)');
      e.target.value = '';
      return;
    }

    setUploading(true);
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
      } catch (e) { console.log('Storage non disponible'); }

      const categorie = detecterCategorie(file.name);
      await supabaseErp.from('erp_fichiers_clients').insert({
        client_id: client.id,
        nom_fichier: file.name,
        categorie: categorie,
        dossier: folderName || 'autre',
        url_fichier: publicUrl,
        taille_fichier: file.size,
        type_mime: file.type
      });

      showAlert('success', '✅ Fichier uploadé');
      e.target.value = '';
      onRefresh();
    } catch (error) {
      console.error('Erreur upload:', error);
      showAlert('error', 'Erreur upload: ' + error.message);
    } finally {
      setUploading(false);
    }
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

  const handleDeleteFile = async () => {
    if (!deleteFile) return;
    try {
      await supabaseErp.from('erp_fichiers_clients').delete().eq('id', deleteFile.id);
      showAlert('success', '✅ Fichier supprimé');
      onRefresh();
    } catch (error) {
      showAlert('error', 'Erreur suppression');
    }
    setDeleteFile(null);
  };

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

  const saveFolder = async () => {
    if (!folderForm.nom.trim()) {
      showAlert('error', 'Le nom du dossier est obligatoire');
      return;
    }

    try {
      const folderName = folderForm.nom.trim();
      const { error } = await supabaseErp.from('erp_fichiers_clients').insert({
        client_id: client.id,
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
      showAlert('success', `✅ Dossier "${folderName}" créé`);
      setShowNewFolder(false);
      setFolderForm({ nom: '', couleur: '#3B82F6', icon: '📁' });
      onRefresh();
    } catch (error) {
      console.error('Erreur saveFolder:', error);
      showAlert('error', 'Erreur lors de la création du dossier');
    }
  };

  if (!isOpen || !client) return null;

  const totalFiles = Object.values(folders).reduce((acc, files) => acc + files.length, 0);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="bg-[#0A1628] px-6 py-4 border-b border-[#1A3A6B] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                client.type_client === 'entreprise' ? 'bg-blue-500/20 text-blue-400' :
                client.type_client === 'passager' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {client.type_client === 'entreprise' ? '🏢' : client.type_client === 'passager' ? '🧳' : '👤'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {client.type_client === 'entreprise' ? client.entreprise || client.nom : `${client.prenom || ''} ${client.nom}`}
                </h2>
                <p className="text-gray-400 text-sm">
                  {totalFiles} fichier{totalFiles > 1 ? 's' : ''} • {Object.keys(folders).length} dossier{Object.keys(folders).length > 1 ? 's' : ''}
                  {client.entreprise && client.type_client !== 'entreprise' && ` • ${client.entreprise}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewFolder(!showNewFolder)}
                className="px-3 py-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5"
              >
                📁 Nouveau dossier
              </button>
              <label
                className="cursor-pointer px-3 py-1.5 bg-[#1A3A6B] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#2A4A6B] transition flex items-center gap-1.5"
              >
                📤 Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleUpload(e)}
                  accept="image/*,.pdf,.ai,.psd,.eps,.cdr"
                  disabled={uploading}
                />
              </label>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#1A3A6B] hover:bg-[#2A4A6B] transition flex items-center justify-center text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Formulaire nouveau dossier */}
          {showNewFolder && (
            <div className="bg-[#0A1628] px-4 py-3 border-b border-[#1A3A6B] flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Nom du dossier..."
                value={folderForm.nom}
                onChange={(e) => setFolderForm({ ...folderForm, nom: e.target.value })}
                className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm focus:ring-2 focus:ring-[#F0C75E]"
                autoFocus
              />
              <div className="flex items-center gap-1">
                {DOSSIER_COLORS.slice(0, 6).map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFolderForm({ ...folderForm, couleur: color.value })}
                    className={`w-6 h-6 rounded-full transition-all ${
                      folderForm.couleur === color.value ? 'ring-2 ring-[#F0C75E] scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <select
                value={folderForm.icon}
                onChange={(e) => setFolderForm({ ...folderForm, icon: e.target.value })}
                className="px-2 py-1 rounded-lg bg-[#071325] border border-[#1A3A6B] text-white text-sm"
              >
                {DOSSIER_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <button
                onClick={saveFolder}
                className="px-3 py-1.5 bg-[#F0C75E] text-[#071325] rounded-lg text-sm font-medium hover:shadow-lg transition"
              >
                ✅ Créer
              </button>
              <button
                onClick={() => setShowNewFolder(false)}
                className="px-3 py-1.5 bg-[#1A3A6B] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#2A4A6B] transition"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Contenu - Dossiers */}
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {Object.keys(folders).length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">📭</span>
                <p className="text-gray-400 text-lg">Aucun dossier</p>
                <p className="text-gray-500 text-sm mt-1">Commencez par créer un dossier ou uploader un fichier</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.keys(folders).sort().map(folderName => {
                  const files = folders[folderName] || [];
                  const isOpen = isFolderOpen(folderName);
                  const folderColor = getFolderColor(folderName);
                  const folderIcon = getFolderIcon(folderName);

                  return (
                    <div key={folderName} className="bg-[#0A1628] rounded-xl border border-[#1A3A6B] overflow-hidden">
                      {/* En-tête dossier */}
                      <div
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition ${
                          isOpen ? 'bg-[#F0C75E]/5' : 'hover:bg-[#1A3A6B]/20'
                        }`}
                        style={{ borderLeft: `3px solid ${folderColor}` }}
                        onClick={() => toggleFolder(folderName)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{folderIcon}</span>
                          <span className="font-medium text-white">{folderName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A3A6B] text-gray-400">
                            {files.length}
                          </span>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folderColor }}></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label
                            className="cursor-pointer text-xs px-2 py-1 bg-[#1A3A6B] text-gray-300 rounded-lg hover:bg-[#2A4A6B] transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📤
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleUpload(e, folderName)}
                              accept="image/*,.pdf,.ai,.psd,.eps,.cdr"
                            />
                          </label>
                          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Fichiers */}
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {files.filter(f => !f.nom_fichier.startsWith('.folder_')).map(f => (
                            <div
                              key={f.id}
                              className="bg-[#0D1F3C] rounded-xl border border-[#1A3A6B] p-2 hover:border-[#F0C75E]/40 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group relative"
                              onClick={() => setPreviewFile(f)}
                            >
                              <div className="h-20 flex items-center justify-center bg-[#071325] rounded-lg mb-2">
                                {f.type_mime?.startsWith('image/') ?
                                  <img src={f.url_fichier} alt={f.nom_fichier} className="max-w-full max-h-full object-contain" /> :
                                  <span className="text-3xl">📄</span>
                                }
                              </div>
                              <p className="text-xs truncate font-medium text-white" title={f.nom_fichier}>
                                {f.nom_fichier}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-gray-500 text-[10px]">{formatTaille(f.taille_fichier)}</span>
                                <span className="text-gray-500 text-[10px]">{new Date(f.date_upload).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <button
                                  onClick={(e) => { e.stopPropagation(); downloadFile(f.url_fichier, f.nom_fichier); }}
                                  className="w-6 h-6 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white text-[10px] flex items-center justify-center shadow-md transition"
                                  title="Télécharger"
                                >
                                  ⬇️
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopyLink(f.url_fichier, f.id); }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md transition ${
                                    copiedId === f.id ? 'bg-green-500 text-white' : 'bg-[#1A3A6B] text-gray-300 hover:bg-[#2A4A6B]'
                                  }`}
                                  title="Copier le lien"
                                >
                                  {copiedId === f.id ? '✅' : '📋'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteFile(f); }}
                                  className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 text-white text-[10px] flex items-center justify-center shadow-md transition"
                                  title="Supprimer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#0A1628] px-6 py-3 border-t border-[#1A3A6B] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {totalFiles} fichier{totalFiles > 1 ? 's' : ''} • {Object.keys(folders).length} dossier{Object.keys(folders).length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1A3A6B] text-gray-300 rounded-lg hover:bg-[#2A4A6B] transition text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0A1628] px-6 py-3 border-b border-[#1A3A6B] flex items-center justify-between">
              <span className="text-white font-medium truncate">{previewFile.nom_fichier}</span>
              <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-auto">
              {previewFile.type_mime?.startsWith('image/') ?
                <img src={previewFile.url_fichier} alt={previewFile.nom_fichier} className="max-w-full max-h-full object-contain" /> :
                <div className="text-center py-12">
                  <span className="text-6xl">📄</span>
                  <a href={previewFile.url_fichier} target="_blank" rel="noopener noreferrer" className="text-[#F0C75E] hover:underline block mt-4">
                    📥 Télécharger
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteFile && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteFile(null)}>
          <div className="bg-[#0D1F3C] rounded-2xl border border-[#1A3A6B] max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-400 mb-6">Supprimer "{deleteFile.nom_fichier}" ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteFile(null)} className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg hover:bg-[#2A4A6B] transition">Annuler</button>
              <button onClick={handleDeleteFile} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}