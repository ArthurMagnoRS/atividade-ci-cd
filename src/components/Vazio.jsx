import { Icone } from './Icone.jsx'

export function Vazio({ arquivo, buscando, aoCriar }) {
  if (buscando)
    return (
      <div className="vazio">
        <span className="vazio-icone"><Icone nome="busca" tamanho={22} /></span>
        <p>Nenhuma nota encontrada.</p>
      </div>
    )
  if (arquivo)
    return (
      <div className="vazio">
        <span className="vazio-icone"><Icone nome="arquivo" tamanho={22} /></span>
        <p>Nenhuma nota arquivada.</p>
      </div>
    )
  return (
    <div className="vazio">
      <span className="vazio-icone"><Icone nome="notas" tamanho={22} /></span>
      <p>Você ainda não tem notas.</p>
      <button className="primario" onClick={aoCriar}>
        Criar a primeira nota
      </button>
    </div>
  )
}
