/**
 * Command Validator Utility
 *
 * Validates and normalizes commands before execution to catch syntax errors,
 * missing environment variables, and path problems early and consistently.
 *
 * @module src/lib/validators/command-validator
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether command passed all validations
 * @property {string[]} errors - Critical issues (command cannot execute)
 * @property {string[]} warnings - Non-critical issues (execution may have problems)
 * @property {string} normalizedCommand - Normalized command (lowercase, trimmed)
 * @property {string[]} normalizedArgs - Normalized arguments (trimmed, deduplicated)
 * @property {string[]} suggestions - Suggestions for fixing issues
 */

/**
 * @typedef {Object} ValidationOptions
 * @property {string[]} [requiredEnvVars] - Environment variables that must be defined
 * @property {string[]} [dangerousPatterns] - Patterns that trigger safety warnings
 * @property {string[]} [allowedCommands] - Whitelist of allowed commands (optional)
 * @property {boolean} [checkPaths=true] - Whether to check paths for issues
 * @property {boolean} [normalizePaths=true] - Whether to normalize paths
 */

/**
 * @typedef {Object} PathValidationResult
 * @property {boolean} isSafe - Whether path is safe to use
 * @property {string[]} issues - List of detected issues
 * @property {string} suggestion - Suggested fix or escaped path
 */

/**
 * @typedef {Object} EnvVarCheckResult
 * @property {string[]} missing - List of missing environment variables
 * @property {Object} defined - Map of defined variables and their values
 */

// Dangerous path patterns that should be rejected
const DANGEROUS_PATHS = [
  /^\/$/,                    // Root directory
  /^\/etc\//,               // System config
  /^\/sys\//,               // System files
  /^\/proc\//,              // Process files
  /^\/dev\//,               // Device files
  /^\/boot\//,              // Boot files
  /^\/root\//,              // Root home
  /~\/\*/,                  // Home wildcard expansion
  /\.\.\/\.\.\/\.\.\//,     // Multiple traversals
];

// Commands that are allowed
const DEFAULT_ALLOWED_COMMANDS = [
  'git', 'gh', 'npm', 'yarn', 'pnpm',
  'node', 'npx', 'bash', 'sh', 'rm', 'mv', 'cp',
  'mkdir', 'touch', 'cat', 'ls', 'cd', 'pwd',
];

/**
 * Validates and normalizes a command before execution
 *
 * @param {string} command - The command to execute (e.g., 'git')
 * @param {string[]} args - Array of arguments for the command
 * @param {ValidationOptions} options - Validation configuration
 * @returns {ValidationResult} Validation result with detailed feedback
 *
 * @example
 * const result = validateCommand('git', ['push', 'origin', 'main'], {
 *   requiredEnvVars: ['GIT_AUTHOR_EMAIL'],
 *   dangerousPatterns: ['--force']
 * });
 *
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 *   process.exit(1);
 * }
 */
function validateCommand(command, args = [], options = {}) {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  // Validate command type
  if (typeof command !== 'string') {
    errors.push('Command must be a string');
    return createResult(false, errors, warnings, command, args, suggestions);
  }

  if (!Array.isArray(args)) {
    errors.push('Arguments must be an array');
    return createResult(false, errors, warnings, command, [], suggestions);
  }

  // Normalize command
  const normalizedCommand = normalizeCommand(command);

  // Check for empty command
  if (!normalizedCommand) {
    errors.push('Command cannot be empty or whitespace-only');
    return createResult(false, errors, warnings, normalizedCommand, args, suggestions);
  }

  // Check for spaces in command (should be single word)
  if (normalizedCommand.includes(' ')) {
    errors.push('Command must be a single word (no spaces). Use args array instead.');
    suggestions.push(`Consider: ${normalizedCommand.split(' ')[0]}`);
    return createResult(false, errors, warnings, normalizedCommand, args, suggestions);
  }

  // Check for null/undefined arguments
  const invalidArgs = args.filter(arg => arg === null || arg === undefined);
  if (invalidArgs.length > 0) {
    errors.push(`Found ${invalidArgs.length} null/undefined argument(s)`);
  }

  // Normalize arguments
  const normalizedArgs = args
    .filter(arg => arg !== null && arg !== undefined)
    .map(arg => String(arg).trim())
    .filter(arg => arg.length > 0);

  // Check required environment variables
  if (options.requiredEnvVars && Array.isArray(options.requiredEnvVars)) {
    const envCheck = checkEnvVars(options.requiredEnvVars);
    if (envCheck.missing.length > 0) {
      errors.push(`Missing environment variables: ${envCheck.missing.join(', ')}`);
      suggestions.push(`Set these variables: export ${envCheck.missing.join(' && export ')}`);
    }
  }

  // Check for dangerous patterns
  if (options.dangerousPatterns && Array.isArray(options.dangerousPatterns)) {
    for (const pattern of options.dangerousPatterns) {
      const found = [normalizedCommand, ...normalizedArgs].some(item =>
        item.includes(pattern)
      );
      if (found) {
        warnings.push(`Dangerous pattern detected: '${pattern}'`);
      }
    }
  }

  // Check paths if enabled
  if (options.checkPaths !== false) {
    for (const arg of normalizedArgs) {
      if (isPathLike(arg)) {
        const pathCheck = validatePath(arg);
        if (!pathCheck.isSafe) {
          if (pathCheck.issues.some(issue => issue.includes('dangerous'))) {
            errors.push(`Unsafe path: ${arg} - ${pathCheck.issues[0]}`);
            suggestions.push(pathCheck.suggestion);
          } else {
            warnings.push(`Path issue: ${arg} - ${pathCheck.issues[0]}`);
            if (pathCheck.suggestion) {
              suggestions.push(`Suggestion: ${pathCheck.suggestion}`);
            }
          }
        }
      }
    }
  }

  const isValid = errors.length === 0;
  return createResult(isValid, errors, warnings, normalizedCommand, normalizedArgs, suggestions);
}

