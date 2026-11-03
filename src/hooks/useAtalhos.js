import { useEffect, useRef } from 'react'

const digitando = (el) => el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/** { n: fn, '/': fn } — atalhos de uma tecla, ignorados enquanto o usuário digita. */
export function useAtalhos(mapa) {
  const ref = useRef(mapa)
  ref.current = mapa

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || digitando(e.target)) return
      const fn = ref.current[e.key.toLowerCase()]
      if (fn) {
        e.preventDefault()
        fn()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])
}
