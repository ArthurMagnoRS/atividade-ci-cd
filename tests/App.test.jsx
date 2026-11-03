import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'

// Testes de interface: simulam o usuário clicando e digitando, como no navegador.
describe('App', () => {
  beforeEach(() => {
    window.localStorage.setItem('bloco-de-notas:v2', '[]') // começa sem as notas de exemplo
  })

  async function criarNota(user, titulo, extras = {}) {
    await user.click(screen.getByRole('button', { name: /nova nota/i }))
    const dialogo = screen.getByRole('dialog')
    await user.type(within(dialogo).getByLabelText('Título'), titulo)
    if (extras.conteudo) await user.type(within(dialogo).getByLabelText(/conteúdo/i), extras.conteudo)
    if (extras.tags) await user.type(within(dialogo).getByLabelText(/tags/i), extras.tags)
    await user.click(within(dialogo).getByRole('button', { name: 'Adicionar nota' }))
  }

  it('mostra as notas de exemplo na primeira visita', () => {
    window.localStorage.clear()
    render(<App />)
    expect(screen.getByText(/Bem-vindo/)).toBeInTheDocument()
  })

  it('cria uma nota e a mantém após recarregar', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await criarNota(user, 'Estudar React', { conteudo: 'hooks e estado' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Estudar React')).toBeInTheDocument()

    unmount()
    render(<App />)
    expect(screen.getByText('Estudar React')).toBeInTheDocument()
  })

  it('exibe erro quando o título está vazio', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /nova nota/i }))
    await user.click(screen.getByRole('button', { name: 'Adicionar nota' }))
    expect(screen.getByRole('alert')).toHaveTextContent('O título é obrigatório')
  })

  it('busca notas pelo texto', async () => {
    const user = userEvent.setup()
    render(<App />)
    await criarNota(user, 'Mercado')
    await criarNota(user, 'Prova de ES')

    await user.type(screen.getByLabelText('Buscar notas'), 'merc')
    expect(screen.getByText('Mercado')).toBeInTheDocument()
    expect(screen.queryByText('Prova de ES')).not.toBeInTheDocument()
  })

  it('exclui uma nota e permite desfazer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await criarNota(user, 'Temporária')

    await user.click(screen.getByRole('button', { name: 'Excluir Temporária' }))
    expect(screen.queryByText('Temporária')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desfazer' }))
    expect(screen.getByText('Temporária')).toBeInTheDocument()
  })

  it('filtra por tag ao clicar nela', async () => {
    const user = userEvent.setup()
    render(<App />)
    await criarNota(user, 'Com tag', { tags: 'aula' })
    await criarNota(user, 'Sem tag')

    await user.click(screen.getByRole('button', { name: '#aula' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('#aula')
    expect(screen.queryByText('Sem tag')).not.toBeInTheDocument()
  })
})
