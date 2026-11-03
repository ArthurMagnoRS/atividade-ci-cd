# Atividade: CI/CD com GitHub Actions e GitHub Pages

Este repositório contém um **Bloco de Notas** em React + Vite, já pronto e com 29 testes automatizados. O que falta é o pipeline. Sua tarefa é criar **dois workflows** do **GitHub Actions**, cada um em seu arquivo:

- **CI (integração contínua), em `ci.yml`:** a cada push e a cada pull request, instala as dependências e roda os testes;
- **CD (deploy contínuo), em `cd.yml`:** a cada push na `main`, roda os testes e, se passarem, gera a build de produção e publica o site no **GitHub Pages**.

Se um teste falhar, **nada pode ser publicado**: a versão anterior continua no ar.

---

## 1. Preparação

1. Faça um **fork** deste repositório para a sua conta.
2. Em **Settings › Pages › Build and deployment › Source**, escolha **GitHub Actions**.
3. Clone o seu fork e confira que o projeto funciona na sua máquina:

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
npm ci          # instala as dependências exatamente como no package-lock.json
npm test        # deve mostrar 29 testes passando
npm run build   # gera a pasta dist/
```

Requer Node.js 20 ou mais recente.

## 2. O que você deve fazer

Crie **dois arquivos** na pasta `.github/workflows/`, atendendo a todos os requisitos abaixo:

| Arquivo | Workflow | Responsabilidade |
| --- | --- | --- |
| `.github/workflows/ci.yml` | `CI` | Instalar dependências e rodar os testes |
| `.github/workflows/cd.yml` | `CD` | Testar, gerar a build e publicar no GitHub Pages |

### Requisitos do CI (`ci.yml`)

- [ ] O workflow se chama `CI`.
- [ ] Roda em `push`.
- [ ] Roda em `pull_request`.
- [ ] Tem um job `testes` que roda em `ubuntu-latest` e:
  - [ ] faz checkout do código (`actions/checkout`);
  - [ ] configura o Node.js **22** (`actions/setup-node`, o equivalente ao `setup-python` da aula);
  - [ ] instala as dependências com `npm ci`;
  - [ ] executa `npm test`.

### Requisitos do CD (`cd.yml`)

- [ ] O workflow se chama `CD`.
- [ ] Roda apenas em `push` para a branch `main`.
- [ ] Declara as permissões necessárias para publicar no Pages (`permissions`).
- [ ] Tem **dois jobs**:
  - [ ] `testes`: os mesmos passos do job do CI (checkout, Node.js 22, `npm ci`, `npm test`);
  - [ ] `build-e-deploy`: só começa se `testes` passar e:
    - [ ] faz checkout, configura o Node.js 22 e instala as dependências com `npm ci`;
    - [ ] gera a build com `npm run build`;
    - [ ] publica a pasta `dist/` no GitHub Pages, com `actions/configure-pages`, `actions/upload-pages-artifact` e `actions/deploy-pages`.
- [ ] O job `build-e-deploy` usa o ambiente (`environment`) `github-pages`, exibindo a URL do site no resumo da execução.

### Dicas

- Um job depende de outro com `needs:`.
- Cada job roda numa máquina nova e vazia: o job `build-e-deploy` também precisa fazer checkout e `npm ci` antes do build.
- Leia os logs de cada passo na aba **Actions**. A mensagem de erro quase sempre diz o que está faltando.
- Erro de permissão no deploy? Revise o bloco `permissions` (`contents: read`, `pages: write`, `id-token: write`) e o passo 2 da preparação.
- YAML usa indentação com espaços, nunca com tab.

### Material de apoio

- [Sintaxe de workflows do GitHub Actions](https://docs.github.com/pt/actions/writing-workflows/workflow-syntax-for-github-actions)
- [Criando um workflow personalizado para o GitHub Pages](https://docs.github.com/pt/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Deploy de um site Vite no GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)

## Sobre o app

### Funcionalidades

- Criar, editar, excluir (com **desfazer**), fixar e arquivar notas
- **Tags** com filtro na barra lateral e **cores** por nota
- **Checklists**: linhas `- [ ] tarefa` viram caixas clicáveis, com barra de progresso
- Busca por título, conteúdo ou tag, e três ordenações
- Tema claro/escuro, layout responsivo, atalhos (`N`, `/`, `Esc`, `Ctrl+Enter`)
- Página **Dados** com resumo das notas e exportar/importar em JSON; tudo salvo no `localStorage`

### Comandos

| Comando | O que faz |
| --- | --- |
| `npm ci` | Instala as dependências exatamente como no `package-lock.json` |
| `npm run dev` | Servidor de desenvolvimento em `http://localhost:5173` |
| `npm test` | Roda os 29 testes (Vitest + Testing Library) |
| `npm run build` | Gera a build de produção em `dist/` |
| `npm run preview` | Serve a pasta `dist/` localmente, para conferir |

### Estrutura

```
├── .github/workflows/ci.yml      ← VOCÊ CRIA: npm ci → npm test
├── .github/workflows/cd.yml      ← VOCÊ CRIA: testes → build e deploy no GitHub Pages
├── index.html                    ← página única; o React monta em #root
├── vite.config.js                ← base './', plugin React, config de testes
├── src/
│   ├── lib/notas.js              ← lógica pura: reducer, filtros, checklist, persistência
│   ├── hooks/                    ← useNotas, useHashRoute, useTema, useAtalhos
│   ├── components/               ← BarraLateral, NotaCard, Editor, Toast, Dados, ...
│   └── App.jsx
└── tests/
    ├── notas.test.js             ← testes da lógica (sem navegador)
    └── App.test.jsx              ← testes de interface (simulam o usuário)
```