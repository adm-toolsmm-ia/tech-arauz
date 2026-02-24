/**
 * Git Wrapper Tests
 *
 * Tests for git operations with validation, error handling, and logging.
 */

const GitWrapper = require('../../src/lib/wrappers/git-wrapper');
const { promises: fs } = require('fs');
const path = require('path');

// Mock child_process.execFile
jest.mock('child_process', () => ({
  execFile: jest.fn(),
}));

const { execFile } = require('child_process');

describe('GitWrapper', () => {
  let wrapper;
  let mockExecFile;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecFile = execFile;
    wrapper = new GitWrapper({
      repoPath: '/test/repo',
      logPath: '/tmp/test-git.log'
    });

    // Mock fs operations
    jest.spyOn(fs, 'appendFile').mockResolvedValue(undefined);
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('push', () => {
    describe('happy path', () => {
      test('successfully pushes to remote', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          callback(null, 'Everything up-to-date\n', '');
        });

        const result = await wrapper.push('main', 'origin');
        expect(result.success).toBe(true);
        expect(result.message).toContain('Successfully pushed');
      });

      test('pushes with set-upstream', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          expect(args).toContain('--set-upstream');
          callback(null, 'Branch set up\n', '');
        });

        const result = await wrapper.push('feature/xyz', 'origin', { setUpstream: true });
        expect(result.success).toBe(true);
      });
    });

    describe('validation', () => {
      test('requires branch name', async () => {
        const result = await wrapper.push(null, 'origin');
        expect(result.success).toBe(false);
        expect(result.message).toContain('required');
      });

      test('requires remote name', async () => {
        const result = await wrapper.push('main', null);
        expect(result.success).toBe(false);
        expect(result.message).toContain('required');
      });

      test('detects missing remote', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          if (args[0] === 'remote') {
            callback(null, 'origin\nupstream\n', '');
          } else if (args[0] === 'branch') {
            callback(null, '* main\n', '');
          } else if (args[0] === 'status') {
            callback(null, '', '');
          }
          callback(new Error('Remote not found'));
        });

        const result = await wrapper.push('main', 'invalid-remote');
        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });

      test('detects uncommitted changes', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          if (args[0] === 'status' && args[1] === '--porcelain') {
            callback(null, 'M src/file.js\n', '');
          } else {
            callback(null, 'output', '');
          }
        });

        const result = await wrapper.push('main', 'origin');
        expect(result.success).toBe(false);
        expect(result.message).toContain('uncommitted changes');
      });
    });

    describe('force push', () => {
      test('detects force-push exceeding limit', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          if (args.includes('log')) {
            // Return 8 commits (exceeds default limit of 5)
            callback(null, 'abc def\n'.repeat(8), '');
          } else {
            callback(null, 'output', '');
          }
        });

        const result = await wrapper.push('main', 'origin', { force: true });
        expect(result.success).toBe(false);
        expect(result.message).toContain('exceeds limit');
      });

      test('allows force-push within limit', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          if (args.includes('log')) {
            // Return 3 commits (within default limit of 5)
            callback(null, 'abc def\n'.repeat(3), '');
          } else {
            callback(null, 'output', '');
          }
        });

        const result = await wrapper.push('main', 'origin', { force: true });
        expect(result.success).toBe(true);
        expect(mockExecFile.mock.calls.some(call =>
          call[1].includes('--force')
        )).toBe(true);
      });

      test('supports force-with-lease', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          if (args.includes('log')) {
            callback(null, 'abc def\n', '');
          } else {
            callback(null, 'output', '');
          }
        });

        const result = await wrapper.push('main', 'origin', { forceWithLease: true });
        expect(result.success).toBe(true);
        expect(mockExecFile.mock.calls.some(call =>
          call[1].includes('--force-with-lease')
        )).toBe(true);
      });
    });

    describe('error handling', () => {
      test('handles git errors', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          callback(new Error('Permission denied'), '', 'fatal: Permission denied');
        });

        const result = await wrapper.push('main', 'origin');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('includes suggestions in result', async () => {
        mockExecFile.mockImplementation((cmd, args, opts, callback) => {
          if (args[0] === 'remote') {
            callback(null, 'origin\n', '');
          }
          callback(new Error('Branch not found'));
        });

        const result = await wrapper.push('invalid', 'origin');
        expect(result.success).toBe(false);
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('pull', () => {
    test('successfully pulls changes', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(null, 'Updated files\n', '');
      });

      const result = await wrapper.pull('main', 'origin');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully pulled');
    });

    test('supports rebase option', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        expect(args).toContain('--rebase');
        callback(null, 'output', '');
      });

      await wrapper.pull('main', 'origin', { rebase: true });
    });

    test('handles pull errors', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(new Error('Merge conflict'));
      });

      const result = await wrapper.pull('main', 'origin');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Merge conflict');
    });
  });

  describe('commit', () => {
    test('creates commit successfully', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(null, 'created commit\n', '');
      });

      const result = await wrapper.commit('feat: add feature');
      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
    });

    test('requires message', async () => {
      const result = await wrapper.commit(null);
      expect(result.success).toBe(false);
      expect(result.message).toContain('required');
    });

    test('supports commit options', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        expect(args).toContain('-a');
        expect(args).toContain('-s');
        callback(null, 'output', '');
      });

      await wrapper.commit('feat: test', { all: true, signoff: true });
    });

    test('handles commit errors', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(new Error('Nothing to commit'));
      });

      const result = await wrapper.commit('feat: test');
      expect(result.success).toBe(false);
    });
  });

  describe('merge', () => {
    test('merges branch successfully', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'branch') {
          callback(null, '* main\n  develop\n', '');
        } else {
          callback(null, 'Merged develop\n', '');
        }
      });

      const result = await wrapper.merge('develop');
      expect(result.success).toBe(true);
    });

    test('requires branch name', async () => {
      const result = await wrapper.merge(null);
      expect(result.success).toBe(false);
    });

    test('checks if branch exists', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'branch') {
          callback(null, '* main\n', '');
        } else {
          callback(new Error('Not found'));
        }
      });

      const result = await wrapper.merge('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('supports merge options', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'branch') {
          callback(null, '* main\n  feature/xyz\n', '');
        } else {
          expect(args).toContain('--no-ff');
          callback(null, 'Merged', '');
        }
      });

      await wrapper.merge('feature/xyz', { noFF: true });
    });
  });

  describe('reset', () => {
    test('resets to commit successfully', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'status') {
          callback(null, '', '');  // No changes
        } else {
          callback(null, 'Reset successful\n', '');
        }
      });

      const result = await wrapper.reset('HEAD~1');
      expect(result.success).toBe(true);
    });

    test('requires target', async () => {
      const result = await wrapper.reset(null);
      expect(result.success).toBe(false);
    });

    test('prevents hard reset with uncommitted changes', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'status' && args[1] === '--porcelain') {
          callback(null, 'M file.js\n', '');
        } else {
          callback(null, 'output', '');
        }
      });

      const result = await wrapper.reset('HEAD~1', { hard: true });
      expect(result.success).toBe(false);
      expect(result.message).toContain('uncommitted changes');
    });

    test('allows hard reset when clean', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'status' && args[1] === '--porcelain') {
          callback(null, '', '');  // No changes
        } else if (args[0] === 'reset') {
          expect(args).toContain('--hard');
          callback(null, 'output', '');
        }
      });

      const result = await wrapper.reset('HEAD~1', { hard: true });
      expect(result.success).toBe(true);
    });
  });

  describe('rebase', () => {
    test('rebases onto target successfully', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(null, 'Rebased\n', '');
      });

      const result = await wrapper.rebase('develop');
      expect(result.success).toBe(true);
    });

    test('requires target', async () => {
      const result = await wrapper.rebase(null);
      expect(result.success).toBe(false);
    });

    test('blocks interactive rebase', async () => {
      const result = await wrapper.rebase('develop', { interactive: true });
      expect(result.success).toBe(false);
      expect(result.message).toContain('must be run manually');
    });

    test('supports autosquash option', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        expect(args).toContain('--autosquash');
        callback(null, 'output', '');
      });

      await wrapper.rebase('develop', { autosquash: true });
    });
  });

  describe('cherryPick', () => {
    test('cherry-picks commit successfully', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'rev-parse') {
          callback(null, 'abc123\n', '');  // Commit exists
        } else {
          callback(null, 'Cherry-picked\n', '');
        }
      });

      const result = await wrapper.cherryPick('abc123');
      expect(result.success).toBe(true);
    });

    test('requires commit hash', async () => {
      const result = await wrapper.cherryPick(null);
      expect(result.success).toBe(false);
    });

    test('validates commit exists', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'rev-parse') {
          callback(new Error('Not a valid ref'));
        } else {
          callback(null, 'output', '');
        }
      });

      const result = await wrapper.cherryPick('invalid-hash');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('logging', () => {
    test('logs successful operations', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'status') {
          callback(null, '', '');
        } else if (args[0] === 'remote') {
          callback(null, 'origin\n', '');
        } else if (args[0] === 'branch') {
          callback(null, '* main\n', '');
        } else {
          callback(null, 'success\n', '');
        }
      });

      await wrapper.push('main', 'origin');

      expect(fs.appendFile).toHaveBeenCalled();
      const logCall = fs.appendFile.mock.calls[0];
      expect(logCall[1]).toContain('success');
    });

    test('logs failed operations', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(new Error('Test error'));
      });

      await wrapper.push('main', 'origin');

      expect(fs.appendFile).toHaveBeenCalled();
      const logCall = fs.appendFile.mock.calls[0];
      expect(logCall[1]).toContain('error');
    });
  });

  describe('result structure', () => {
    test('includes duration in result', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'status') {
          callback(null, '', '');
        } else if (args[0] === 'remote') {
          callback(null, 'origin\n', '');
        } else if (args[0] === 'branch') {
          callback(null, '* main\n', '');
        } else {
          callback(null, 'output\n', '');
        }
      });

      const result = await wrapper.push('main', 'origin');
      expect(result.duration).toBeDefined();
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    test('omits error field on success', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        if (args[0] === 'status') {
          callback(null, '', '');
        } else if (args[0] === 'remote') {
          callback(null, 'origin\n', '');
        } else if (args[0] === 'branch') {
          callback(null, '* main\n', '');
        } else {
          callback(null, 'output\n', '');
        }
      });

      const result = await wrapper.push('main', 'origin');
      expect(result.error).not.toBeDefined();
    });

    test('includes error on failure', async () => {
      mockExecFile.mockImplementation((cmd, args, opts, callback) => {
        callback(new Error('Test error'));
      });

      const result = await wrapper.push('main', 'origin');
      expect(result.error).toBeDefined();
    });
  });
});
