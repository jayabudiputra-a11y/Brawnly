// scripts/ping.mjs
// Auto-ping IndexNow setiap deploy
// Menggantikan google.com/ping?sitemap (deprecated Juni 2023)
// dan bing.com/ping?sitemap (deprecated, 410 Gone)

const KEY          = 'e3191f74706b4732b2bd533e17fdd435';
const HOST         = 'www.brawnly.online';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP      = `https://${HOST}/sitemap.xml`;

const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/articles`,
  `https://${HOST}/sitemap.xml`,
];

const BODY = JSON.stringify({
  host:        HOST,
  key:         KEY,
  keyLocation: KEY_LOCATION,
  urlList:     URLS,
});

const HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

// IndexNow aggregator — distributes to Google, Bing, Yandex, Seznam, etc.
async function pingIndexNow() {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: HEADERS, body: BODY,
    });
    const status = `${res.status} ${res.statusText}`;
    const ok = res.status === 200 || res.status === 202;
    console.log(`${ok ? '✅' : '❌'} IndexNow (api.indexnow.org)   : ${status}`);
  } catch (e) {
    console.error('❌ IndexNow failed:', e.message);
  }
}

// Bing IndexNow endpoint (replaces deprecated bing.com/ping?sitemap → 410)
async function pingBingIndexNow() {
  try {
    const res = await fetch('https://www.bing.com/indexnow', {
      method: 'POST', headers: HEADERS, body: BODY,
    });
    const status = `${res.status} ${res.statusText}`;
    const ok = res.status === 200 || res.status === 202;
    console.log(`${ok ? '✅' : '❌'} IndexNow (bing.com/indexnow)  : ${status}`);
  } catch (e) {
    console.error('❌ Bing IndexNow failed:', e.message);
  }
}

// Yandex IndexNow endpoint
async function pingYandex() {
  try {
    const res = await fetch('https://yandex.com/indexnow', {
      method: 'POST', headers: HEADERS, body: BODY,
    });
    const status = `${res.status} ${res.statusText}`;
    const ok = res.status === 200 || res.status === 202;
    console.log(`${ok ? '✅' : '❌'} IndexNow (yandex.com)         : ${status}`);
  } catch (e) {
    console.error('❌ Yandex failed:', e.message);
  }
}

// Seznam (juga bagian IndexNow network)
async function pingSeznam() {
  try {
    const res = await fetch('https://search.seznam.cz/indexnow', {
      method: 'POST', headers: HEADERS, body: BODY,
    });
    const status = `${res.status} ${res.statusText}`;
    const ok = res.status === 200 || res.status === 202;
    console.log(`${ok ? '✅' : '❌'} IndexNow (seznam.cz)          : ${status}`);
  } catch (e) {
    // Seznam optional — skip if unreachable
  }
}

console.log(`\n🔔 Pinging search engines for ${HOST}...`);
console.log(`   Key      : ${KEY}`);
console.log(`   Sitemap  : ${SITEMAP}`);
console.log(`   URLs     : ${URLS.length} URLs`);
console.log(`   Note     : 200 = verified, 202 = accepted (key pending)\n`);

await pingIndexNow();
await pingBingIndexNow();
await pingYandex();
await pingSeznam();

console.log('\n✅ Done. Submitted to IndexNow network (Bing, Yandex, Google, Seznam).\n');

