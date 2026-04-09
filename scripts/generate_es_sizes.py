#!/usr/bin/env python3
"""Generate Spanish /es/sizes/*.html. Run: python3 scripts/generate_es_sizes.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "es" / "sizes"

METRIC = [
    (3, 0.5, 2.5, 5.5, "#4-40", "M3 es un sujetador métrico pequeño habitual en electrónica y mecanismos compactos.", "Electrónica, instrumentos, sujeciones ligeras."),
    (4, 0.7, 3.3, 7, "#8-32", "M4 es un tornillo métrico compacto muy usado en maquinaria ligera y electrónica.", "Maquinaria, automoción secundaria, muebles y chasis."),
    (5, 0.8, 4.2, 8, "#10-24", "M5 equilibra tamaño y resistencia entre M4 y M6.", "Automoción, maquinaria general, muebles y estructuras medianas."),
    (6, 1.0, 5.0, 10, "1/4-20", "M6 es una de las tallas métricas más habituales en taller.", "Soportes, carcasas, estructuras ligeras y ferretería general."),
    (7, 1.0, 6.0, 11, "entre M6 y 1/4\"", "M7 es menos habitual que M6 u M8; aparece en equipos europeos y especialidades.", "Mecanismos especiales, bicicletas y repuestos que especifican M7."),
    (8, 1.25, 6.8, 13, "5/16-18", "M8 es muy usado en automoción, maquinaria y estructuras.", "Chasis, bastidores, sujeciones medianas y piezas sometidas a cargas mayores."),
    (9, 1.25, 7.8, 14, "entre M8 y M10", "M9 es una talla intermedia poco estándar; confirme en catálogo del fabricante.", "Aplicaciones especiales y algunos equipos importados."),
    (10, 1.5, 8.5, 17, "3/8-16", "M10 es estándar en automoción, maquinaria y estructura.", "Motores, chasis, bridas y uniones con alto apriete."),
    (11, 1.5, 9.5, 18, "7/16-14 (aprox.)", "M11 es menos común que M10 o M12; verifique disponibilidad de tuercas y arandelas.", "Maquinaria especial y repuestos que indican M11."),
    (12, 1.75, 10.2, 19, "1/2-13", "M12 aporta alta resistencia en bridas y uniones críticas.", "Estructuras, automoción pesada, bridas y máquinas industriales."),
    (13, 1.75, 11.2, 20, "1/2-13 (aprox.)", "M13 es poco frecuente; puede requerir surtido especializado.", "Equipos que especifican M13 según documentación."),
    (14, 2.0, 12.0, 22, "9/16-12", "M14 se usa en maquinaria pesada y uniones grandes.", "Marcos, ejes, prensas y aplicaciones de alta carga."),
    (15, 1.5, 13.5, 24, "5/8-11 (aprox.)", "M15 es una talla intermedia; confirme paso fino o grueso en el plano.", "Construcción de máquinas y equipos que listan M15."),
    (16, 2.0, 14.0, 24, "5/8-11", "M16 es habitual en estructuras y bridas de gran tamaño.", "Estructuras metálicas, máquinas herramienta y uniones pesadas."),
    (17, 1.5, 15.5, 27, "5/8-11 (aprox.)", "M17 es poco común; valide el paso con la pieza original.", "Repuestos y equipos que especifican M17."),
    (18, 2.5, 15.5, 27, "3/4-10", "M18 cubre uniones muy exigentes en maquinaria pesada.", "Ingeniería pesada, husillos grandes y bridas de alta carga."),
    (19, 2.5, 16.5, 30, "3/4-10 (aprox.)", "M19 es raro; su uso depende del fabricante del equipo.", "Aplicaciones especiales con documentación explícita."),
    (20, 2.5, 17.5, 30, "3/4-10", "M20 es habitual en construcción metálica y máquinas grandes.", "Estructuras, pernos de anclaje medianos y uniones de alta resistencia."),
]

AEO_Q = {i: f"¿Qué es un perno M{i}?" for i in range(3, 21)}
AEO_A = {
    3: "Sujetador métrico de 3 mm de diámetro nominal y paso grueso 0,5 mm; habitual en electrónica y mecanismos compactos.",
    4: "Tornillo métrico de 4 mm de nominal y paso 0,7 mm; muy extendido en maquinaria ligera.",
    5: "Perno de 5 mm de nominal y paso 0,8 mm; punto medio muy común entre M4 y M6.",
    6: "Uno de los M más usados: 6 mm de nominal y paso grueso 1,0 mm (el fino 0,75 mm es frecuente en ajustes).",
    7: "Diámetro nominal 7 mm; talla menos estándar que M6 u M8, usada en algunos equipos especializados.",
    8: "Perno de 8 mm de nominal; el paso grueso típico es 1,25 mm y el fino 1,0 mm en aplicaciones específicas.",
    9: "9 mm de nominal con paso habitual 1,25 mm; menos corriente que M8 o M10.",
    10: "10 mm de nominal y paso grueso 1,5 mm; estándar en automoción y estructura.",
    11: "11 mm de nominal; menos habitual que M10 o M12; confirme en el plano o pieza original.",
    12: "12 mm de nominal y paso grueso 1,75 mm; usado en bridas y uniones de mayor carga.",
    13: "13 mm de nominal; talla poco habitual; verifique paso y disponibilidad con el fabricante.",
    14: "14 mm de nominal y paso grueso 2,0 mm; habitual en maquinaria pesada.",
    15: "15 mm de nominal; puede aparecer con pasos distintos; consulte documentación técnica.",
    16: "16 mm de nominal y paso grueso 2,0 mm; habitual en estructuras y uniones pesadas.",
    17: "17 mm de nominal; talla intermedia poco comercial; valide especificación.",
    18: "18 mm de nominal y paso grueso 2,5 mm; uniones muy exigentes en maquinaria grande.",
    19: "19 mm de nominal; uso poco frecuente; siga la documentación del equipo.",
    20: "20 mm de nominal y paso grueso 2,5 mm; pernos grandes para estructuras y máquinas pesadas.",
}

FINE_ROW = {
    8: "<tr><td>Paso fino</td><td>1,0 mm</td></tr>",
    10: "<tr><td>Paso fino</td><td>1,25 mm</td></tr>",
    12: "<tr><td>Paso fino</td><td>1,5 mm</td></tr>",
    16: "<tr><td>Paso fino</td><td>1,5 mm</td></tr>",
    20: "<tr><td>Paso fino</td><td>1,5 mm o 2,0 mm</td></tr>",
}


def faq_schema_m(mm, pitch, tap, imp):
    pitch_s = str(pitch).replace(".", ",")
    tap_s = str(tap).replace(".", ",")
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"¿Cuál es el paso estándar de un perno M{mm}?",
                "acceptedAnswer": {"@type": "Answer", "text": f"El paso grueso ISO habitual de M{mm} es {pitch_s} mm."},
            },
            {
                "@type": "Question",
                "name": f"¿Qué broca usar para roscar M{mm}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"Para rosca M{mm} × {pitch_s} gruesa, use broca de {tap_s} mm aproximadamente. Para otros pasos use la calculadora de broca para roscar.",
                },
            },
            {
                "@type": "Question",
                "name": f"¿Qué tornillo imperial se acerca más a M{mm}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"Referencia orientativa: {imp}. Compare siempre con la pieza original.",
                },
            },
        ],
    }
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


FOOTER_SCRIPTS = """  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Albor Digital LLC","url":"https://albor.digital","email":"contact@albor.digital","sameAs":["https://boltlab.io","https://screwsizechart.com","https://boltgradechart.com"]}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"BoltLab","url":"https://boltlab.io","publisher":{"@type":"Organization","name":"Albor Digital LLC"}}</script>
  <script src="/js/link-engine.js" defer></script>
  <script src="/js/context-anchor-engine.js" defer></script>
  <script src="/js/anchor-engine.js" defer></script>
