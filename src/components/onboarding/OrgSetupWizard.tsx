'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { OrganizationType, WizardFormData, WizardAreaSetup } from '@/lib/organization/bootstrap-templates';
import { DEFAULT_WIZARD_DATA, getBootstrapTemplate } from '@/lib/organization/bootstrap-templates';
import { WizardProgressBar } from './WizardProgressBar';
import { BasicsStep } from './steps/BasicsStep';
import { StructureStep } from './steps/StructureStep';
import { RolesStep } from './steps/RolesStep';
import { TemplatesStep } from './steps/TemplatesStep';
import { IntegrationStep } from './steps/IntegrationStep';
import {
  getBootstrapTemplatesAction,
  validateWizardStepAction,
  createOrgFromWizardAction,
} from '@/app/actions/bootstrap';

interface OrgSetupWizardProps {
  onComplete?: (organizationId: string) => void;
  className?: string;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * OrgSetupWizard component
 * Story 11.12: Multi-step organization setup wizard
 *
 * Features:
 * - 5-step wizard (Basics, Structure, Roles, Templates, Integration)
 * - Form validation at each step
 * - Progress tracking
 * - Mobile responsive
 * - Dark mode support
 * - Accessibility (WCAG AA)
 */
export function OrgSetupWizard({
  onComplete,
  className,
}: OrgSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<WizardFormData>(DEFAULT_WIZARD_DATA);

  // Template loading state
  const [templateLoading, setTemplateLoading] = useState(false);

  const handleNextStep = useCallback(async () => {
    // Validate current step
    const validation = await validateWizardStepAction(currentStep, formData);

    if (!validation.success || !validation.data?.valid) {
      setErrors(validation.data?.errors || ['Erro ao validar o passo']);
      toast.error('Por favor, corrija os erros antes de continuar');
      return;
    }

    setErrors([]);

    // Load template if moving to step 3 (Structure)
    if (currentStep === 2) {
      setTemplateLoading(true);
      try {
        const templateResult = await getBootstrapTemplatesAction(formData.organization_type);

        if (templateResult.success && templateResult.data) {
          const template = templateResult.data;
          // Initialize areas from template
          setFormData(prev => ({
            ...prev,
            template_id: template.id,
            areas: template.areas.map(area => ({
              name: area.name,
              description: area.description || '',
              nuclei: area.nuclei.map(nucleus => ({
                name: nucleus.name,
                description: nucleus.description || '',
              })),
            })),
          }));
        }
      } catch (error) {
        toast.error('Erro ao carregar o template');
        console.error('Template loading error:', error);
        return;
      } finally {
        setTemplateLoading(false);
      }
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, formData]);

  const handlePreviousStep = useCallback(() => {
    setErrors([]);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    // Final validation
    const validation = await validateWizardStepAction(5, formData);

    if (!validation.success || !validation.data?.valid) {
      setErrors(validation.data?.errors || ['Erro ao validar a configuração final']);
      toast.error('Por favor, corrija os erros antes de finalizar');
      return;
    }

    setLoading(true);
    try {
      const result = await createOrgFromWizardAction(formData);

      if (result.success && result.data) {
        toast.success('Organização inicializada com sucesso!');
        setErrors([]);

        // Delay to show success message
        setTimeout(() => {
          if (onComplete) {
            onComplete(result.data!.organization_id);
          }
        }, 1500);
      } else {
        toast.error(result.message || 'Erro ao inicializar organização');
        setErrors([result.message || 'Erro desconhecido']);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Erro ao processar a solicitação');
      setErrors(['Erro ao processar a solicitação']);
    } finally {
      setLoading(false);
    }
  }, [formData, onComplete]);

  const wizardSteps = [
    { number: 1, label: 'Básicos', completed: currentStep > 1 },
    { number: 2, label: 'Modelo', completed: currentStep > 2 },
    { number: 3, label: 'Estrutura', completed: currentStep > 3 },
    { number: 4, label: 'Funções', completed: currentStep > 4 },
    { number: 5, label: 'Integração', completed: false },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assistente de Configuração da Organização</CardTitle>
          <CardDescription>
            Configure sua estrutura organizacional em 5 passos fáceis
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <WizardProgressBar steps={wizardSteps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <BasicsStep
              organizationType={formData.organization_type}
              onOrganizationTypeChange={(type) =>
                setFormData(prev => ({
                  ...prev,
                  organization_type: type as OrganizationType,
                }))
              }
              organizationName={formData.customization.organizationName}
              onOrganizationNameChange={(name) =>
                setFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, organizationName: name },
                }))
              }
              industry={formData.customization.industry}
              onIndustryChange={(industry) =>
                setFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, industry },
                }))
              }
              size={formData.customization.size}
              onSizeChange={(size) =>
                setFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, size },
                }))
              }
              description={formData.customization.description}
              onDescriptionChange={(desc) =>
                setFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, description: desc },
                }))
              }
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <TemplatesStep
              templates={[
                {
                  id: 'legal_office',
                  name: '📋 Escritório Jurídico',
                  description: 'Estrutura padrão para escritórios de advocacia com áreas como Recuperação de Crédito, Trabalhista, Civil e Tributário',
                  processCount: 4,
                },
                {
                  id: 'consultancy',
                  name: '💼 Consultoria',
                  description: 'Estrutura padrão para empresas de consultoria com áreas de Estratégia, Operações e Transformação Digital',
                  processCount: 4,
                },
                {
                  id: 'corporation',
                  name: '🏢 Corporação',
                  description: 'Estrutura padrão para grandes corporações com áreas Financeira, Operações, Comercial e RH',
                  processCount: 4,
                },
                {
                  id: 'other',
                  name: '⚙️ Customizar',
                  description: 'Comece em branco e configure sua estrutura manualmente',
                  processCount: 0,
                },
              ]}
              selectedTemplateId={formData.template_id}
              onTemplateSelect={(id) =>
                setFormData(prev => ({
                  ...prev,
                  template_id: id,
                }))
              }
              loading={templateLoading}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <StructureStep
              areas={formData.areas}
              onAreasChange={(areas) =>
                setFormData(prev => ({
                  ...prev,
                  areas,
                }))
              }
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <RolesStep
              selectedRoles={formData.customization.selectedRoles || []}
              onRolesChange={(roles) =>
                setFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, selectedRoles: roles },
                }))
              }
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <IntegrationStep
              integrations={[
                {
                  id: 'espaider',
                  name: 'Espaider',
                  description: 'Integração com plataforma Espaider para sincronização de dados',
                  enabled: formData.customization.integrations?.espaider || false,
                },
                {
                  id: 'slack',
                  name: 'Slack',
                  description: 'Notificações e atualizações de processos no Slack',
                  enabled: formData.customization.integrations?.slack || false,
                },
              ]}
              onIntegrationToggle={(id, enabled) =>
                setFormData(prev => ({
                  ...prev,
                  customization: {
                    ...prev.customization,
                    integrations: {
                      ...prev.customization.integrations,
                      [id]: enabled,
                    },
                  },
                }))
              }
              summary={{
                organizationName: formData.customization.organizationName,
                organizationType: formData.organization_type,
                areaCount: formData.areas.length,
                nucleusCount: formData.areas.reduce((sum, area) => sum + area.nuclei.length, 0),
                roleCount: (formData.customization.selectedRoles || []).length,
              }}
              errors={errors}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 1 || loading}
          aria-label="Voltar para o passo anterior"
        >
          ← Anterior
        </Button>

        <div className="flex gap-3">
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={loading || templateLoading}
              aria-label={`Ir para o passo ${currentStep + 1}`}
            >
              {templateLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Próximo →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
              aria-label="Finalizar e criar organização"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Inicializando...' : 'Finalizar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
