import { Medication, MedicationLog } from '@/src/models';
import { API_BASE_URL } from './config';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ----------------------------------------------------------------
// Medications
// ----------------------------------------------------------------
export const medicationApi = {
  getAll(): Promise<Medication[]> {
    return apiFetch('/medications');
  },

  getById(id: string): Promise<Medication> {
    return apiFetch(`/medications/${id}`);
  },

  create(data: Omit<Medication, 'id'>): Promise<Medication> {
    return apiFetch('/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<Medication>): Promise<Medication> {
    return apiFetch(`/medications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove(id: string): Promise<void> {
    return apiFetch(`/medications/${id}`, { method: 'DELETE' });
  },
};

// ----------------------------------------------------------------
// Medication Logs
// ----------------------------------------------------------------
export const medicationLogApi = {
  getAll(opts?: { days?: number; medicationId?: string }): Promise<MedicationLog[]> {
    const params = new URLSearchParams();
    if (opts?.days)           params.append('days',          String(opts.days));
    if (opts?.medicationId)   params.append('medicationId',  opts.medicationId);
    const query = params.toString();
    return apiFetch(`/medication-logs${query ? `?${query}` : ''}`);
  },

  create(data: Omit<MedicationLog, 'id'>): Promise<MedicationLog> {
    return apiFetch('/medication-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
