/**
 * CSV/JSON Import and Export utilities for Organization entities
 * Story 11.13: Bulk Operations & Import/Export
 *
 * Handles parsing, validation, and transformation of organizational data
 */

import type {
  OrgArea,
  OrgNucleus,
  OrgProcess,
  OrgRoutine,
  OrgActivity,
  OrgSystem,
  OrgSupplier,
  OrgService,
  OrgDocument,
} from '@/types/organization';

export type ExportableEntity =
  | OrgArea
  | OrgNucleus
  | OrgProcess
  | OrgRoutine
  | OrgActivity
  | OrgSystem
  | OrgSupplier
  | OrgService
  | OrgDocument;

export interface ImportError {
  row: number;
  column?: string;
  error: string;
  value?: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: ImportError[];
  data: Record<string, unknown>[];
}

export interface ExportOptions {
  includeTimestamps?: boolean;
  includeIds?: boolean;
}

/**
 * Parse CSV content with proper handling of quoted fields and escaping
 * Supports RFC 4180 CSV format
 */
export function parseCSV(content: string): Record<string, unknown>[] {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  if (headers.length === 0) return [];

  const result: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    result.push(record);
  }

  return result;
}

/**
 * Parse a single CSV line handling quoted fields and commas within quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Validate CSV data against required fields for an entity type
 */
export function validateCSVData(
  data: Record<string, unknown>[],
  entityType: string,
  requiredFields: string[]
): ImportResult {
  const errors: ImportError[] = [];
  const validData: Record<string, unknown>[] = [];
  let imported = 0;

  data.forEach((row, index) => {
    const rowNum = index + 2; // +1 for header, +1 for 1-indexed

    // Check required fields
    const missingFields = requiredFields.filter((field) => !row[field] || row[field] === '');
    if (missingFields.length > 0) {
      errors.push({
        row: rowNum,
        error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
      });
      return;
    }

    // Validate data types
    if (entityType === 'area' && typeof row.name !== 'string') {
      errors.push({
        row: rowNum,
        column: 'name',
        error: 'Campo "name" deve ser texto',
        value: String(row.name),
      });
      return;
    }

    // Parse JSON arrays if present
    const processedRow = { ...row };
    for (const [key, value] of Object.entries(processedRow)) {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          processedRow[key] = JSON.parse(value);
        } catch (e) {
          errors.push({
            row: rowNum,
            column: key,
            error: `Campo JSON inválido: ${(e as Error).message}`,
            value,
          });
          return;
        }
      }
    }

    validData.push(processedRow);
    imported++;
  });

  return {
    imported,
    failed: errors.length,
    errors,
    data: validData,
  };
}

/**
 * Export entities as CSV content
 */
export function exportAsCSV(entities: ExportableEntity[], options?: ExportOptions): string {
  if (entities.length === 0) return '';

  const includeTimestamps = options?.includeTimestamps ?? false;
  const includeIds = options?.includeIds ?? true;

  // Get all unique keys from all entities
  const allKeys = new Set<string>();
  entities.forEach((entity) => {
    Object.keys(entity).forEach((key) => {
      if (includeIds || key !== 'id') {
        if (!includeTimestamps && (key === 'created_at' || key === 'updated_at')) {
          return;
        }
        allKeys.add(key);
      }
    });
  });

  // Skip system fields
  const headers = Array.from(allKeys).filter(
    (key) => !['tenant_id', 'id', 'created_at', 'updated_at'].includes(key) || includeIds
  );

  if (headers.length === 0) return '';

  // Build CSV
  const lines: string[] = [];

  // Header row
  lines.push(headers.map((h) => escapeCSVField(h)).join(','));

  // Data rows
  entities.forEach((entity) => {
    const values = headers.map((header) => {
      const value = (entity as unknown as Record<string, unknown>)[header];
      return escapeCSVField(value);
    });
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

/**
 * Escape CSV field values (handle quotes, commas, newlines)
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';

  let str = String(value);

  // Convert objects/arrays to JSON
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  }

  // Escape quotes and wrap in quotes if needed
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}

/**
 * Export entities as JSON content
 */
export function exportAsJSON(entities: ExportableEntity[], pretty = true): string {
  if (pretty) {
    return JSON.stringify(entities, null, 2);
  }
  return JSON.stringify(entities);
}

/**
 * Parse JSON import data
 */
export function parseJSON(content: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get required fields for entity type
 */
export function getRequiredFields(entityType: string): string[] {
  const requirements: Record<string, string[]> = {
    area: ['name', 'objective'],
    nucleus: ['name', 'objective', 'area_id'],
    process: ['name', 'objective', 'nucleus_id'],
    routine: ['name', 'objective', 'process_id'],
    activity: ['name', 'routine_id'],
    system: ['name'],
    supplier: ['name'],
    service: ['name'],
    document: ['name'],
  };

  return requirements[entityType.toLowerCase()] || ['name'];
}

/**
 * Validate import/export file format
 */
export function validateFileFormat(filename: string): { valid: boolean; format: 'csv' | 'json' | null } {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return { valid: true, format: 'csv' };
  if (ext === 'json') return { valid: true, format: 'json' };
  return { valid: false, format: null };
}
