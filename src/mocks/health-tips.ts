/**
 * Dicas de saúde para a splash screen
 */
export const healthTips: string[] = [
  'Beba pelo menos 2 litros de água por dia 💧',
  'Durma de 7 a 9 horas por noite para recuperar o corpo 😴',
  'Tome seus medicamentos sempre no mesmo horário ⏰',
  'Movimente-se! 30 minutos de caminhada fazem diferença 🚶',
  'Anote seu peso regularmente para acompanhar sua evolução ⚖️',
  'Alimentação equilibrada é a base da saúde 🥗',
  'Não pule suas refeições, elas são importantes para o metabolismo 🍽️',
  'Reserve um tempo para cuidar da sua saúde mental 🧠',
  'Consulte seu médico regularmente para check-ups preventivos 🏥',
  'Pequenos hábitos diários geram grandes resultados ao longo do tempo ✨',
];

/**
 * Retorna uma dica aleatória
 */
export function getRandomTip(): string {
  const index = Math.floor(Math.random() * healthTips.length);
  return healthTips[index];
}
