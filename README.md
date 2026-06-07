# Oblitus est scientia

**Ciencia, tecnología y pensamiento crítico**

Oblitus est scientia es una web editorial estática preparada para GitHub Pages. Su objetivo es funcionar como una alternativa ligera a WordPress para publicar artículos largos, documentos convertidos en publicaciones web, recursos multimedia y pequeñas microinterfaces JavaScript.

La idea principal es sencilla: el contenido se guarda en la carpeta `articulos/`, y una GitHub Action genera automáticamente el índice de publicaciones que aparece en la portada.

---

## Estado del proyecto

Versión actual: **v0.9.0**

Esta versión incorpora una adaptación móvil específica. En pantallas pequeñas la barra superior se reduce al botón OES, que funciona como menú desplegable vertical. En el lector móvil se conserva el botón OES y el título del artículo aparece a su derecha. También se corrige la anchura de artículos, tarjetas, tablas, imágenes y contenido generado para mejorar la lectura en móviles Android en orientación vertical.

---

## Funcionalidades principales

- Portada editorial compacta con acceso inmediato a los artículos.
- Barra superior fija en escritorio y móvil.
- Menú móvil basado en botón OES.
- En artículos móviles, título del documento visible junto al botón OES.
- Buscador compacto integrado en la barra: input, ordenación y lupa en un solo bloque.
- Modo visual automático según la hora local del visitante.
- Modos manuales: automático, día, tarde y noche.
- Transición animada entre todas las paletas, también al cambiar manualmente de modo.
- Paleta automática calculada sobre una línea temporal de 24 horas con base de 15 minutos.
- Mosaico de artículos a pantalla ancha en escritorio y a una columna en móvil.
- Búsqueda por título, resumen, categoría, formato, etiquetas y texto interno de los artículos generados.
- Filtros por etiquetas.
- Ordenación por fecha ascendente, descendente y título.
- Lector de artículos con título activo en la barra superior.
- Página interna `sobre.html` con presentación del autor, línea editorial, temáticas, etiquetas y sistema de publicación.
- `tematicas.html` redirige a `sobre.html#tematicasBase` para no romper enlaces antiguos.
- Índice lateral automático dentro de cada artículo.
- Capítulos contraíbles y expandibles.
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
- el lector de artículos muestra el título del artículo junto al botón OES;
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

El modo seleccionado se guarda en `localStorage`, por lo que el navegador recuerda la preferencia del visitante.

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

Crea un archivo `.md` dentro de `articulos/`:

```txt
articulos/2026-06-10-mi-articulo.md
```

Con metadatos opcionales:

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

El archivo puede empezar con metadatos:

```html
---
title: Simulación interactiva
tags: [JavaScript, Simulación, Ciencia]
interactive: true
---

<h2>Introducción</h2>
<p>Contenido del artículo...</p>
<script>
  console.log('Microinterfaz cargada');
</script>
```

---

## Publicación en GitHub Pages

Este proyecto ya incluye un workflow en:

```txt
.github/workflows/pages.yml
```

Pasos:

1. Sube el proyecto a un repositorio de GitHub.
2. Entra en `Settings`.
3. Entra en `Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Haz un commit en `main` o `master`.
6. GitHub ejecutará el workflow y publicará la web.

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

## Sobre los PDF

El proyecto puede extraer texto de PDF, pero el PDF no es el formato ideal para convertirlo en un post web. Un PDF está pensado como formato final de página fija, por lo que puede perder columnas, saltos, estilos o disposición visual al transformarse en HTML.

Recomendación:

- Para publicar como artículo web: usa `.docx`, `.md` o `.html`.
- Para conservar una versión final imprimible: guarda el PDF como archivo descargable adicional.

---

## Personalización visual

Los estilos principales están en:

```txt
assets/css/styles.css
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

---

## Próximas mejoras recomendadas

- Añadir paginación si la biblioteca supera varias decenas de artículos.
- Añadir RSS automático.
- Generar `sitemap.xml` automáticamente.
- Añadir páginas de categoría.
- Añadir sistema de series editoriales.
- Añadir plantilla para bibliografía y fuentes.
- Añadir vista de lectura con ancho ajustable.
- Añadir soporte para portada automática desde la primera imagen del documento.
- Crear un índice de búsqueda estático precompilado si el número de artículos crece mucho.

---

## Licencia

Este proyecto incluye una licencia MIT por defecto. Puedes cambiarla si prefieres otra licencia abierta, como Apache 2.0.

---

## Historial de versiones

### v0.9.0

- Añadido `assets/css/mobile.css` para aislar la adaptación móvil.
- Añadido `assets/js/mobile-menu.js` como controlador común del menú móvil.
- Añadido botón OES móvil en portada, sobre la web y lector de artículos.
- En móvil, la navegación superior se reduce al botón OES.
- El menú OES se despliega como menú vertical.
- En el lector móvil, el título del artículo aparece junto al botón OES.
- Ajustada la anchura de tarjetas y artículos para móviles Android en vertical.
- Añadidas reglas de seguridad para evitar desbordes horizontales en imágenes, tablas, código, iframes, vídeos y canvas.

