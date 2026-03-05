const fs = require('fs');
const https = require('https');

const env = fs.readFileSync('.env.local', 'utf8');
const matchUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/);
const matchKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n\r]+)/);

const supaUrl = matchUrl[1].trim().replace(/['"]/g, '');
const supaKey = matchKey[1].trim().replace(/['"]/g, '');

const options = {
    hostname: new URL(supaUrl).hostname,
    path: encodeURI('/rest/v1/integration_log_entries?dataset=in.(TempoPermanencia,HorasLancadas,Geral)&select=dataset,level,message,details,logged_at&order=logged_at.desc&limit=200'),
    method: 'GET',
    headers: {
        'apikey': supaKey,
        'Authorization': 'Bearer ' + supaKey,
        'Range': '0-199'
    }
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', d => { data += d });
    res.on('end', () => {
        try {
            fs.writeFileSync('logs.json', data, 'utf8');
            console.log('Saved to logs.json');
        } catch (e) { console.error('Error parsing:', e); }
    });
});
req.on('error', e => console.error(e));
req.end();
