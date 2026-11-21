# Central de Solicitações

Aplicação para registrar e acompanhar solicitações internas, da abertura à conclusão. A interface permite cadastrar, consultar, buscar, filtrar e editar solicitações, além de acompanhar o histórico de status.

## Executando localmente

### Pré-requisitos

- Node.js 20.11 ou superior.
- npm e Git.
- Docker Desktop ou Docker Engine com Docker Compose.

O PostgreSQL roda no Docker. A API NestJS e o frontend Next.js rodam diretamente na máquina.

### 1. Clonar e configurar

No PowerShell:

```powershell
git clone https://github.com/PedroRianlab/teste_loading.git
Set-Location teste_loading
```

Se estiver avaliando o PR antes do merge, execute `git switch fix/revisao-frontend-backend`.

Copie os arquivos de configuração na primeira execução:

```powershell
Copy-Item .env.example .env
Copy-Item back-end/.env.example back-end/.env
```

Os exemplos já funcionam no ambiente local. Se mudar as credenciais ou a porta do banco no `.env` da raiz, atualize também a `DATABASE_URL` em `back-end/.env`.

### 2. Instalar as dependências e preparar o banco

Na raiz do repositório, com o Docker iniciado:

```powershell
npm.cmd install
npm.cmd run db:up
npm.cmd run prisma:generate

Push-Location back-end
npx.cmd prisma migrate deploy
Pop-Location
```

O `npm install` instala as dependências do backend e do frontend. O PostgreSQL fica disponível em `localhost:5432`. Para parar o banco preservando os dados, execute `npm.cmd run db:down` na raiz.

### 3. Iniciar a API e o frontend

Abra dois terminais na raiz do projeto:

```powershell
# Terminal 1
npm.cmd run dev:api
```

```powershell
# Terminal 2
npm.cmd run dev:web
```

