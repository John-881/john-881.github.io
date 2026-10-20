const IMG_BASE = '/wp-content/uploads/'
const X = String.fromCharCode(64) + String.fromCharCode(64)
const TAG = { img: X + 'WPIMAGE' + X, gal: X + 'WPGALLERY' + X, code: X + 'WPCODE' + X, inline: X + 'WPINLINEIMG' + X, end: X }

export function rewriteUploads(url) {
  if (!url) return url
  const idx = url.indexOf(IMG_BASE)
  if (idx < 0) return url
  let rest = url.slice(idx + IMG_BASE.length)
  rest = rest.split('?')[0].split('#')[0]
  try { rest = decodeURIComponent(rest) } catch { void 0 }
  return '/images/' + rest.replace(/^\/+/, '');
}

export function imgToToken(tag) {
  const srcM = /\ssrc="([^"]*)"/i.exec(tag) || /\ssrc='([^']*)'/i.exec(tag)
  const altM = /\salt="([^"]*)"/i.exec(tag) || /\salt='([^']*)'/i.exec(tag)
  return { url: rewriteUploads(srcM ? srcM[1] : ''), alt: altM ? altM[1] : '' };
}

function extractImages(inner) {
  const imgs = [];
  const re = /<img\b[^>]*>/gi;
  let mm;
  while ((mm = re.exec(inner))) imgs.push(imgToToken(mm[0]));
  return imgs;
}

export function preprocessGutenberg(html, opts) {
  const issues = [];
  const label = (opts && opts.source) || 'unknown';
  let out = String(html || '').replace(/\r\n/g, '\n');

  // gallery first: nested images inside a gallery figure must not be treated as standalone images
  out = out.replace(/<figure class="wp-block-gallery[^"]*">([\s\S]*?)<\/figure>\s*/g, (m, inner) => {
    const imgs = extractImages(inner);
    if (!imgs.length) {
      issues.push({ kind: 'gallery-empty', source: label, detail: m.slice(0, 140) });
      return m;
    }
    return TAG.gal + Buffer.from(JSON.stringify(imgs), 'utf8').toString('base64') + TAG.end + '\n';
  });

  out = out.replace(/<figure class="wp-block-image([^"]*)">([\s\S]*?)<\/figure>/g, (m, cls, inner) => {
    const imgs = extractImages(inner);
    if (!imgs.length) {
      issues.push({ kind: 'figure-image-no-img', source: label, detail: m.slice(0, 140) });
      return m;
    }
    const capM = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(inner);
    const caption = capM ? capM[1].replace(/<[^>]+>/g, '').trim() : '';
    const first = { url: imgs[0].url, alt: imgs[0].alt, caption, count: imgs.length };
    return '\u0040\u0040WPIMAGE\u0040\u0040' + Buffer.from(JSON.stringify(first), 'utf8').toString('base64') + '\u0040\u0040\n';
  });

  out = out.replace(/<pre class="wp-block-code"><code(?:\s+class="language-([A-Za-z0-9_+#.-]+)")?>([\s\S]*?)<\/code><\/pre>/g, (m, lang, body) => {
    return TAG.code + Buffer.from(JSON.stringify({ lang: lang || '', code: body }), 'utf8').toString('base64') + TAG.end + '\n';
  });

  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const t = imgToToken(tag);
    return TAG.inline + Buffer.from(JSON.stringify(t), 'utf8').toString('base64') + TAG.end;
  });

  out = out.replace(/\s*<!--\s+\/??wp:[\s\S]*?-->/g, '\n');

  out = out.replace(/<figure class="wp-block-table[^"]*"[^>]*>/gi, '');

  out = out.replace(/<figure\b[^>]*>(?![\s\S]*?<\/figure>)/g, (c) => (issues.push({ kind: 'orphan-figure', source: label, detail: c.slice(0, 120) }), ''))
  out = out.replace(/<\/figure>/g, '')
  out = out.replace(/^\s+$/gm, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  out = out.trim() + '\n';
  return { html: out, issues };
}
