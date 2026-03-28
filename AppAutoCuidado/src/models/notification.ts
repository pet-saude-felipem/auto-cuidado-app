/**
 * Modelo de dados para notificação
 */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  scheduledDate: string; // ISO date string
  type: NotificationType;
  relatedId?: string; // ID do peso ou medicação relacionado
}

/**
 * Tipos de notificação
 */
export type NotificationType = 'medication_reminder' | 'weight_reminder';
