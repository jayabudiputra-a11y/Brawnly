import _fs from 'fs';
import { SitemapStream as _SS, streamToPromise as _sTP } from 'sitemap';
import { Readable as _R } from 'stream';
import { createClient as _cC } from '@supabase/supabase-js';
import * as _dt from 'dotenv';

_dt.config();

const _sU = 'https://zlwhvkexgjisyhakxyoe.supabase.co';
const _sK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsd2h2a2V4Z2ppc3loYWt4eW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjkzMDksImV4cCI6MjA3OTcwNTMwOX0.mhlXTh7MVxBB4Z0_TANi87t5TunMtMSOiP9U8laEn2M';
const _sB = _cC(_sU, _sK);

async function _genBrawnlySEO() {
  const _base = 'https://www.brawnly.online';
  
  let _lks = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/articles', changefreq: 'daily', priority: 0.9 },
    { url: '/library', changefreq: 'daily', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.5 },
    { url: '/contact', changefreq: 'monthly', priority: 0.5 },
    { url: '/terms', changefreq: 'monthly', priority: 0.3 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { url: '/ethics', changefreq: 'monthly', priority: 0.3 },
  ];

  try {
    const { data: _arts, error: _errA } = await _sB
      .from('articles')
      .select('slug, updated_at, title');

    if (_errA) throw _errA;

    if (_arts && _arts.length > 0) {
      console.log(`📦 [BRAWNLY_DATABASE] Found ${_arts.length} articles.`);
      _arts.forEach(_a => {
        _lks.push({
          url: `/article/${_a.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: _a.updated_at
        });
      });
    } else {
      console.log('⚠️ [BRAWNLY_DATABASE] No articles found in table.');
    }

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

    console.log(`✅ [BRAWNLY_SEO] Success! Total URLs: ${_lks.length}`);
  } catch (_err) {
    console.error('❌ [BRAWNLY_ERROR] Generator failed:', _err);
  }
}

_genBrawnlySEO();