"""


def en_hreflang_url(mm):
    """English metric size page (M3–M20 generated; stubs for all)."""
    return f"https://boltlab.io/sizes/m{mm}-bolt-size.html"


def tambien_metric_html(mm):
    """3–4 internal ES links: previous M, next M, one UNC reference."""
    lines = []
    if mm > 3:
        lines.append(
            f'          <li><a href="/es/sizes/perno-m{mm - 1}.html">Perno M{mm - 1}</a> (talla anterior)</li>'
        )
    if mm < 20:
        lines.append(
            f'          <li><a href="/es/sizes/perno-m{mm + 1}.html">Perno M{mm + 1}</a> (talla siguiente)</li>'
        )
    if 3 <= mm <= 6:
        unc = ("perno-1-4-20", "1/4-20 UNC (referencia imperial)")
    elif 7 <= mm <= 11:
        unc = ("perno-5-16-18", "5/16-18 UNC (referencia imperial)")
    else:
        unc = ("perno-3-8-16", "3/8-16 UNC (referencia imperial)")
    lines.append(f'          <li><a href="/es/sizes/{unc[0]}.html">{unc[1]}</a></li>')
    body = "\n".join(lines[:4])
    return f"""      <section class="card">
        <h2>También te puede interesar</h2>
        <ul class="meta-list">
{body}
        </ul>
      </section>

