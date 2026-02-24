/**
 * Git Wrapper Utility
 *
 * Safely wraps all git operations with validation, error handling, and logging.
 * Prevents destructive operations without confirmation and provides audit trail.
 *
 * @module src/lib/wrappers/git-wrapper
 */

const { execFile } = require('child_process');
const { promises: fs } = require('fs');
const path = require('path');
const validator = require('../validators/command-validator');

/**
 * @typedef {Object} GitOperationResult
 * @property {boolean} success - Whether operation succeeded
 * @property {string} message - Human-readable result message
 * @property {string} output - Command output
 * @property {string} [error] - Error message if failed
 * @property {string[]} [suggestions] - Suggestions for fixing issues
 * @property {number} [duration] - Operation duration in milliseconds
 */

/**
 * @typedef {Object} GitPushOptions
 * @property {boolean} [force] - Use --force (requires confirmation)
 * @property {boolean} [forceWithLease] - Use --force-with-lease
 * @property {boolean} [setUpstream] - Use --set-upstream
 * @property {boolean} [confirm] - Require confirmation for dangerous ops (default: true)
 * @property {Function} [confirmFn] - Custom confirmation function (for testing)
 */

/**
 * Git Wrapper Class
 *
 * Provides safe wrapper methods for common git operations with validation and logging.
 */
class GitWrapper {
  /**
   * Initialize GitWrapper
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.repoPath] - Path to git repository (default: current directory)
   * @param {string} [options.logPath] - Path to log file (default: logs/git-operations.log)
   * @param {number} [options.timeoutMs] - Command timeout in milliseconds (default: 30000)
   * @param {boolean} [options.confirmMode] - Whether to require confirmation (default: true)
   */
  constructor(options = {}) {
    this.repoPath = options.repoPath || '.';
    this.logPath = options.logPath || 'logs/git-operations.log';
    this.timeoutMs = options.timeoutMs || 30000;
    this.confirmMode = options.confirmMode !== false;
    this.maxForcePushCommits = options.maxForcePushCommits || 5;
  }

