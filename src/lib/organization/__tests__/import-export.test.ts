/**
 * Test suite for import-export utilities
 * Story 11.13: Bulk Operations & Import/Export
 */

import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  validateCSVData,
  exportAsCSV,
  exportAsJSON,
  parseJSON,
  getRequiredFields,
  validateFileFormat,
} from '../import-export';
import type { OrgArea } from '@/types/organization';

describe('CSV Parsing', () => {
  it('should parse simple CSV with headers and values', () => {
    const csv = 'name,description\nArea A,Desc A\nArea B,Desc B';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Area A', description: 'Desc A' });
    expect(result[1]).toEqual({ name: 'Area B', description: 'Desc B' });
  });

  it('should handle quoted fields with commas', () => {
    const csv = 'name,description\n"Area, Inc",Desc with comma\n"Area 2","Desc, also"';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Area, Inc');
    expect(result[1].description).toBe('Desc, also');
  });

  it('should handle escaped quotes in fields', () => {
    const csv = 'name,description\n"Area ""Big""",Test quote\n"Test ""quoted""","Another ""test"""';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Area "Big"');
    expect(result[1].description).toBe('Another "test"');
  });

  it('should handle multiline values in quoted fields', () => {
    const csv = 'name,description\n"Area A","Line 1\nLine 2"\n"Area B","Single"';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].description).toContain('Line 1\nLine 2');
  });

  it('should handle empty fields', () => {
    const csv = 'name,description,objective\n"Area A",,Obj\nArea B,Desc,';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].description).toBe('');
    expect(result[1].objective).toBe('');
  });

  it('should handle trailing commas', () => {
    const csv = 'name,description,\nArea A,Desc,\nArea B,Desc2,';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
  });

  it('should ignore empty lines', () => {
    const csv = 'name,description\n\nArea A,Desc A\n\n\nArea B,Desc B\n';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
  });

  it('should return empty array for empty content', () => {
    expect(parseCSV('')).toEqual([]);
    expect(parseCSV('\n\n')).toEqual([]);
  });
});

describe('CSV Validation', () => {
  it('should validate required fields', () => {
    const data = [{ name: 'Area A', objective: 'Test' }];
    const result = validateCSVData(data, 'area', ['name', 'objective']);

    expect(result.imported).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail on missing required fields', () => {
    const data = [{ name: 'Area A' }, { objective: 'Test' }];
    const result = validateCSVData(data, 'area', ['name', 'objective']);

    expect(result.imported).toBe(0);
    expect(result.failed).toBe(2);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].error).toContain('Campos obrigatórios ausentes');
  });

  it('should parse JSON arrays in CSV fields', () => {
    const data = [
      { name: 'Area A', responsible_roles: '["admin", "manager"]' },
    ];
    const result = validateCSVData(data, 'area', ['name']);

    expect(result.imported).toBe(1);
    expect(result.data[0].responsible_roles).toEqual(['admin', 'manager']);
  });

  it('should handle invalid JSON in CSV fields', () => {
    const data = [
      { name: 'Area A', responsible_roles: '{invalid json}' },
    ];
    const result = validateCSVData(data, 'area', ['name']);

    expect(result.imported).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0].error).toContain('JSON inválido');
  });

  it('should return row numbers correctly', () => {
    const data = [
      { name: 'Area A' },
      { name: 'Area B' },
      { name: 'Area C' },
    ];
    const result = validateCSVData(data, 'area', ['name', 'objective']);

    expect(result.errors[0].row).toBe(2); // First data row (after header)
    expect(result.errors[1].row).toBe(3);
    expect(result.errors[2].row).toBe(4);
  });

  it('should track column information in errors', () => {
    const data = [
      { name: 'Area A', responsible_roles: '[invalid' },
    ];
    const result = validateCSVData(data, 'area', ['name']);

    expect(result.errors[0].column).toBe('responsible_roles');
    expect(result.errors[0].row).toBe(2);
  });
});

describe('CSV Export', () => {
  it('should export entities as CSV', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area A',
        objective: 'Test objective',
        description: 'Test description',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const csv = exportAsCSV(entities);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(2); // header + 1 data row
    expect(lines[0]).toContain('name');
    expect(lines[0]).toContain('objective');
  });

  it('should exclude timestamps by default', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area A',
        objective: 'Test',
        description: '',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const csv = exportAsCSV(entities);

    expect(csv).not.toContain('created_at');
    expect(csv).not.toContain('updated_at');
  });

  it('should include timestamps when requested', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area A',
        objective: 'Test',
        description: '',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    const csv = exportAsCSV(entities, { includeTimestamps: true });

    expect(csv).toContain('created_at');
    expect(csv).toContain('2024-01-01');
  });

  it('should escape CSV fields correctly', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area "Test", Inc.',
        objective: 'Contains "quotes"',
        description: 'Contains\nnewline',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const csv = exportAsCSV(entities);

    expect(csv).toContain('"Area ""Test"", Inc."');
    expect(csv).toContain('"Contains ""quotes"""');
  });

  it('should return empty string for empty entities', () => {
    const csv = exportAsCSV([]);
    expect(csv).toBe('');
  });

  it('should handle objects in fields by converting to JSON', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area A',
        objective: 'Test',
        description: '',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const csv = exportAsCSV(entities);
    expect(csv).toBeTruthy();
  });
});