"""


def render_metric(row):
    mm, pitch, tap, hexv, imp, intro, uses = row
    slug = f"perno-m{mm}"
    en_url = en_hreflang_url(mm)
    en_path = en_url.replace("https://boltlab.io", "")
    pitch_s = str(pitch).replace(".", ",")
    tap_s = str(tap).replace(".", ",")
    title = f"Perno M{mm}: tallas y especificaciones de rosca | BoltLab"
    desc = f"Dimensiones M{mm}, paso {pitch_s} mm, broca {tap_s} mm, cabeza hex {hexv} mm. Referencia imperial: {imp}."
    faq = faq_schema_m(mm, pitch, tap, imp)
    tambien = tambien_metric_html(mm)
    fine = FINE_ROW.get(mm, "")
    tbody = f"""              <tr><td>Diámetro nominal</td><td>{mm} mm</td></tr>
              <tr><td>Paso estándar (grueso)</td><td>{pitch_s} mm</td></tr>
{fine}              <tr><td>Diámetro de broca para roscar</td><td>{tap_s} mm</td></tr>
              <tr><td>Equivalente imperial más cercano</td><td>{imp}</td></tr>"""

    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="https://boltlab.io/es/sizes/{slug}.html">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="alternate" hreflang="en" href="{en_url}" />
  <link rel="alternate" hreflang="es" href="https://boltlab.io/es/sizes/{slug}.html" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <script type="application/ld+json">
  {faq}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/es/">BoltLab</a>
      <nav aria-label="Primary">
        <ul class="nav-list">
          <li><a href="/es/">Herramientas</a></li>
          <li><a href="/charts/">Gráficos</a></li>
          <li><a href="/reference/">Referencia</a></li>
          <li><a href="/sizes/">Tamaños</a></li>
          <li><a href="/guides/">Guías</a></li>
        </ul>
      </nav>
      <div class="lang-switch" role="navigation" aria-label="Idioma">
        <a href="{en_path}" class="lang-switch-link" hreflang="en">EN</a>
        <span class="lang-switch-sep" aria-hidden="true">|</span>
        <a href="/es/sizes/{slug}.html" class="lang-switch-link lang-switch-link--active" hreflang="es" aria-current="page">ES</a>
      </div>
    </div>
  </header>
  <main id="content" class="container">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/es/">BoltLab</a> → <a href="/sizes/">Tamaños de pernos</a> → M{mm}</nav>
      <h1>Perno M{mm}: tallas y especificaciones de rosca</h1>
      <div class="aeo-answer-block" aria-label="Respuesta directa">
        <h2>{AEO_Q[mm]}</h2>
        <p>{AEO_A[mm]}</p>
      </div>
      <p class="muted">{intro} Referencia en inglés: <a href="{en_path}" hreflang="en">M{mm} bolt size</a>.</p>

      <section class="card">
        <h2>Especificaciones</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Especificación</th><th scope="col">Valor</th></tr></thead>
            <tbody>
{tbody}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Tamaño de cabeza hexagonal</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Talla del perno</th><th scope="col">Llave hexagonal</th></tr></thead>
            <tbody><tr><td>M{mm}</td><td>{hexv} mm</td></tr></tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Usos habituales</h2>
        <p>{uses}</p>
      </section>

      <section class="card">
        <h2>Herramientas relacionadas</h2>
        <ul class="meta-list">
          <li><a href="/es/tools/metrico-a-pulgadas.html">Convertidor métrico a pulgadas</a></li>
          <li><a href="/es/tools/calculadora-broca-roscar.html">Calculadora de broca para roscar</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Gráficos relacionados</h2>
        <ul class="meta-list">
          <li><a href="/charts/universal-screw-bolt-size-chart.html">Universal Screw &amp; Bolt Size Chart</a></li>
          <li><a href="/charts/tap-drill-chart.html">Tap Drill Chart</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Preguntas frecuentes</h2>
        <h3>¿Cuál es el paso estándar de un perno M{mm}?</h3>
        <p>El paso grueso ISO habitual de M{mm} es {pitch_s} mm.</p>
        <h3>¿Qué broca usar para roscar M{mm}?</h3>
        <p>Para rosca M{mm} × {pitch_s} gruesa use broca de {tap_s} mm. Para otros pasos use nuestra calculadora de broca para roscar.</p>
        <h3>¿Qué tornillo imperial se acerca más a M{mm}?</h3>
        <p>Referencia orientativa: {imp}. Compare siempre diámetro y TPI con la pieza original.</p>
      </section>

{tambien}      <aside class="ad-slot ad-slot--inline" aria-label="Publicidad" data-ad-placeholder="true"></aside>
      <section class="card guide-links">
        <h3>Guía relacionada</h3>
        <p><a href="/es/guides/metrico-vs-imperial.html">Sujetadores métricos vs imperiales</a></p>
      </section>
    </article>
  <div id="related-links" class="related-links" aria-label="Related links"></div>
  </main>
      <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="footer-logo" href="/es/">BoltLab</a>
        <p class="footer-tagline">Herramientas de sujeción de precisión para el uso real.</p>
      </div>
      <nav class="footer-nav footer-nav-center" aria-label="Product">
        <a href="/es/">Herramientas</a>
        <a href="/charts/">Gráficos</a>
        <a href="/sizes/">Tamaños</a>
        <a href="/guides/">Guías</a>
      </nav>
      <nav class="footer-nav footer-nav-right" aria-label="Company">
        <a href="/about">Acerca de</a>
        <a href="/contact">Contacto</a>
        <a href="/privacy">Privacidad</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p class="footer-copyright">© BoltLab — A product of Albor Digital LLC</p>
        <p class="footer-domains"><span class="footer-domains-label">Supporting domains:</span> screwsizechart.com · boltgradechart.com</p>
      </div>
    </div>
  </footer>
{FOOTER_SCRIPTS}
</body>
</html>
"""


