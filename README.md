# Oblitus est scientia

**Ciencia, tecnología y pensamiento crítico**

Oblitus est scientia es una web editorial estática preparada para GitHub Pages. Su objetivo es funcionar como una alternativa ligera a WordPress para publicar artículos largos, documentos convertidos en publicaciones web, recursos multimedia y pequeñas microinterfaces JavaScript.

La idea principal es sencilla: el contenido se guarda en la carpeta `articulos/`, y una GitHub Action genera automáticamente el índice de publicaciones que aparece en la portada.

---

## Estado del proyecto

Versión actual: **v0.12.0**

Esta versión corrige la visualización del retrato de Alejandro Picó, sustituye la incrustación anterior por una versión JPEG más compatible, reajusta la maquetación de la sección de autor para evitar saltos extraños en el texto y refuerza el contraste del modo automático durante la transición de tarde a noche.

---

## Funcionalidades principales

- Portada editorial compacta con acceso inmediato a los artículos.
- Barra superior fija en escritorio y móvil.
- Menú móvil basado en botón OES.
- Título móvil acoplable en portada cuando el encabezado principal sale de pantalla.
- En artículos móviles, título del documento centrado en la barra superior.
- Buscador compacto integrado en la barra en escritorio y dentro del menú OES en móvil.
- Modo visual automático según la hora local del visitante.
- Modos manuales: automático, día, tarde y noche.
- Transición animada entre todas las paletas, también al cambiar manualmente de modo.
- Mosaico de artículos a pantalla ancha en escritorio y a una columna en móvil.
- Fichas de artículos con título superpuesto sobre la imagen.
- Fichas con fecha y duración de lectura, sin mostrar el tipo técnico de archivo.
- Etiquetas de ficha en carril horizontal desplazable.
- Búsqueda por título, resumen, categoría, formato, etiquetas y texto interno de los artículos generados.
- Página interna `sobre.html` con presentación del autor, retrato, línea editorial, temáticas, etiquetas y sistema de publicación.
- `tematicas.html` redirige a `sobre.html#tematicasBase` para no romper enlaces antiguos.
- Lector de artículos con índice lateral automático y capítulos contraíbles.
- Soporte para artículos procedentes de Word, PDF, Markdown, HTML y carpetas interactivas.
- Generación automática mediante GitHub Actions.
- Preparado para GitHub Pages.

---

## Estructura del proyecto

