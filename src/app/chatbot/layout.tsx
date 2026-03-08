import type { ReactNode } from 'react';

interface ChatbotLayoutProps {
  children: ReactNode;
}

export default function ChatbotLayout({ children }: ChatbotLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
