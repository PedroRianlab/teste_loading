'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { encerrarSessao, useToken, useUsuario } from '../sessao';
import { Login } from './login';

export function AreaProtegida({ children }: { children: React.ReactNode }) {
  const token = useToken();
  const usuario = useUsuario();
  const usuarioExpirado = token === null ? usuario : null;
  const router = useRouter();
  useEffect(() => {
    if (token === null && !usuarioExpirado) router.replace('/login');
  }, [token, usuarioExpirado, router]);

  if (!token && !usuarioExpirado) return <main className="shell" role="status">Carregando sessão…</main>;

  return <>
    <div hidden={Boolean(usuarioExpirado)}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/solicitacoes">Central de Solicitações</Link>
          <button className="button" onClick={encerrarSessao}>Sair</button>
        </div>
      </header>
      <main className="shell page-enter">{children}</main>
    </div>
    {usuarioExpirado && <Login usuarioExpirado={usuarioExpirado} />}
  </>;
}
