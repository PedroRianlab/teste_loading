import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/lora/latin-700.css';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Central de Solicitações', description: 'Registro e acompanhamento de solicitações' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}


