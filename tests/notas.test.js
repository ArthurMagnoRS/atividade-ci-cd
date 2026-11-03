import { describe, it, expect } from 'vitest'
import {
  alternarItem,
  carregarNotas,
  CHAVE,
  contarTags,
  criarNota,
  estatisticas,
  filtrarNotas,
  importarNotas,
  normalizarTags,
  notasReducer,
  progressoChecklist,
  salvarNotas,
} from '../src/lib/notas.js'

// Um "localStorage" falso, em memória: os testes não dependem do navegador.
function storageFalso(inicial = {}) {
  const dados = { ...inicial }
  return {
    getItem: (chave) => (chave in dados ? dados[chave] : null),
    setItem: (chave, valor) => {
      dados[chave] = String(valor)
    },
  }
}

// Cria notas com id e horário previsíveis.
let relogio = 0
const nota = (dados, extra = {}) => ({
  ...criarNota(dados, { agora: ++relogio * 1000, id: `n${relogio}` }),
  ...extra,
})

describe('normalizarTags', () => {
  it('separa por vírgula, remove # e espaços, deixa minúsculo e sem repetição', () => {
    expect(normalizarTags(' Estudo, #CI/CD, estudo, , ')).toEqual(['estudo', 'ci/cd'])
  })

  it('aceita uma lista', () => {
    expect(normalizarTags(['A', '#b'])).toEqual(['a', 'b'])
  })
})

describe('criarNota', () => {
  it('cria uma nota com valores padrão', () => {
    expect(criarNota({ titulo: '  Mercado ', conteudo: 'Comprar café' }, { agora: 10, id: 'x' })).toEqual({
      id: 'x',
      titulo: 'Mercado',
      conteudo: 'Comprar café',
      tags: [],
      cor: 'padrao',
      fixada: false,
      arquivada: false,
      criadaEm: 10,
      editadaEm: 10,
    })
  })

  it('exige título', () => {
    expect(() => criarNota({ titulo: '   ' })).toThrow('O título é obrigatório')
  })

  it('troca uma cor desconhecida pela padrão', () => {
    expect(criarNota({ titulo: 'A', cor: 'neon' }).cor).toBe('padrao')
  })
})

describe('notasReducer', () => {
  it('adiciona a nota nova no início', () => {
    const antes = [nota({ titulo: 'Antiga' })]
    const depois = notasReducer(antes, { tipo: 'adicionar', dados: { titulo: 'Nova' }, id: 'z', agora: 1 })
    expect(depois.map((n) => n.titulo)).toEqual(['Nova', 'Antiga'])
  })

  it('edita e atualiza a data de edição, sem mexer na de criação', () => {
    const n = nota({ titulo: 'Rascunho' })
    const [editada] = notasReducer([n], { tipo: 'editar', id: n.id, dados: { titulo: 'Final' }, agora: 99_999 })
    expect(editada).toMatchObject({ titulo: 'Final', criadaEm: n.criadaEm, editadaEm: 99_999 })
  })

  it('não deixa editar para um título vazio', () => {
    const n = nota({ titulo: 'A' })
    expect(() => notasReducer([n], { tipo: 'editar', id: n.id, dados: { titulo: '' } })).toThrow(
      'O título é obrigatório'
    )
  })

  it('remove e restaura (desfazer)', () => {
    const a = nota({ titulo: 'A' })
    const b = nota({ titulo: 'B' })
    const semA = notasReducer([a, b], { tipo: 'remover', id: a.id })
    expect(semA).toEqual([b])
    expect(notasReducer(semA, { tipo: 'restaurar', nota: a })).toEqual([a, b])
  })

  it('avisa quando a nota não existe', () => {
    expect(() => notasReducer([], { tipo: 'remover', id: 'nada' })).toThrow('Nota nada não encontrada')
  })

  it('arquivar desfixa a nota', () => {
    const n = nota({ titulo: 'A' }, { fixada: true })
    const [arquivada] = notasReducer([n], { tipo: 'arquivar', id: n.id })
    expect(arquivada).toMatchObject({ arquivada: true, fixada: false })
  })
})

