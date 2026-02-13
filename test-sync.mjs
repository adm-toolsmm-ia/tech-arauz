#!/usr/bin/env node
/**
 * Script de teste: Sync de Históricos e Aprovadores
 * Executa sync e verifica se dados foram importados
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Carregar env vars do .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Env vars não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔍 Verificando estrutura das tabelas...\n');

  // 1. Verificar se colunas existem
  const tables = ['project_histories', 'project_approvers', 'project_budgets'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Erro ao consultar ${table}:`, error.message);
    } else {
      console.log(`✅ ${table}: ${data?.length || 0} registro(s) encontrado(s)`);
      if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        const hasNewCols = keys.includes('tenant_id') && keys.includes('espaider_id') && keys.includes('espaider_raw');
        console.log(`   Colunas novas: ${hasNewCols ? '✅ tenant_id, espaider_id, espaider_raw' : '❌ FALTANDO'}`);
      }
    }
  }

  console.log('\n📊 Contagem de registros...\n');

  // 2. Contar registros
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`   ${table}: ${count} registro(s)`);
    }
  }

  console.log('\n📋 Verificando logs de sincronização recentes...\n');

  // 3. Verificar logs recentes
  const { data: logs, error: logsError } = await supabase
    .from('integration_log_entries')
    .select('dataset, level, message, created_at')
    .in('dataset', ['Historicos', 'Aprovadores', 'Orcamentos'])
    .order('created_at', { ascending: false })
    .limit(10);

  if (logsError) {
    console.error('❌ Erro ao buscar logs:', logsError.message);
  } else if (logs && logs.length > 0) {
    console.log(`✅ ${logs.length} log(s) encontrado(s):`);
    logs.forEach(log => {
      const emoji = log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : '✅';
      console.log(`   ${emoji} [${log.dataset}] ${log.message} (${new Date(log.created_at).toLocaleString('pt-BR')})`);
    });
  } else {
    console.log('⚠️ Nenhum log encontrado - sync ainda não foi executado');
  }

  console.log('\n✅ Verificação concluída!\n');
}

main().catch(console.error);
