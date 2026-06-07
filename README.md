# Oblitus est scientia

**Redivulgación de temática científica**

Oblitus est scientia es una web estática de estilo editorial, preparada para funcionar en GitHub Pages como alternativa gratuita a un blog clásico de WordPress. La idea es mantener una portada seria, buscable y etiquetada, donde cada artículo pueda ser una carpeta independiente con texto largo, imágenes, audio, visualizaciones y microinterfaces JavaScript.

## Objetivo del proyecto

Crear una plataforma personal de publicación que permita:

- publicar artículos largos tipo blog o ensayo;
- organizar el contenido por etiquetas, categorías y buscador;
- integrar audio, imágenes, SVG, tablas, gráficos y pequeñas interfaces JavaScript;
- funcionar sin base de datos, sin servidor propio y sin coste de hosting inicial;
- conservar control total sobre el diseño, la estructura y la evolución técnica.

## Estado actual

Versión inicial funcional.

Incluye:

- portada editorial con mosaico de artículos;
- buscador por título, resumen, categoría y etiquetas;
- filtro dinámico por etiquetas;
- orden por fecha o título;
- modo claro/oscuro con persistencia en navegador;
- dos artículos de ejemplo;
- plantilla de artículo con bloque de audio;
- plantilla de artículo con microinterfaz JavaScript;
- editor estático para generar el bloque JSON y el HTML base de nuevos artículos;
- estructura preparada para GitHub Pages;
- favicon, manifest, robots.txt, sitemap.xml, 404.html, licencia MIT y `.nojekyll`.

## Estructura del proyecto

```text
oblitus-est-scientia/
├── index.html
├── editor.html
├── 404.html
├── README.md
├── LICENSE
├── robots.txt
├── sitemap.xml
├── manifest.webmanifest
├── .nojekyll
├── .gitignore
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── editor.js
│   │   └── article-demo.js
│   ├── data/
│   │   └── posts.json
│   └── media/
│       ├── audio/
│       │   ├── README.md
│       │   └── silencio-muestra.wav
│       └── images/
│           ├── favicon.svg
│           ├── default-cover.svg
│           └── interactive-cover.svg
├── articulos/
│   ├── manifiesto-editorial/
│   │   └── index.html
│   └── microinterfaz-demo/
│       └── index.html
└── docs/
    ├── GUIA_EDITORIAL.md
    └── PUBLICACION.md
```

## Cómo funciona

La portada no lee carpetas automáticamente, porque GitHub Pages sirve HTML, CSS y JavaScript de forma estática. En su lugar, la web utiliza el fichero:

```text
assets/data/posts.json
```

Ese fichero actúa como índice editorial. Cada entrada define:

- título;
- subtítulo;
- fecha;
- categoría;
- etiquetas;
- resumen;
- imagen de portada;
- ruta del artículo;
- tiempo de lectura;
- si tiene audio;
- si tiene bloque interactivo.

La página `index.html` carga ese JSON y genera el mosaico de artículos, filtros, etiquetas y buscador.

## Cómo añadir un nuevo artículo

### 1. Crear carpeta

Dentro de `articulos/`, crea una carpeta con el slug del artículo:

```text
articulos/nombre-del-articulo/
```

Dentro de esa carpeta, crea:

```text
index.html
```

### 2. Crear el artículo

Puedes partir de uno de los ejemplos:

```text
articulos/manifiesto-editorial/index.html
articulos/microinterfaz-demo/index.html
```

También puedes abrir:

```text
editor.html
```

Ese editor genera una plantilla HTML básica y el bloque JSON que deberás añadir a `posts.json`.

### 3. Registrar el artículo en `posts.json`

Añade una nueva entrada dentro del array `posts`:

```json
{
  "id": "nombre-del-articulo",
  "title": "Título del artículo",
  "subtitle": "Subtítulo editorial",
  "date": "2026-06-07",
  "category": "Física",
  "tags": ["Ciencia", "Física", "Historia"],
  "excerpt": "Resumen breve del artículo.",
  "cover": "assets/media/images/default-cover.svg",
  "url": "articulos/nombre-del-articulo/",
  "readingTime": "12 min",
  "audio": false,
  "interactive": false,
  "status": "borrador"
}
```

