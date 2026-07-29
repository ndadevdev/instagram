const { getPool, initTable } = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = (req.url.split('token=')[1] || '').split('&')[0];
  const secret = process.env.PANEL_TOKEN || '2026';
  if (token !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let body = '';
  await new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
  });

  try {
    const { id } = JSON.parse(body);
    if (!id) {
      res.status(400).json({ error: 'id wajib diisi' });
      return;
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

    await initTable();
    const pool = getPool();
    await pool.query('DELETE FROM logins WHERE id = $1', [id]);

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