| Serviço | Endereço |
| --- | --- |
| Interface | [http://localhost:3001/login](http://localhost:3001/login) |
| API | [http://localhost:3000](http://localhost:3000) |
| Swagger | [http://localhost:3000/docs](http://localhost:3000/docs) |
| OpenAPI em JSON | [http://localhost:3000/docs-json](http://localhost:3000/docs-json) |

### 4. Testar o fluxo

1. Abra a interface e clique em **Criar uma conta**. Use um nome de usuário ou e-mail e uma senha de pelo menos oito caracteres.
2. Entre e cadastre uma solicitação com título, descrição, categoria e prioridade. Ela começa como **Aberta**.
3. Abra o detalhe, clique em **Iniciar atendimento** e depois em **Concluir solicitação**. Confira as duas mudanças no histórico.

### Variáveis de ambiente

| Arquivo | Variável | Finalidade |
| --- | --- | --- |
| `.env` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Configuração do PostgreSQL no Docker. A porta padrão é `5432`. |
| `back-end/.env` | `DATABASE_URL` | Conexão do Prisma com o banco. |
| `back-end/.env` | `PORT`, `API_HOST` | Porta e endereço da API. Os padrões são `3000` e `127.0.0.1`. |
| `back-end/.env` | `FRONTEND_ORIGIN` | Origem aceita pelo CORS. O padrão é `http://localhost:3001`. |
| `back-end/.env` | `AUTH_REGISTRO_ABERTO` | Use `true` para habilitar o cadastro. O exemplo local já o habilita. |
| `back-end/.env` | `AUTH_USUARIO`, `AUTH_SENHA` | Credenciais de uma conta opcional definida no ambiente. |
| `front-end/.env.local` | `NEXT_PUBLIC_API_URL` | Endereço da API usado pela interface. Configure se precisar mudar o padrão `http://localhost:3000`. |

## O que está pronto

### Solicitações

- Cadastro, listagem, detalhe, edição e exclusão com confirmação.
- Busca por trecho do título ou da descrição, sem diferenciar maiúsculas de minúsculas.
- Filtros combináveis por status e prioridade. Ordenação por data de criação, prioridade ou título.
- Fluxo **Aberta → Em andamento → Concluída**, validado pela API. O status só muda pela rota de transição.
- Histórico com data, status anterior e novo status. A transição e a entrada no histórico são gravadas na mesma transação.

### Autenticação e interface

- Login e registro na mesma tela, com nome de usuário ou e-mail.
- Senhas protegidas com hash scrypt e sal aleatório. As rotas de solicitações exigem token Bearer.
- Quando a sessão expira, a interface pede login com a mesma conta e preserva o rascunho do formulário enquanto a página estiver aberta.
- Interface responsiva com estados de carregamento, erro e lista vazia. Cadastro e edição reutilizam o mesmo formulário.

Os requisitos originais estão no [documento do desafio](docs/Loading_Full_Stack.pdf).

## Como o projeto funciona

O frontend Next.js envia o token no cabeçalho `Authorization`. Na API NestJS, o controller recebe a requisição, o service aplica as regras de negócio e o repository acessa o PostgreSQL por meio do Prisma. Três migrações versionadas criam as tabelas de solicitações, histórico e contas.

| Área | Tecnologias |
| --- | --- |
| Frontend | Next.js 16 com App Router, React 19, TypeScript e CSS |
| Backend | NestJS 11, TypeScript, Swagger e Throttler |
| Persistência | PostgreSQL 16 e Prisma 6 |
| Ambiente local | npm workspaces e Docker Compose |
| Testes da API | `node:test` |

## API

| Método | Rota | Acesso | Operação |
| --- | --- | --- | --- |
| `GET` | `/` | Público | Verifica se a API responde, sem consultar o banco. |
| `POST` | `/auth/registro` | Público quando habilitado | Cria uma conta. |
| `POST` | `/auth/login` | Público | Autentica e retorna o token. |
| `GET` | `/solicitacoes` | Bearer | Lista com busca, filtros e ordenação. |
| `POST` | `/solicitacoes` | Bearer | Cria uma solicitação com status `ABERTA`. |
| `GET` | `/solicitacoes/:id` | Bearer | Retorna a solicitação e o histórico. |
| `PATCH` | `/solicitacoes/:id` | Bearer | Edita os campos de cadastro. |
| `PATCH` | `/solicitacoes/:id/status` | Bearer | Avança o status em uma etapa. |
| `DELETE` | `/solicitacoes/:id` | Bearer | Exclui a solicitação e o histórico. Retorna HTTP 204. |

A listagem aceita `busca`, `status`, `prioridade`, `ordenarPor` e `ordem`. Por exemplo, `GET /solicitacoes?status=ABERTA&prioridade=ALTA&ordenarPor=criadaEm&ordem=desc`.

As prioridades são `BAIXA`, `MEDIA` e `ALTA`. Os status são `ABERTA`, `EM_ANDAMENTO` e `CONCLUIDA`.

### Teste manual pelo Swagger

1. Abra `http://localhost:3000/docs` e faça login em `POST /auth/login`.
2. Copie o campo `token` da resposta e cole seu valor em **Authorize**.
3. Use as rotas de solicitações para testar cadastro, filtros e transições de status.

## Segurança e decisões

- Todas as contas autenticadas acessam a mesma central. O projeto tem um único nível de acesso.
- O token fica no `sessionStorage` da aba e expira em uma hora. Sair remove o token localmente. Reiniciar a API invalida os tokens emitidos.
- A API escuta na máquina local por padrão. O cadastro público exige configuração explícita. Quando desabilitado, retorna HTTP 403.
- As rotas de autenticação têm limites separados por IP de 10 tentativas de login e 5 de cadastro por minuto. O excesso retorna HTTP 429. Os contadores ficam em memória por instância.
- O e-mail é usado como identificador de acesso, sem verificação da caixa postal. O histórico registra mudanças feitas após a migração e é excluído junto com a solicitação.

## Testes e qualidade

Na raiz, após gerar o cliente Prisma:

```powershell
npm.cmd test -w ./back-end
npm.cmd run lint -w ./front-end
npm.cmd run build
```

Os testes da API cobrem validação de campos, filtros e transições de status. No navegador foram conferidos registro, login, CRUD e recuperação do rascunho após expiração da sessão. A persistência foi verificada após reiniciar o PostgreSQL.

## Estrutura do repositório

```text
teste_loading/
├── back-end/
│   ├── prisma/          # Esquema e migrações
│   ├── src/modules/     # Autenticação, solicitações e saúde
│   └── test/            # Testes da API
├── front-end/
│   └── src/
│       ├── app/         # Rotas do App Router
│       ├── features/    # Autenticação e solicitações
│       ├── lib/         # Cliente HTTP
│       └── ui/          # Componentes compartilhados
├── docs/               # Documento do desafio
├── compose.yaml        # PostgreSQL local
└── README.md
```