```txt
oblitus-est-scientia/
├── .github/workflows/pages.yml
├── articulos/
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   ├── editorial.css
│   │   └── mobile.css
│   ├── data/articles.generated.json
│   ├── generated/
│   ├── js/
│   │   ├── app.js
│   │   ├── article.js
│   │   ├── mobile-menu.js
│   │   ├── site.js
│   │   └── theme.js
│   └── media/
│       └── images/
│           ├── alejandro-pico-profile.svg
│           └── default-cover.svg
├── docs/
├── tools/build-articles.mjs
├── 404.html
├── articulo.html
├── index.html
├── sobre.html
├── tematicas.html
├── manifest.webmanifest
├── package.json
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## Arquitectura pública

```txt
index.html       Portada + biblioteca de artículos
sobre.html       Presentación, línea editorial, temáticas y publicación
tematicas.html   Redirección interna a sobre.html#tematicasBase
articulo.html    Lector interno de artículos generados
```

La portada no debe acumular bloques explicativos. Su función principal es presentar el proyecto y llevar al lector a los artículos publicados sin fricción.

---

## Adaptación móvil

La adaptación móvil se concentra en:

```txt
assets/css/mobile.css
assets/js/mobile-menu.js
```

En pantallas pequeñas:

- la cabecera se reduce al botón OES;
- el botón OES abre y cierra el menú vertical;
- el menú incluye búsqueda, artículos, sobre la web y modo visual;
- el título principal de la portada se acopla a la barra cuando deja de verse en pantalla;
- el lector de artículos muestra el título centrado en la barra superior;
- las tarjetas pasan a una sola columna;
- el artículo se ajusta al ancho disponible sin obligar a hacer pinza;
- tablas, código, imágenes, vídeos, iframes y canvas quedan limitados al ancho móvil.

---

## Sistema de tema temporal

El tema visual se controla desde:

```txt
assets/js/theme.js
```

Por defecto funciona en modo automático. El sistema calcula la hora local del visitante y genera una paleta interpolada para una línea temporal de 24 horas. La base de cálculo trabaja sobre fracciones de 15 minutos y la página vuelve a recalcular el tema mientras permanece abierta.

El botón de la barra superior alterna entre:

```txt
◐ Auto → ☀ Día → ◒ Tarde → ☾ Noche
```

La transición de tarde a noche incluye anclajes específicos para mantener un contraste legible durante las horas críticas de atardecer.

---

## Buscador

El buscador principal vive en la barra superior en escritorio y dentro del menú OES en móvil. Busca en:

- título;
- subtítulo;
- resumen;
- categoría;
- formato;
- etiquetas;
- nombre del archivo fuente;
- texto interno de los artículos HTML generados.

El contenido interno se indexa en segundo plano cargando los `contentUrl` presentes en `assets/data/articles.generated.json`. La búsqueda normaliza mayúsculas, acentos y espacios para que las coincidencias sean más tolerantes.

---

## Cómo publicar un artículo

### Opción recomendada: Word / DOCX

1. Escribe el artículo en Word o LibreOffice.
2. Usa estilos reales: `Título 1`, `Título 2`, listas, tablas, etc.
3. Guarda el archivo como `.docx`.
4. Copia el archivo dentro de `articulos/`.
5. Haz commit y push.
6. GitHub Actions generará la web publicada.

Ejemplo:

```txt
articulos/2026-06-10-la-frontera-del-conocimiento.docx
```

### Opción técnica: Markdown

Crea un archivo `.md` dentro de `articulos/` con metadatos opcionales:

```md
---
title: Título del artículo
subtitle: Subtítulo breve
category: Física
tags: [Física, Cosmología, Divulgación]
excerpt: Resumen que aparecerá en la portada.
cover: assets/media/images/default-cover.svg
audio: false
interactive: false
---

## Introducción

Texto del artículo...
```

### Opción interactiva: HTML

Para artículos con JavaScript, crea una carpeta:

```txt
articulos/mi-articulo-interactivo/index.html
```

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

No abras `index.html` directamente con doble clic, porque algunos navegadores bloquean la lectura de archivos JSON locales. Usa siempre un servidor local.

---

## Personalización visual

Los estilos principales están en:

```txt
assets/css/styles.css
assets/css/editorial.css
assets/css/mobile.css
```

Variables importantes:

```css
--max-width: 1680px;
--reader-width: 920px;
--page-width: 1180px;
--radius-lg: 4px;
--radius-md: 2px;
--radius-sm: 0px;
--font-title: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, 'Times New Roman', serif;
--theme-transition: background 1400ms ease, background-color 1400ms ease, color 1400ms ease, border-color 1400ms ease, box-shadow 1400ms ease;
```

---

## Limitaciones actuales

- No hay panel de administración web.
- La portada no puede leer carpetas por sí sola; necesita el índice generado.
- La conversión PDF a artículo es básica.
- Los `.docx` muy maquetados pueden necesitar ajustes.
- Las microinterfaces complejas conviene desarrollarlas como HTML específico.
- El modo automático depende de la hora local del navegador del visitante.
- La búsqueda de texto interno se basa en los HTML generados disponibles desde `contentUrl`.
- El retrato se ha preparado con recorte/fondo aproximado; puede sustituirse por otra versión más limpia cuando esté disponible.

---

## Historial de versiones

### v0.12.0

- Sustituido el retrato incrustado en WebP por una versión JPEG dentro del SVG para mejorar compatibilidad.
- Corregida la maquetación de la sección “Alejandro Picó” para evitar saltos extraños de texto.
- Rehecha la posición del retrato como bloque flotante estable en escritorio y bloque superior en móvil.
- Reforzado el contraste del modo automático entre las 17:45 y las 19:00.
- Añadidos anclajes temporales intermedios para evitar estados de transición con bajo contraste.

### v0.11.0

- Añadido `assets/media/images/alejandro-pico-profile.svg` con retrato preparado para “Sobre la web”.
- Añadido `assets/css/editorial.css` para estilos editoriales complementarios.
- Integrado el retrato en la sección de autor mediante CSS.
- Rediseñadas las fichas de artículos para que el título se superponga sobre la imagen.
- Eliminada la visualización del formato técnico del archivo en la ficha.
- Centrada la fecha y el tiempo de lectura bajo la imagen.
- Convertidas las etiquetas de ficha en un carril horizontal desplazable.
- Limpiado `default-cover.svg` para que no muestre el título genérico de la web.

### v0.10.0

- Añadido título móvil acoplable en portada mediante cálculo de scroll y posición del `h1`.
- El título “Oblitus est scientia” aparece en la barra móvil cuando el título principal deja de verse.
- El título móvil desaparece al volver al inicio de la portada.
- Añadida animación de entrada con opacidad, desplazamiento vertical y escala.
- Centrado horizontalmente el título del artículo dentro de la barra móvil del lector.

### v0.9.0

- Añadido `assets/css/mobile.css` para aislar la adaptación móvil.
- Añadido `assets/js/mobile-menu.js` como controlador común del menú móvil.
- Añadido botón OES móvil en portada, sobre la web y lector de artículos.
- En móvil, la navegación superior se reduce al botón OES.
- El menú OES se despliega como menú vertical.
- Ajustada la anchura de tarjetas y artículos para móviles Android en vertical.

### v0.8.0

- Movido el buscador al inicio de la navegación, antes de “Artículos”.
- Eliminado el enlace público independiente a “Temáticas”.
- Unificada la página de temáticas dentro de `sobre.html`.
- Añadida presentación personal de Alejandro Picó en “Sobre la web”.
- Convertido `tematicas.html` en redirección a `sobre.html#tematicasBase`.
- Reducidos los radios globales a una estética más recta y angulada.

