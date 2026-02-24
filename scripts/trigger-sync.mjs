#!/usr/bin/env node
/**
 * Trigger manual sync via API
 */

import { readFileSync } from 'fs';

// Carregar URL da aplicação do .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Use localhost para teste local ou URL de produção
const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🚀 Triggering sync via ${baseUrl}/api/integracoes/sync...`);
console.log('⚠️  Nota: Este endpoint requer autenticação. Use o frontend para testar.\n');

console.log('📝 Comando alternativo via curl:');
console.log(`curl -X POST ${baseUrl}/api/integracoes/sync \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"\n`);

console.log('✅ Para testar: acesse /integracoes no navegador e clique em "Sincronizar Agora"');
