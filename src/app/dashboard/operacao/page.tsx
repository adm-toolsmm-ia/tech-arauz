import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard Operação',
  description: 'Redireciona para o Dashboard Operações.',
};

export default function OperacaoDashboardPage() {
  redirect('/dashboard/operacoes');
}