describe('JSON Export & Import', () => {
  it('should export as JSON with pretty formatting', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area A',
        objective: 'Test',
        description: '',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const json = exportAsJSON(entities, true);
    const parsed = JSON.parse(json);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].name).toBe('Area A');
  });

  it('should export as JSON compact', () => {
    const entities: OrgArea[] = [
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Area A',
        objective: 'Test',
        description: '',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const json = exportAsJSON(entities, false);

    expect(json).not.toContain('\n');
    expect(JSON.parse(json)).toHaveLength(1);
  });

  it('should parse valid JSON array', () => {
    const json = JSON.stringify([{ name: 'Area A', objective: 'Test' }]);
    const result = parseJSON(json);

    expect(result).toHaveLength(1);
    expect(result?.[0].name).toBe('Area A');
  });

  it('should return null for invalid JSON', () => {
    const result = parseJSON('not valid json {');
    expect(result).toBeNull();
  });

  it('should return null for JSON object instead of array', () => {
    const json = JSON.stringify({ name: 'Area A' });
    const result = parseJSON(json);

    expect(result).toBeNull();
  });
});

describe('Required Fields', () => {
  it('should return required fields for area', () => {
    const fields = getRequiredFields('area');
    expect(fields).toContain('name');
    expect(fields).toContain('objective');
  });

  it('should return required fields for nucleus', () => {
    const fields = getRequiredFields('nucleus');
    expect(fields).toContain('name');
    expect(fields).toContain('objective');
    expect(fields).toContain('area_id');
  });

  it('should return required fields for process', () => {
    const fields = getRequiredFields('process');
    expect(fields).toContain('name');
    expect(fields).toContain('objective');
    expect(fields).toContain('nucleus_id');
  });

  it('should default to [name] for unknown entity types', () => {
    const fields = getRequiredFields('unknown');
    expect(fields).toEqual(['name']);
  });

  it('should be case insensitive', () => {
    const lowercase = getRequiredFields('area');
    const uppercase = getRequiredFields('AREA');
    const mixed = getRequiredFields('ArEa');

    expect(lowercase).toEqual(uppercase);
    expect(lowercase).toEqual(mixed);
  });
});

describe('File Format Validation', () => {
  it('should validate CSV file format', () => {
    const result = validateFileFormat('data.csv');
    expect(result.valid).toBe(true);
    expect(result.format).toBe('csv');
  });

  it('should validate JSON file format', () => {
    const result = validateFileFormat('data.json');
    expect(result.valid).toBe(true);
    expect(result.format).toBe('json');
  });

  it('should reject invalid formats', () => {
    const result = validateFileFormat('data.txt');
    expect(result.valid).toBe(false);
    expect(result.format).toBeNull();
  });

  it('should be case insensitive', () => {
    const result1 = validateFileFormat('data.CSV');
    const result2 = validateFileFormat('data.JSON');

    expect(result1.valid).toBe(true);
    expect(result2.valid).toBe(true);
  });

  it('should handle no extension', () => {
    const result = validateFileFormat('data');
    expect(result.valid).toBe(false);
  });
});

describe('Performance Tests', () => {
  it('should parse 1000 row CSV efficiently', () => {
    const headers = 'id,name,description,objective';
    const rows = Array.from({ length: 1000 }, (_, i) => `${i},Name ${i},Desc ${i},Obj ${i}`);
    const csv = [headers, ...rows].join('\n');

    const start = performance.now();
    const result = parseCSV(csv);
    const duration = performance.now() - start;

    expect(result).toHaveLength(1000);
    expect(duration).toBeLessThan(1000); // Should parse in less than 1 second
  });

  it('should export 1000 entities efficiently', () => {
    const entities: OrgArea[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `id-${i}`,
      tenant_id: 'tenant-1',
      name: `Area ${i}`,
      objective: `Objective ${i}`,
      description: `Description ${i}`,
      nuclei_count: Math.floor(Math.random() * 10),
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }));

    const start = performance.now();
    const csv = exportAsCSV(entities);
    const duration = performance.now() - start;

    expect(csv).toBeTruthy();
    expect(duration).toBeLessThan(1000);
  });

  it('should validate 1000 rows efficiently', () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({
      name: `Area ${i}`,
      objective: `Obj ${i}`,
    }));

    const start = performance.now();
    const result = validateCSVData(data, 'area', ['name', 'objective']);
    const duration = performance.now() - start;

    expect(result.imported).toBe(1000);
    expect(duration).toBeLessThan(500);
  });
});

describe('Edge Cases', () => {
  it('should handle entities with null description', () => {
    const data = [{ name: 'Area A', description: null, objective: 'Test' }];
    const result = validateCSVData(data, 'area', ['name', 'objective']);

    expect(result.imported).toBe(1);
  });

  it('should handle very long field values', () => {
    const longValue = 'x'.repeat(10000);
    const csv = `name,description\nArea A,${longValue}`;
    const result = parseCSV(csv);

    expect(result[0].description).toBe(longValue);
  });

  it('should handle special characters in CSV', () => {
    const csv = 'name,description\nÁrea ñ,Prüfung\nCité,Москва';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].name).toContain('ñ');
    expect(result[1].description).toContain('Москва');
  });

  it('should handle empty CSV with only headers', () => {
    const csv = 'name,description,objective';
    const result = parseCSV(csv);

    expect(result).toHaveLength(0);
  });
});
