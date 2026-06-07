# Arquitectura técnica

## Idea central

GitHub Pages sirve archivos estáticos. No tiene backend propio ni base de datos. Por eso la web simula un CMS mediante generación estática:

- `articulos/` contiene documentos fuente.
- `tools/build-articles.mjs` escanea la carpeta.
- `assets/generated/` guarda el HTML resultante.
- `assets/data/articles.generated.json` guarda el índice que lee la portada.
- `index.html` muestra el mosaico, búsqueda, filtros y ordenación.
- `articulo.html` actúa como lector universal de publicaciones.

## Por qué no se lista la carpeta directamente

Un navegador no puede preguntar a GitHub Pages “qué archivos hay dentro de esta carpeta” como lo haría un servidor. Para que la portada conozca los artículos, alguien tiene que crear un índice. En este proyecto lo hace GitHub Actions en cada publicación.

## Ventajas

- Coste cero.
- Sin base de datos.
- Control total de HTML, CSS y JavaScript.
- Buen encaje con GitHub Pages.
- Posibilidad de migrar más adelante a un CMS real.

## Limitaciones

- Los PDF no se convierten con fidelidad perfecta.
- Los documentos Word deben usar estilos semánticos para una conversión limpia.
- El contenido multimedia pesado no debería alojarse masivamente en GitHub.
- No hay panel de administración en línea; la publicación se hace mediante Git.
