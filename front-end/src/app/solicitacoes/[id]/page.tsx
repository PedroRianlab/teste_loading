import { Detalhe } from '@/features/solicitacoes/components/detalhe';

export default async function DetalhePage({ params }: { params: Promise<{ id: string }> }) {
  return <Detalhe id={(await params).id} />;
}
