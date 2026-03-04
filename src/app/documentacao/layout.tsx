import { AppSidebar } from '@/components/layout/AppSidebar';

export default function DocumentacaoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
