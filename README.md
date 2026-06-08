# Oblitus est scientia

**Ciencia, tecnología y pensamiento crítico**

Oblitus est scientia es una web editorial estática preparada para GitHub Pages. Su objetivo es funcionar como una alternativa ligera a WordPress para publicar artículos largos, documentos convertidos en publicaciones web, recursos multimedia y microinterfaces JavaScript.

La idea principal actual es sencilla: el contenido se guarda en `articulos/`, y una GitHub Action genera automáticamente el índice de publicaciones que aparece en la portada.

---

## Estado del proyecto

Versión actual: **v0.15.0**

Esta versión pausa la sincronización activa con Google Drive y vuelve a dejar el flujo centrado en la carpeta `articulos/`. También mejora el tratamiento de HTML completos generados externamente: los documentos HTML autónomos se publican dentro del lector mediante un iframe interno para conservar sus estilos, botones, scripts, canvas, cuestionarios, vídeos e interactividad sin contaminar ni romper la maqueta de Oblitus.

---

## Funcionalidades principales

- Portada editorial compacta con acceso inmediato a los artículos.
- Barra superior fija en escritorio y móvil.
- Menú móvil basado en botón OES.
- Buscador compacto integrado en la barra en escritorio y dentro del menú OES en móvil.
- Tema visual automático según la hora local del visitante.
- Arranque temprano del tema visual antes de cargar los estilos, para evitar flashes claros en modo nocturno.
- Fichas de artículos con título superpuesto sobre la imagen.
- Fecha y duración de lectura visibles en ficha, sin mostrar el tipo técnico de archivo.
- Etiquetas de ficha en carril horizontal desplazable.
- Búsqueda por título, resumen, categoría, formato, etiquetas y texto interno de artículos generados.
- Lector de artículos con índice lateral automático y capítulos contraíbles para documentos convertidos o HTML de fragmento.
- Modo de lector autónomo para HTML completos con JavaScript propio.
- Índice lateral del lector con scroll interno cuando tiene mucho contenido.
- Soporte para artículos procedentes de Word, PDF, Markdown, HTML de fragmento y HTML completo interactivo.
- Hoja de ruta funcional documentada en `docs/decisiones-editoriales-y-funcionales.md`.
- Preparado para GitHub Pages.

---

## Estructura principal

