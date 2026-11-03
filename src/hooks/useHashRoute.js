import { useCallback, useEffect, useState } from 'react'

const lerHash = () => window.location.hash.replace(/^#/, '') || '/'

/**
 * Roteamento mínimo baseado em hash (#/dados, #/tag/aula).
 * Em uma hospedagem só de arquivos estáticos não há servidor para redirecionar
 * /dados → index.html, então usamos o hash, que nunca é enviado ao servidor.
 */
export function useHashRoute() {
  const [rota, setRota] = useState(lerHash)

  useEffect(() => {
    const aoMudar = () => setRota(lerHash())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  const navegar = useCallback((destino) => {
    window.location.hash = destino
  }, [])

  return [rota, navegar]
}

/** "/tag/casa%2Fcompras" → { pagina: 'notas', tag: 'casa/compras' } */
export function interpretarRota(rota) {
  const [, pagina = '', param] = rota.split('/')
  if (pagina === 'arquivo') return { pagina: 'arquivo' }
  if (pagina === 'dados') return { pagina: 'dados' }
  if (pagina === 'tag' && param) return { pagina: 'notas', tag: decodeURIComponent(param) }
  return { pagina: 'notas' }
}
