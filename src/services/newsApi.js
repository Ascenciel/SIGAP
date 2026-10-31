const NEWS_FEED_URL = 'https://news.google.com/rss/search?q=bencana+Indonesia+OR+banjir+Indonesia+OR+cuaca+ekstrem&hl=id&gl=ID&ceid=ID:id';

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .trim();
}

function readTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

export async function fetchNews() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(NEWS_FEED_URL, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`Feed berita merespons ${response.status}`);

  const xml = await response.text();
  const articles = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
    .map(([, item]) => {
      const title = readTag(item, 'title');
      const source = readTag(item, 'source') || title.split(' - ').pop() || 'Penerbit berita';
      return {
        title: title.replace(/\s+-\s+[^-]+$/, '').trim(),
        source,
        url: readTag(item, 'link'),
        publishedAt: readTag(item, 'pubDate'),
      };
    })
    .filter(article => article.title && article.url)
    .slice(0, 12);

  if (articles.length === 0) throw new Error('Feed belum memuat berita.');
  return articles;
}

export const NEWS_SOURCE = 'Google News · pencarian berita kebencanaan';
