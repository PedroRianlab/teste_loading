import { AreaProtegida } from '@/features/auth/components/area-protegida';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AreaProtegida>{children}</AreaProtegida>;
}
