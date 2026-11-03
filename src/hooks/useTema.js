import { useEffect, useState } from 'react'

const CHAVE = 'bloco-de-notas:tema'

function lerTema() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    /* storage indisponível */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

export function useTema() {
  const [tema, setTema] = useState(lerTema)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      /* ignora */
    }
  }, [tema])

  return [tema, () => setTema((t) => (t === 'claro' ? 'escuro' : 'claro'))]
}
