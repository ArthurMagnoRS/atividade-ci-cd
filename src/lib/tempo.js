const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
const UNIDADES = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

export function tempoRelativo(timestamp, agora = Date.now()) {
  const segundos = Math.round((timestamp - agora) / 1000)
  if (Math.abs(segundos) < 45) return 'agora mesmo'
  for (const [unidade, s] of UNIDADES) {
    if (Math.abs(segundos) >= s) return rtf.format(Math.round(segundos / s), unidade)
  }
  return rtf.format(Math.round(segundos / 60), 'minute')
}

export function dataCompleta(timestamp) {
  return new Date(timestamp).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
}
