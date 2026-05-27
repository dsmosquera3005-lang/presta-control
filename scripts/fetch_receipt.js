const fs = require('fs');
const url = 'https://jfckpkmkxbutvbukgtce.supabase.co';
try {
  const env = fs.readFileSync('.env', 'utf8');
  const m = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY\s*=\s*"?([^"\r\n]+)"?/);
  if (!m) { console.error('VITE_SUPABASE_PUBLISHABLE_KEY not found in .env'); process.exit(1); }
  const key = m[1];
  (async () => {
    const paymentsRes = await fetch(`${url}/rest/v1/payments?select=id,amount,created_at&order=created_at.desc&limit=5`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    const payments = await paymentsRes.json();
    fs.writeFileSync('payments.json', JSON.stringify(payments, null, 2));
    if (!payments || payments.length === 0) { console.error('No payments returned'); process.exit(1); }
    const first = payments[0].id;
    const rpcRes = await fetch(`${url}/rest/v1/rpc/get_payment_receipt`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_payment_id: first })
    });
    const rpcJson = await rpcRes.json();
    fs.writeFileSync('rpc.json', JSON.stringify(rpcJson, null, 2));
    console.log('Wrote payments.json and rpc.json');
  })();
} catch (e) {
  console.error(e);
  process.exit(1);
}
