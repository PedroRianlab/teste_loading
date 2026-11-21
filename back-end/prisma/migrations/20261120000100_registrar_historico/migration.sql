CREATE TABLE "MudancaStatus" (
    "id" SERIAL PRIMARY KEY,
    "solicitacaoId" TEXT NOT NULL,
    "anterior" "StatusSolicitacao" NOT NULL,
    "novo" "StatusSolicitacao" NOT NULL,
    "alteradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MudancaStatus_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MudancaStatus_solicitacaoId_idx" ON "MudancaStatus"("solicitacaoId");
