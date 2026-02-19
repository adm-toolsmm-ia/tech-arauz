
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

// Manual env var loading
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
} catch (e) {
    console.warn('⚠️ .env.local not found, trying .env');
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    } catch (e2) {
        // ignore
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Env vars not found! Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function truncateTables() {
    console.log('🗑️  Iniciando limpeza das tabelas de projetos...');

    // Ordem de dependência (filhos primeiro)
    const tables = [
        'project_histories',
        'project_approvers',
        'project_budgets',
        'project_phases',
        'project_schedules',
        'project_deliveries',
        'project_requirements',
        'project_notes',
        'projects'
    ];

    for (const table of tables) {
        process.stdout.write(`   Limpando ${table}... `);

        // Usando delete com filtro 'id' não nulo (assume que id é PK e sempre existe)
        // Para garantir a limpeza completa, usamos um filtro que sempre é verdadeiro se houver dados.
        // 'neq' id '00000000-0000-0000-0000-000000000000' é seguro para UUIDs.
        // Se a tabela usar ID numérico, isso falharia. Vamos verificar schema.
        // PROJECT tables usam UUID ou Serial?
        // 019_rollback_and_fix_child_tables.sql mostra IDs como UUID default gen_random_uuid().

        const { error, count } = await supabase
            .from(table)
            .delete({ count: 'exact' })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
            console.log(`❌ Erro: ${error.message}`);
        } else {
            console.log(`✅ ${count} registros removidos.`);
        }
    }
}

truncateTables().catch(console.error);
