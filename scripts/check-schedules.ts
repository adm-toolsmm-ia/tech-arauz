import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
    envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
        const [key, ...val] = line.split('=');
        return [key.trim(), val.join('=').trim().replace(/^['"]|['"]$/g, '')];
    })
);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Fetching from project_schedules...');
    const { data, error } = await supabase
        .from('project_schedules')
        .select(`
      *,
      project:projects(id, titulo, codigo, status:situacao_original, fase_atual)
    `)
        .limit(2);

    if (error) {
        console.error('ERROR fetching schedules (with join):', error);
    } else {
        console.log('SUCCESS (with join). Count:', data.length);
        if (data.length > 0) {
            console.log('Sample data:', data[0]);
        }
    }

    const { data: raw, error: rawError } = await supabase
        .from('project_schedules')
        .select('*')
        .limit(2);
    if (rawError) {
        console.error('ERROR fetching raw:', rawError);
    } else {
        console.log('SUCCESS (raw). Count:', raw.length);
        if (raw.length > 0) {
            console.log('Sample raw:', raw[0]);
        }
    }
}

check();
