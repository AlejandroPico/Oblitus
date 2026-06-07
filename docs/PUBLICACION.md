# Flujo de publicación

## Publicar un nuevo artículo

1. Abrir `editor.html` en local.
2. Rellenar los datos del artículo.
3. Generar la plantilla.
4. Crear la carpeta en `articulos/slug-del-articulo/`.
5. Guardar la plantilla como `index.html`.
6. Copiar el bloque JSON generado.
7. Pegar el bloque dentro de `assets/data/posts.json`.
8. Probar en local con `python -m http.server 8000`.
9. Revisar portada, búsqueda y etiquetas.
10. Hacer commit y push a GitHub.

## Commit recomendado

```bash
git add .
git commit -m "Añade nuevo artículo sobre <tema>"
git push
```

## Revisión previa

Antes de publicar:

- comprobar que el artículo abre;
- comprobar que aparece en portada;
- comprobar que las etiquetas filtran bien;
- comprobar que la imagen carga;
- comprobar que no hay rutas absolutas innecesarias;
- comprobar el peso de audios e imágenes.
