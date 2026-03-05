const fs = require('fs');
const https = require('https');

const env = fs.readFileSync('.env.local', 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const supaKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');

const options = {
    hostname: new URL(supaUrl).hostname,
    path: encodeURI('/rest/v1/espaider_apis?select=id,tipo,identificador,base_url,token,is_active'),
    method: 'GET',
    headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey }
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', d => { data += d });
    res.on('end', async () => {
        const apis = JSON.parse(data);
        const horasL = apis.find(a => a.tipo === 'horas_lancadas');

        console.log('--- TESTANDO API DE HORAS LANCADAS ---');
        console.log(horasL.base_url);

        try {
            const url = new URL(`${horasL.base_url}/ExportaDados`);
            url.searchParams.set('Token', horasL.token);
            url.searchParams.set('Identificador', horasL.identificador);

            console.log('Fetching:', url.toString());

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const text = await response.text();
            fs.writeFileSync('espaider_raw_horas.json', text);

            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} ${response.statusText}`);
                return;
            }

            const parsed = JSON.parse(text);
            const regs = parsed.ListaRegistros || [];
            console.log(`Recebeu ${regs.length} registros`);
            if (regs.length > 0) {
                console.log('Campos do 1o registro: ', regs[0].ListaCampos.map(c => c.Identificador).join(', '));
            }
        } catch (err) {
            console.error(err);
        }
    });
});
req.end();
