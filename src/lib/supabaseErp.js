// src/lib/supabaseErp.js
import { createClient } from '@supabase/supabase-js';

// =====================================================
// 1. RÉCUPÉRATION DES VARIABLES D'ENVIRONNEMENT
// =====================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// =====================================================
// 2. LOGS DE DÉBOGAGE
// =====================================================
console.log('🔍 [supabaseErp] URL:', supabaseUrl);
console.log('🔍 [supabaseErp] Anon Key:', supabaseAnonKey ? '✅ Présente' : '❌ Manquante');
console.log('🔍 [supabaseErp] Service Key:', supabaseServiceKey ? '✅ Présente' : '❌ Manquante (admin uniquement)');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [supabaseErp] Erreur: Variables d\'environnement Supabase manquantes!');
  console.error('❌ [supabaseErp] Vérifiez votre fichier .env');
}

// =====================================================
// 3. CRÉATION DU CLIENT STANDARD (Frontend)
// =====================================================
export const supabaseErp = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-erp-auth-token',
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// =====================================================
// 4. CRÉATION DU CLIENT ADMIN (Service Role)
// =====================================================
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    })
  : null;

// =====================================================
// 5. FONCTIONS ADMIN (UTILISATEURS)
// =====================================================

/**
 * Crée un utilisateur dans Supabase Auth (admin uniquement)
 */
export async function createAuthUser(email, userMetadata) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: userMetadata || {},
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur création utilisateur:', error);
    return { data: null, error };
  }
}

/**
 * Envoie un email d'invitation à un utilisateur (admin uniquement)
 */
export async function inviteUserByEmail(email) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur invitation:', error);
    return { data: null, error };
  }
}

/**
 * Supprime un utilisateur de Supabase Auth (admin uniquement)
 */
export async function deleteAuthUser(userId) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur suppression utilisateur:', error);
    return { data: null, error };
  }
}

/**
 * Récupère un utilisateur Auth par son ID (admin uniquement)
 */
export async function getAuthUser(userId) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur récupération utilisateur:', error);
    return { data: null, error };
  }
}

/**
 * Liste tous les utilisateurs Auth (admin uniquement)
 */
export async function listAuthUsers() {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur liste utilisateurs:', error);
    return { data: null, error };
  }
}

/**
 * Met à jour les métadonnées d'un utilisateur Auth (admin uniquement)
 */
export async function updateAuthUser(userId, metadata) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur mise à jour utilisateur:', error);
    return { data: null, error };
  }
}

/**
 * Vérifie si un utilisateur Auth a un mot de passe (admin uniquement)
 */
export async function hasUserPassword(userId) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) throw error;
    return data?.user?.encrypted_password !== null;
  } catch (error) {
    console.error('❌ Erreur vérification mot de passe:', error);
    return false;
  }
}

// =====================================================
// 6. FONCTIONS CHAT (NOUVEAU)
// =====================================================

/**
 * Récupère les messages d'un canal de chat
 */
export async function getChatMessages(channelId = 'general', limit = 100) {
  try {
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .select(`
        *,
        sender:erp_profiles!sender_id(id, full_name, role, avatar_url),
        replies:erp_messages!reply_to(id, content, sender_id, created_at)
      `)
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur récupération messages:', error);
    return { data: null, error };
  }
}

/**
 * Envoie un nouveau message dans le chat
 */
