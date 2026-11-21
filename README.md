# Central de Solicitações

Monorepositório npm com Next.js, API NestJS e PostgreSQL. Os requisitos estão em [docs/Loading_Full_Stack.pdf](docs/Loading_Full_Stack.pdf).

## Estrutura

- `front-end/src/app`: rotas; `front-end/src/features`: funcionalidades; `front-end/src/ui`: componentes compartilhados.
- `back-end/src/modules`: módulos da API, com controller, service e repository para módulos que persistem dados.
- `back-end/prisma`: esquema do banco e futuras migrações.
- `compose.yaml`: PostgreSQL para desenvolvimento.

A API oferece `GET /`, que retorna `{"status":"ok"}` sem verificar o banco.

## Desenvolvimento

Requisitos: Node.js 20.9 ou superior, npm e Docker com Docker Compose.

1. Copie `.env.example` para `.env` na raiz e `back-end/.env.example` para `back-end/.env`. Os valores são apenas para desenvolvimento local.
2. Execute `npm install` na raiz.
3. Inicie o banco com `npm run db:up`.
4. Gere o cliente Prisma com `npm run prisma:generate` e aplique as migrações com `npm run prisma:migrate`.
5. Em terminais separados, execute `npm run dev:api` e `npm run dev:web`.

A API responde em http://localhost:3000 e o front-end em http://localhost:3001. O PostgreSQL fica em localhost:5432. Execute `npm run build` para compilar os dois projetos e `npm run lint -w @cofre/web` para verificar o front-end.

Abra [a tela de login](http://localhost:3001/login) e selecione **Criar uma conta** para começar. Após entrar, use a listagem para buscar, filtrar ou ordenar solicitações. O detalhe exibe o histórico e permite editar, excluir ou avançar o status. Se a API usar outro endereço, configure `NEXT_PUBLIC_API_URL` em `front-end/.env.local` com base no exemplo.

`npm run db:down` para o contêiner sem remover o volume de dados. Alterações nas credenciais iniciais do PostgreSQL não alteram um volume já inicializado.

Este projeto contou com auxílio de inteligência artificial na organização inicial e documentação.


## API de solicitações

Com a API rodando, abra [Swagger UI](http://localhost:3000/docs) para explorar e executar as rotas. A especificação OpenAPI está em [JSON](http://localhost:3000/docs-json). Para testar as solicitações, execute `POST /auth/login` e cole o token em **Authorize**.

A API implementa cadastro, listagem, consulta, edição, exclusão e avanço de status. Aplique as migrações antes de iniciar a API. Dentro de `back-end`, `npx prisma migrate deploy` aplica as migrações existentes sem criar novas.

| Método e rota | Operação |
| --- | --- |
| `POST /solicitacoes` | Cria uma solicitação com status `ABERTA`. |
| `POST /auth/login` | Recebe `usuario` e `senha` e retorna um token válido por uma hora. |
| `POST /auth/registro` | Cria uma conta local com nome de usuário ou e-mail no campo `usuario`, além da `senha`. |
| `GET /solicitacoes` | Lista solicitações com filtros, busca textual e ordenação. |
| `GET /solicitacoes/:id` | Consulta a solicitação e seu histórico de mudanças de status. |
| `PATCH /solicitacoes/:id` | Altera um ou mais campos do cadastro. |
| `PATCH /solicitacoes/:id/status` | Avança o status, enviando `{"status":"EM_ANDAMENTO"}` ou `{"status":"CONCLUIDA"}`. |
| `DELETE /solicitacoes/:id` | Exclui e retorna HTTP 204. |

Exemplo de corpo para criação:

```json
{
  "titulo": "Acesso à impressora",
  "descricao": "Preciso de acesso à impressora do setor.",
  "categoria": "Infraestrutura",
  "prioridade": "MEDIA"
}
```

O registro salva o usuário no PostgreSQL com um hash da senha. A conta de ambiente, se configurada por `AUTH_USUARIO` e `AUTH_SENHA` em `back-end/.env`, continua disponível. Todas as contas autenticadas têm acesso às mesmas solicitações. Envie o token no cabeçalho `Authorization: Bearer <token>` para acessar essas rotas diretamente. Reiniciar a API invalida os tokens emitidos.

A listagem aceita `status`, `prioridade` e `busca` juntos. A busca encontra trechos do título ou da descrição sem distinguir maiúsculas de minúsculas. Use `ordenarPor=criadaEm|prioridade|titulo` e `ordem=asc|desc`. O padrão é data de criação decrescente. O histórico registra as transições feitas após a migração e é removido junto com a solicitação.

Os campos textuais são obrigatórios e não podem conter apenas espaços. Prioridades: `BAIXA`, `MEDIA`, `ALTA`. Status: `ABERTA`, `EM_ANDAMENTO`, `CONCLUIDA`; só é permitido avançar nessa ordem. Erros de entrada retornam HTTP 400, solicitações inexistentes retornam 404 e alterações simultâneas de status podem retornar 409. O CORS aceita por padrão `http://localhost:3001`; altere `FRONTEND_ORIGIN` na configuração da API se necessário.

`npm test -w @cofre/api` compila a API e executa os testes das regras de solicitações (após gerar o cliente Prisma).
