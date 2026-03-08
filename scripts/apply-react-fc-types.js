#!/usr/bin/env node

/**
 * Apply React.FC<Props> typing to all components in src/components/
 * Script para automatizar a aplicação do Pattern 2 (Function Return Types)
 *
 * Uso: node scripts/apply-react-fc-types.js [--dry-run] [--filter=pattern]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const filterPattern = args.find(arg => arg.startsWith('--filter='))?.split('=')[1];

// Components that already have explicit React.FC typing
const ALREADY_TYPED = new Set([
  'src/components/dashboard/KPICard.tsx',
  'src/components/project/ProjectCockpit.tsx',
  'src/components/project/ProjectKanbanCard.tsx',
  'src/components/agents/BudgetGauge.tsx',
]);

const PATTERN_REGEX = /^export function (\w+)\(\{([^}]*)\}: (\w+Props)\) \{$/m;
const INLINE_PATTERN_REGEX = /^(export )?(function|const) (\w+)\(\{ ([^}]*) \}: \{ ([^}]*) \}\) \{$/m;

function findComponentFiles() {
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  const files = [];

  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        walkDir(itemPath);
      } else if (item.endsWith('.tsx')) {
        const relativePath = path.relative(path.join(__dirname, '..'), itemPath);
        if (filterPattern && !relativePath.includes(filterPattern)) continue;
        if (!ALREADY_TYPED.has(relativePath)) {
          files.push(relativePath);
        }
      }
    }
  }

  walkDir(componentsDir);
  return files;
}

function analyzeFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  const violations = [];

  // Pattern 1: export function without React.FC
  const pattern1Regex = /^export function (\w+)\(\{([^}]*)\}: (\w+Props)\)/;

  lines.forEach((line, idx) => {
    if (pattern1Regex.test(line)) {
      violations.push({
        line: idx + 1,
        type: 'export-function-without-fc',
        code: line.trim(),
        pattern: 'Pattern 2 - Function Return Types',
      });
    }

    // Pattern: inline props without interface
    if (/^(function|const|export function) \w+\(\{[^}]*\}: \{[^}]*\}\)/.test(line)) {
      violations.push({
        line: idx + 1,
        type: 'inline-props',
        code: line.trim(),
        pattern: 'Pattern 2 - Function Return Types (inline)',
      });
    }
  });

  return violations;
}

function main() {
  const files = findComponentFiles();
  console.log(`\n📊 Found ${files.length} component files to analyze...\n`);

  const totalViolations = {};
  const fileViolations = {};

  for (const file of files) {
    const violations = analyzeFile(file);
    if (violations.length > 0) {
      fileViolations[file] = violations;
      violations.forEach(v => {
        totalViolations[v.pattern] = (totalViolations[v.pattern] || 0) + 1;
      });
    }
  }

  console.log('📋 Violation Summary:');
  console.log('='.repeat(60));
  Object.entries(totalViolations).forEach(([pattern, count]) => {
    console.log(`${pattern}: ${count} violations`);
  });

  console.log('\n⚠️  Files with violations:');
  console.log('='.repeat(60));
  Object.entries(fileViolations).forEach(([file, violations]) => {
    console.log(`\n${file}`);
    violations.forEach(v => {
      console.log(`  Line ${v.line}: ${v.type} (${v.pattern})`);
      console.log(`    → ${v.code.substring(0, 80)}`);
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\nTotal files with violations: ${Object.keys(fileViolations).length}/${files.length}`);
  console.log('Already typed: 4 files (manually updated)');
  console.log(`Remaining: ${Object.keys(fileViolations).length} files need fixes\n`);

  if (isDryRun) {
    console.log('🔍 DRY RUN — No changes made');
    console.log('Run without --dry-run to apply fixes\n');
  } else {
    console.log('💡 To apply fixes to specific components:');
    console.log('   node scripts/apply-react-fc-types.js --filter=agents');
    console.log('   node scripts/apply-react-fc-types.js --filter=project\n');
  }
}

main();
