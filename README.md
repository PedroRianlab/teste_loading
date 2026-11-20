# Central de Solicitações

Monorepositório npm com Next.js, API NestJS e PostgreSQL. Os requisitos estão em [docs/Loading_Full_Stack.pdf](docs/Loading_Full_Stack.pdf).

## Estrutura

- `front-end/src/app`: rotas; `front-end/src/features`: funcionalidades; `front-end/src/ui`: componentes compartilhados.
- `back-end/src/modules`: módulos da API, com controller, service e repository para módulos que persistem dados.
- `back-end/prisma`: esquema do banco e futuras migrações.
- `compose.yaml`: PostgreSQL para desenvolvimento.

A API oferece `GET /`, que retorna `{"status":"ok"}` sem verificar o banco. Os requisitos funcionais do documento ainda não estão implementados.

## Desenvolvimento

Requisitos: Node.js 20.9 ou superior, npm e Docker com Docker Compose.

1. Copie `.env.example` para `.env` na raiz e `back-end/.env.example` para `back-end/.env`. Os valores são apenas para desenvolvimento local.
2. Execute `npm install` na raiz.
3. Inicie o banco com `npm run db:up`.
4. Gere o cliente Prisma com `npm run prisma:generate`. Após adicionar modelos, crie uma migração com `npm run prisma:migrate`.
5. Em terminais separados, execute `npm run dev:api` e `npm run dev:web`.

A API responde em http://localhost:3000 e o front-end em http://localhost:3001. O PostgreSQL fica em localhost:5432. Execute `npm run build` para compilar os dois projetos e `npm run lint -w @cofre/web` para verificar o front-end.

`npm run db:down` para o contêiner sem remover o volume de dados. Alterações nas credenciais iniciais do PostgreSQL não alteram um volume já inicializado.

Este projeto contou com auxílio de inteligência artificial na organização inicial e documentação.

