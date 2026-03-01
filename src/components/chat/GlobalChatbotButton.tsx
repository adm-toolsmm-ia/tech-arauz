'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface GlobalChatbotButtonProps {
  onClick: () => void;
}

export function GlobalChatbotButton({ onClick }: GlobalChatbotButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      title="Abrir Assistente AI"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}
