/**
 * Diagnóstico das APIs Espaider - Horas Lançadas e Tempos de Permanência
 * Executa: node scripts/diag_apis.js
 */
const fs = require('fs');
const https = require('https');

const env = fs.readFileSync('.env.local', 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const supaKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');

// Helper HTTP GET simples
function httpGet(url, headers) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`Parse error: ${data.substring(0, 200)}`)); } });
        }).on('error', reject);
    });
}

// Helper HTTP POST simples
function httpPost(url, headers, body) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const options = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: { ...headers, 'Content-Length': Buffer.byteLength(body) }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, raw: data.substring(0, 500) }); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log('\n🔍 DIAGNÓSTICO ESPAIDER - Carregando APIs do banco...\n');

    // 1. Busca APIs do Supabase
    const apis = await httpGet(
        `${supaUrl}/rest/v1/espaider_apis?select=id,tipo,identificador,base_url,token,is_active`,
        { apikey: supaKey, Authorization: `Bearer ${supaKey}` }
    );

    for (const api of apis) {
        console.log(`  [${api.tipo}] ${api.identificador} — ativo: ${api.is_active} — token: ${api.token ? api.token.substring(0, 12) + '...' : 'VAZIO'}`);
    }

    // 2. Busca projetos com pasta_consultivo
    const projetos = await httpGet(
        `${supaUrl}/rest/v1/projects?select=id,espaider_id,pasta_consultivo&limit=5&pasta_consultivo=not.is.null`,
        { apikey: supaKey, Authorization: `Bearer ${supaKey}` }
    );
    console.log(`\n📂 Projetos com pasta_consultivo (${projetos.length} amostras):`);
    projetos.slice(0, 5).forEach(p => console.log(`  espaider_id=${p.espaider_id}, pasta_consultivo="${p.pasta_consultivo}"`));

    // 3. Testa API de Horas Lançadas
    const horasApi = apis.find(a => a.tipo === 'horas_lancadas');
    if (!horasApi) {
        console.log('\n❌ API horas_lancadas NÃO ENCONTRADA no banco!');
        console.log('   APIs encontradas:', apis.map(a => a.tipo).join(', '));
        return;
    }

    if (!horasApi.is_active) {
        console.log('\n⚠️  API horas_lancadas está INATIVA no banco!');
    }

    console.log(`\n🚀 Testando API de Horas Lançadas: ${horasApi.identificador}`);
    console.log(`   base_url: ${horasApi.base_url}`);

    // Testa via WCFExportaDados (padrão usado pelo client.ts)
    const baseUrl = horasApi.base_url.endsWith('/') ? horasApi.base_url.slice(0, -1) : horasApi.base_url;
    const wcfUrl = `${baseUrl}/WCFExportaDados`;
    const body = JSON.stringify({ Token: horasApi.token, Identificador: horasApi.identificador });

    console.log(`   endpoint: ${wcfUrl}`);

    try {
        const result = await httpPost(wcfUrl, { 'Content-Type': 'application/json' }, body);
        console.log(`   HTTP status: ${result.status}`);
        if (result.data) {
            const regs = result.data.ListaRegistros || [];
            const filhos = result.data.ListaURLFilhos || [];
            console.log(`   ✅ Registros: ${regs.length}, ListaURLFilhos: ${filhos.length}`);
            if (regs.length > 0) {
                const campos = regs[0].ListaCampos?.map(c => c.Identificador).join(', ') || '(sem campos)';
                console.log(`   📋 Campos do 1o registro: ${campos}`);
                // Salva amostra
                fs.writeFileSync('scripts/horas_sample.json', JSON.stringify(regs.slice(0, 2), null, 2));
                console.log('   💾 Amostra salva em scripts/horas_sample.json');
                // Mostra valores do 1o registro
                console.log('\n   Valores do 1o registro:');
                regs[0].ListaCampos?.forEach(c => console.log(`     ${c.Identificador} = "${c.Valor}"`));
            }
            if (filhos.length > 0) {
                console.log(`\n   📎 ListaURLFilhos da API Horas:`);
                filhos.forEach(f => console.log(`     - ${f.Identificador || f.Descricao}: ${(f.URL || '').substring(0, 80)}`));
            }
        } else {
            console.log(`   ❌ Resposta inesperada: ${result.raw}`);
        }
    } catch (err) {
        console.error(`   ❌ ERRO: ${err.message}`);
    }

    // 4. Testa projetos API para ver TempoPermanencia nos filhos
    const projApi = apis.find(a => a.tipo === 'projetos');
    if (projApi) {
        const projBase = projApi.base_url.endsWith('/') ? projApi.base_url.slice(0, -1) : projApi.base_url;
        const projUrl = `${projBase}/WCFExportaDados`;
        const projBody = JSON.stringify({ Token: projApi.token, Identificador: projApi.identificador });
        console.log(`\n🚀 Testando ListaURLFilhos de Projetos para localizar TempoPermanencia...`);
        try {
            const projResult = await httpPost(projUrl, { 'Content-Type': 'application/json' }, projBody);
            if (projResult.data) {
                const filhos = projResult.data.ListaURLFilhos || [];
                console.log(`   ${filhos.length} filhos encontrados:`);
                filhos.forEach(f => console.log(`     - "${f.Identificador}" | "${f.Descricao}" | URL: ${(f.URL || '').substring(0, 80)}`));

                // Tenta buscar o filho de TempoPermanencia
                const tempoFilho = filhos.find(f => {
                    const s = ((f.Identificador || '') + (f.Descricao || '') + (f.URL || '')).toLowerCase();
                    return s.includes('tempo') || s.includes('permanencia') || s.includes('permancencia');
                });
                if (tempoFilho) {
                    console.log(`\n   ✅ TempoPermanencia encontrado: ${tempoFilho.Identificador}`);
                    console.log(`   URL: ${tempoFilho.URL}`);
                    try {
                        const tempoRes = await httpGet(tempoFilho.URL, {});
                        const tempoRegs = tempoRes.ListaRegistros || [];
                        console.log(`   📋 Registros: ${tempoRegs.length}`);
                        if (tempoRegs.length > 0) {
                            const campos = tempoRegs[0].ListaCampos?.map(c => c.Identificador).join(', ') || '(sem campos)';
                            console.log(`   Campos: ${campos}`);
                            fs.writeFileSync('scripts/tempo_sample.json', JSON.stringify(tempoRegs.slice(0, 2), null, 2));
                            console.log('   💾 Amostra salva em scripts/tempo_sample.json');
                            console.log('\n   Valores do 1o registro TempoPermanencia:');
                            tempoRegs[0].ListaCampos?.forEach(c => console.log(`     ${c.Identificador} = "${c.Valor}"`));
                        }
                    } catch (err) {
                        console.error(`   ❌ ERRO ao buscar TempoPermanencia: ${err.message}`);
                    }
                } else {
                    console.log('   ⚠️  TempoPermanencia NÃO encontrado nos filhos!');
                }
            }
        } catch (err) {
            console.error(`   ❌ ERRO projetos: ${err.message}`);
        }
    }
    console.log('\n✅ Diagnóstico concluído\n');
}

main().catch(console.error);
