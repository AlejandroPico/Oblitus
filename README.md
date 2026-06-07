# Oblitus est scientia

**Redivulgación de temática científica**

Oblitus est scientia es una web editorial estática preparada para GitHub Pages. Su objetivo es funcionar como una alternativa ligera a WordPress para publicar artículos largos, documentos convertidos en publicaciones web, recursos multimedia y pequeñas microinterfaces JavaScript.

La idea principal es sencilla: el contenido se guarda en la carpeta `articulos/`, y una GitHub Action genera automáticamente el índice de publicaciones que aparece en la portada.

---

## Estado del proyecto

Versión actual: **v0.2.0**

Esta versión elimina el editor visible de la primera maqueta y orienta el proyecto hacia un flujo real de publicación mediante documentos.

---

## Funcionalidades principales

- Portada editorial con diseño serio y ancho ampliado.
- Mosaico de artículos a pantalla ancha.
- Búsqueda por título, resumen, categoría, formato y etiquetas.
- Filtros por etiquetas.
- Ordenación por fecha ascendente, descendente y título.
- Modo claro/oscuro.
- Sección de línea editorial.
- Sección de temáticas base.
- Lector universal de artículos.
- Índice lateral automático dentro de cada artículo.
- Capítulos contraíbles y expandibles.
- Soporte para artículos procedentes de:
  - Word `.docx`.
  - PDF `.pdf`.
  - Markdown `.md`.
  - HTML `.html`.
  - Carpetas con `index.html` para piezas interactivas.
- Generación automática mediante GitHub Actions.
- Preparado para GitHub Pages.

---

## Estructura del proyecto

```txt
oblitus-est-scientia/
├── .github/
│   └── workflows/
│       └── pages.yml
├── articulos/
│   ├── README.md
│   ├── 2026-06-07-manifiesto-editorial.md
│   └── microinterfaz-demo/
│       └── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── data/
│   │   └── articles.generated.json
│   ├── generated/
│   │   ├── manifiesto-editorial.html
│   │   └── microinterfaz-demo.html
│   ├── js/
│   │   ├── app.js
│   │   └── article.js
│   └── media/
│       ├── audio/
│       └── images/
├── docs/
│   ├── ARQUITECTURA.md
│   ├── GUIA_EDITORIAL.md
│   └── PUBLICACION.md
├── tools/
│   └── build-articles.mjs
├── 404.html
├── articulo.html
├── index.html
├── manifest.webmanifest
├── package.json
├── robots.txt
├── sitemap.xml
└── README.md
```

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

Para probar la web en tu ordenador:

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

## Sobre los documentos Word

La conversión de Word a HTML funciona mejor si el documento usa estilos semánticos.

Buenas prácticas:

- Usa `Título 1`, `Título 2`, `Título 3`.
- Evita usar tamaños de letra manuales como si fueran encabezados.
- Usa listas reales, no guiones escritos a mano.
- Inserta tablas reales.
- Mantén las imágenes comprimidas.

---

## Sobre audios, vídeos e imágenes

Puedes guardar recursos en:

```txt
assets/media/images/
assets/media/audio/
```

Para muchos audios largos o vídeos pesados, es mejor usar alojamiento externo y enlazarlos desde el artículo. GitHub Pages no está pensado como almacén multimedia masivo.

---

## Personalización visual

Los estilos principales están en:

```txt
assets/css/styles.css
```

Variables importantes:

```css
--max-width: 1540px;
--reader-width: 920px;
--accent: #7c2d12;
--accent-2: #1f4d4f;
```

---

## Limitaciones actuales

- No hay panel de administración web.
- La portada no puede leer carpetas por sí sola; necesita el índice generado.
- La conversión PDF a artículo es básica.
- Los `.docx` muy maquetados pueden necesitar ajustes.
- Las microinterfaces complejas conviene desarrollarlas como HTML específico.

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

---

## Licencia

Este proyecto incluye una licencia MIT por defecto. Puedes cambiarla si prefieres otra licencia abierta, como Apache 2.0.

---

## Historial de versiones

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
