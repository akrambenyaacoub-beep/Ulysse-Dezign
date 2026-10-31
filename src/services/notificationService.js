// src/services/notificationService.js
import { supabaseErp } from '../lib/supabaseErp';

export const NotificationService = {
  // =====================================================
  // CRÉER UNE NOTIFICATION POUR UN UTILISATEUR
  // =====================================================
  async createNotification(userId, data) {
    try {
      const notification = {
        user_id: userId,
        type: data.type || 'system',
        title: data.title,
        message: data.message,
        link: data.link || null,
        priority: data.priority || 'normal',
        icon: data.icon || null,
        color: data.color || null,
        metadata: data.metadata || {}
      };

      const { error } = await supabaseErp
        .from('erp_notifications')
        .insert([notification]);

      if (error) throw error;
      return { success: true };
      
    } catch (err) {
      console.error('❌ Erreur création notification:', err);
      return { success: false, error: err.message };
    }
  },

  // =====================================================
  // NOTIFICATION DE TÂCHE ASSIGNÉE
  // =====================================================
  async notifyTaskAssigned(userId, task) {
    return this.createNotification(userId, {
      type: 'task',
      title: '📋 Nouvelle tâche assignée',
      message: `"${task.titre}" vous a été assignée`,
      link: `/equipage`,
      priority: 'normal',
      icon: '📋',
      color: 'blue'
    });
  },

  // =====================================================
  // NOTIFICATION DE TÂCHE TERMINÉE
  // =====================================================
  async notifyTaskCompleted(userId, task) {
    return this.createNotification(userId, {
      type: 'task',
      title: '✅ Tâche terminée',
      message: `"${task.titre}" a été marquée comme terminée`,
      link: `/equipage`,
      priority: 'low',
      icon: '✅',
      color: 'green'
    });
  },

  // =====================================================
  // NOTIFICATION DE TÂCHE EN RETARD
  // =====================================================
  async notifyTaskOverdue(userId, task) {
    return this.createNotification(userId, {
      type: 'task',
      title: '⚠️ Tâche en retard',
      message: `"${task.titre}" est en retard (échéance: ${task.date_fin_prevue})`,
      link: `/equipage`,
      priority: 'urgent',
      icon: '⚠️',
      color: 'red'
    });
  },

  // =====================================================
  // NOTIFICATION DE NOUVELLE COMMANDE
  // =====================================================
  async notifyNewOrder(userId, order) {
    return this.createNotification(userId, {
      type: 'order',
      title: '📦 Nouvelle commande',
      message: `Commande ${order.numero} a été créée`,
      link: `/commandes`,
      priority: 'high',
      icon: '📦',
      color: 'orange'
    });
  },

  // =====================================================
  // NOTIFICATION DE CHANGEMENT DE STATUT DE COMMANDE
  // =====================================================
  async notifyOrderStatusChange(userId, order, oldStatus, newStatus) {
    return this.createNotification(userId, {
      type: 'order',
      title: '📦 Commande mise à jour',
      message: `Commande ${order.numero} est passée de "${oldStatus}" à "${newStatus}"`,
      link: `/commandes/${order.id}`,
      priority: 'normal',
      icon: '📦',
      color: 'blue'
    });
  },

  // =====================================================
  // NOTIFICATION DE PAIEMENT REÇU
  // =====================================================
  async notifyPaymentReceived(userId, payment) {
    return this.createNotification(userId, {
      type: 'payment',
      title: '💳 Paiement reçu',
      message: `Paiement de ${payment.montant} TND reçu`,
      link: `/tresors`,
      priority: 'normal',
      icon: '💰',
      color: 'green'
    });
  },

  // =====================================================
  // NOTIFICATION DE MENTION DANS LE CHAT
  // =====================================================
  async notifyMention(userId, message, channel) {
    return this.createNotification(userId, {
      type: 'team',
      title: '💬 Mention dans le chat',
      message: `${message.sender?.full_name} vous a mentionné : "${message.content}"`,
      link: `/equipage`,
      priority: 'normal',
      icon: '💬',
      color: 'purple'
    });
  },

  // =====================================================
  // NOTIFICATION DE NOUVEAU MEMBRE
  // =====================================================
  async notifyNewMember(userId, member) {
    return this.createNotification(userId, {
      type: 'team',
      title: '👥 Nouveau membre',
      message: `${member.full_name} a rejoint l\'équipe`,
      link: `/equipe`,
      priority: 'low',
      icon: '👤',
      color: 'purple'
    });
  },

  // =====================================================
  // NOTIFICATION D'ALERTE SYSTÈME
  // =====================================================
  async notifySystemAlert(userId, title, message) {
    return this.createNotification(userId, {
      type: 'system',
      title: `⚙️ ${title}`,
      message: message,
      priority: 'high',
      icon: '⚙️',
      color: 'gray'
    });
  },

  // =====================================================
  // NOTIFICATION EN MASSE
  // =====================================================
  async notifyAllUsers(data, userIds) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: data.type || 'system',
      title: data.title,
      message: data.message,
      link: data.link || null,
      priority: data.priority || 'normal',
      icon: data.icon || null,
      color: data.color || null,
      metadata: data.metadata || {}
    }));

    try {
      const { error } = await supabaseErp
        .from('erp_notifications')
        .insert(notifications);

      if (error) throw error;
      return { success: true };
      
    } catch (err) {
      console.error('❌ Erreur notification en masse:', err);
      return { success: false, error: err.message };
    }
  }
};