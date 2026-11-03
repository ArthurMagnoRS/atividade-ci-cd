// Lógica do bloco de notas em funções puras: nada aqui depende do React nem do navegador.
// Por isso é fácil de testar (veja tests/notas.test.js).

export const CORES = ['padrao', 'amarelo', 'verde', 'azul', 'roxo', 'rosa']

export const ORDENS = {
  recentes: 'Editadas recentemente',
  antigas: 'Mais antigas',
  titulo: 'Título (A–Z)',
}

const gerarIdPadrao = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

/** "Estudo, #CI/CD, estudo" → ["estudo", "ci/cd"] */
export function normalizarTags(entrada) {
  const lista = Array.isArray(entrada) ? entrada : String(entrada ?? '').split(',')
  const tags = lista
    .map((t) => String(t).trim().replace(/^#+/, '').toLowerCase())
    .filter(Boolean)
  return [...new Set(tags)]
}

export function validarNota({ titulo, conteudo = '', tags = [], cor = 'padrao' } = {}) {
  const t = String(titulo ?? '').trim()
  if (!t) throw new Error('O título é obrigatório')
  if (t.length > 120) throw new Error('O título pode ter no máximo 120 caracteres')
  return {
    titulo: t,
    conteudo: String(conteudo ?? '').trim(),
    tags: normalizarTags(tags),
    cor: CORES.includes(cor) ? cor : 'padrao',
  }
}

export function criarNota(dados, { agora = Date.now(), id = gerarIdPadrao() } = {}) {
  return {
    id,
    ...validarNota(dados),
    fixada: false,
    arquivada: false,
    criadaEm: agora,
    editadaEm: agora,
  }
}

// ---------- Checklist: linhas "- [ ] tarefa" e "- [x] feita" ----------

const ITEM = /^(\s*[-*]\s+\[)([ xX])(\]\s?)(.*)$/

/** Divide o conteúdo em blocos de texto e itens de checklist, para renderizar. */
export function interpretarConteudo(conteudo) {
  let indice = 0
  return String(conteudo ?? '')
    .split('\n')
    .map((linha) => {
      const m = linha.match(ITEM)
      if (!m) return { tipo: 'texto', texto: linha }
      return { tipo: 'item', indice: indice++, feito: m[2].toLowerCase() === 'x', texto: m[4] }
    })
}

export function progressoChecklist(conteudo) {
  const itens = interpretarConteudo(conteudo).filter((b) => b.tipo === 'item')
  return { feitos: itens.filter((i) => i.feito).length, total: itens.length }
}

/** Marca/desmarca o n-ésimo item de checklist do conteúdo. */
export function alternarItem(conteudo, alvo) {
  let indice = 0
  return String(conteudo ?? '')
    .split('\n')
    .map((linha) => {
      const m = linha.match(ITEM)
      if (!m) return linha
      if (indice++ !== alvo) return linha
      const marcado = m[2].toLowerCase() === 'x'
      return `${m[1]}${marcado ? ' ' : 'x'}${m[3]}${m[4]}`
    })
    .join('\n')
}

// ---------- Reducer: todas as mudanças de estado passam por aqui ----------

export function notasReducer(notas, acao) {
  const agora = acao.agora ?? Date.now()
  const atualizar = (id, fn) => {
    if (!notas.some((n) => n.id === id)) throw new Error(`Nota ${id} não encontrada`)
    return notas.map((n) => (n.id === id ? fn(n) : n))
  }

  switch (acao.tipo) {
    case 'adicionar':
      return [criarNota(acao.dados, { agora, id: acao.id }), ...notas]
    case 'editar':
      return atualizar(acao.id, (n) => ({ ...n, ...validarNota(acao.dados), editadaEm: agora }))
    case 'remover':
      atualizar(acao.id, (n) => n)
      return notas.filter((n) => n.id !== acao.id)
    case 'restaurar':
      return notas.some((n) => n.id === acao.nota.id) ? notas : [acao.nota, ...notas]
    case 'fixar':
      return atualizar(acao.id, (n) => ({ ...n, fixada: !n.fixada }))
    case 'arquivar':
      return atualizar(acao.id, (n) => ({ ...n, arquivada: !n.arquivada, fixada: false }))
    case 'alternarItem':
      return atualizar(acao.id, (n) => ({
        ...n,
        conteudo: alternarItem(n.conteudo, acao.indice),
        editadaEm: agora,
      }))
    case 'sincronizar':
      return Array.isArray(acao.notas) ? acao.notas : notas
    case 'importar':
      return importarNotas(acao.notas, notas)
    default:
      throw new Error(`Ação desconhecida: ${acao.tipo}`)
  }
}

// ---------- Consultas ----------

export function filtrarNotas(notas, { busca = '', tag = null, arquivadas = false, ordem = 'recentes' } = {}) {
  const termo = busca.trim().toLowerCase()
  const resultado = notas.filter((n) => {
    if (n.arquivada !== arquivadas) return false
    if (tag && !n.tags.includes(tag)) return false
    if (!termo) return true
    return [n.titulo, n.conteudo, ...n.tags].some((campo) => campo.toLowerCase().includes(termo))
  })

  const comparar = {
    recentes: (a, b) => b.editadaEm - a.editadaEm,
    antigas: (a, b) => a.criadaEm - b.criadaEm,
    titulo: (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'),
  }[ordem] ?? (() => 0)

  // Fixadas sempre primeiro; dentro de cada grupo, a ordem escolhida.
  return resultado.sort((a, b) => Number(b.fixada) - Number(a.fixada) || comparar(a, b))
}

/** [{ tag: 'estudo', total: 3 }, ...] das notas não arquivadas, mais usadas primeiro. */
export function contarTags(notas) {
  const contagem = new Map()
  for (const n of notas) {
    if (n.arquivada) continue
    for (const t of n.tags) contagem.set(t, (contagem.get(t) ?? 0) + 1)
  }
  return [...contagem]
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))
}

export function estatisticas(notas) {
  const ativas = notas.filter((n) => !n.arquivada)
  const tarefas = ativas.reduce(
    (acc, n) => {
      const p = progressoChecklist(n.conteudo)
      return { feitos: acc.feitos + p.feitos, total: acc.total + p.total }
    },
    { feitos: 0, total: 0 }
  )
  return {
    total: notas.length,
    ativas: ativas.length,
    arquivadas: notas.length - ativas.length,
    fixadas: ativas.filter((n) => n.fixada).length,
    tarefas,
  }
}

// ---------- Importar / exportar ----------

export function importarNotas(entrada, existentes = []) {
  if (!Array.isArray(entrada)) throw new Error('Arquivo inválido: esperado uma lista de notas')
  const ids = new Set(existentes.map((n) => n.id))
  const novas = entrada.map((bruta, i) => {
    try {
      const agora = Number(bruta.editadaEm) || Date.now()
      const nota = criarNota(bruta, { agora, id: bruta.id != null ? String(bruta.id) : undefined })
      return {
        ...nota,
        criadaEm: Number(bruta.criadaEm) || agora,
        fixada: Boolean(bruta.fixada),
        arquivada: Boolean(bruta.arquivada),
      }
    } catch (e) {
      throw new Error(`Nota ${i + 1} do arquivo: ${e.message}`)
    }
  })
  return [...novas.filter((n) => !ids.has(n.id)), ...existentes]
}

// ---------- Persistência ----------

export const CHAVE = 'bloco-de-notas:v2'
const CHAVE_V1 = 'bloco-de-notas' // formato da versão sem React

/** Lê as notas do storage. Retorna null se nunca houve nada salvo. */
export function carregarNotas(storage) {
  const v2 = storage.getItem(CHAVE)
  if (v2 !== null) return JSON.parse(v2)

  // Migração: aproveita as notas salvas pela versão antiga (id numérico, sem tags).
  const v1 = storage.getItem(CHAVE_V1)
  if (v1 !== null) return importarNotas(JSON.parse(v1).map((n) => ({ ...n, id: `v1-${n.id}` })))

  return null
}

export function salvarNotas(storage, notas) {
  storage.setItem(CHAVE, JSON.stringify(notas))
}