/**
 * Validates a file system path for safety
 *
 * @param {string} path - The path to validate
 * @returns {PathValidationResult} Validation result with issues and suggestions
 *
 * @example
 * const result = validatePath('/path with spaces/file.txt');
 * // Returns: { isSafe: false, issues: ['Spaces in path'], suggestion: "'/path with spaces/file.txt'" }
 */
function validatePath(path) {
  const issues = [];
  let suggestion = null;

  if (typeof path !== 'string') {
    return {
      isSafe: false,
      issues: ['Path must be a string'],
      suggestion: null
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATHS) {
    if (pattern.test(path)) {
      return {
        isSafe: false,
        issues: ['Path matches dangerous pattern'],
        suggestion: 'Use a safer path'
      };
    }
  }

  // Check for spaces in path
  if (path.includes(' ')) {
    issues.push('Spaces in path - must be escaped');
    // Suggest escaping with quotes (most portable)
    suggestion = `'${path}'`;
  }

  // Check for relative paths with ../ (potential traversal)
  if (path.includes('..')) {
    issues.push('Path contains .. (parent directory reference)');
  }

  // Check for unescaped wildcards (but * in args is OK)
  if (path.includes('*') && !path.startsWith("'") && !path.startsWith('"')) {
    issues.push('Wildcard * not quoted - may expand unexpectedly');
    suggestion = `'${path}'`;
  }

  const isSafe = issues.length === 0;
  return { isSafe, issues, suggestion };
}

/**
 * Checks if required environment variables are defined
 *
 * @param {string[]} envVarNames - List of environment variable names to check
 * @param {Object} [defaults] - Optional default values for missing vars
 * @returns {EnvVarCheckResult} Object with missing and defined variables
 *
 * @example
 * const result = checkEnvVars(['GITHUB_TOKEN', 'GIT_AUTHOR']);
 * // Returns: { missing: ['GIT_AUTHOR'], defined: { GITHUB_TOKEN: '...' } }
 */
function checkEnvVars(envVarNames, defaults = {}) {
  const missing = [];
  const defined = {};

  for (const varName of envVarNames) {
    const value = process.env[varName];
    if (!value && !defaults[varName]) {
      missing.push(varName);
    } else if (value) {
      defined[varName] = value;
    } else if (defaults[varName]) {
      defined[varName] = defaults[varName];
    }
  }

  return { missing, defined };
}

/**
 * Normalizes a command string
 *
 * Applies: lowercase, trim whitespace, deduplicate spaces
 *
 * @param {string} command - The command to normalize
 * @returns {string} Normalized command
 *
 * @example
 * normalizeCommand('  Git  ')  // Returns: 'git'
 * normalizeCommand('  cd  ..')  // Returns: 'cd' (takes first word)
 */
function normalizeCommand(command) {
  if (typeof command !== 'string') {
    return '';
  }

  return command
    .trim()
    .toLowerCase()
    .split(/\s+/)[0];  // Take only first word
}

/**
 * Detects if a string looks like a file path
 *
 * @private
 * @param {string} str - String to check
 * @returns {boolean} True if string appears to be a path
 */
function isPathLike(str) {
  if (typeof str !== 'string') return false;

  // Looks like path if contains slashes or dots
  return /[\/\\]|\.\.|^\~/.test(str);
}

/**
 * Creates a structured validation result object
 *
 * @private
 * @returns {ValidationResult}
 */
function createResult(isValid, errors, warnings, command, args, suggestions) {
  return {
    isValid,
    errors: errors || [],
    warnings: warnings || [],
    normalizedCommand: command,
    normalizedArgs: args || [],
    suggestions: suggestions || []
  };
}

// Export functions
module.exports = {
  validateCommand,
  validatePath,
  checkEnvVars,
  normalizeCommand,

  // For testing
  _internal: {
    isPathLike,
    DANGEROUS_PATHS,
    DEFAULT_ALLOWED_COMMANDS
  }
};
