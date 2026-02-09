import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

async function generateSitemap() {
  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/articles', changefreq: 'daily', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.5 },
    { url: '/contact', changefreq: 'monthly', priority: 0.5 },
    { url: '/terms', changefreq: 'monthly', priority: 0.3 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { url: '/ethics', changefreq: 'monthly', priority: 0.3 },
  ];

  try {
    const stream = new SitemapStream({ hostname: 'https://www.brawnly.online' });
    const xml = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
      data.toString()
    );

    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('Sitemap successfully generated at ./public/sitemap.xml');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();