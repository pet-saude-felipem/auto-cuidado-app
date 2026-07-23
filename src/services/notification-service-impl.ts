import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppNotification } from '@/src/models';
import { INotificationService } from './notification-service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationServiceImpl implements INotificationService {
  private static instance: NotificationServiceImpl;
  private notifications: Map<string, AppNotification> = new Map();
  private notificationIds: Map<string, string> = new Map(); // Maps app ID to Expo ID

  private constructor() {
    this.setupAndroidChannel();
  }

  public static getInstance(): NotificationServiceImpl {
    if (!NotificationServiceImpl.instance) {
      NotificationServiceImpl.instance = new NotificationServiceImpl();
    }
    return NotificationServiceImpl.instance;
  }

  private async setupAndroidChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Lembretes de Medicação',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  private async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  public async ensurePermissions(): Promise<boolean> {
    return await this.requestPermissions();
  }

  public async schedule(notification: Omit<AppNotification, 'id'>): Promise<AppNotification> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Permissão de notificação não concedida');
      }

      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: AppNotification = { ...notification, id };
      
      this.notifications.set(id, newNotification);

      const scheduledDate = new Date(notification.scheduledDate);
      await this.scheduleExpoNotification(id, newNotification, scheduledDate);

      return newNotification;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      throw error;
    }
  }

  private async scheduleExpoNotification(
    id: string,
    notification: AppNotification,
    date: Date
  ): Promise<void> {
    try {
      const expoId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { id, type: notification.type, relatedId: notification.relatedId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: Platform.OS === 'android' ? 'medication-reminders' : undefined,
        },
      });
      
      this.notificationIds.set(id, expoId);
      console.log(`✅ Notificação agendada: ${notification.title}`);
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  }

  public cancel(id: string): boolean {
    const expoId = this.notificationIds.get(id);
    if (!expoId) return false;

    try {
      Notifications.cancelScheduledNotificationAsync(expoId);
      this.notifications.delete(id);
      this.notificationIds.delete(id);
      console.log(`✅ Notificação cancelada: ${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      return false;
    }
  }

  public getAll(): AppNotification[] {
    return Array.from(this.notifications.values());
  }
}

export const notificationService = NotificationServiceImpl.getInstance();