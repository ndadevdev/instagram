const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
  const file = isMobile ? 'indexm.html' : 'index.html';
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
