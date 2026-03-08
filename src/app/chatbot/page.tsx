'use client';

import React, { Suspense } from 'react';
import { ChatbotContent } from './components/chatbot-content';
import { SkeletonKPI } from '@/components/ui/skeletons';

/**
 * Page: /chatbot/
 *
 * Main chatbot page component.
 * Renders the chat interface with agent selector and message history.
 */
export default function ChatbotPage() {
  return (
    <Suspense fallback={<ChatbotSkeleton />}>
      <ChatbotContent />
    </Suspense>
  );
}

function ChatbotSkeleton() {
  return (
    <div className="flex h-full gap-4 p-4">
      <div className="w-64 bg-muted rounded-lg animate-pulse" />
      <div className="flex-1 flex flex-col gap-4">
        <SkeletonKPI />
        <div className="flex-1 bg-muted rounded-lg animate-pulse" />
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
