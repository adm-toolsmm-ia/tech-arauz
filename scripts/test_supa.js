const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const supaKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supaUrl, supaKey);

async function run() {
    const { data, error } = await supabase.from('projects').select('id, espaider_id, pasta_consultivo').limit(5);
    console.log('projects:', data, error);
}
run();