describe('checklist', () => {
  const texto = 'Compras:\n- [ ] pão\n- [x] leite\n* [ ] café'

  it('conta o progresso', () => {
    expect(progressoChecklist(texto)).toEqual({ feitos: 1, total: 3 })
  })

  it('marca e desmarca itens pelo índice', () => {
    expect(alternarItem(texto, 0)).toBe('Compras:\n- [x] pão\n- [x] leite\n* [ ] café')
    expect(alternarItem(texto, 1)).toBe('Compras:\n- [ ] pão\n- [ ] leite\n* [ ] café')
  })
})

describe('filtrarNotas', () => {
  const notas = [
    nota({ titulo: 'Prova de ES', conteudo: 'Estudar CI/CD', tags: ['faculdade'] }),
    nota({ titulo: 'Mercado', conteudo: 'Comprar café', tags: ['casa'] }),
    nota({ titulo: 'Antiga', tags: ['casa'] }, { arquivada: true }),
    nota({ titulo: 'Importante' }, { fixada: true }),
  ]

  it('mostra fixadas primeiro e depois as editadas mais recentemente', () => {
    expect(filtrarNotas(notas).map((n) => n.titulo)).toEqual(['Importante', 'Mercado', 'Prova de ES'])
  })

  it('busca em título, conteúdo e tags, sem diferenciar maiúsculas', () => {
    expect(filtrarNotas(notas, { busca: 'ci/cd' }).map((n) => n.titulo)).toEqual(['Prova de ES'])
    expect(filtrarNotas(notas, { busca: 'MERCADO' }).map((n) => n.titulo)).toEqual(['Mercado'])
    expect(filtrarNotas(notas, { busca: 'faculdade' }).map((n) => n.titulo)).toEqual(['Prova de ES'])
  })

  it('filtra por tag e separa as arquivadas', () => {
    expect(filtrarNotas(notas, { tag: 'casa' }).map((n) => n.titulo)).toEqual(['Mercado'])
    expect(filtrarNotas(notas, { arquivadas: true }).map((n) => n.titulo)).toEqual(['Antiga'])
  })

  it('ordena por título', () => {
    expect(filtrarNotas(notas, { ordem: 'titulo' }).map((n) => n.titulo)).toEqual([
      'Importante',
      'Mercado',
      'Prova de ES',
    ])
  })

  it('conta tags e estatísticas ignorando arquivadas', () => {
    expect(contarTags(notas)).toEqual([
      { tag: 'casa', total: 1 },
      { tag: 'faculdade', total: 1 },
    ])
    expect(estatisticas(notas)).toMatchObject({ total: 4, ativas: 3, arquivadas: 1, fixadas: 1 })
  })
})

describe('persistência', () => {
  it('retorna null na primeira visita', () => {
    expect(carregarNotas(storageFalso())).toBeNull()
  })

  it('mantém as notas ao recarregar a página', () => {
    const storage = storageFalso()
    salvarNotas(storage, [nota({ titulo: 'Persistente' })])
    expect(carregarNotas(storage)[0].titulo).toBe('Persistente')
  })

  it('migra as notas da versão antiga (sem React)', () => {
    const v1 = JSON.stringify([{ id: 1, titulo: 'Velha', conteudo: 'oi' }])
    const [migrada] = carregarNotas(storageFalso({ 'bloco-de-notas': v1 }))
    expect(migrada).toMatchObject({ id: 'v1-1', titulo: 'Velha', conteudo: 'oi', tags: [] })
    expect(CHAVE).toBe('bloco-de-notas:v2')
  })

  it('importa notas sem duplicar ids existentes', () => {
    const existente = nota({ titulo: 'Já tenho' })
    const resultado = importarNotas([{ ...existente }, { id: 'nova', titulo: 'Nova' }], [existente])
    expect(resultado.map((n) => n.titulo)).toEqual(['Nova', 'Já tenho'])
  })

  it('recusa arquivo de importação inválido', () => {
    expect(() => importarNotas({})).toThrow('esperado uma lista')
    expect(() => importarNotas([{ titulo: '' }])).toThrow('Nota 1 do arquivo: O título é obrigatório')
  })
})
