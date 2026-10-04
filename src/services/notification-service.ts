import { AppNotification } from '@/src/models';

export interface INotificationService {
  schedule(notification: Omit<AppNotification, 'id'>): Promise<AppNotification>;
  cancel(id: string): boolean;
  cancelMedicationReminders(): Promise<void>;
  reconcileMedicationReminders(activeMedicationIds: string[]): Promise<void>;
  getAll(): AppNotification[];
}
