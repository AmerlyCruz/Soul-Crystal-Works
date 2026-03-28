# Soul Crystal Works

Landing comercial y portafolio premium de Soul Crystal Works.

## Qué incluye

- Hero y propuesta de valor orientados a conversion
- Proyectos destacados con CTA por caso
- Modal comercial por referencia (`ref`, `source`, `campaign`)
- Banner de referencia para trafico entrante desde proyectos
- Analitica first-party simple en `localStorage`
- Configuracion base para despliegue en Netlify

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

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`
- `netlify.toml`
