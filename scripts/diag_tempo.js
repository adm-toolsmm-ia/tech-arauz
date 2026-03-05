const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const supaKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(supaUrl, supaKey);

async function main() {
    // 1. Amostra de tempo_permanencia com espaider_raw
    const { data: tempos } = await sb
        .from('project_tempo_permanencia')
        .select('id, fase, responsavel, situacao, espaider_raw')
        .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
        .limit(3);

    console.log(`\n📊 project_tempo_permanencia (${tempos?.length || 0} registros):`);
    tempos?.forEach(t => {
        console.log(`  fase="${t.fase}", responsavel="${t.responsavel}", situacao="${t.situacao}"`);
        if (t.espaider_raw?.ListaCampos) {
            console.log('  Campos brutos da API:');
            t.espaider_raw.ListaCampos.forEach(c => console.log(`    ${c.Identificador} = "${c.Valor}"`));
        }
        console.log('---');
    });

    // 2. Últimos logs de sincronização
    const { data: logs } = await sb
        .from('integration_log_entries')
        .select('level, dataset, message, details, logged_at')
        .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
        .in('dataset', ['TempoPermanencia', 'HorasLancadas', 'Geral'])
        .order('logged_at', { ascending: false })
        .limit(30);

    console.log(`\n📋 Últimos logs TempoPermanencia/HorasLancadas (${logs?.length || 0}):`);
    logs?.forEach(l => {
        console.log(`  [${l.level}] ${l.dataset}: ${l.message}`);
        if (l.details) console.log('    details:', JSON.stringify(l.details).substring(0, 200));
    });

    // 3. Contagens
    const { count: horas } = await sb.from('project_horas_lancadas').select('*', { count: 'exact', head: true }).eq('tenant_id', '00000000-0000-0000-0000-000000000001');
    const { count: tempo } = await sb.from('project_tempo_permanencia').select('*', { count: 'exact', head: true }).eq('tenant_id', '00000000-0000-0000-0000-000000000001');
    console.log(`\n📊 project_horas_lancadas: ${horas}, project_tempo_permanencia: ${tempo}`);
}

main().catch(console.error);
