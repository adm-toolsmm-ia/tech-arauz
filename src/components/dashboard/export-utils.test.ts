import { describe, it, expect, beforeEach } from '@jest/globals';
import { exportToCSV, exportToJSON, downloadJSON, generateFilename } from './export-utils';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

// Mock data
const mockPerson: PerformanceMetrics = {
  responsible_id: '1',
  responsible: 'João Silva',
  total_movements: 150,
  projects_completed: 90,
  average_duration_days: 25,
  lead_time_average_days: 20,
};

const mockTeamData: PerformanceMetrics[] = [
  mockPerson,
  {
    responsible_id: '2',
    responsible: 'Maria Santos',
    total_movements: 120,
    projects_completed: 80,
    average_duration_days: 30,
    lead_time_average_days: 25,
  },
  {
    responsible_id: '3',
    responsible: 'Pedro Costa',
    total_movements: 100,
    projects_completed: 70,
    average_duration_days: 35,
    lead_time_average_days: 28,
  },
];

describe('export-utils', () => {
  beforeEach(() => {
    // Mock URL and Blob for browser APIs
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
  });

  describe('exportToJSON', () => {
    it('should generate valid JSON with person metrics', () => {
      const jsonString = exportToJSON(mockPerson);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.metadata).toBeDefined();
      expect(jsonData.metadata.exportFormat).toBe('application/json');
      expect(jsonData.person.name).toBe('João Silva');
      expect(jsonData.person.metrics.totalMovements).toBe(150);
      expect(jsonData.person.metrics.completionRate).toBe('60%');
    });

    it('should include team comparison when allData provided', () => {
      const jsonString = exportToJSON(mockPerson, {
        allData: mockTeamData,
        includeComparison: true,
      });
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.comparison).toBeDefined();
      expect(jsonData.comparison.teamAverages.avgMovements).toBe(123);
      expect(jsonData.comparison.performance.status).toBe('High Performer');
    });

    it('should calculate correct performance delta', () => {
      // João has 150 movements, team avg is 123
      // Delta: (150 - 123) / 123 * 100 ≈ 22%
      const jsonString = exportToJSON(mockPerson, {
        allData: mockTeamData,
        includeComparison: true,
      });
      const jsonData = JSON.parse(jsonString);

      const delta = parseInt(jsonData.comparison.performance.movementsDelta);
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThan(30);
    });

    it('should not include comparison when allData is not provided', () => {
      const jsonString = exportToJSON(mockPerson);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.comparison).toBeUndefined();
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with .csv extension', () => {
      const filename = generateFilename('João Silva', 'csv');
      expect(filename).toMatch(/^performance-joao-silva-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate filename with .pdf extension', () => {
      const filename = generateFilename('Maria Santos', 'pdf');
      expect(filename).toMatch(/^performance-maria-santos-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should generate filename with .json extension', () => {
      const filename = generateFilename('Pedro Costa', 'json');
      expect(filename).toMatch(/^performance-pedro-costa-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should handle names with special characters', () => {
      const filename = generateFilename('João-André Silva', 'csv');
      expect(filename).toMatch(/^performance-joao-andre-silva-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should include current date in filename', () => {
      const filename = generateFilename('Test User', 'csv');
      const today = new Date().toISOString().split('T')[0];
      expect(filename).toContain(today);
    });
  });

  describe('exportToCSV', () => {
    it('should create CSV with correct headers and data', () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      global.Blob = jest.fn(() => mockBlob);

      exportToCSV(mockPerson, 'test.csv');

      expect(global.Blob).toHaveBeenCalled();
      const callArgs = (global.Blob as jest.Mock).mock.calls[0];
      const csvContent = callArgs[0][0];

      expect(csvContent).toContain('Métrica');
      expect(csvContent).toContain('João Silva');
      expect(csvContent).toContain('150'); // total movements
      expect(csvContent).toContain('60%'); // completion rate
    });

    it('should include team comparison columns when provided', () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      global.Blob = jest.fn(() => mockBlob);

      exportToCSV(mockPerson, 'test.csv', {
        allData: mockTeamData,
        includeComparison: true,
      });

      const callArgs = (global.Blob as jest.Mock).mock.calls[0];
      const csvContent = callArgs[0][0];

      expect(csvContent).toContain('Média de Time');
      expect(csvContent).toContain('Vs Média');
    });
  });

  describe('downloadJSON', () => {
    it('should create download link with JSON filename', () => {
      const mockLink = {
        click: jest.fn(),
      };
      global.document.createElement = jest.fn(() => mockLink as any);

      const jsonString = exportToJSON(mockPerson);
      downloadJSON(jsonString, 'test.json');

      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toContain('.json');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle division by zero in efficiency calculation', () => {
      const personNoCom = { ...mockPerson, total_movements: 0 };
      const jsonString = exportToJSON(personNoCom);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.person.metrics.completionRate).toBe('0%');
    });

    it('should handle empty team data', () => {
      const jsonString = exportToJSON(mockPerson, {
        allData: [],
        includeComparison: true,
      });
      const jsonData = JSON.parse(jsonString);

      // Should still generate valid JSON even with empty team
      expect(jsonData.person).toBeDefined();
    });

    it('should preserve special characters in names', () => {
      const specialPerson = { ...mockPerson, responsible: 'José-María da Silva' };
      const filename = generateFilename(specialPerson.responsible, 'csv');
      expect(filename).toContain('jose-maria');
    });
  });
});