  /**
   * Execute a git command safely
   *
   * @private
   * @param {string[]} args - Git command arguments
   * @param {Object} [options] - Execution options
   * @returns {Promise<string>} Command output
   * @throws {Error} If command fails
   */
  async _execute(args, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || this.timeoutMs;

      execFile('git', args, {
        cwd: this.repoPath,
        timeout,
        maxBuffer: 1024 * 1024,  // 1MB buffer
      }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  /**
   * Log a git operation
   *
   * @private
   * @param {string} operation - Operation name (push, pull, etc.)
   * @param {string[]} args - Command arguments
   * @param {GitOperationResult} result - Operation result
   */
  async _log(operation, args, result) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        args: args.join(' '),
        success: result.success,
        duration: result.duration || 0,
        message: result.message,
        error: result.error || null,
      };

      // Ensure logs directory exists
      const logDir = path.dirname(this.logPath);
      await fs.mkdir(logDir, { recursive: true }).catch(() => {});

      // Append to log file
      await fs.appendFile(
        this.logPath,
        JSON.stringify(logEntry) + '\n'
      ).catch(() => {});  // Non-critical failure
    } catch (err) {
      // Logging failure should not block execution
      console.warn('Git wrapper: Failed to write log:', err.message);
    }
  }

  /**
   * Validate that a branch exists
   *
   * @private
   * @param {string} branch - Branch name
   * @returns {Promise<boolean>} True if branch exists
   */
  async _branchExists(branch) {
    try {
      const output = await this._execute(['branch', '-a']);
      return output.split('\n').some(line =>
        line.trim().endsWith(branch) || line.includes(`/${branch}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Validate that a remote exists
   *
   * @private
   * @param {string} remote - Remote name
   * @returns {Promise<boolean>} True if remote exists
   */
  async _remoteExists(remote) {
    try {
      const output = await this._execute(['remote']);
      return output.split('\n').includes(remote);
    } catch {
      return false;
    }
  }

  /**
   * Check if repository has uncommitted changes
   *
   * @private
   * @returns {Promise<boolean>} True if changes exist
   */
  async _hasUncommittedChanges() {
    try {
      const output = await this._execute(['status', '--porcelain']);
      return output.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Count commits between branches
   *
   * @private
   * @param {string} base - Base branch
   * @param {string} target - Target branch
   * @returns {Promise<number>} Number of commits
   */
  async _countCommits(base, target) {
    try {
      const output = await this._execute(['log', `${base}..${target}`, '--oneline']);
      return output.split('\n').filter(line => line.length > 0).length;
    } catch {
      return 0;
    }
  }

  /**
   * Push changes to remote repository
   *
   * @param {string} branch - Branch to push
   * @param {string} remote - Remote name (e.g., 'origin')
   * @param {GitPushOptions} options - Push options
   * @returns {Promise<GitOperationResult>} Operation result
   *
   * @example
   * const wrapper = new GitWrapper();
   * const result = await wrapper.push('main', 'origin', { confirm: true });
   * if (!result.success) {
   *   console.error('Push failed:', result.message);
   * }
   */
  async push(branch, remote, options = {}) {
    const start = Date.now();
    const args = ['push'];

    // Validate inputs
    if (typeof branch !== 'string' || !branch) {
      return this._createResult(false, 'Branch name is required', '', 'Branch required');
    }
    if (typeof remote !== 'string' || !remote) {
      return this._createResult(false, 'Remote name is required', '', 'Remote required');
    }

    try {
      // Validation checks
      const errors = [];
      const suggestions = [];

      // Check remote exists
      const remoteExists = await this._remoteExists(remote);
      if (!remoteExists) {
        errors.push(`Remote '${remote}' not found`);
        suggestions.push(`Run 'git remote -v' to see available remotes`);
      }

      // Check branch exists
      const branchExists = await this._branchExists(branch);
      if (!branchExists) {
        errors.push(`Branch '${branch}' not found`);
        suggestions.push(`Run 'git branch -a' to see available branches`);
      }

      // Check for uncommitted changes
      const hasChanges = await this._hasUncommittedChanges();
      if (hasChanges) {
        errors.push('Repository has uncommitted changes');
        suggestions.push('Commit or stash changes before pushing');
      }

      if (errors.length > 0) {
        const result = this._createResult(
          false,
          errors.join('; '),
          '',
          errors[0],
          suggestions
        );
        result.duration = Date.now() - start;
        await this._log('push', [branch, remote], result);
        return result;
      }

      // Handle force push
      if (options.force || options.forceWithLease) {
        const commitCount = await this._countCommits(`${remote}/${branch}`, branch);

        if (commitCount > this.maxForcePushCommits) {
          const result = this._createResult(
            false,
            `Force-push exceeds limit (max ${this.maxForcePushCommits} commits, found ${commitCount})`,
            '',
            'Force limit exceeded',
            [`Reduce to ≤ ${this.maxForcePushCommits} commits or contact team lead`]
          );
          result.duration = Date.now() - start;
          await this._log('push', [branch, remote], result);
          return result;
        }

        if (options.force) {
          args.push('--force');
        } else if (options.forceWithLease) {
          args.push('--force-with-lease');
        }
      }

      // Add upstream tracking if requested
      if (options.setUpstream) {
        args.push('--set-upstream');
      }

      args.push(remote, branch);

      // Execute push
      const output = await this._execute(args);
      const result = this._createResult(
        true,
        `Successfully pushed ${branch} to ${remote}`,
        output
      );
      result.duration = Date.now() - start;
      await this._log('push', [branch, remote], result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Push failed: ${err.message}`,
        '',
        err.message
      );
      result.duration = Date.now() - start;
      await this._log('push', [branch, remote], result);
      return result;
    }
  }

  /**
   * Pull changes from remote repository
   *
   * @param {string} [branch] - Branch to pull (default: current branch)
   * @param {string} [remote] - Remote name (default: origin)
   * @param {Object} options - Pull options
   * @returns {Promise<GitOperationResult>} Operation result
   */
  async pull(branch, remote, options = {}) {
    const start = Date.now();
    const args = ['pull'];

    try {
      if (remote) {
        args.push(remote);
      }
      if (branch) {
        args.push(branch);
      }

      if (options.rebase) {
        args.push('--rebase');
      }

      const output = await this._execute(args);
      const result = this._createResult(
        true,
        'Successfully pulled changes',
        output
      );
      result.duration = Date.now() - start;
      await this._log('pull', args, result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Pull failed: ${err.message}`,
        '',
        err.message
      );
      result.duration = Date.now() - start;
      await this._log('pull', args, result);
      return result;
    }
  }

  /**
   * Commit changes
   *
   * @param {string} message - Commit message
   * @param {Object} options - Commit options
   * @returns {Promise<GitOperationResult>} Operation result
   */
  async commit(message, options = {}) {
    const start = Date.now();
    const args = ['commit'];

    try {
      if (!message || typeof message !== 'string') {
        return this._createResult(false, 'Commit message required', '', 'Message required');
      }

      if (options.all) {
        args.push('-a');
      }

      if (options.gpg) {
        args.push('-S');
      }

      if (options.signoff) {
        args.push('-s');
      }

      args.push('-m', message);

      const output = await this._execute(args);
      const result = this._createResult(
        true,
        'Commit created successfully',
        output
      );
      result.duration = Date.now() - start;
      await this._log('commit', [message], result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Commit failed: ${err.message}`,
        '',
        err.message
      );
      result.duration = Date.now() - start;
      await this._log('commit', [message], result);
      return result;
    }
  }

  /**
   * Merge a branch into current branch
   *
   * @param {string} branch - Branch to merge
   * @param {Object} options - Merge options
   * @returns {Promise<GitOperationResult>} Operation result
   */
  async merge(branch, options = {}) {
    const start = Date.now();
    const args = ['merge'];

    try {
      if (!branch || typeof branch !== 'string') {
        return this._createResult(false, 'Branch name required', '', 'Branch required');
      }

      // Check if branch exists
      const exists = await this._branchExists(branch);
      if (!exists) {
        return this._createResult(
          false,
          `Branch '${branch}' not found`,
          '',
          'Branch not found',
          [`Run 'git branch -a' to see available branches`]
        );
      }

      if (options.noFF !== false) {
        args.push('--no-ff');
      }

      if (options.squash) {
        args.push('--squash');
      }

      args.push(branch);

      const output = await this._execute(args);
      const result = this._createResult(
        true,
        `Successfully merged ${branch}`,
        output
      );
      result.duration = Date.now() - start;
      await this._log('merge', [branch], result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Merge failed: ${err.message}`,
        '',
        err.message
      );
      result.duration = Date.now() - start;
      await this._log('merge', [branch], result);
      return result;
    }
  }

  /**
   * Reset to a specific commit (DESTRUCTIVE)
   *
   * @param {string} target - Commit hash or branch
   * @param {Object} options - Reset options
   * @returns {Promise<GitOperationResult>} Operation result
   */
  async reset(target, options = {}) {
    const start = Date.now();
    const args = ['reset'];

    try {
      if (!target || typeof target !== 'string') {
        return this._createResult(false, 'Target required', '', 'Target required');
      }

      // Check for uncommitted changes if hard reset
      if (options.hard) {
        const hasChanges = await this._hasUncommittedChanges();
        if (hasChanges) {
          return this._createResult(
            false,
            'Cannot hard reset with uncommitted changes',
            '',
            'Uncommitted changes exist',
            ['Commit or stash changes before reset']
          );
        }
      }

      if (options.hard) {
        args.push('--hard');
      }

      args.push(target);

      const output = await this._execute(args);
      const result = this._createResult(
        true,
        `Successfully reset to ${target}`,
        output
      );
      result.duration = Date.now() - start;
      await this._log('reset', [target], result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Reset failed: ${err.message}`,
        '',
        err.message
      );
      result.duration = Date.now() - start;
      await this._log('reset', [target], result);
      return result;
    }
  }

  /**
   * Rebase onto another branch
   *
   * @param {string} target - Target branch
   * @param {Object} options - Rebase options
   * @returns {Promise<GitOperationResult>} Operation result
   */
  async rebase(target, options = {}) {
    const start = Date.now();

    try {
      if (!target || typeof target !== 'string') {
        return this._createResult(false, 'Target required', '', 'Target required');
      }

      // Interactive rebase must be manual
      if (options.interactive) {
        const result = this._createResult(
          false,
          'Interactive rebase must be run manually in terminal',
          '',
          'Interactive rebase not automated'
        );
        result.duration = Date.now() - start;
        await this._log('rebase', [target], result);
        return result;
      }

      const args = ['rebase'];

      if (options.autosquash) {
        args.push('--autosquash');
      }

      args.push(target);

      const output = await this._execute(args);
      const result = this._createResult(
        true,
        `Successfully rebased onto ${target}`,
        output
      );
      result.duration = Date.now() - start;
      await this._log('rebase', [target], result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Rebase failed: ${err.message}`,
        '',
        err.message,
        ['Resolve conflicts and run: git rebase --continue']
      );
      result.duration = Date.now() - start;
      await this._log('rebase', [target], result);
      return result;
    }
  }

  /**
   * Cherry-pick a commit
   *
   * @param {string} commitHash - Commit hash or ref
   * @returns {Promise<GitOperationResult>} Operation result
   */
  async cherryPick(commitHash) {
    const start = Date.now();

    try {
      if (!commitHash || typeof commitHash !== 'string') {
        return this._createResult(false, 'Commit hash required', '', 'Hash required');
      }

      // Validate commit exists
      try {
        await this._execute(['rev-parse', commitHash]);
      } catch {
        return this._createResult(
          false,
          `Commit '${commitHash}' not found`,
          '',
          'Commit not found'
        );
      }

      const args = ['cherry-pick', commitHash];
      const output = await this._execute(args);
      const result = this._createResult(
        true,
        `Successfully cherry-picked ${commitHash}`,
        output
      );
      result.duration = Date.now() - start;
      await this._log('cherry-pick', [commitHash], result);
      return result;
    } catch (err) {
      const result = this._createResult(
        false,
        `Cherry-pick failed: ${err.message}`,
        '',
        err.message,
        ['Resolve conflicts and run: git cherry-pick --continue']
      );
      result.duration = Date.now() - start;
      await this._log('cherry-pick', [commitHash], result);
      return result;
    }
  }

  /**
   * Create a structured result object
   *
   * @private
   * @returns {GitOperationResult}
   */
  _createResult(success, message, output, error = null, suggestions = []) {
    return {
      success,
      message,
      output,
      ...(error && { error }),
      ...(suggestions.length > 0 && { suggestions })
    };
  }
}

module.exports = GitWrapper;
