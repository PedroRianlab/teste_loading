import { Formulario } from '@/features/solicitacoes/components/formulario';

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  return <Formulario id={(await params).id} />;
}
