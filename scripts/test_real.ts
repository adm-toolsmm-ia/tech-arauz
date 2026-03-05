import { exportarDados } from '../src/integrations/espaider/api';
import fs from 'fs';

async function run() {
    process.env.ESPAIDER_BASE_URL = 'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc';

    // Aqui uso o token real que recuperei antes 
    // O test script fará request
    const req = {
        identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS',
        baseUrl: process.env.ESPAIDER_BASE_URL,
        // o token será o req manual da config? a gte precisa importar a key
    };

    try {
        const { createClient } = require('@supabase/supabase-js');
        const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supaUrl, supaKey);

        const { data } = await supabase.from('espaider_apis').select('token, base_url').eq('tipo', 'horas_lancadas').single();

        req.token = data.token;
        req.baseUrl = data.base_url;

        console.log('Fetching HorasLancadas with SDK...');
        const res = await exportarDados(req);

        console.log('API Response object keys:', Object.keys(res));
        if (res.ListaRegistros) {
            console.log(`Tem ${res.ListaRegistros.length} registros`);
            if (res.ListaRegistros.length > 0) {
                console.log('Campos: ', res.ListaRegistros[0].ListaCampos.map(c => c.Identificador).join(', '));
                fs.writeFileSync('espaider_raw_horas.json', JSON.stringify(res, null, 2));
            }
        } else {
            console.log('No ListaRegistros. Error?', res.MensagemErro || res.Erro);
        }
    } catch (e) {
        console.error('Error fetching API:', e);
    }
}

run();
