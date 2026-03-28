/**
 * URL base da API REST que conecta ao PostgreSQL.
 *
 * Ajuste conforme o ambiente:
 *   - Emulador Android  → http://10.0.2.2:3001
 *   - Simulador iOS / web → http://localhost:3001
 *   - Dispositivo físico → http://<IP_DA_MAQUINA>:3001
 */
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3001'
  : 'http://localhost:3001';
