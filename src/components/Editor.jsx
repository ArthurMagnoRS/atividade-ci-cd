import { useEffect, useId, useRef, useState } from 'react'
import { CORES, validarNota } from '../lib/notas.js'

const NOMES_CORES = {
  padrao: 'Padrão', amarelo: 'Amarelo', verde: 'Verde', azul: 'Azul', roxo: 'Roxo', rosa: 'Rosa',
}

export function Editor({ nota, tagSugerida, sugestoes, aoSalvar, aoFechar }) {
  const [titulo, setTitulo] = useState(nota?.titulo ?? '')
  const [conteudo, setConteudo] = useState(nota?.conteudo ?? '')
  const [tags, setTags] = useState(nota ? nota.tags.join(', ') : tagSugerida ?? '')
  const [cor, setCor] = useState(nota?.cor ?? 'padrao')
  const [erro, setErro] = useState('')
  const tituloRef = useRef(null)
  const id = useId()

  const fecharRef = useRef(aoFechar)
  fecharRef.current = aoFechar

  useEffect(() => {
    tituloRef.current?.focus()
    const aoTeclar = (e) => e.key === 'Escape' && fecharRef.current()
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])

  function enviar(e) {
    e?.preventDefault()
    try {
      aoSalvar(validarNota({ titulo, conteudo, tags, cor }))
    } catch (err) {
      setErro(err.message)
      tituloRef.current?.focus()
    }
  }

  function inserirChecklist() {
    setConteudo((c) => (c && !c.endsWith('\n') ? `${c}\n- [ ] ` : `${c}- [ ] `))
  }

  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <form
        className={`modal cor-${cor}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        onSubmit={enviar}
        onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && enviar(e)}
      >
        <h2 id={`${id}-titulo`}>{nota ? 'Editar nota' : 'Nova nota'}</h2>

        <label className="campo">
          <span>Título</span>
          <input
            ref={tituloRef}
            value={titulo}
            onChange={(e) => (setTitulo(e.target.value), setErro(''))}
            maxLength={120}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? `${id}-erro` : undefined}
            autoComplete="off"
          />
        </label>

        <label className="campo">
          <span>
            Conteúdo
            <button type="button" className="link" onClick={inserirChecklist}>
              + item de checklist
            </button>
          </span>
          <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={7} />
        </label>

        <label className="campo">
          <span>Tags (separadas por vírgula)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} list={`${id}-tags`} autoComplete="off" />
          <datalist id={`${id}-tags`}>
            {sugestoes.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>

        <fieldset className="cores">
          <legend>Cor</legend>
          {CORES.map((c) => (
            <label key={c} className={`amostra cor-${c}`} title={NOMES_CORES[c]}>
              <input type="radio" name="cor" value={c} checked={cor === c} onChange={() => setCor(c)} />
              <span className="sr-only">{NOMES_CORES[c]}</span>
            </label>
          ))}
        </fieldset>

        {erro && (
          <p id={`${id}-erro`} className="erro" role="alert">
            {erro}
          </p>
        )}

        <div className="modal-acoes">
          <span className="dica">
            <kbd>Ctrl</kbd>+<kbd>Enter</kbd> salva · <kbd>Esc</kbd> fecha
          </span>
          <button type="button" onClick={aoFechar}>
            Cancelar
          </button>
          <button type="submit" className="primario">
            {nota ? 'Salvar alterações' : 'Adicionar nota'}
          </button>
        </div>
      </form>
    </div>
  )
}
