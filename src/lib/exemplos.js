// Notas criadas na primeira visita, para o site não abrir vazio na demonstração.
export function notasDeExemplo(agora = Date.now()) {
  const min = 60_000
  return [
    {
      titulo: 'Bem-vindo(a) ao Bloco de Notas',
      conteudo:
        'Tudo fica salvo no localStorage do seu navegador: não há servidor.\n\n' +
        'Atalhos: N cria uma nota, / foca a busca, Esc fecha o editor e Ctrl+Enter salva.',
      tags: ['dicas'],
      cor: 'amarelo',
      fixada: true,
      editadaEm: agora,
    },
    {
      titulo: 'Mercado da semana',
      conteudo:
        '- [x] Café\n- [x] Pão integral\n- [ ] Frutas\n- [ ] Detergente\n\n' +
        'Clique nos itens para marcar. Linhas no formato "- [ ] tarefa" viram checklist.',
      tags: ['casa'],
      cor: 'verde',
      editadaEm: agora - 5 * min,
    },
    {
      titulo: 'Livros para ler',
      conteudo:
        'O Programador Pragmático\nCódigo Limpo\nEntendendo Algoritmos\n\n' +
        'Use tags para agrupar notas parecidas e filtre clicando nelas na barra lateral.',
      tags: ['leitura', 'pessoal'],
      cor: 'azul',
      editadaEm: agora - 30 * min,
    },
  ].map((n, i) => ({ fixada: false, arquivada: false, ...n, id: `exemplo-${i + 1}`, criadaEm: n.editadaEm }))
}