### v0.8.0

- Movido el buscador al inicio de la navegación, antes de “Artículos”.
- Eliminado el enlace público independiente a “Temáticas”.
- Unificada la página de temáticas dentro de `sobre.html`.
- Añadida presentación personal de Alejandro Picó en “Sobre la web”.
- Convertido `tematicas.html` en redirección a `sobre.html#tematicasBase`.
- Actualizado `sitemap.xml` para publicar solo portada y `sobre.html`.
- Reducidos los radios globales a una estética más recta y angulada.

### v0.7.0

- Compactado el buscador superior eliminando rótulos visibles de campo y orden.
- Corregida la dirección de apertura: el buscador se expande hacia la izquierda y la lupa permanece a la derecha.
- Añadido un recuadro de énfasis único para agrupar input, ordenación y lupa.
- Ajustada la altura del buscador para que no duplique la altura de la barra superior.
- Añadido título del artículo activo en el centro de la barra superior del lector.
- Añadida reducción de tamaño automática para títulos largos en la barra del lector.

### v0.6.0

- Corregidas las transiciones manuales entre Auto, Día, Tarde y Noche para que ya no sean bruscas.
- Añadida interpolación animada con `requestAnimationFrame` entre la paleta actual y la nueva.
- Ajustada la línea temporal automática a una base de 15 minutos.
- Mantenida la actualización activa mientras la página permanece abierta.
- Convertido el buscador en un panel expansible integrado dentro de la barra superior.
- Movida la lupa al inicio del grupo de navegación.
- Añadida indexación del contenido interno de los artículos generados mediante `contentUrl`.
- Mejorada la normalización de búsqueda para mayúsculas, acentos y espacios.
- Mantenida la ordenación por fecha y título dentro del buscador expandido.

### v0.5.0

- Añadido `assets/js/theme.js` como sistema común de tema visual.
- Añadido modo automático basado en la hora local del visitante.
- Añadida interpolación cromática por franjas de media hora.
- Añadida actualización activa del tema mientras la página permanece abierta.
- Añadidos modos manuales: automático, día, tarde y noche.
- Sustituido el antiguo botón “Modo” por un selector cíclico con iconos textuales.
- Reducidos los radios visuales globales para una estética más cuadrada.
- Eliminadas formas excesivamente redondeadas en barra superior, botones, etiquetas y tarjetas.
- Añadidas transiciones suaves para fondos, textos, bordes y sombras.
- Aplicado el sistema temporal a portada, páginas internas y lector de artículos.

### v0.4.0

- Reducida la cabecera hero de la portada.
- Eliminado el rótulo “Archivo editorial independiente” de la portada.
- Sustituido el subtítulo público por “Ciencia, tecnología y pensamiento crítico”.
- Centrado el título principal y el subtítulo.
- Cambiada la fuente del título y subtítulo a una familia serif de tono más académico.
- Movido el buscador a la barra superior mediante icono de lupa.
- Añadido panel desplegable de búsqueda y ordenación.
- Eliminado el gran panel contenedor de la biblioteca.
- Ocultados visualmente el título “Artículos publicados” y el contador de artículos.
- Mantenidas las tarjetas individuales de artículos.
- Fijada la barra superior para que permanezca visible durante el scroll.

### v0.3.0

- Reorganizada la portada para que el contenido principal sea la biblioteca de artículos.
- Eliminados los botones redundantes de la cabecera hero.
- Eliminadas de la portada las tarjetas de línea editorial, publicación y formatos.
- Movida la explicación editorial a `sobre.html`.
- Movido el mapa de temáticas a `tematicas.html`.
- Unificada la navegación pública entre portada, lector y páginas internas.
- Añadido `assets/js/site.js` para compartir el modo claro/oscuro en páginas estáticas.
- Aumentado el ancho máximo general de la web a `1680px`.
- Ajustada la cabecera para reducir scroll inicial y acercar la biblioteca al primer pantallazo.

### v0.2.0

- Eliminado el enlace visible al editor estático.
- Eliminado el enlace visible al README desde la navegación pública.
- Añadida arquitectura basada en carpeta `articulos/`.
- Añadido generador de artículos desde documentos.
- Añadido soporte para `.docx`, `.pdf`, `.md` y `.html`.
- Añadido lector universal `articulo.html`.
- Añadido índice lateral de capítulos.
- Añadida función de contraer y expandir capítulos.
- Ampliado el ancho general de la web.
- Ajustado el título principal para evitar saltos de línea en pantallas grandes.
- Añadida sección `Sobre la web`.
- Añadida sección de línea editorial.
- Añadido workflow de GitHub Actions para publicar en GitHub Pages.
- Añadida documentación técnica y editorial.

### v0.1.0

- Primera maqueta estática.
- Portada editorial.
- Mosaico de artículos.
- Buscador.
- Filtros por etiquetas.
- Modo claro/oscuro.
- Dos artículos HTML de ejemplo.
