import _fs from 'fs';
import { SitemapStream as _SS, streamToPromise as _sTP } from 'sitemap';
import { Readable as _R } from 'stream';

async function _genBrawnlySEO() {
  const _base = 'https://www.brawnly.online';
  const _lks = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/articles', changefreq: 'daily', priority: 0.9 },
    { url: '/library', changefreq: 'daily', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.5 },
    { url: '/contact', changefreq: 'monthly', priority: 0.5 },
    { url: '/terms', changefreq: 'monthly', priority: 0.3 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { url: '/ethics', changefreq: 'monthly', priority: 0.3 },
    { url: '/article/every-episode-of-sex-and-the-city-part-2-julia-dicesare', changefreq: 'weekly', priority: 0.7 },
    { url: '/article/the-pull-up-video-that-set-my-night-on-fire', changefreq: 'weekly', priority: 0.7 },
    { url: '/article/lockers-and-looks-thrill', changefreq: 'weekly', priority: 0.7 },
    { url: '/article/what-a-muscular-body-symbolizes-to-me', changefreq: 'weekly', priority: 0.7 },
    { url: '/article/lifted-spirits-my-gym-crush-v2', changefreq: 'weekly', priority: 0.7 },
  ];

  try {
    const _stm = new _SS({ hostname: _base });
    const _xml = await _sTP(_R.from(_lks).pipe(_stm)).then((_d) => _d.toString());
    _fs.writeFileSync('./public/sitemap.xml', _xml);

    let _rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n<title>Brawnly Editorial</title>\n<link>${_base}</link>\n<description>Smart Fitness &amp; Wellness Tracker Intelligence</description>\n<atom:link href="${_base}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    
    _lks.filter(l => l.url.includes('/article/')).forEach(l => {
      const _title = l.url.split('/').pop().replace(/-/g, ' ').toUpperCase();
      _rss += `<item>\n<title>${_title}</title>\n<link>${_base}${l.url}</link>\n<guid>${_base}${l.url}</guid>\n<pubDate>${new Date().toUTCString()}</pubDate>\n</item>\n`;
    });
    
    _rss += `</channel>\n</rss>`;
    _fs.writeFileSync('./public/rss.xml', _rss);

    console.log('✅ [BRAWNLY_SEO] Sitemap & RSS generated successfully.');
  } catch (_err) {
    console.error('❌ [BRAWNLY_ERROR] Generator failed:', _err);
  }
}

_genBrawnlySEO();