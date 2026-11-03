import { useEffect, useRef } from 'react'

export function Toast({ mensagem, desfazer, aoFechar, duracao = 5000 }) {
  const fecharRef = useRef(aoFechar)
  fecharRef.current = aoFechar

  useEffect(() => {
    const t = setTimeout(() => fecharRef.current(), duracao)
    return () => clearTimeout(t)
  }, [duracao])

  return (
    <div className="toast" role="status">
      <span>{mensagem}</span>
      {desfazer && (
        <button
          onClick={() => {
            desfazer()
            aoFechar()
          }}
        >
          Desfazer
        </button>
      )}
    </div>
  )
}
