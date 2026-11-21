'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { Aviso } from '@/ui/aviso';
import { encerrarSessao, iniciarSessao } from '../sessao';

export function Login({ usuarioExpirado }: { usuarioExpirado?: string }) {
  const router = useRouter();
  const [registro, setRegistro] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [usuario, setUsuario] = useState(usuarioExpirado ?? '');

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const senha = new FormData(form).get('senha');
    setErro('');
    setSucesso('');
    setOcupado(true);
    try {
      const dados = { usuario, senha };
      if (registro) {
        await api('/auth/registro', { metodo: 'POST', dados, publico: true });
        form.reset();
        setRegistro(false);
        setSucesso('Conta criada. Entre com sua senha.');
      } else {
        const { token } = await api<{ token: string }>('/auth/login', { metodo: 'POST', dados, publico: true });
        iniciarSessao(token, usuario);
        if (!usuarioExpirado) router.replace('/solicitacoes');
      }
    } catch (erro) {
      setErro((erro as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  return <main className="auth page-enter">
    <div className="auth-content">
      <h1>Central de Solicitações</h1>
      <p className="muted">Abra e acompanhe as solicitações da sua equipe.</p>
      <section className="panel auth-panel" aria-labelledby="modo-auth">
        <h2 id="modo-auth">{usuarioExpirado ? 'Sua sessão expirou' : registro ? 'Criar conta' : 'Entrar'}</h2>
        {usuarioExpirado && <p role="status">Entre novamente com a mesma conta para continuar. Se estiver preenchendo um formulário, o texto ficará nesta página.</p>}
        {sucesso && <p className="sucesso" role="status">{sucesso}</p>}
        {erro && <Aviso mensagem={erro} />}
        <form key={String(registro)} className="stack" onSubmit={enviar}>
          <label>Usuário ou e-mail<input name="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} readOnly={Boolean(usuarioExpirado)} required maxLength={254} /></label>
          <label>Senha<input name="senha" type="password" autoComplete={registro ? 'new-password' : 'current-password'} required minLength={registro ? 8 : undefined} maxLength={128} /></label>
          {registro && <p className="muted">Use seu e-mail ou um nome de usuário de 3 a 32 caracteres. A senha precisa ter pelo menos 8 caracteres.</p>}
          <button className="button primary" disabled={ocupado}>{ocupado ? 'Aguarde…' : usuarioExpirado ? 'Entrar novamente' : registro ? 'Criar conta' : 'Entrar'}</button>
        </form>
        {usuarioExpirado ? (
          <button className="text-button" type="button" disabled={ocupado} onClick={encerrarSessao}>Sair e descartar o rascunho</button>
        ) : (
          <button className="text-button" type="button" disabled={ocupado} onClick={() => {
            setErro('');
            setSucesso('');
            setRegistro(!registro);
          }}>{registro ? 'Já tenho conta' : 'Criar uma conta'}</button>
        )}
      </section>
    </div>
  </main>;
}
