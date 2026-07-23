import { WeightRecord } from '@/src/models';
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
// Weight Records
// ----------------------------------------------------------------
export const weightApi = {
  getAll(): Promise<WeightRecord[]> {
    return apiFetch('/weight-records');
  },

  getById(id: string): Promise<WeightRecord> {
    return apiFetch(`/weight-records/${id}`);
  },

  create(data: Omit<WeightRecord, 'id'>): Promise<WeightRecord> {
    return apiFetch('/weight-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<WeightRecord>): Promise<WeightRecord> {
    return apiFetch(`/weight-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove(id: string): Promise<void> {
    return apiFetch(`/weight-records/${id}`, { method: 'DELETE' });
  },
};
