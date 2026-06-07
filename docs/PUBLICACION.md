# Guía de publicación

## Objetivo

La web funciona como un blog estático. No hay WordPress ni base de datos. La portada lee un índice generado automáticamente a partir de los documentos que se guardan en `articulos/`.

## Flujo recomendado

1. Escribe el artículo en Word, LibreOffice, Markdown o HTML.
2. Guarda el documento en `articulos/`.
3. Sube el cambio a GitHub.
4. GitHub Actions ejecuta `npm run build:content`.
5. Se genera `assets/data/articles.generated.json` y los HTML internos en `assets/generated/`.
6. GitHub Pages publica la web resultante.

## Activar GitHub Pages

1. Entra en el repositorio de GitHub.
2. Abre `Settings`.
3. Entra en `Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Haz un commit o ejecuta manualmente la acción `Publicar web en GitHub Pages`.

## Formatos admitidos

### DOCX

Es el formato recomendado para escribir artículos largos.

Buenas prácticas:

- Usa estilos de Word: `Título 1`, `Título 2`, listas y tablas.
- Evita maquetaciones demasiado visuales si quieres una conversión limpia.
- Las imágenes incrustadas pueden convertirse, pero conviene revisar el resultado.

### PDF

El PDF se puede leer, pero no es el formato ideal para transformarlo en post. Un PDF está pensado como documento final de página fija; extraerlo como HTML puede perder columnas, estilos, pies y disposición exacta.

Uso recomendado:

- Para publicar como artículo: mejor `.docx`.
- Para conservar un documento final: guarda el PDF como recurso descargable adicional.

### Markdown

Perfecto para artículos técnicos y piezas limpias.

### HTML

Recomendado para artículos con JavaScript, widgets, animaciones o microinterfaces.

## Metadatos opcionales

En Markdown o HTML puedes iniciar el archivo así:

```md
---
title: Título del artículo
subtitle: Subtítulo breve
category: Física
tags: [Física, Cosmología, Divulgación]
excerpt: Resumen que aparece en la portada.
cover: assets/media/images/default-cover.svg
interactive: true
audio: false
---
```

## Recursos multimedia

Guarda imágenes, audio y vídeo en `assets/media/`.

Para audios largos o muchos vídeos, es mejor usar alojamiento externo. GitHub Pages tiene límites de tamaño y ancho de banda, por lo que no conviene convertir el repositorio en un almacén multimedia pesado.
