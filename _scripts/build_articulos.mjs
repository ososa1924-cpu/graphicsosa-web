// Genera /blog/<slug>.html (ES y EN) a partir del arreglo LOCAL_POSTS de index.html.
// Uso: node _scripts/build_articulos.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = "https://graphicsosa-web.vercel.app";
const WA = "https://wa.me/584242377576?text=Hola%20Graphic%20Sosa%2C%20quiero%20una%20revisi%C3%B3n%20gratis%20de%20mi%20marca";
const OG = BASE + "/assets/og-image.jpg";

// ---------- leer y extraer LOCAL_POSTS ----------
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const start = html.indexOf("const LOCAL_POSTS = ");
if (start < 0) throw new Error("no encontré LOCAL_POSTS");

function extraerObjeto(src, desde) {
  const i = src.indexOf("{", desde);
  let depth = 0, quote = null, esc = false;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (quote) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return src.slice(i, k + 1); }
  }
  throw new Error("objeto sin cerrar");
}

const LOCAL_POSTS = new Function("return " + extraerObjeto(html, start))();

// ---------- textos por idioma ----------
const T = {
  es: {
    blog: "Blog",
    inicio: "Inicio",
    leer: "Leer artículo",
    mas: "Más artículos",
    cta_t: "¿Tu marca necesita esto?",
    cta_p: "Te reviso gratis la imagen actual y te digo qué cambiaría, sin compromiso.",
    cta_b: "Escribir por WhatsApp",
    volver: "Volver a la web",
    creado: "Escrito por Graphic Sosa · Maracay, Venezuela",
  },
  en: {
    blog: "Blog",
    inicio: "Home",
    leer: "Read article",
    mas: "More articles",
    cta_t: "Does your brand need this?",
    cta_p: "I'll review your current image for free and tell you what I'd change, no strings attached.",
    cta_b: "Message on WhatsApp",
    volver: "Back to the site",
    creado: "Written by Graphic Sosa · Maracay, Venezuela",
  },
};

const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const recorte = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");

