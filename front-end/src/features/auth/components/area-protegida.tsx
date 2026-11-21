'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { lerToken, observarSessao, salvarToken } from '../sessao';

export function AreaProtegida({ children }: { children: React.ReactNode }) {
  const token = useSyncExternalStore<string | null | undefined>(observarSessao, lerToken, () => undefined);
  const router = useRouter();
  useEffect(() => {
    if (token === null) router.replace('/login');
  }, [token, router]);

  if (!token) return <main className="shell" role="status">Carregando sessão…</main>;

  return <>
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/solicitacoes">Central de Solicitações</Link>
        <button className="button" onClick={() => salvarToken(null)}>Sair</button>
      </div>
    </header>
    <main className="shell page-enter">{children}</main>
  </>;
}
