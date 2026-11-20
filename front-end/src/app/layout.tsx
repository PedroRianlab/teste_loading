import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Central de Solicitações', description: 'Registro e acompanhamento de solicitações' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}


