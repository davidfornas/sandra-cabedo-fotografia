# Sandra Cabedo Fotografía

Sitio web estático de demostración para **Sandra Cabedo Fotografía**, fotógrafa de familia,
newborn e infantil en Castellón (España). Construido con [Astro](https://astro.build/) como
sitio 100% estático, pensado para publicarse en GitHub Pages.

Esta primera versión usa **textos y fotografías provisionales** (placeholders): sirve para
validar la dirección visual y la base técnica antes de incorporar el contenido definitivo.
No incluye formulario de contacto ni backend; la conversión se canaliza a través de
**WhatsApp**.

## Requisitos

- **Node.js 20 LTS** (`>=20 <21`, según el campo `engines` de `package.json`).
- **npm** (incluido con Node).

## Ejecutar en local

```bash
npm install
npm run dev
```

`npm run dev` levanta el servidor de desarrollo de Astro. La consola muestra la URL local;
recuerda que el sitio se sirve bajo el subpath `/sandra-cabedo-fotografia/`.

## Compilar y previsualizar

```bash
npm run build
npm run preview
```

- `npm run build` genera el sitio estático en la carpeta `dist/`.
- `npm run preview` sirve el contenido de `dist/` en local, tal como quedará en producción,
  para verificar la build antes de publicar.

Otros scripts disponibles:

- `npm test` — ejecuta la suite de tests con Vitest.
- `npm run check:links` — comprueba los enlaces internos de `dist/` (rutas rotas o que
  omiten el prefijo `base`).

## Despliegue en GitHub Pages

### 1. Configurar el origen de Pages

En el repositorio de GitHub: **Settings → Pages → Build and deployment → Source** y
selecciona **GitHub Actions**. Esto permite que el flujo de trabajo publique la build en
lugar de servir una rama.

### 2. Despliegue automático

El flujo de trabajo `.github/workflows/deploy.yml` se encarga de compilar y publicar:

- **Push a `main`**: cada cambio que llega a la rama `main` dispara el flujo, que instala
  Node 20, ejecuta `npm ci`, compila con `npm run build` y publica el contenido de `dist/`
  en GitHub Pages.
- **Ejecución manual**: el flujo admite `workflow_dispatch`, así que también puedes lanzarlo
  a mano desde la pestaña **Actions** del repositorio, sin necesidad de un nuevo commit.

Con el origen configurado en «GitHub Actions», no hay pasos manuales adicionales: la demo se
mantiene siempre actualizada.

## Subpath y dominio propio

El sitio se sirve bajo el subpath `/sandra-cabedo-fotografia/`. Toda la identidad de
despliegue vive **únicamente** en `astro.config.mjs`, en dos valores:

```js
const SITE = 'https://sandra-cabedo.github.io';
const BASE = '/sandra-cabedo-fotografia/';
```

Los componentes y las páginas nunca escriben estas rutas a mano: derivan sus URLs, enlaces y
assets a partir de `base` mediante las utilidades del proyecto.

### Migrar a un dominio propio

Para mover el sitio a un dominio raíz (por ejemplo `sandracabedofotografia.es`):

1. En `astro.config.mjs`, cambia **solo** los dos valores `SITE` y `BASE`, dejando el
   `base` en la raíz:

   ```js
   const SITE = 'https://sandracabedofotografia.es';
   const BASE = '/';
   ```

   No hay que editar componentes, enlaces ni imágenes: todas las rutas internas siguen
   funcionando.

2. Añade un archivo `public/CNAME` con el dominio en una sola línea:

   ```
   sandracabedofotografia.es
   ```

3. Configura el DNS del dominio según la
   [documentación de dominios personalizados de GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site):
   registros `A` (o `ALIAS`) apuntando a las IPs de GitHub Pages para el dominio raíz, y un
   registro `CNAME` para el subdominio `www` si lo usas.

4. Actualiza la URL del sitemap en `public/robots.txt` para que apunte al nuevo dominio.

## Estructura del proyecto

El código de producción vive bajo `src/`, con las carpetas `config`, `lib`, `content`,
`images`, `layouts`, `components`, `scripts`, `styles` y `pages`. Las imágenes provisionales
están en `assets/images/mocks/` y se importan como assets ESM para su optimización.