export async function sendChatMessage(content, senderId, channelId = 'general', replyTo = null) {
  if (!content?.trim()) {
    return { error: new Error('Le message ne peut pas être vide') };
  }

  try {
    const newMessage = {
      content: content.trim(),
      sender_id: senderId,
      channel_id: channelId,
      reply_to: replyTo,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseErp
      .from('erp_messages')
      .insert(newMessage)
      .select(`
        *,
        sender:erp_profiles!sender_id(id, full_name, role, avatar_url)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur envoi message:', error);
    return { data: null, error };
  }
}

/**
 * Marque un message comme lu
 */
export async function markMessageAsRead(messageId) {
  try {
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur marquage message lu:', error);
    return { data: null, error };
  }
}

/**
 * Marque tous les messages d'un canal comme lus
 */
export async function markAllMessagesAsRead(channelId, userId) {
  try {
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('channel_id', channelId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur marquage tous lus:', error);
    return { data: null, error };
  }
}

/**
 * Supprime un message (soft delete)
 */
export async function deleteChatMessage(messageId) {
  try {
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .update({ 
        deleted_at: new Date().toISOString(),
        content: '[Message supprimé]'
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur suppression message:', error);
    return { data: null, error };
  }
}

/**
 * Modifie un message
 */
export async function editChatMessage(messageId, newContent) {
  if (!newContent?.trim()) {
    return { error: new Error('Le message ne peut pas être vide') };
  }

  try {
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .update({ 
        content: newContent.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur modification message:', error);
    return { data: null, error };
  }
}

/**
 * Récupère les canaux de chat
 */
export async function getChatChannels() {
  try {
    const { data, error } = await supabaseErp
      .from('erp_channels')
      .select('*')
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur récupération canaux:', error);
    return { data: null, error };
  }
}

/**
 * Crée un nouveau canal de chat
 */
export async function createChatChannel(name, description = '', type = 'public', createdBy) {
  try {
    const newChannel = {
      name: name.trim(),
      description: description.trim() || null,
      type: type,
      created_by: createdBy,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseErp
      .from('erp_channels')
      .insert(newChannel)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur création canal:', error);
    return { data: null, error };
  }
}

/**
 * Récupère le nombre de messages non lus pour un utilisateur
 */
export async function getUnreadMessageCount(userId) {
  try {
    const { count, error } = await supabaseErp
      .from('erp_messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false)
      .is('deleted_at', null);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur comptage messages non lus:', error);
    return { count: 0, error };
  }
}

/**
 * Récupère les messages non lus par canal
 */
export async function getUnreadMessagesByChannel(userId) {
  try {
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .select('channel_id, count: id')
      .neq('sender_id', userId)
      .eq('is_read', false)
      .is('deleted_at', null)
      .group('channel_id');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur récupération messages non lus par canal:', error);
    return { data: null, error };
  }
}

/**
 * Récupère les utilisateurs actifs dans le chat
 */
export async function getChatActiveUsers(channelId) {
  try {
    // Utiliser la table erp_messages pour obtenir les derniers utilisateurs actifs
    const { data, error } = await supabaseErp
      .from('erp_messages')
      .select(`
        sender_id,
        sender:erp_profiles!sender_id(id, full_name, role),
        created_at
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Dédupliquer par sender_id
    const uniqueUsers = [];
    const seen = new Set();
    for (const msg of data || []) {
      if (!seen.has(msg.sender_id) && msg.sender) {
        seen.add(msg.sender_id);
        uniqueUsers.push(msg.sender);
      }
    }

    return { data: uniqueUsers, error: null };
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur récupération utilisateurs actifs:', error);
    return { data: null, error };
  }
}

// =====================================================
// 7. TEST DE CONNEXION
// =====================================================
async function testConnection() {
  try {
    const { data, error } = await supabaseErp
      .from('erp_produits')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ [supabaseErp] Test de connexion échoué:', error);
    } else {
      console.log('✅ [supabaseErp] Test de connexion réussi!');
      console.log('✅ [supabaseErp] Table erp_produits accessible');
    }
  } catch (error) {
    console.error('❌ [supabaseErp] Erreur de test:', error);
  }
}

// Exécuter le test (optionnel, commenté par défaut)
// testConnection();

// =====================================================
// 8. FONCTIONS UTILES (SESSION, PROFIL, TABLES)
// =====================================================

/**
 * Récupère la session de l'utilisateur connecté
 */
export async function getErpSession() {
  const { data: { session }, error } = await supabaseErp.auth.getSession();
  if (error) {
    console.error('❌ [supabaseErp] Erreur session:', error);
    return null;
  }
  return session;
}

/**
 * Récupère le profil de l'utilisateur connecté
 */
export async function getErpProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabaseErp
    .from('erp_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('❌ [supabaseErp] Erreur profil:', error);
    return null;
  }
  return data;
}

/**
 * Vérifie si la table existe
 */
export async function tableExists(tableName) {
  try {
    const { data, error } = await supabaseErp
      .from(tableName)
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ [supabaseErp] Table ${tableName} inaccessible:`, error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Récupère un utilisateur Auth par son email (admin uniquement)
 */
export async function findAuthUserByEmail(email) {
  if (!supabaseAdmin) {
    console.error('❌ [supabaseAdmin] Non disponible - Service Key manquante');
    return { error: new Error('Service Key non configurée') };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    
    const user = data?.users?.find(u => u.email === email);
    return { data: user || null, error: null };
  } catch (error) {
    console.error('❌ [supabaseAdmin] Erreur recherche utilisateur:', error);
    return { data: null, error };
  }
}

// =====================================================
// 9. EXPORT PAR DÉFAUT
// =====================================================
export default supabaseErp;