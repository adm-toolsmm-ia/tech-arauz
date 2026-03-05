const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const supaKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(supaUrl, supaKey);

async function main() {
    // Estado das tabelas alvo
    const { count: horas } = await sb.from('project_horas_lancadas').select('*', { count: 'exact', head: true }).eq('tenant_id', '00000000-0000-0000-0000-000000000001');
    const { count: tempo } = await sb.from('project_tempo_permanencia').select('*', { count: 'exact', head: true }).eq('tenant_id', '00000000-0000-0000-0000-000000000001');
    const { count: projetos } = await sb.from('projects').select('*', { count: 'exact', head: true }).eq('tenant_id', '00000000-0000-0000-0000-000000000001');

    console.log('📊 Estado das tabelas:');
    console.log(`  projects: ${projetos} registros`);
    console.log(`  project_horas_lancadas: ${horas} registros`);
    console.log(`  project_tempo_permanencia: ${tempo} registros`);

    // Projetos com pasta_consultivo
    const { data: projetosComPasta } = await sb.from('projects').select('espaider_id, pasta_consultivo').eq('tenant_id', '00000000-0000-0000-0000-000000000001').not('pasta_consultivo', 'is', null).limit(10);
    console.log(`\n📂 Projetos com pasta_consultivo (${projetosComPasta?.length || 0}):`);
    projetosComPasta?.slice(0, 5).forEach(p => console.log(`  espaider_id=${p.espaider_id}, pasta="${p.pasta_consultivo}"`));

    // Últimos logs
    const { data: logs } = await sb.from('integration_log_entries').select('level, dataset, message, logged_at').eq('tenant_id', '00000000-0000-0000-0000-000000000001').order('logged_at', { ascending: false }).limit(20);
    console.log(`\n📋 Últimos 20 logs (${logs?.length || 0}):`);
    logs?.forEach(l => console.log(`  [${l.level}] ${l.dataset}: ${l.message} (${new Date(l.logged_at).toLocaleString('pt-BR')})`));

    // APIs configuradas
    const { data: apis } = await sb.from('espaider_apis').select('tipo, identificador, is_active, last_sync_status, token');
    console.log('\n🔌 APIs configuradas:');
    apis?.forEach(a => console.log(`  [${a.tipo}] ativo=${a.is_active}, status=${a.last_sync_status}, token=${a.token ? a.token.substring(0, 10) + '...' : 'VAZIO'}, id=${a.identificador}`));
}

main().catch(console.error);
