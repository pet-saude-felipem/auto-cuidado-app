import { AppNotification } from '@/src/models';

/**
 * Contrato do serviço de notificações
 * Regras de negócio — Gustavo implementa
 */
export interface INotificationService {
  schedule(notification: Omit<AppNotification, 'id'>): AppNotification;
  cancel(id: string): boolean;
  getAll(): AppNotification[];
}
