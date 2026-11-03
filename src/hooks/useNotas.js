import { useEffect, useReducer } from 'react'
import { CHAVE, carregarNotas, notasReducer, salvarNotas } from '../lib/notas.js'
import { notasDeExemplo } from '../lib/exemplos.js'

function inicializar(storage) {
  try {
    return carregarNotas(storage) ?? notasDeExemplo()
  } catch {
    return [] // conteúdo corrompido no storage: começa do zero em vez de quebrar a página
  }
}

/** Estado das notas + persistência automática no localStorage. */
export function useNotas(storage = window.localStorage) {
  const [notas, dispatch] = useReducer(notasReducer, storage, inicializar)

  useEffect(() => {
    salvarNotas(storage, notas)
  }, [storage, notas])

  // Mantém várias abas sincronizadas.
  useEffect(() => {
    const aoMudar = (e) => {
      if (e.key === CHAVE && e.newValue) dispatch({ tipo: 'sincronizar', notas: JSON.parse(e.newValue) })
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  return [notas, dispatch]
}