```txt
oblitus-est-scientia/
├── .github/workflows/pages.yml
├── articulos/
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   ├── editorial.css
│   │   ├── reader.css
│   │   └── mobile.css
│   ├── data/articles.generated.json
│   ├── generated/
│   ├── js/
│   │   ├── app.js
│   │   ├── article.js
│   │   ├── mobile-menu.js
│   │   ├── site.js
│   │   ├── theme-bootstrap.js
│   │   └── theme.js
│   └── media/images/
│       ├── alejandro-pico-profile.jpg
│       └── default-cover.svg
├── docs/
│   ├── decisiones-editoriales-y-funcionales.md
│   └── google-drive.md
├── tools/
│   ├── build-articles.mjs
│   └── sync-drive.mjs
├── articulo.html
├── index.html
├── sobre.html
├── tematicas.html
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## Google Drive

La integración con Google Drive queda **pausada**. El código y la documentación se conservan para retomarlo más adelante, pero el workflow de publicación ya no ejecuta `npm run sync:drive` y `package.json` ya no instala `googleapis`.

El flujo activo vuelve a ser:

```txt
subir artículos a articulos/ → ejecutar Actions o hacer push → publicar GitHub Pages
```

---

## Sistema de tema temporal

El tema visual principal está en:

```txt
assets/js/theme.js
```

El arranque preventivo está en:

```txt
assets/js/theme-bootstrap.js
```

`theme-bootstrap.js` se carga en el `<head>` antes de las hojas CSS. Su función es aplicar de inmediato una paleta coherente con la hora local o con el modo elegido en `localStorage`, evitando que el navegador pinte primero la versión diurna y después salte al modo nocturno.

---

## Formato prioritario de artículos

El formato que se priorizará a partir de ahora será:

```txt
articulos/mi-articulo/index.html
```

También se aceptan ficheros HTML completos directamente dentro de `articulos/`:

```txt
articulos/mi-articulo-interactivo.html
```

Si el generador detecta un documento HTML completo con `<!doctype html>` o `<html>`, lo tratará como artículo autónomo y lo abrirá dentro de un iframe interno. Esto evita que su CSS global, su índice propio, sus botones o sus scripts entren en conflicto con la página principal de Oblitus.

---

## Desarrollo local

```bash
npm install
npm run build:content
npm run serve
```

Después abre:

```txt
http://localhost:8000
```

---

## Hoja de ruta aceptada

Queda documentada en:

```txt
docs/decisiones-editoriales-y-funcionales.md
```

Incluye: índice de lectura automático, modo lectura larga, series editoriales, notas al margen, citas, glosario, HTML interactivo, buscador avanzado, RSS, sitemap, hemeroteca, compartir por redes, exportación a PDF/DOCX/EPUB y PWA.

---

## Historial de versiones

### v0.15.0

- Pausada la sincronización activa con Google Drive.
- Eliminado `npm run sync:drive` del workflow de publicación.
- Eliminada la dependencia activa `googleapis` de `package.json`.
- Añadida detección de documentos HTML completos en `tools/build-articles.mjs`.
- Los HTML completos se marcan con `standalone: true` y `renderMode: standalone`.
- El lector abre artículos autónomos mediante iframe interno para conservar CSS, scripts, botones, canvas, vídeos y cuestionarios.
- Añadido `assets/css/reader.css` para estilos específicos del lector.
- Corregido el scroll interno del índice lateral cuando hay muchos capítulos.
- El índice automático de Oblitus ignora encabezados dentro de `nav`, `aside`, `.toc` y `.toolbar`.

### v0.14.0

- Añadida primera integración experimental con Google Drive.
- Añadido `tools/sync-drive.mjs`.
- Añadido `config/drive-sources.json`.
- Añadido `docs/google-drive.md`.

### v0.13.0

- Sustituido el uso efectivo del retrato por `assets/media/images/alejandro-pico-profile.jpg`.
- Eliminada la dependencia visual del SVG incrustado para el retrato del autor.
- Añadido `assets/js/theme-bootstrap.js` para aplicar el tema antes de cargar CSS.
- Insertado `theme-bootstrap.js` en portada, página “Sobre la web” y lector de artículos.
- Añadido `editorial.css` directamente en `sobre.html` y `articulo.html` para evitar cargas tardías.
- Corregido el fogonazo blanco nocturno al navegar entre páginas.

### v0.12.0

- Sustituido el retrato incrustado en WebP por una versión JPEG dentro del SVG para mejorar compatibilidad.
- Corregida la maquetación de la sección “Alejandro Picó” para evitar saltos extraños de texto.
- Reforzado el contraste del modo automático entre las 17:45 y las 19:00.

### v0.11.0

- Añadido retrato preparado para “Sobre la web”.
- Añadido `assets/css/editorial.css` para estilos editoriales complementarios.
- Rediseñadas las fichas de artículos para que el título se superponga sobre la imagen.
- Eliminada la visualización del formato técnico del archivo en la ficha.
- Convertidas las etiquetas de ficha en un carril horizontal desplazable.
- Limpiado `default-cover.svg` para que no muestre el título genérico de la web.

### v0.10.0

- Añadido título móvil acoplable en portada mediante cálculo de scroll y posición del `h1`.
- El título “Oblitus est scientia” aparece en la barra móvil cuando el título principal deja de verse.
- Centrado horizontalmente el título del artículo dentro de la barra móvil del lector.

### v0.9.0

- Añadido `assets/css/mobile.css` para aislar la adaptación móvil.
- Añadido `assets/js/mobile-menu.js` como controlador común del menú móvil.
- Añadido botón OES móvil en portada, sobre la web y lector de artículos.
- Ajustada la anchura de tarjetas y artículos para móviles Android en vertical.

### v0.8.0

- Movido el buscador al inicio de la navegación, antes de “Artículos”.
- Eliminado el enlace público independiente a “Temáticas”.
- Unificada la página de temáticas dentro de `sobre.html`.
- Añadida presentación personal de Alejandro Picó en “Sobre la web”.
- Reducidos los radios globales a una estética más recta y angulada.

### v0.7.0

- Compactado el buscador superior.
- Corregida la dirección de apertura del buscador.
- Añadido título del artículo activo en la barra superior del lector.

### v0.6.0

- Corregidas las transiciones manuales entre Auto, Día, Tarde y Noche.
- Ajustada la línea temporal automática a una base de 15 minutos.
- Añadida indexación del contenido interno de los artículos generados mediante `contentUrl`.

### v0.5.0

- Añadido `assets/js/theme.js` como sistema común de tema visual.
- Añadido modo automático basado en la hora local del visitante.

### v0.4.0

- Reducida la cabecera hero de la portada.
- Movido el buscador a la barra superior mediante icono de lupa.
- Fijada la barra superior durante el scroll.

### v0.3.0

- Reorganizada la portada para que el contenido principal sea la biblioteca de artículos.
- Movida la explicación editorial a `sobre.html`.

### v0.2.0

- Añadida arquitectura basada en carpeta `articulos/`.
- Añadido generador de artículos desde documentos.
- Añadido lector universal `articulo.html`.
- Añadido workflow de GitHub Actions para publicar en GitHub Pages.

### v0.1.0

- Primera maqueta estática.
- Portada editorial.
- Mosaico de artículos.
- Buscador.
- Filtros por etiquetas.
- Modo claro/oscuro.
