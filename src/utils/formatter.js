/**
 * Formata um tempo em milissegundos para string (MM:SS ou HH:MM:SS)
 * @param {number} ms - Tempo em milissegundos
 * @returns {string}
 */
export function formatDuration(ms) {
  if (isNaN(ms) || ms < 0) return '00:00';
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  const pad = (num) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Cria uma barra de progresso em texto
 * @param {number} currentMs - Tempo atual em milissegundos
 * @param {number} totalMs - Tempo total em milissegundos
 * @param {number} [size=15] - Tamanho da barra (quantidade de caracteres)
 * @returns {string}
 */
export function createProgressBar(currentMs, totalMs, size = 15) {
  if (isNaN(currentMs) || isNaN(totalMs) || totalMs <= 0) {
    return `🔘${'▬'.repeat(size)}`;
  }
  
  const percentage = Math.min(Math.max(currentMs / totalMs, 0), 1);
  const progress = Math.round(size * percentage);
  const emptyProgress = size - progress;

  const progressText = '▬'.repeat(progress);
  const emptyProgressText = '▬'.repeat(emptyProgress);

  return `${progressText}🔘${emptyProgressText}`;
}
