# Decisiones editoriales y funcionales

Este documento recoge las decisiones actuales del proyecto Oblitus est scientia para no perder el criterio funcional durante las próximas iteraciones.

---

## Enfoque general

La web seguirá alojada inicialmente en GitHub Pages, con generación estática y publicación mediante GitHub Actions. A medio o largo plazo se contempla migrar a un servidor propio si el proyecto necesita panel privado, conectores avanzados, usuarios, automatización editorial o backend persistente.

La prioridad de la web es publicar artículos largos, técnicos, divulgativos e interactivos. El formato principal tenderá a ser HTML con JavaScript integrado, no Word ni PDF. Los documentos Word/PDF se mantienen como formatos de entrada o de prueba, pero la experiencia editorial ideal será HTML estructurado con metadatos.

---

## Formato prioritario de artículos

Se acepta como formato principal:

```txt
articulos/mi-articulo/index.html
```

Cada artículo HTML podrá incluir:

- metadatos editoriales ocultos;
- título;
- subtítulo;
- resumen de ficha;
- portada de ficha;
- fecha editorial;
- serie editorial;
- etiquetas;
- capítulos;
- imágenes;
- audio;
- vídeo;
- mapas;
- animaciones;
- microinterfaces JavaScript;
- simuladores;
- comparativas interactivas;
- notas al margen;
- citas;
- bibliografía;
- glosario contextual.

---

## Funcionalidades aceptadas

### Lectura

- Índice automático de lectura dentro del artículo.
- Progreso de lectura.
- Resaltado del capítulo activo.
- Modo de lectura larga.
- Ancho ajustable del cuerpo del artículo.
- Tamaño de letra configurable.
- Interlineado configurable.
- Posible selector tipográfico futuro.

### Organización editorial

- Sistema de series editoriales.
- Jerarquías de artículos como si fueran capítulos de una saga o colección.
- Fichas de autor preparadas, aunque inicialmente solo escribirá Alejandro Picó.
- Metadatos editoriales ocultos.
- Portada automática desde metadatos o desde la primera imagen relevante.
- Tiempo de lectura calculado sobre palabras reales del contenido.

### Contenido enriquecido

- Citas y notas al margen.
- Bibliografía y fuentes.
- Glosario automático o semiautomático para términos técnicos.
- Artículos HTML interactivos como formato de referencia.
- Comparativas interactivas dentro de artículos.
- Mapas, animaciones y pequeñas aplicaciones JavaScript embebidas.

### Búsqueda y distribución

- Buscador avanzado por contenido interno, etiquetas, serie, fecha y metadatos.
- RSS automático.
- Sitemap automático.
- Compartir artículos mediante X/Twitter, WhatsApp y enlace directo.
- Archivo cronológico / hemeroteca, aunque la portada ya permita ordenar por fecha.

### Descarga y lectura externa

- Exportación del artículo limpio a PDF.
- Exportación futura a DOCX.
- Exportación futura a EPUB para lectores de tinta electrónica.
- Modo offline/PWA para instalación como aplicación web.

---

## Funcionalidades descartadas o pospuestas

### Pospuestas

- Panel privado de administración.
- Usuarios registrados.
- Estadísticas internas o contadores avanzados.
- Conectores Drive/OneDrive con OAuth persistente.

### No prioritarias ahora

- Contadores visibles por temática.
- Vista de laboratorio separada para piezas interactivas.
- Sistema de dificultad, porque la mayoría de artículos técnicos ya asumirán profundidad alta.
- Publicidad.

---

## Arquitectura futura para Google Drive / OneDrive

No se recomienda conectar la web pública directamente a carpetas privadas de Google Drive u OneDrive desde JavaScript del navegador, porque obligaría a exponer o gestionar credenciales en cliente.

La arquitectura recomendada tiene dos fases.

### Fase 1: GitHub Actions como conector

Una GitHub Action se ejecutaría manualmente o de forma programada. Esa Action:

1. se autentica contra Google Drive u OneDrive usando secretos guardados en GitHub;
2. lee una o varias carpetas configuradas;
3. descarga o inspecciona los artículos;
4. convierte documentos si hace falta;
5. genera `assets/data/articles.generated.json`;
6. genera HTML estático;
7. publica la web en GitHub Pages.

Ventaja: la web sigue siendo estática y segura.

### Fase 2: servidor propio

Cuando exista servidor propio, el conector pasaría al backend. Entonces sería posible:

- panel privado;
- subida directa de documentos;
- gestión visual de metadatos;
- previsualización de fichas;
- OAuth persistente;
- caché;
- control de publicación;
- usuarios;
- futuras estadísticas privadas.

---

## Criterio actual sobre la foto de autor

La imagen de autor debe poder sustituirse fácilmente. De momento se usará una fotografía directa, sin recorte complejo ni eliminación de fondo. Más adelante se sustituirá por una versión proporcionada manualmente por Alejandro Picó.
