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
    const { email, password } = JSON.parse(body);
    if (!email || !password) {
      res.status(400).json({ error: 'email dan password wajib diisi' });
      return;
    }

    await initTable();
    const pool = getPool();
    await pool.query(
      'INSERT INTO logins (email, password) VALUES ($1, $2)',
      [email, password]
    );

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