## Cómo probar en local

Por seguridad del navegador, `fetch('assets/data/posts.json')` puede fallar si abres `index.html` directamente con doble clic. Lo correcto es levantar un servidor local.

Con Python:

```bash
python -m http.server 8000
```

Después abre:

```text
http://localhost:8000
```

Con VS Code también puedes usar la extensión Live Server.

## Cómo publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todos los ficheros del proyecto.
3. Entra en **Settings > Pages**.
4. En **Build and deployment**, selecciona la rama principal y la carpeta raíz.
5. Guarda la configuración.
6. GitHub publicará la web en una URL del tipo:

```text
https://usuario.github.io/nombre-del-repositorio/
```

Después de publicar, actualiza `sitemap.xml` con la URL real.

## Recomendaciones sobre audios, imágenes y peso

GitHub Pages funciona bien para una web estática, pero no conviene usar el repositorio como almacén masivo de audios o vídeos.

Recomendación inicial:

- imágenes en SVG, WebP, JPG o PNG optimizados;
- audios en MP3 u OGG comprimido;
- vídeos alojados externamente;
- podcasts largos alojados en una plataforma externa y enlazados desde la web;
- repositorio por debajo de 1 GB siempre que sea posible.

## Línea editorial inicial

El proyecto está orientado a piezas extensas y serias sobre:

- física;
- matemáticas;
- química;
- cosmología;
- inteligencia artificial;
- tecnología;
- historia de la ciencia;
- geopolítica del conocimiento;
- cultura crítica.

## Convenciones recomendadas

### Carpetas

Usar minúsculas, guiones y nombres descriptivos:

```text
articulos/la-maquina-de-antikythera/
articulos/por-que-la-ia-no-es-magia/
articulos/mapa-minimo-de-la-fisica-cuantica/
```

### Etiquetas

Usar pocas etiquetas, pero consistentes:

```text
Ciencia, Física, IA, Historia, Matemáticas, Geopolítica, Tecnología
```

### Portadas

Guardar portadas en:

```text
assets/media/images/
```

### Audios

Guardar audios en:

```text
assets/media/audio/
```

Para artículos con muchos recursos, se puede crear una subcarpeta propia dentro del artículo:

```text
articulos/nombre-del-articulo/media/
```

## Hoja de ruta

Posibles mejoras futuras:

- lector de artículos con índice lateral automático;
- sistema de series o colecciones;
- etiquetas jerárquicas;
- páginas de categoría;
- RSS estático;
- exportación de artículos a PDF;
- contador estimado de palabras;
- soporte para Markdown mediante generación previa;
- migración futura a Astro, Eleventy, Jekyll o Hugo si el volumen crece;
- buscador avanzado con MiniSearch o Lunr;
- comentarios externos opcionales con Giscus;
- integración con YouTube o podcast externo.

## Licencia

El código se distribuye bajo licencia MIT.

El contenido editorial —textos, audios, imágenes propias y artículos— puede quedar bajo otra licencia si se desea. Una opción razonable para textos divulgativos sería Creative Commons, pero no se ha aplicado todavía para no mezclar código y obra editorial.

## Historial de versiones

### v1.0.0 — Primera versión funcional

- Creada portada editorial para **Oblitus est scientia**.
- Añadido subtítulo **Redivulgación de temática científica**.
- Implementado mosaico de artículos.
- Implementado buscador.
- Implementado filtrado por etiquetas.
- Implementado orden por fecha y título.
- Añadido modo claro/oscuro.
- Añadidos dos artículos de ejemplo.
- Añadido soporte básico para audio.
- Añadida demo de microinterfaz JavaScript.
- Añadido editor estático para generar artículos.
- Añadidos ficheros propios de publicación web: `404.html`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, favicon, `.gitignore`, `.nojekyll` y licencia MIT.