// ---------- plantilla ----------
function pagina(post, lang, otros) {
  const t = T[lang];
  const otroLang = lang === "es" ? "en" : "es";
  const ruta = lang === "es" ? `${post.id}.html` : `en/${post.id}.html`;
  const url = `${BASE}/blog/${ruta}`;
  const altEs = `${BASE}/blog/${post.id}.html`;
  const altEn = `${BASE}/blog/en/${post.id}.html`;
  const home = lang === "es" ? "../index.html" : "../../index.html";
  const blogHome = lang === "es" ? "index.html" : "../index.html";
  const assets = lang === "es" ? "../assets" : "../../assets";
  const fechaISO = post.iso;

  const cuerpo = post.body.map((b) => {
    if (typeof b === "string") return `<p>${esc(b)}</p>`;
    return `<blockquote><p>${esc(b.quote)}</p><cite>— ${esc(b.movie)}</cite></blockquote>`;
  }).join("\n");

  const relacionados = otros.map((o) => {
    const p = LOCAL_POSTS[lang].find((x) => x.id === o);
    if (!p) return "";
    const href = lang === "es" ? `${p.id}.html` : `${p.id}.html`;
    return `<a class="card" href="${href}"><span class="k">${esc(p.date)}</span><h3>${esc(p.title)}</h3></a>`;
  }).join("");

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": url + "#article",
        headline: post.title,
        description: post.summary,
        datePublished: fechaISO,
        dateModified: fechaISO,
        inLanguage: lang === "es" ? "es-VE" : "en",
        image: [OG],
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: "Graphic Sosa", url: BASE + "/" },
        publisher: {
          "@type": "Organization",
          name: "Graphic Sosa",
          logo: { "@type": "ImageObject", url: BASE + "/assets/favicon.png" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.inicio, item: BASE + "/" },
          { "@type": "ListItem", position: 2, name: t.blog, item: BASE + "/blog/" },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="${lang === "es" ? "es" : "en"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(post.title)} | Graphic Sosa</title>
<meta name="description" content="${esc(recorte(post.summary, 155))}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es" href="${altEs}">
<link rel="alternate" hreflang="en" href="${altEn}">
<link rel="alternate" hreflang="x-default" href="${altEs}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(recorte(post.summary, 200))}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG}">
<meta property="og:locale" content="${lang === "es" ? "es_VE" : "en_US"}">
<meta property="article:published_time" content="${fechaISO}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(recorte(post.summary, 200))}">
<meta name="twitter:image" content="${OG}">
<link rel="icon" type="image/png" href="${assets}/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>
  :root{--bg:#0c0f14;--panel:#131822;--line:rgba(255,255,255,.09);--text:#f5f4ff;--muted:#8b91b8;--blue:#0D6EFD}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.7;-webkit-font-smoothing:antialiased}
  a{color:inherit}
  .top{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;
       padding:14px 22px;background:rgba(12,15,20,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:Sora,sans-serif;font-weight:800;font-size:.95rem;letter-spacing:.02em}
  .brand img{width:26px;height:26px;object-fit:contain}
  .top nav a{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-decoration:none}
  .top nav a:hover{color:var(--text)}
  main{max-width:760px;margin:0 auto;padding:56px 22px 80px}
  .crumbs{font-family:"IBM Plex Mono",monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:26px}
  .crumbs a{text-decoration:none;color:var(--muted)}
  .crumbs a:hover{color:var(--text)}
  .kicker{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);margin-bottom:16px}
  h1{font-family:Sora,sans-serif;font-weight:800;font-size:clamp(1.75rem,4.4vw,2.7rem);line-height:1.15;letter-spacing:-.02em;margin-bottom:20px}
  .lead{font-size:1.06rem;color:var(--muted);margin-bottom:38px}
  article p{margin-bottom:22px;font-size:1.02rem}
  article > p:first-of-type{font-size:1.08rem}
  blockquote{border-left:3px solid var(--blue);padding:6px 0 6px 20px;margin:30px 0}
  blockquote p{font-family:Sora,sans-serif;font-size:1.2rem;font-weight:600;line-height:1.4;margin-bottom:6px}
  blockquote cite{font-family:"IBM Plex Mono",monospace;font-style:normal;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .cta{margin:52px 0 0;padding:28px;border:1px solid var(--line);border-radius:16px;background:var(--panel)}
  .cta h2{font-family:Sora,sans-serif;font-size:1.15rem;margin-bottom:8px}
  .cta p{color:var(--muted);font-size:.94rem;margin-bottom:18px}
  .btn{display:inline-flex;align-items:center;gap:9px;background:var(--blue);color:#fff;text-decoration:none;
       padding:12px 20px;border-radius:999px;font-weight:600;font-size:.92rem}
  .btn:hover{filter:brightness(1.1)}
  .more{margin-top:64px;padding-top:32px;border-top:1px solid var(--line)}
  .more h2{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:18px}
  .cards{display:grid;gap:12px}
  .card{display:block;text-decoration:none;padding:18px 20px;border:1px solid var(--line);border-radius:12px;background:var(--panel);transition:border-color .18s}
  .card:hover{border-color:rgba(13,110,253,.5)}
  .card .k{font-family:"IBM Plex Mono",monospace;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .card h3{font-family:Sora,sans-serif;font-size:1rem;line-height:1.35;margin-top:6px}
  footer{border-top:1px solid var(--line);padding:26px 22px;text-align:center;color:var(--muted);font-size:.8rem}
  footer a{color:var(--muted);text-decoration:none}
  footer a:hover{color:var(--text)}
  @media(max-width:600px){main{padding:36px 18px 60px}}
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="${home}"><img src="${assets}/favicon.png" alt="">Graphic Sosa</a>
  <nav><a href="${blogHome}">${t.blog}</a></nav>
</header>
<main>
  <div class="crumbs"><a href="${home}">${t.inicio}</a> / <a href="${blogHome}">${t.blog}</a></div>
  <div class="kicker">${esc(post.date)} · Maracay, Venezuela</div>
  <h1>${esc(post.title)}</h1>
  <p class="lead">${esc(post.summary)}</p>
  <article>
${cuerpo}
  </article>

  <div class="cta">
    <h2>${t.cta_t}</h2>
    <p>${t.cta_p}</p>
    <a class="btn" href="${WA}" target="_blank" rel="noopener">${t.cta_b} →</a>
  </div>

  <div class="more">
    <h2>${t.mas}</h2>
    <div class="cards">${relacionados}</div>
  </div>
</main>
<footer>
  ${t.creado} · <a href="${home}">${t.volver}</a>
</footer>
</body>
</html>
`;
}

// ---------- índice del blog ----------
function indice(lang, posts) {
  const t = T[lang];
  const home = lang === "es" ? "../index.html" : "../../index.html";
  const assets = lang === "es" ? "../assets" : "../../assets";
  const url = lang === "es" ? `${BASE}/blog/` : `${BASE}/blog/en/`;
  const cards = posts.map((p) => `
    <a class="post" href="${p.id}.html">
      <span class="k">${esc(p.date)}</span>
      <h2>${esc(p.title)}</h2>
      <p>${esc(p.summary)}</p>
      <span class="l">${t.leer} →</span>
    </a>`).join("");

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": url + "#blog",
        name: "Blog · Graphic Sosa",
        url,
        inLanguage: lang === "es" ? "es-VE" : "en",
        publisher: { "@type": "Organization", name: "Graphic Sosa", url: BASE + "/" },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${url}${p.id}.html`,
          datePublished: p.iso,
          author: { "@type": "Organization", name: "Graphic Sosa" },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.inicio, item: BASE + "/" },
          { "@type": "ListItem", position: 2, name: t.blog, item: url },
        ],
      },
    ],
  };
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.blog} · Graphic Sosa</title>
<meta name="description" content="${lang === "es"
    ? "Artículos sobre diseño gráfico, menús, identidad y redes para negocios de Venezuela y el mundo."
    : "Articles on graphic design, menus, identity and social media for businesses in Venezuela and beyond."}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es" href="${BASE}/blog/">