# UNC: es_slug, en_slug, title label, short desc, meta, AEO h2, AEO p, spec rows html, intro, uses, guide href, guide text, metric link
UNC_PAGES = [
    (
        "perno-1-4-20",
        "1-4-20-bolt-size.html",
        "1/4-20",
        "1/4 es el diámetro nominal en pulgadas (0,25 in). 20 es el número de roscas por pulgada (TPI). Es una rosca UNC gruesa muy habitual.",
        "Perno 1/4-20 UNC: diámetro 0,25 in, 20 TPI, broca #7. Referencia métrica: M6.",
        "¿Qué es un perno 1/4-20?",
        "Roscado imperial UNC con 1/4 in de diámetro nominal y 20 TPI; uno de los tamaños más usados en Norteamérica y maquinaria importada.",
        """              <tr><td>Diámetro nominal</td><td>0,25 in (6,35 mm)</td></tr>
              <tr><td>Roscas por pulgada (TPI)</td><td>20</td></tr>
              <tr><td>Broca para roscar</td><td>#7 (0,201 in)</td></tr>
              <tr><td>Equivalente métrico más cercano</td><td>M6</td></tr>""",
        "1/4-20 es uno de los sujetadores imperiales más comunes en automoción, maquinaria y ferretería norteamericana.",
        "Automoción, muebles, chasis, máquinas y equipos con especificación UNC.",
        "/es/guides/paso-de-rosca.html",
        "Paso de rosca explicado",
    ),
    (
        "perno-5-16-18",
        "5-16-18-bolt-size.html",
        "5/16-18",
        "5/16 in de diámetro nominal (0,3125 in) y 18 TPI en serie UNC gruesa.",
        "Perno 5/16-18: 18 TPI, broca F. Referencia métrica: M8.",
        "¿Qué es un perno 5/16-18?",
        "Roscado UNC con 5/16 in de diámetro y 18 TPI; tamaño intermedio muy habitual en estructuras y automoción.",
        """              <tr><td>Diámetro nominal</td><td>0,3125 in (7,94 mm)</td></tr>
              <tr><td>Roscas por pulgada (TPI)</td><td>18</td></tr>
              <tr><td>Broca para roscar</td><td>F (0,257 in)</td></tr>
              <tr><td>Equivalente métrico más cercano</td><td>M8</td></tr>""",
        "5/16-18 se usa entre 1/4-20 y 3/8-16 en muchas aplicaciones estructurales y mecánicas.",
        "Automoción, maquinaria, uniones estructurales y ferretería industrial.",
        "/es/guides/metrico-vs-imperial.html",
        "Sujetadores métricos vs imperiales",
    ),
    (
        "perno-3-8-16",
        "3-8-16-bolt-size.html",
        "3/8-16",
        "3/8 in de diámetro nominal y 16 TPI en UNC gruesa.",
        "Perno 3/8-16: 16 TPI, broca 5/16 in. Referencia métrica: M10.",
        "¿Qué es un perno 3/8-16?",
        "Roscado UNC de 3/8 in con 16 TPI; tamaño robusto para cargas altas en aplicaciones imperiales.",
        """              <tr><td>Diámetro nominal</td><td>0,375 in (9,53 mm)</td></tr>
              <tr><td>Roscas por pulgada (TPI)</td><td>16</td></tr>
              <tr><td>Broca para roscar</td><td>5/16 in</td></tr>
              <tr><td>Equivalente métrico más cercano</td><td>M10</td></tr>""",
        "3/8-16 es frecuente en motores, chasis y estructuras que siguen especificaciones norteamericanas.",
        "Automoción pesada, maquinaria, bridas y uniones de alta resistencia.",
        "/es/guides/metrico-vs-imperial.html",
        "Sujetadores métricos vs imperiales",
    ),
]


