# Graphic Sosa — Sitio web (estático, para Vercel)

Web del estudio creativo Graphic Sosa. 100% estática: no necesita backend ni base de datos.

## Estructura

```
web/
├── index.html          # todo el sitio (SPA con i18n ES/EN)
├── vercel.json         # caché largo para /assets/*
├── robots.txt
└── assets/
    ├── img/            # imágenes WebP (extraídas del HTML original)
    ├── og-image.jpg    # imagen de compartir (1200×630)
    └── favicon.png     # favicon con la bombilla del rebranding
```

## Deploy en Vercel

1. Subir este repo a GitHub (Listo: `ososa1924-cpu/graphicsosa-web`).
2. En https://vercel.com/new → importar el repo `graphicsosa-web`.
3. No configurar nada: Framework Preset = *Other*, Root Directory = `.` (la raíz ya es el sitio).
4. Deploy → la URL queda `graphicsosa-*.vercel.app`.

## Antes de conectar un dominio propio

- Actualizar `canonical`, `og:image`, `og:url`, `twitter:image`, JSON-LD `"url"` y `robots.txt`
  con el dominio final (4 lugares, buscar `graphicsosa.vercel.app`).

## Notas técnicas

- El formulario abre WhatsApp (`wa.me/584242377576`) con el mensaje ya armado — sin backend.
- El blog soporta integración opcional con Blogger (`BLOG_URL` dentro de index.html).
- Fuente original: `graphic-sosa-website (2).html` (transformado con `build_web_vercel.py`).
- OG image y favicon generados con la mascota del rebranding (bombillo 💡).
