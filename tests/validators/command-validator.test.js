/**
 * Command Validator Tests
 *
 * Tests for command validation, path safety, environment variable checking,
 * and command normalization.
 *
 * @requires jest
 */

const validator = require('../../src/lib/validators/command-validator');

describe('command-validator', () => {
  describe('validateCommand', () => {
    describe('happy path', () => {
      test('validates simple git command', () => {
        const result = validator.validateCommand('git', ['push', 'origin', 'main']);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.normalizedCommand).toBe('git');
      });

      test('validates gh command', () => {
        const result = validator.validateCommand('gh', ['pr', 'create', '--title', 'Fix bug']);
        expect(result.isValid).toBe(true);
        expect(result.normalizedArgs).toContain('pr');
        expect(result.normalizedArgs).toContain('create');
      });

      test('validates npm command', () => {
        const result = validator.validateCommand('npm', ['install', '--save-dev', 'jest']);
        expect(result.isValid).toBe(true);
      });

      test('normalizes command to lowercase', () => {
        const result = validator.validateCommand('Git', ['status']);
        expect(result.normalizedCommand).toBe('git');
      });

      test('handles empty args array', () => {
        const result = validator.validateCommand('git', []);
        expect(result.isValid).toBe(true);
        expect(result.normalizedArgs).toHaveLength(0);
      });
    });

    describe('invalid commands', () => {
      test('rejects non-string command', () => {
        const result = validator.validateCommand(123, ['push']);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('must be a string');
      });

      test('rejects non-array args', () => {
        const result = validator.validateCommand('git', 'push');
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Arguments must be an array');
      });

      test('rejects command with spaces', () => {
        const result = validator.validateCommand('git push', ['origin']);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('single word');
      });

      test('rejects empty command', () => {
        const result = validator.validateCommand('', []);
        expect(result.isValid).toBe(false);
      });

      test('rejects whitespace-only command', () => {
        const result = validator.validateCommand('   ', []);
        expect(result.isValid).toBe(false);
      });
    });

    describe('null/undefined arguments', () => {
      test('detects null arguments', () => {
        const result = validator.validateCommand('git', ['push', null, 'main']);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('null/undefined');
      });

      test('detects undefined arguments', () => {
        const result = validator.validateCommand('git', ['push', undefined, 'main']);
        expect(result.isValid).toBe(false);
      });

      test('filters null/undefined from normalized args', () => {
        const result = validator.validateCommand('git', ['push', null, 'origin', undefined, 'main']);
        expect(result.normalizedArgs).toEqual(['push', 'origin', 'main']);
      });
    });

    describe('environment variables', () => {
      beforeEach(() => {
        delete process.env.TEST_VAR;
        delete process.env.GITHUB_TOKEN;
      });

      test('validates required env vars exist', () => {
        process.env.GITHUB_TOKEN = 'test-token';
        const result = validator.validateCommand('gh', ['pr', 'create'], {
          requiredEnvVars: ['GITHUB_TOKEN']
        });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('reports missing env vars', () => {
        const result = validator.validateCommand('gh', ['pr', 'create'], {
          requiredEnvVars: ['MISSING_VAR']
        });
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Missing environment variables');
        expect(result.errors[0]).toContain('MISSING_VAR');
      });

      test('handles multiple missing vars', () => {
        const result = validator.validateCommand('cmd', [], {
          requiredEnvVars: ['VAR1', 'VAR2', 'VAR3']
        });
        expect(result.errors[0]).toContain('VAR1');
        expect(result.errors[0]).toContain('VAR2');
        expect(result.errors[0]).toContain('VAR3');
      });
    });

    describe('dangerous patterns', () => {
      test('detects --force pattern', () => {
        const result = validator.validateCommand('git', ['push', '--force', 'origin'], {
          dangerousPatterns: ['--force']
        });
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('--force');
      });

      test('detects -rf pattern (rm -rf)', () => {
        const result = validator.validateCommand('rm', ['-rf', '/tmp'], {
          dangerousPatterns: ['--force', '-rf']
        });
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      test('does not affect validity on dangerous pattern', () => {
        const result = validator.validateCommand('git', ['push', '--force', 'origin'], {
          dangerousPatterns: ['--force']
        });
        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    describe('path validation', () => {
      test('warns about spaces in paths', () => {
        const result = validator.validateCommand('rm', ['/path with spaces/file.txt']);
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      test('provides suggestion for escaped paths', () => {
        const result = validator.validateCommand('rm', ['/path with spaces/file.txt']);
        expect(result.suggestions.length).toBeGreaterThan(0);
      });

      test('can disable path checking', () => {
        const result = validator.validateCommand('rm', ['/path with spaces/file.txt'], {
          checkPaths: false
        });
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('normalization', () => {
      test('trims and deduplicates spaces in args', () => {
        const result = validator.validateCommand('git', ['  push  ', 'origin']);
        expect(result.normalizedArgs[0]).toBe('push');
      });

      test('filters empty args', () => {
        const result = validator.validateCommand('git', ['push', '', 'origin']);
        expect(result.normalizedArgs).toEqual(['push', 'origin']);
      });
    });
  });

  describe('validatePath', () => {
    describe('safe paths', () => {
      test('validates simple relative path', () => {
        const result = validator.validatePath('file.txt');
        expect(result.isSafe).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      test('validates absolute path', () => {
        const result = validator.validatePath('/tmp/file.txt');
        expect(result.isSafe).toBe(true);
      });

      test('validates home path', () => {
        const result = validator.validatePath('~/documents/file.txt');
        expect(result.isSafe).toBe(true);
      });
    });

    describe('unsafe paths', () => {
      test('rejects root directory', () => {
        const result = validator.validatePath('/');
        expect(result.isSafe).toBe(false);
        expect(result.issues[0]).toContain('dangerous');
      });

      test('rejects /etc paths', () => {
        const result = validator.validatePath('/etc/passwd');
        expect(result.isSafe).toBe(false);
      });

      test('rejects /sys paths', () => {
        const result = validator.validatePath('/sys/config');
        expect(result.isSafe).toBe(false);
      });

      test('rejects /proc paths', () => {
        const result = validator.validatePath('/proc/info');
        expect(result.isSafe).toBe(false);
      });
    });

    describe('path issues', () => {
      test('detects spaces in path', () => {
        const result = validator.validatePath('/path with spaces/file.txt');
        expect(result.issues[0]).toContain('Spaces');
        expect(result.suggestion).toContain("'");
      });

      test('detects parent directory reference', () => {
        const result = validator.validatePath('../../etc/passwd');
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.issues[0]).toContain('..');
      });

      test('detects unquoted wildcards', () => {
        const result = validator.validatePath('/tmp/*.txt');
        expect(result.issues.length).toBeGreaterThan(0);
      });

      test('allows quoted wildcards', () => {
        const result = validator.validatePath("'/tmp/*.txt'");
        expect(result.isSafe).toBe(true);
      });
    });

    describe('invalid inputs', () => {
      test('rejects non-string paths', () => {
        const result = validator.validatePath(123);
        expect(result.isSafe).toBe(false);
        expect(result.issues[0]).toContain('must be a string');
      });

      test('rejects null paths', () => {
        const result = validator.validatePath(null);
        expect(result.isSafe).toBe(false);
      });
    });
  });

  describe('checkEnvVars', () => {
    beforeEach(() => {
      delete process.env.TEST_VAR;
      delete process.env.DEFINED_VAR;
      process.env.DEFINED_VAR = 'value';
    });

    test('reports defined variables', () => {
      const result = validator.checkEnvVars(['DEFINED_VAR']);
      expect(result.missing).toHaveLength(0);
      expect(result.defined).toHaveProperty('DEFINED_VAR');
    });

    test('reports missing variables', () => {
      const result = validator.checkEnvVars(['MISSING_VAR']);
      expect(result.missing).toContain('MISSING_VAR');
      expect(result.defined).toEqual({});
    });

    test('handles mixed defined and missing', () => {
      const result = validator.checkEnvVars(['DEFINED_VAR', 'MISSING_VAR']);
      expect(result.missing).toContain('MISSING_VAR');
      expect(result.defined).toHaveProperty('DEFINED_VAR');
    });

    test('handles defaults for missing vars', () => {
      const result = validator.checkEnvVars(['MISSING_VAR'], { MISSING_VAR: 'default' });
      expect(result.missing).toHaveLength(0);
      expect(result.defined.MISSING_VAR).toBe('default');
    });

    test('prefers env vars over defaults', () => {
      process.env.TEST_VAR = 'from-env';
      const result = validator.checkEnvVars(['TEST_VAR'], { TEST_VAR: 'default' });
      expect(result.defined.TEST_VAR).toBe('from-env');
    });
  });

  describe('normalizeCommand', () => {
    test('converts to lowercase', () => {
      expect(validator.normalizeCommand('GIT')).toBe('git');
      expect(validator.normalizeCommand('Git')).toBe('git');
    });

    test('trims whitespace', () => {
      expect(validator.normalizeCommand('  git  ')).toBe('git');
    });

    test('takes first word only', () => {
      expect(validator.normalizeCommand('git push origin')).toBe('git');
    });

    test('handles non-string input', () => {
      expect(validator.normalizeCommand(null)).toBe('');
      expect(validator.normalizeCommand(undefined)).toBe('');
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      process.env.GITHUB_TOKEN = 'token123';
      delete process.env.MISSING_VAR;
    });

    test('validates complete gh pr create command', () => {
      const result = validator.validateCommand(
        'gh',
        ['pr', 'create', '--title', 'Fix bug', '--base', 'main'],
        {
          requiredEnvVars: ['GITHUB_TOKEN'],
          dangerousPatterns: ['--force-push']
        }
      );
      expect(result.isValid).toBe(true);
      expect(result.normalizedCommand).toBe('gh');
    });

    test('catches multiple issues at once', () => {
      const result = validator.validateCommand(
        'git',
        ['push', '--force', '/path with spaces/repo', null],
        {
          requiredEnvVars: ['MISSING_VAR'],
          dangerousPatterns: ['--force'],
          checkPaths: true
        }
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('git push to main workflow', () => {
      const result = validator.validateCommand(
        'git',
        ['push', 'origin', 'main'],
        {
          requiredEnvVars: ['GIT_AUTHOR_EMAIL'],
          dangerousPatterns: ['--force', '--force-with-lease']
        }
      );
      expect(result.isValid).toBe(false);  // Missing GIT_AUTHOR_EMAIL
      expect(result.errors[0]).toContain('GIT_AUTHOR_EMAIL');
    });
  });

  describe('performance', () => {
    test('validates command in < 10ms', () => {
      const start = process.hrtime.bigint();
      validator.validateCommand('git', ['push', 'origin', 'main']);
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000;  // Convert to ms
      expect(duration).toBeLessThan(10);
    });
  });
});
