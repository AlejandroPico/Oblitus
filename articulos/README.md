# Carpeta de artículos

Coloca aquí los documentos fuente que quieras publicar en la web.

Formatos admitidos por el generador:

- `.docx` para documentos de Word o LibreOffice Writer.
- `.pdf` para extracción básica de texto.
- `.md` para Markdown.
- `.html` para artículos con estructura propia.
- carpetas con `index.html` para artículos interactivos.

Reglas prácticas:

1. Usa nombres de archivo claros: `2026-06-07-mi-articulo.docx`.
2. El título del post se obtiene del primer encabezado del documento o del nombre del archivo.
3. La fecha se obtiene del último commit de Git que modificó el archivo.
4. Para etiquetas y categoría, añade metadatos al principio si usas Markdown o HTML.
5. Para máxima calidad visual, usa `.docx` con estilos de Word: Título 1, Título 2, listas y tablas.

Ejemplo de metadatos en Markdown:

```md
---
title: Mi investigación
subtitle: Subtítulo del artículo
category: Física
tags: [Física, Cosmología, Divulgación]
excerpt: Breve resumen que aparecerá en la portada.
cover: assets/media/images/default-cover.svg
---
```
