import { useRef } from 'react'
import { Icone } from './Icone.jsx'

export function Dados({ notas, stats, dispatch, avisar }) {
  const arquivoRef = useRef(null)

  function exportar() {
    const blob = new Blob([JSON.stringify(notas, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `notas-${new Date().toISOString().slice(0, 10)}.json`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importar(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    try {
      const lista = JSON.parse(await arquivo.text())
      dispatch({ tipo: 'importar', notas: lista })
      avisar(`${lista.length} nota(s) importada(s)`)
    } catch (err) {
      avisar(`Não foi possível importar: ${err.message}`)
    }
  }

  return (
    <div className="dados">
      <section className="cartao">
        <h2>Resumo</h2>
        <div className="numeros">
          <div><strong>{stats.ativas}</strong><span>ativas</span></div>
          <div><strong>{stats.fixadas}</strong><span>fixadas</span></div>
          <div><strong>{stats.arquivadas}</strong><span>arquivadas</span></div>
          <div><strong>{stats.tarefas.feitos}/{stats.tarefas.total}</strong><span>tarefas</span></div>
        </div>
      </section>

      <section className="cartao">
        <h2>Backup</h2>
        <p className="texto-suave">
          As notas ficam salvas apenas neste navegador. Exporte um arquivo JSON para guardar uma cópia ou levar
          as notas para outro computador.
        </p>
        <div className="botoes">
          <button onClick={exportar}>
            <Icone nome="baixar" tamanho={16} /> Exportar JSON
          </button>
          <button onClick={() => arquivoRef.current?.click()}>
            <Icone nome="enviar" tamanho={16} /> Importar JSON
          </button>
          <input ref={arquivoRef} type="file" accept="application/json,.json" hidden onChange={importar} />
        </div>
      </section>
    </div>
  )
}
