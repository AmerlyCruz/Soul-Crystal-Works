# Soul Crystal Works

Landing comercial y portafolio premium de Soul Crystal Works.

## Qué incluye

- Hero y propuesta de valor orientados a conversion
- Proyectos destacados con CTA por caso
- Modal comercial por referencia (`ref`, `source`, `campaign`)
- Banner de referencia para trafico entrante desde proyectos
- Analitica first-party simple en `localStorage`
- Panel `admin.html` para editar giro, niveles, proyectos, contacto y footer
- Panel online en `/admin/` con Decap CMS para publicar contenido del sitio
- Configuracion base para despliegue en Netlify

## Panel administrador

Abre `admin.html` para editar el contenido principal del sitio.

Permite cambiar:

- Informacion base del negocio
- Hero principal del inicio
- Niveles o categorias y comparativa
- Proyectos del portafolio, incluyendo ocultarlos
- Seccion de contacto
- Footer compartido

Detalles importantes:

- Los cambios se guardan en `localStorage` usando la clave `scw-site-content-v1`
- Afectan este navegador y este dispositivo, no publican cambios globales por si solos
- El panel permite exportar e importar JSON para mover la configuracion

## Decap CMS

El sitio ahora puede leer contenido publicado desde `data/site-content.json`.

Archivos principales del CMS:

- `admin/index.html`
- `admin/config.yml`
- `data/site-content.json`

Para usar el editor online en Netlify:

1. Abre Netlify y entra al proyecto
2. Activa `Identity`
3. Activa `Git Gateway`
4. Deja `Registration` en `Invite only`
5. Invita solo tu correo como usuaria
6. En `Identity > Users`, asigna el rol `admin` a tu usuaria
7. Entra a `/admin/` en tu web publicada

Notas importantes:

- El editor online escribe en el repo y publica cambios reales para todos los visitantes
- El panel local `admin.html` sigue existiendo para borradores en este navegador
- Si ves diferencias entre el panel local y la web publicada, limpia el borrador local o usa `Restaurar` en `admin.html`
- La ruta `/admin/` ahora queda protegida por rol en Netlify; sin el rol `admin` redirige a `/login.html`

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
- `netlify.toml`
