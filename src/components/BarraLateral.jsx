import { Icone } from './Icone.jsx'

export function BarraLateral({ pagina, tagAtiva, tags, stats, aberta, aoNavegar, aoFechar }) {
  const item = (destino, rotulo, icone, ativo, contagem) => (
    <li key={destino}>
      <a
        href={`#${destino}`}
        className={ativo ? 'ativo' : undefined}
        aria-current={ativo ? 'page' : undefined}
        onClick={(e) => {
          e.preventDefault()
          aoNavegar(destino)
        }}
      >
        <Icone nome={icone} tamanho={17} />
        <span className="rotulo">{rotulo}</span>
        {contagem != null && <span className="contagem">{contagem}</span>}
      </a>
    </li>
  )

  return (
    <>
      {aberta && <div className="cortina so-mobile" onClick={aoFechar} />}
      <aside className={`lateral ${aberta ? 'aberta' : ''}`}>
        <div className="marca">
          <img src="./favicon.svg" alt="" width="24" height="24" />
          <span>Bloco de Notas</span>
        </div>

        <nav aria-label="Seções">
          <ul>
            {item('/', 'Notas', 'notas', pagina === 'notas' && !tagAtiva, stats.ativas)}
            {item('/arquivo', 'Arquivo', 'arquivo', pagina === 'arquivo', stats.arquivadas)}
            {item('/dados', 'Dados', 'dados', pagina === 'dados')}
          </ul>
        </nav>

        {tags.length > 0 && (
          <nav aria-label="Tags">
            <h2>Tags</h2>
            <ul>
              {tags.map(({ tag, total }) =>
                item(`/tag/${encodeURIComponent(tag)}`, tag, 'hash', tagAtiva === tag, total)
              )}
            </ul>
          </nav>
        )}

        {stats.tarefas.total > 0 && (
          <div className="progresso-geral">
            <div className="progresso-rotulo">
              <span>Tarefas</span>
              <span>
                {stats.tarefas.feitos}/{stats.tarefas.total}
              </span>
            </div>
            <div className="barra">
              <div style={{ width: `${(stats.tarefas.feitos / stats.tarefas.total) * 100}%` }} />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
