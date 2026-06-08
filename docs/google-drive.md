# Integración con Google Drive

Oblitus puede sincronizar artículos HTML desde carpetas de Google Drive antes de publicar la web en GitHub Pages.

La sincronización no ocurre desde el navegador del visitante. Se ejecuta en GitHub Actions, descarga los archivos HTML al entorno temporal de construcción y después `tools/build-articles.mjs` los convierte en artículos normales de la biblioteca.

---

## Carpeta configurada actualmente

```txt
Nombre: Oblitus · Google Drive
Folder ID: 1eIjb899Icw7pBA5Na09a_klwL9xvNxBL
Destino temporal: articulos/_drive/google-drive-oblitus
```

La configuración está en:

```txt
config/drive-sources.json
```

---

## Funcionamiento actual

1. Alejandro sube uno o más HTML a la carpeta de Google Drive.
2. Cuando quiere publicar, entra en GitHub.
3. Va a `Actions`.
4. Abre el workflow `Publicar web en GitHub Pages`.
5. Pulsa `Run workflow`.
6. GitHub Actions ejecuta `npm run sync:drive`.
7. `tools/sync-drive.mjs` lee `config/drive-sources.json`.
8. Se conecta a Google Drive con permisos de solo lectura.
9. Lista los archivos de la carpeta configurada.
10. Descarga archivos `.html` o `.htm`.
11. Los deja temporalmente en `articulos/_drive/...`.
12. Ejecuta `npm run build:content`.
13. La web se publica ya con esos HTML como artículos.

En esta fase de pruebas no hay sincronización programada. La actualización se hace manualmente desde GitHub Actions.

---

## Seguridad recomendada

La opción recomendada es usar una cuenta de servicio de Google Cloud.

Pasos generales:

1. Crear un proyecto en Google Cloud.
2. Activar Google Drive API.
3. Crear una cuenta de servicio.
4. Generar una clave JSON para esa cuenta de servicio.
5. Compartir la carpeta de Google Drive con el email de la cuenta de servicio.
6. Guardar el JSON completo como secreto de GitHub:

```txt
GOOGLE_DRIVE_SERVICE_ACCOUNT
```

El script también admite una clave pública de API mediante:

```txt
GOOGLE_DRIVE_API_KEY
```

pero esa opción solo sirve si la carpeta y sus archivos son públicamente accesibles. Para carpetas privadas se debe usar cuenta de servicio.

---

## Añadir más carpetas

Añade nuevas entradas en `config/drive-sources.json`:

```json
{
  "id": "otra-cuenta-oblitus",
  "name": "Oblitus · Segunda cuenta",
  "provider": "google-drive",
  "folderUrl": "https://drive.google.com/drive/folders/ID_DE_LA_CARPETA",
  "folderId": "ID_DE_LA_CARPETA",
  "enabled": true,
  "recursive": false,
  "targetDir": "articulos/_drive/otra-cuenta-oblitus"
}
```

Si `recursive` se cambia a `true`, el sincronizador también recorrerá subcarpetas.

---

## Limitación importante

GitHub Pages es una web estática. No puede detectar cambios en Drive exactamente cuando un visitante abre la página.

La actualización ocurre cuando GitHub Actions reconstruye la web:

- al hacer `push`;
- manualmente desde `Actions > Publicar web en GitHub Pages > Run workflow`.

La ejecución programada queda desactivada mientras la web esté en pruebas.

---

## Formato recomendado para HTML externos

Cada HTML puede llevar metadatos al inicio:

```html
---
title: Título del artículo
subtitle: Subtítulo opcional
category: Inteligencia artificial
tags: [IA, Ciencia, Ensayo]
excerpt: Texto breve para la ficha de portada.
cover: assets/media/images/default-cover.svg
date: 2026-06-08
interactive: true
---

<h2>Introducción</h2>
<p>Contenido del artículo...</p>
<script>
  console.log('Interactividad interna');
</script>
```

Si no hay metadatos, Oblitus intentará extraer el título desde el primer `h1` o `h2` del documento.
