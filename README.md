# Soul Crystal Works

Landing comercial y portafolio premium de Soul Crystal Works.

## Qué incluye

- Hero y propuesta de valor orientados a conversion
- Proyectos destacados con CTA por caso
- Modal comercial por referencia (`ref`, `source`, `campaign`)
- Banner de referencia para trafico entrante desde proyectos
- Analitica first-party simple en `localStorage`
- Panel privado en `/admin/` con login por Supabase
- Configuracion de respaldo en `data/site-content.json`
- Configuracion base para despliegue en Netlify

## Panel administrador privado

Abre `/admin/` para editar el contenido principal del sitio.

Permite cambiar:

- Informacion base del negocio
- Hero principal del inicio
- Niveles o categorias y comparativa
- Proyectos del portafolio, incluyendo ocultarlos
- Seccion de contacto
- Footer compartido

Detalles importantes:

- El editor usa Supabase Auth para iniciar sesion y guardar el contenido publicado
- El sitio publico intenta leer primero desde Supabase y, si no esta configurado o no existe la fila, usa `data/site-content.json`
- El panel sigue usando `localStorage` con la clave `scw-site-content-v1` como respaldo local para borradores e importaciones
- `admin.html` ahora solo redirige a `/admin/`

## Configuracion de Supabase

Archivos principales:

- `site-config.js`
- `supabase/setup.sql`
- `admin/index.html`
- `admin.js`
- `content-manager.js`
- `data/site-content.json`

Pasos:

1. Crea un proyecto en Supabase
2. En `Project Settings > API`, copia tu `Project URL` y tu `anon public key`
3. Edita `site-config.js` y pega ambos valores
4. En `SQL Editor`, ejecuta `supabase/setup.sql`
5. El SQL ya viene configurado para `amecruz334@gmail.com`; si luego cambias de correo admin, actualiza esa politica antes de ejecutarlo
6. En `Authentication`, crea tu usuaria admin con correo y contrasena, o usa magic link
7. Entra a `/admin/`, inicia sesion y guarda una vez para crear o actualizar la fila `primary`

Notas:

- La seguridad real queda en Supabase Auth + RLS, no en ocultar la ruta
- Cualquiera puede abrir `/admin/`, pero sin una sesion valida no puede editar ni escribir en la tabla
- El sitio publicado ya no depende de Decap CMS, Netlify Identity ni Git Gateway
- Si todavia no configuraste Supabase, la web sigue funcionando con `data/site-content.json`

## Parametros de referencia soportados

Ejemplo:

`/?ref=beautyfast&source=footer&campaign=project-lead#contacto`

Valores activos:

- `beautyfast`
- `flexiway`
- `default`

## Analitica simple

La landing guarda eventos en `localStorage` para una capa ligera de medicion.

Claves usadas:

- `scw-analytics-events`
- `scw-analytics-summary`

Eventos principales:

- `page_view`
- `referral_visit`
- `referral_banner_show`
- `referral_banner_closed`
- `lead_modal_open`
- `whatsapp_click`
- `cta_click`
- `project_view`
- `project_interest`
- `nav_toggle`

Puedes inspeccionarlos en consola:

```js
window.scwAnalytics.getEvents()
window.scwAnalytics.getSummary()
```

## Deploy en Netlify

1. Sube este repo a GitHub
2. Conecta el repo en Netlify
3. La publicacion es la raiz del proyecto (`.`)
4. `netlify.toml` ya incluye headers y cache basicos
5. No necesitas activar Netlify Identity ni Git Gateway para el admin

## Capturas automaticas de proyectos

La landing puede regenerar las previews de proyectos con Playwright.

### Instalacion inicial

```bash
npm install
npm run screenshots:install
```

### Generar capturas

```bash
npm run screenshots
```

Esto crea o actualiza:

- `project-previews/aris.png`
- `project-previews/flexi.png`

El script actual captura estas URLs:

- `https://soulcrystal.netlify.app/`
- `GoodFinance/index.html` servido localmente por el script en `http://127.0.0.1:4173`

Si quieres cambiar proyectos, edita el arreglo `previews` en `scripts/generate-project-previews.mjs`.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`
- `site-config.js`
- `supabase/setup.sql`
- `netlify.toml`