<link rel="alternate" hreflang="en" href="${BASE}/blog/en/">
<link rel="alternate" hreflang="x-default" href="${BASE}/blog/">
<meta property="og:type" content="website">
<meta property="og:title" content="${t.blog} · Graphic Sosa">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG}">
<link rel="icon" type="image/png" href="${assets}/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>
  :root{--bg:#0c0f14;--panel:#131822;--line:rgba(255,255,255,.09);--text:#f5f4ff;--muted:#8b91b8;--blue:#0D6EFD}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.65}
  a{color:inherit}
  .top{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid var(--line)}
  .brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:Sora,sans-serif;font-weight:800;font-size:.95rem}
  .brand img{width:26px;height:26px}
  .top nav a{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-decoration:none}
  main{max-width:860px;margin:0 auto;padding:60px 22px 80px}
  .kicker{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);margin-bottom:14px}
  h1{font-family:Sora,sans-serif;font-size:clamp(2rem,5vw,2.9rem);line-height:1.1;letter-spacing:-.02em;margin-bottom:14px}
  .sub{color:var(--muted);margin-bottom:44px;max-width:56ch}
  .grid{display:grid;gap:14px}
  .post{display:block;text-decoration:none;padding:24px;border:1px solid var(--line);border-radius:14px;background:var(--panel);transition:border-color .18s,transform .18s}
  .post:hover{border-color:rgba(13,110,253,.5);transform:translateY(-2px)}
  .post .k{font-family:"IBM Plex Mono",monospace;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .post h2{font-family:Sora,sans-serif;font-size:1.15rem;line-height:1.3;margin:8px 0 8px}
  .post p{color:var(--muted);font-size:.92rem}
  .post .l{display:inline-block;margin-top:14px;font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--blue)}
  footer{border-top:1px solid var(--line);padding:26px 22px;text-align:center;color:var(--muted);font-size:.8rem}
  footer a{text-decoration:none}
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="${home}"><img src="${assets}/favicon.png" alt="">Graphic Sosa</a>
  <nav><a href="${home}">${t.inicio}</a></nav>
</header>
<main>
  <div class="kicker">${t.blog}</div>
  <h1>${lang === "es" ? "Ideas para que tu marca venda más" : "Ideas to make your brand sell more"}</h1>
  <p class="sub">${lang === "es"
    ? "Diseño, menús, identidad y redes explicados sin humo, con casos de negocios reales en Venezuela."
    : "Design, menus, identity and social media explained without fluff, with real business cases in Venezuela."}</p>
  <div class="grid">${cards}
  </div>
</main>
<footer><a href="${home}">← ${t.volver}</a></footer>
</body>
</html>
`;
}

// ---------- escribir ----------
const OUT = path.join(ROOT, "blog");
fs.mkdirSync(path.join(OUT, "en"), { recursive: true });

const ISOS = {
  "logo-clinicas-consultorios": "2026-11-11",
  "errores-menu-restaurante": "2026-11-10",
  "cuanto-cuesta-logo": "2026-11-10",
  "frases-peliculas": "2026-07-25",
};

const nombres = { es: [], en: [] };

for (const lang of ["es", "en"]) {
  const posts = LOCAL_POSTS[lang].map((p) => ({ ...p, iso: ISOS[p.id] || "2026-11-10" }));
  for (const p of posts) {
    const otros = posts.filter((x) => x.id !== p.id).slice(0, 3).map((x) => x.id);
    const dir = lang === "es" ? OUT : path.join(OUT, "en");
    fs.writeFileSync(path.join(dir, `${p.id}.html`), pagina(p, lang, otros), "utf8");
    nombres[lang].push(p.id);
  }
  fs.writeFileSync(path.join(lang === "es" ? OUT : path.join(OUT, "en"), "index.html"), indice(lang, posts), "utf8");
}

console.log("ES:", nombres.es.join(", "));
console.log("EN:", nombres.en.join(", "));
console.log("salida:", OUT);
