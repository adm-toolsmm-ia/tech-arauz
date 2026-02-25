/**
 * @file Agents Validator
 * @description Validation utilities for agent configuration
 *
 * Handles:
 * - JSON Schema validation (Ajv)
 * - Template variable validation
 * - Slug format validation
 * - Breaking change detection
 */

import Ajv from 'ajv';
import { z } from 'zod';

import type {
  AgentConfig,
  AgentVariable,
  ModelConfig,
  PromptConfig,
} from '@/types/agents';

const ajv = new Ajv();

/**
 * Zod schemas for type-safe validation
 */

export const AgentVariableSchema = z.object({
  key: z.string().min(1).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  type: z.enum(['string', 'number', 'boolean', 'enum', 'array', 'object']),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  enum: z.array(z.string()).optional(),
  regex: z.string().optional(),
  description: z.string().optional(),
});

export const ModelConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'azure_openai', 'other']),
  model_id: z.string().min(1),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  max_tokens: z.number().positive().optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  stop_sequences: z.array(z.string()).optional(),
  response_format: z.enum(['text', 'json']).optional(),
  endpoint_overrides: z
    .object({
      base_url: z.string().url().optional(),
      deployment_id: z.string().optional(),
    })
    .optional(),
});

export const PromptConfigSchema = z.object({
  objective: z.string().min(10).max(500),
  instructions: z.array(z.string().min(1)),
  user_template: z.string().min(1),
  persona: z.string().optional(),
  examples: z
    .array(
      z.object({
        user: z.string(),
        assistant: z.string(),
      }),
    )
    .max(3)
    .optional(),
  variables: z.array(AgentVariableSchema),
});

export const AgentConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  owners: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'deprecated']),
  persona: z.string().optional(),
  prompt_objective: z.string(),
  prompt_instructions: z.array(z.string()),
  prompt_template: z.string(),
  output_schema: z.record(z.unknown()).optional(),
  model: ModelConfigSchema,
});

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Extract {{variable}} placeholders from template
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    matches.push(match[1]);
  }
  // deduplicate using Array.from and Set
  return Array.from(new Set(matches));
}

/**
 * Validate template has all required variables
 */
export function validateTemplateVariables(
  template: string,
  variables: AgentVariable[],
): {
  valid: boolean;
  missingInTemplate: string[];
  unusedVariables: string[];
  missingInDefinition: string[];
} {
  const templateVars = extractTemplateVariables(template);
  const definedVars = variables.map((v) => v.key);
  const requiredVars = variables.filter((v) => v.required).map((v) => v.key);

  const missingInTemplate = requiredVars.filter(
    (v) => !templateVars.includes(v),
  );
  const unusedVariables = definedVars.filter((v) => !templateVars.includes(v));
  const missingInDefinition = templateVars.filter(
    (v) => !definedVars.includes(v),
  );

  return {
    valid:
      missingInTemplate.length === 0 && missingInDefinition.length === 0,
    missingInTemplate,
    unusedVariables,
    missingInDefinition,
  };
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: string,
  variables: Record<string, unknown>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
      String(value ?? ''),
    );
  }
  return result;
}

/**
 * Validate JSON Schema
 */
export function validateJsonSchema(schema: unknown): {
  valid: boolean;
  errors?: string[];
} {
  try {
    const validate = ajv.compile(schema as Record<string, unknown>);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, errors: [message] };
  }
}

/**
 * Generate example value from JSON Schema
 */
export function generateExampleFromSchema(
  schema: Record<string, unknown>,
): unknown {
  if (schema.type === 'object' && schema.properties) {
    const example: Record<string, unknown> = {};
    const props = schema.properties as Record<string, unknown>;
    for (const [key, prop] of Object.entries(props)) {
      if (typeof prop === 'object' && prop !== null) {
        const propObj = prop as Record<string, unknown>;
        if (propObj.type === 'string') {
          example[key] = 'example';
        } else if (propObj.type === 'number') {
          example[key] = 0;
        } else if (propObj.type === 'boolean') {
          example[key] = true;
        } else if (propObj.type === 'array') {
          example[key] = [];
        } else if (propObj.type === 'object') {
          example[key] = {};
        }
      }
    }
    return example;
  }
  return null;
}

/**
 * Detect breaking changes between configs
 */
export function detectBreakingChange(
  oldConfig: Partial<AgentConfig>,
  newConfig: Partial<AgentConfig>,
): boolean {
  // Check if input_schema changed incompatibly
  if (oldConfig.prompt_template && newConfig.prompt_template) {
    const oldVars = extractTemplateVariables(oldConfig.prompt_template);
    const newVars = extractTemplateVariables(newConfig.prompt_template);

    // Breaking if required variables removed
    const removed = oldVars.filter((v) => !newVars.includes(v));
    if (removed.length > 0) {
      return true;
    }
  }

  // Check if output_schema changed incompatibly
  if (oldConfig.output_schema && newConfig.output_schema) {
    const oldRequired = (oldConfig.output_schema.required as string[]) || [];
    const newRequired = (newConfig.output_schema.required as string[]) || [];

    // Breaking if required fields removed
    const removedFields = oldRequired.filter((f) => !newRequired.includes(f));
    if (removedFields.length > 0) {
      return true;
    }

    // Breaking if field type changed
    const oldProps = (oldConfig.output_schema.properties as Record<
      string,
      Record<string, unknown>
    >) || {};
    const newProps = (newConfig.output_schema.properties as Record<
      string,
      Record<string, unknown>
    >) || {};

    for (const [field, oldProp] of Object.entries(oldProps)) {
      if (newProps[field] && oldProp.type !== newProps[field].type) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate entire AgentConfig
 */
export async function validateAgentConfig(
  config: unknown,
): Promise<{ valid: boolean; errors?: z.ZodError }> {
  try {
    await AgentConfigSchema.parseAsync(config);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
}
