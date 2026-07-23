export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDateInput(date?: string): Date {
  if (!date) {
    const today = new Date();
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  }
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
