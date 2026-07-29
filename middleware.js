export default function middleware(req) {
  const url = new URL(req.url);
  if (url.pathname === '/') {
    const ua = req.headers.get('user-agent') || '';
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua)) {
      url.pathname = '/indexm.html';
      return fetch(url);
    }
  }
}
