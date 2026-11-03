import { useMemo, useRef, useState } from 'react'
import { useNotas } from './hooks/useNotas.js'
import { interpretarRota, useHashRoute } from './hooks/useHashRoute.js'
import { useTema } from './hooks/useTema.js'
import { useAtalhos } from './hooks/useAtalhos.js'
import { contarTags, estatisticas, filtrarNotas, ORDENS } from './lib/notas.js'
import { BarraLateral } from './components/BarraLateral.jsx'
import { NotaCard } from './components/NotaCard.jsx'
import { Editor } from './components/Editor.jsx'
import { Toast } from './components/Toast.jsx'
import { Dados } from './components/Dados.jsx'
import { Vazio } from './components/Vazio.jsx'
import { Icone } from './components/Icone.jsx'

export default function App() {
  const [notas, dispatch] = useNotas()
  const [rota, navegar] = useHashRoute()
  const [tema, alternarTema] = useTema()
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('recentes')
  const [editando, setEditando] = useState(null) // null | 'nova' | nota
  const [toast, setToast] = useState(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const buscaRef = useRef(null)

  const { pagina, tag } = interpretarRota(rota)
  const arquivadas = pagina === 'arquivo'

  const visiveis = useMemo(
    () => filtrarNotas(notas, { busca, tag, arquivadas, ordem }),
    [notas, busca, tag, arquivadas, ordem]
  )
  const tags = useMemo(() => contarTags(notas), [notas])
  const stats = useMemo(() => estatisticas(notas), [notas])

  useAtalhos({
    n: () => setEditando('nova'),
    '/': () => buscaRef.current?.focus(),
  })

  function avisar(mensagem, desfazer) {
    setToast({ mensagem, desfazer, id: Date.now() })
  }

  function salvar(dados) {
    if (editando === 'nova') {
      dispatch({ tipo: 'adicionar', dados })
      avisar('Nota criada')
    } else {
      dispatch({ tipo: 'editar', id: editando.id, dados })
      avisar('Alterações salvas')
    }
    setEditando(null)
  }

  function remover(nota) {
    dispatch({ tipo: 'remover', id: nota.id })
    avisar(`"${nota.titulo}" excluída`, () => dispatch({ tipo: 'restaurar', nota }))
  }

  function arquivar(nota) {
    dispatch({ tipo: 'arquivar', id: nota.id })
    avisar(nota.arquivada ? 'Nota restaurada do arquivo' : 'Nota arquivada', () =>
      dispatch({ tipo: 'arquivar', id: nota.id })
    )
  }

  const titulo = pagina === 'dados' ? 'Dados' : arquivadas ? 'Arquivo' : tag ? `#${tag}` : 'Notas'

  return (
    <div className="app">
      <BarraLateral
        pagina={pagina}
        tagAtiva={tag}
        tags={tags}
        stats={stats}
        aberta={menuAberto}
        aoNavegar={(destino) => {
          navegar(destino)
          setMenuAberto(false)
        }}
        aoFechar={() => setMenuAberto(false)}
      />

      <div className="conteudo">
        <header className="topo">
          <button className="icone so-mobile" aria-label="Abrir menu" onClick={() => setMenuAberto(true)}>
            <Icone nome="menu" />
          </button>
          <h1>{titulo}</h1>
          <div className="topo-acoes">
            <button
              className="icone"
              onClick={alternarTema}
              aria-label={tema === 'claro' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              title="Alternar tema"
            >
              <Icone nome={tema === 'claro' ? 'lua' : 'sol'} />
            </button>
            {pagina !== 'dados' && (
              <button className="primario" onClick={() => setEditando('nova')}>
                <Icone nome="mais" tamanho={16} />
                Nova nota <kbd>N</kbd>
              </button>
            )}
          </div>
        </header>

        {pagina === 'dados' ? (
          <Dados notas={notas} stats={stats} dispatch={dispatch} avisar={avisar} />
        ) : (
          <>
            <div className="filtros">
              <label className="busca">
                <Icone nome="busca" tamanho={16} />
                <input
                  ref={buscaRef}
                  type="search"
                  placeholder="Buscar por título, conteúdo ou tag"
                  aria-label="Buscar notas"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && (setBusca(''), e.currentTarget.blur())}
                />
                <kbd>/</kbd>
              </label>
              <select aria-label="Ordenar" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                {Object.entries(ORDENS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </div>

            <p className="contador" aria-live="polite">
              {visiveis.length} {visiveis.length === 1 ? 'nota' : 'notas'}
              {busca && ` para "${busca}"`}
              {tag && (
                <button className="link" onClick={() => navegar('/')}>
                  limpar filtro <Icone nome="x" tamanho={13} />
                </button>
              )}
            </p>

            {visiveis.length === 0 ? (
              <Vazio arquivo={arquivadas} buscando={Boolean(busca || tag)} aoCriar={() => setEditando('nova')} />
            ) : (
              <ul className="grade">
                {visiveis.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    aoEditar={() => setEditando(nota)}
                    aoFixar={() => dispatch({ tipo: 'fixar', id: nota.id })}
                    aoArquivar={() => arquivar(nota)}
                    aoRemover={() => remover(nota)}
                    aoMarcarItem={(indice) => dispatch({ tipo: 'alternarItem', id: nota.id, indice })}
                    aoClicarTag={(t) => navegar(`/tag/${encodeURIComponent(t)}`)}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {editando && (
        <Editor
          nota={editando === 'nova' ? null : editando}
          tagSugerida={tag}
          sugestoes={tags.map((t) => t.tag)}
          aoSalvar={salvar}
          aoFechar={() => setEditando(null)}
        />
      )}

      {toast && <Toast key={toast.id} {...toast} aoFechar={() => setToast(null)} />}
    </div>
  )
}