### v0.7.0

- Compactado el buscador superior eliminando rótulos visibles de campo y orden.
- Corregida la dirección de apertura: el buscador se expande hacia la izquierda y la lupa permanece a la derecha.
- Añadido un recuadro de énfasis único para agrupar input, ordenación y lupa.
- Añadido título del artículo activo en el centro de la barra superior del lector.

### v0.6.0

- Corregidas las transiciones manuales entre Auto, Día, Tarde y Noche para que ya no sean bruscas.
- Añadida interpolación animada con `requestAnimationFrame` entre la paleta actual y la nueva.
- Ajustada la línea temporal automática a una base de 15 minutos.
- Añadida indexación del contenido interno de los artículos generados mediante `contentUrl`.

### v0.5.0

- Añadido `assets/js/theme.js` como sistema común de tema visual.
- Añadido modo automático basado en la hora local del visitante.
- Reducidos los radios visuales globales para una estética más cuadrada.
- Aplicado el sistema temporal a portada, páginas internas y lector de artículos.

### v0.4.0

- Reducida la cabecera hero de la portada.
- Eliminado el rótulo “Archivo editorial independiente” de la portada.
- Sustituido el subtítulo público por “Ciencia, tecnología y pensamiento crítico”.
- Movido el buscador a la barra superior mediante icono de lupa.
- Fijada la barra superior para que permanezca visible durante el scroll.

### v0.3.0

- Reorganizada la portada para que el contenido principal sea la biblioteca de artículos.
- Movida la explicación editorial a `sobre.html`.
- Movido el mapa de temáticas a `tematicas.html`.
- Añadido `assets/js/site.js` para compartir el modo claro/oscuro en páginas estáticas.

### v0.2.0

- Eliminado el enlace visible al editor estático.
- Añadida arquitectura basada en carpeta `articulos/`.
- Añadido generador de artículos desde documentos.
- Añadido soporte para `.docx`, `.pdf`, `.md` y `.html`.
- Añadido lector universal `articulo.html`.
- Añadido índice lateral de capítulos.
- Añadida función de contraer y expandir capítulos.
- Añadido workflow de GitHub Actions para publicar en GitHub Pages.

### v0.1.0

- Primera maqueta estática.
- Portada editorial.
- Mosaico de artículos.
- Buscador.
- Filtros por etiquetas.
- Modo claro/oscuro.
- Dos artículos HTML de ejemplo.
