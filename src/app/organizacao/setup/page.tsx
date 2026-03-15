import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrgSetupWizard } from '@/components/onboarding/OrgSetupWizard';

/**
 * Organization Setup Wizard Page
 * Story 11.12: `/organizacao/setup` route
 *
 * Provides a multi-step wizard for initializing organization structure
 */
export default async function OrganizacaoSetupPage() {
  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const handleComplete = (organizationId: string) => {
    // Redirect to organization dashboard after completion
    redirect(`/organizacao?initialized=true`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <OrgSetupWizard
          onComplete={handleComplete}
        />
      </div>
    </main>
  );
}
