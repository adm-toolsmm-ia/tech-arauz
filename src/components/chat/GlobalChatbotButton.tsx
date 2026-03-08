'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface GlobalChatbotButtonProps {
  onClick: () => void;
}

export const GlobalChatbotButton: React.FC<GlobalChatbotButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-shadow hover:shadow-xl"
      title="Abrir Assistente AI"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};