def render_unc(t):
    slug, en_slug, label, short_faq, meta, aeo_q, aeo_a, body_rows, intro, uses, gurl, gtext = t
    title = f"Perno {label}: especificaciones UNC | BoltLab"
    faq = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f"¿Qué significa {label}?",
                    "acceptedAnswer": {"@type": "Answer", "text": short_faq},
                },
                {
                    "@type": "Question",
                    "name": f"¿Qué broca usar para roscar {label}?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Consulte la tabla de este artículo o la calculadora de broca para roscar para el diámetro exacto de broca.",
                    },
                },
                {
                    "@type": "Question",
                    "name": f"¿Qué perno métrico equivale a {label}?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Vea la fila de equivalente métrico en la tabla; siempre compare con la pieza original.",
                    },
                },
            ],
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )

    metric_slug = {"perno-1-4-20": "perno-m6", "perno-5-16-18": "perno-m8", "perno-3-8-16": "perno-m10"}[slug]
    hex_row = "7/16 in" if "1/4" in label else ("1/2 in" if "5/16" in label else "9/16 in")

    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{meta}">
  <link rel="canonical" href="https://boltlab.io/es/sizes/{slug}.html">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="alternate" hreflang="en" href="https://boltlab.io/sizes/{en_slug}" />
  <link rel="alternate" hreflang="es" href="https://boltlab.io/es/sizes/{slug}.html" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <script type="application/ld+json">
  {faq}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/es/">BoltLab</a>
      <nav aria-label="Primary">
        <ul class="nav-list">
          <li><a href="/es/">Herramientas</a></li>
          <li><a href="/charts/">Gráficos</a></li>
          <li><a href="/reference/">Referencia</a></li>
          <li><a href="/sizes/">Tamaños</a></li>
          <li><a href="/guides/">Guías</a></li>
        </ul>
      </nav>
      <div class="lang-switch" role="navigation" aria-label="Idioma">
        <a href="/sizes/{en_slug}" class="lang-switch-link" hreflang="en">EN</a>
        <span class="lang-switch-sep" aria-hidden="true">|</span>
        <a href="/es/sizes/{slug}.html" class="lang-switch-link lang-switch-link--active" hreflang="es" aria-current="page">ES</a>
      </div>
    </div>
  </header>
  <main id="content" class="container">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/es/">BoltLab</a> → <a href="/sizes/">Tamaños de pernos</a> → {label}</nav>
      <h1>Perno {label}: especificaciones UNC</h1>
      <div class="aeo-answer-block" aria-label="Respuesta directa">
        <h2>{aeo_q}</h2>
        <p>{aeo_a}</p>
      </div>
      <p class="muted">{intro} Referencia en inglés: <a href="/sizes/{en_slug}" hreflang="en">{label} (EN)</a>.</p>

      <section class="card">
        <h2>Especificaciones</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Especificación</th><th scope="col">Valor</th></tr></thead>
            <tbody>
{body_rows}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Tamaño de cabeza hexagonal</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Talla</th><th scope="col">Llave hexagonal</th></tr></thead>
            <tbody><tr><td>{label}</td><td>{hex_row}</td></tr></tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Usos habituales</h2>
        <p>{uses}</p>
      </section>

      <section class="card">
        <h2>Herramientas relacionadas</h2>
        <ul class="meta-list">
          <li><a href="/es/tools/metrico-a-pulgadas.html">Convertidor métrico a pulgadas</a></li>
          <li><a href="/es/tools/paso-rosca-a-tpi.html">Convertidor de paso a TPI</a></li>
          <li><a href="/es/tools/calculadora-broca-roscar.html">Calculadora de broca para roscar</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Gráficos relacionados</h2>
        <ul class="meta-list">
          <li><a href="/charts/universal-screw-bolt-size-chart.html">Universal Screw &amp; Bolt Size Chart</a></li>
          <li><a href="/charts/tap-drill-chart.html">Tap Drill Chart</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Preguntas frecuentes</h2>
        <h3>¿Qué significa {label}?</h3>
        <p>{short_faq}</p>
        <h3>¿Qué broca usar para roscar {label}?</h3>
        <p>Vea la tabla de especificaciones arriba o use la calculadora de broca para roscar.</p>
        <h3>¿Qué perno métrico equivale a {label}?</h3>
        <p>Consulte la tabla; para más detalle vea también <a href="/es/sizes/{metric_slug}.html">la página del equivalente métrico</a>.</p>
      </section>

      <section class="card guide-links">
        <h3>Guía relacionada</h3>
        <p><a href="{gurl}">{gtext}</a></p>
      </section>

      <aside class="ad-slot ad-slot--inline" aria-label="Publicidad" data-ad-placeholder="true"></aside>
    </article>
  <div id="related-links" class="related-links" aria-label="Related links"></div>
  </main>
      <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="footer-logo" href="/es/">BoltLab</a>
        <p class="footer-tagline">Herramientas de sujeción de precisión para el uso real.</p>
      </div>
      <nav class="footer-nav footer-nav-center" aria-label="Product">
        <a href="/es/">Herramientas</a>
        <a href="/charts/">Gráficos</a>
        <a href="/sizes/">Tamaños</a>
        <a href="/guides/">Guías</a>
      </nav>
      <nav class="footer-nav footer-nav-right" aria-label="Company">
        <a href="/about">Acerca de</a>
        <a href="/contact">Contacto</a>
        <a href="/privacy">Privacidad</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p class="footer-copyright">© BoltLab — A product of Albor Digital LLC</p>
        <p class="footer-domains"><span class="footer-domains-label">Supporting domains:</span> screwsizechart.com · boltgradechart.com</p>
      </div>
    </div>
  </footer>
{FOOTER_SCRIPTS}
</body>
</html>
"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for row in METRIC:
        mm = row[0]
        path = OUT / f"perno-m{mm}.html"
        path.write_text(render_metric(row), encoding="utf-8")
        print("wrote", path.name)
    for t in UNC_PAGES:
        path = OUT / f"{t[0]}.html"
        path.write_text(render_unc(t), encoding="utf-8")
        print("wrote", path.name)


if __name__ == "__main__":
    main()
