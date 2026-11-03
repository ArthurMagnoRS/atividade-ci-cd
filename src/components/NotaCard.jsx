import { interpretarConteudo, progressoChecklist } from '../lib/notas.js'
import { dataCompleta, tempoRelativo } from '../lib/tempo.js'
import { Icone } from './Icone.jsx'

export function NotaCard({ nota, aoEditar, aoFixar, aoArquivar, aoRemover, aoMarcarItem, aoClicarTag }) {
  const blocos = interpretarConteudo(nota.conteudo)
  const progresso = progressoChecklist(nota.conteudo)

  return (
    <li className={`nota cor-${nota.cor} ${nota.fixada ? 'fixada' : ''}`}>
      <div className="nota-cabecalho">
        <h2>
          <button className="titulo-botao" onClick={aoEditar} title="Editar nota">
            {nota.titulo}
          </button>
        </h2>
        {!nota.arquivada && (
          <button
            className={`icone pino ${nota.fixada ? 'ligado' : ''}`}
            onClick={aoFixar}
            aria-pressed={nota.fixada}
            aria-label={nota.fixada ? `Desafixar ${nota.titulo}` : `Fixar ${nota.titulo}`}
          >
            <Icone nome="pino" tamanho={16} />
          </button>
        )}
      </div>

      {nota.conteudo && (
        <div className="nota-corpo">
          {blocos.map((b, i) =>
            b.tipo === 'item' ? (
              <label key={i} className={`item ${b.feito ? 'feito' : ''}`}>
                <input type="checkbox" checked={b.feito} onChange={() => aoMarcarItem(b.indice)} />
                <span>{b.texto}</span>
              </label>
            ) : b.texto.trim() ? (
              <p key={i}>{b.texto}</p>
            ) : (
              <div key={i} className="espaco" />
            )
          )}
        </div>
      )}

      {progresso.total > 0 && (
        <div className="barra pequena" title={`${progresso.feitos} de ${progresso.total} tarefas`}>
          <div style={{ width: `${(progresso.feitos / progresso.total) * 100}%` }} />
        </div>
      )}

      {nota.tags.length > 0 && (
        <ul className="tags" aria-label="Tags">
          {nota.tags.map((t) => (
            <li key={t}>
              <button onClick={() => aoClicarTag(t)}>#{t}</button>
            </li>
          ))}
        </ul>
      )}

      <div className="nota-rodape">
        <time dateTime={new Date(nota.editadaEm).toISOString()} title={dataCompleta(nota.editadaEm)}>
          {tempoRelativo(nota.editadaEm)}
        </time>
        <div className="nota-acoes">
          <button onClick={aoEditar}>Editar</button>
          <button onClick={aoArquivar}>{nota.arquivada ? 'Desarquivar' : 'Arquivar'}</button>
          <button className="perigo" onClick={aoRemover} aria-label={`Excluir ${nota.titulo}`}>
            Excluir
          </button>
        </div>
      </div>
    </li>
  )
}
