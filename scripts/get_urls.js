const fs = require('fs');
const https = require('https');
const env = fs.readFileSync('.env.local', 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');
const supaKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/)[1].trim().replace(/['"]/g, '');

const options = {
    hostname: new URL(supaUrl).hostname,
    path: encodeURI('/rest/v1/espaider_apis?select=tipo,base_url'),
    method: 'GET',
    headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey }
};
https.request(options, res => {
    let data = '';
    res.on('data', d => { data += d });
    res.on('end', () => console.log(JSON.parse(data)));
}).end();
