CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');
CREATE TYPE "StatusSolicitacao" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA');
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "prioridade" "Prioridade" NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'ABERTA',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);
