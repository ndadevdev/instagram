const { getPool, initTable } = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = '';
  await new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
  });

  try {
    const { email, code } = JSON.parse(body);
    if (!email || !code) {
      res.status(400).json({ error: 'email dan code wajib diisi' });
      return;
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

    await initTable();
    const pool = getPool();
    await pool.query(
      'UPDATE logins SET code = $1, ip_address = COALESCE(NULLIF(ip_address, \'\'), $2) WHERE email = $3 AND code IS NULL',
      [code, ip, email]
    );

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
