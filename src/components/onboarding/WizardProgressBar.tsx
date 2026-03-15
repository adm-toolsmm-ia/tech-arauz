'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  number: number;
  label: string;
  completed: boolean;
}

interface WizardProgressBarProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

/**
 * WizardProgressBar component
 * Story 11.12: Progress indicator with step tracking
 *
 * Features:
 * - Visual progress bar showing completion percentage
 * - Step indicators with labels
 * - Mobile responsive (stacks vertically on small screens)
 * - Accessibility: ARIA labels, semantic structure
 * - Dark mode support
 */
export function WizardProgressBar({ steps, currentStep, className }: WizardProgressBarProps) {
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)} role="region" aria-label="Progresso do assistente">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Passo {currentStep} de {steps.length}
          </span>
          <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2"
          aria-valuenow={Math.round(progressPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:gap-3">
        {steps.map((step) => {
          const isCompleted = step.completed;
          const isCurrent = step.number === currentStep;
          const isPast = step.number < currentStep;

          return (
            <div key={step.number} className="flex flex-shrink-0 flex-col items-center gap-1">
              {/* Step Circle */}
              <button
                type="button"
                aria-label={`${step.label}${isCurrent ? ' (atual)' : isCompleted ? ' (concluído)' : ''}`}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all',
                  isCurrent
                    ? 'bg-primary text-primary-foreground ring-2 ring-ring'
                    : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
                disabled
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
              </button>

              {/* Label */}
              <span
                className={cn(
                  'max-w-[60px] break-words text-center text-xs font-medium transition-colors',
                  isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
