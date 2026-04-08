document.addEventListener('DOMContentLoaded', async () => {
  const manager = window.scwContentManager;
  if (!manager) return;

  const form = document.getElementById('adminForm');
  if (!form) return;

  const hub = document.getElementById('adminHub');
  const backButton = document.getElementById('adminBackButton');
  const viewEyebrow = document.getElementById('adminViewEyebrow');
  const viewTitle = document.getElementById('adminViewTitle');
  const viewDescription = document.getElementById('adminViewDescription');
  const viewButtons = document.querySelectorAll('[data-open-view]');
  const views = document.querySelectorAll('.admin-view');
  const brandStats = document.getElementById('brandStats');
  const heroStats = document.getElementById('heroStats');
  const servicesStats = document.getElementById('servicesStats');
  const compareStats = document.getElementById('compareStats');
  const projectsStats = document.getElementById('projectsStats');
  const contactStats = document.getElementById('contactStats');
  const footerStats = document.getElementById('footerStats');
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const status = document.getElementById('adminStatus');
  const exportButton = document.getElementById('exportConfig');
  const importInput = document.getElementById('importConfig');
  const resetButton = document.getElementById('resetConfig');
  const servicesEditor = document.getElementById('servicesEditor');
  const compareEditor = document.getElementById('compareEditor');
  const projectsEditor = document.getElementById('projectsEditor');
  const addServiceButton = document.getElementById('addService');
  const addCompareButton = document.getElementById('addCompareItem');
  const addProjectButton = document.getElementById('addProject');
  const submitButton = form.querySelector('button[type="submit"]');
  const authGate = document.getElementById('adminAuthGate');
  const authForm = document.getElementById('adminAuthForm');
  const authEmail = document.getElementById('adminAuthEmail');
  const authPassword = document.getElementById('adminAuthPassword');
  const authMagicLinkButton = document.getElementById('adminMagicLink');
  const authStatus = document.getElementById('adminAuthStatus');
  const sessionBar = document.getElementById('adminSessionBar');
  const sessionEmail = document.getElementById('adminSessionEmail');
  const signOutButton = document.getElementById('adminSignOut');
  const privateApp = document.getElementById('adminPrivateApp');
  const authSubmitButton = authForm ? authForm.querySelector('button[type="submit"]') : null;

  const TONES = ['green', 'gold', 'red', 'violet'];
  const THEME_STORAGE_KEY = 'scw-theme-v2';
  const VIEW_META = {
    brand: {
      eyebrow: 'Marca',
      title: 'Giro y canales',
      description: 'Edita la identidad base de Soul Crystal Works y sus accesos de contacto.'
    },
    hero: {
      eyebrow: 'Home',
      title: 'Hero principal',
      description: 'Administra el primer impacto del home sin mezclarlo con otras secciones.'
    },
    services: {
      eyebrow: 'Catalogo',
      title: 'Niveles y comparativas',
      description: 'Gestiona categorias, niveles visibles y tarjetas comparativas desde una sola vista dedicada.'
    },
    projects: {
      eyebrow: 'Portafolio',
      title: 'Proyectos visibles',
      description: 'Edita, oculta o agrega proyectos sin tener un listado largo siempre abierto.'
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Bloque comercial',
      description: 'Controla el cierre de venta y sus CTA con una jerarquia mas clara.'
    },
    footer: {
      eyebrow: 'Footer',
      title: 'Informacion compartida',
      description: 'Actualiza el contenido que se reutiliza al final del sitio.'
    }
  };

  const remoteConfig = manager.getRemoteConfig ? manager.getRemoteConfig() : {
    url: '',
    anonKey: '',
    contentTable: 'site_content',
    contentSlug: 'primary'
  };

  let draft = manager.getDefaultContent();
  let supabaseClient = null;
  let currentUser = null;
  let hasUnsavedChanges = false;
  let isSubmitting = false;

  function setDirtyState(isDirty) {
    hasUnsavedChanges = Boolean(isDirty);
  }

  function markDirty(message = 'Hay cambios sin guardar.') {
    setDirtyState(true);
    setStatus(message);
  }

  function markClean(message) {
    setDirtyState(false);
    if (message) {
      setStatus(message);
    }
  }

  function setAuthBusy(isBusy) {
    if (authSubmitButton) authSubmitButton.disabled = isBusy;
    if (authMagicLinkButton) authMagicLinkButton.disabled = isBusy;
    if (authEmail) authEmail.disabled = isBusy;
    if (authPassword) authPassword.disabled = isBusy;
  }

  function isSafeUrl(value, { allowRelative = false, allowHash = false } = {}) {
    const text = String(value || '').trim();
    if (!text) {
      return false;
    }

    if (allowHash && text.startsWith('#')) {
      return true;
    }

    try {
      const parsed = new URL(text, window.location.origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      if (allowRelative) {
        return true;
      }

      return /^https?:\/\//i.test(text);
    } catch {
      return false;
    }
  }

  function buildValidationMessage(issues) {
    if (!issues.length) {
      return '';
    }

    const preview = issues.slice(0, 3).join(' | ');
    return issues.length > 3
      ? `El borrador tiene ${issues.length} problemas: ${preview} | ...`
      : `El borrador tiene ${issues.length} problemas: ${preview}`;
  }

  function validateDraft() {
    const issues = [];
    const whatsappDigits = String(draft.brand?.whatsappNumber || '').replace(/\D/g, '');

    if (!String(draft.brand?.name || '').trim()) {
      issues.push('La marca necesita un nombre.');
    }

    if (whatsappDigits.length < 8) {
      issues.push('El numero de WhatsApp parece incompleto.');
    }

    if (!isSafeUrl(draft.brand?.instagramUrl)) {
      issues.push('La URL de Instagram no es valida.');
    }

    draft.home.services.items.forEach((item, index) => {
      if (!String(item.title || '').trim()) {
        issues.push(`El servicio ${index + 1} no tiene titulo.`);
      }

      if (!isSafeUrl(item.url, { allowRelative: true, allowHash: true })) {
        issues.push(`La URL del servicio ${index + 1} no es valida.`);
      }
    });

    draft.home.services.compareItems.forEach((item, index) => {
      if (!String(item.title || '').trim()) {
        issues.push(`La comparativa ${index + 1} no tiene titulo.`);
      }

      if (!Array.isArray(item.bullets) || !item.bullets.some((bullet) => String(bullet || '').trim())) {
        issues.push(`La comparativa ${index + 1} necesita al menos un bullet.`);
      }
    });

    draft.home.projects.items.forEach((item, index) => {
      if (!String(item.title || '').trim()) {
        issues.push(`El proyecto ${index + 1} no tiene titulo.`);
      }

      if (!isSafeUrl(item.projectUrl)) {
        issues.push(`La URL del proyecto ${index + 1} no es valida.`);
      }

      if (!String(item.previewSrc || '').trim()) {
        issues.push(`El proyecto ${index + 1} necesita una imagen preview.`);
      }
    });

    if (!isSafeUrl(draft.home.contact.secondaryHref, { allowRelative: true, allowHash: true })) {
      issues.push('El enlace secundario de contacto no es valido.');
    }

    return issues;
  }

  function applyTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);

    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', nextTheme === 'dark' ? '#0f172a' : '#f5f1ff');
    }

    if (themeToggle) {
      const isDark = nextTheme === 'dark';
      const label = themeToggle.querySelector('.theme-toggle__label');
      const icon = themeToggle.querySelector('.theme-toggle__icon');
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      if (label) label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
      if (icon) icon.textContent = isDark ? '☀' : '◐';
    }
  }

  function initializeTheme() {
    let storedTheme = null;

    try {
      storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      storedTheme = null;
    }

    applyTheme(storedTheme === 'dark' ? 'dark' : 'light');

    themeToggle?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Ignore storage errors in the admin panel.
      }
      applyTheme(nextTheme);
    });
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function setAuthStatus(message) {
    if (authStatus) {
      authStatus.textContent = message;
    }
  }

  function persistDraftLocally() {
    try {
      if (typeof manager.saveContent === 'function') {
        draft = manager.saveContent(draft);
      }
      return true;
    } catch {
      return false;
    }
  }

  function setPrivateAccess(isSignedIn) {
    if (authGate) {
      authGate.hidden = isSignedIn;
    }

    if (privateApp) {
      privateApp.hidden = !isSignedIn;
    }

    if (sessionBar) {
      sessionBar.hidden = !isSignedIn;
    }
  }

  function getValueByPath(source, path) {
    return path.split('.').reduce((current, key) => (current ? current[key] : undefined), source);
  }

  function setValueByPath(target, path, value) {
    const segments = path.split('.');
    const lastKey = segments.pop();
    const container = segments.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, target);
    container[lastKey] = value;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readLines(value) {
    return String(value || '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function createToneOptions(selectedTone) {
    return TONES.map((tone) => `<option value="${tone}"${selectedTone === tone ? ' selected' : ''}>${tone}</option>`).join('');
  }

  function closeAllViews() {
    views.forEach((view) => {
      view.hidden = true;
    });
  }

  function showHub() {
    closeAllViews();
    form.hidden = true;
    hub.hidden = false;
  }

  function openView(viewName) {
    const meta = VIEW_META[viewName];
    const targetView = document.querySelector(`.admin-view[data-view="${viewName}"]`);
    if (!meta || !targetView) return;

    closeAllViews();
    targetView.hidden = false;
    hub.hidden = true;
    form.hidden = false;

    if (viewEyebrow) viewEyebrow.textContent = meta.eyebrow;
    if (viewTitle) viewTitle.textContent = meta.title;
    if (viewDescription) viewDescription.textContent = meta.description;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function createDisclosureCard(title, subtitle, content) {
    return `
      <details class="admin-disclosure admin-disclosure--item">
        <summary class="admin-disclosure__summary">
          <div>
            <strong>${title}</strong>
            <span>${subtitle}</span>
          </div>
          <span class="admin-disclosure__toggle">Mostrar</span>
        </summary>
        <div class="admin-disclosure__content">${content}</div>
      </details>
    `;
  }

  function countVisible(items) {
    return items.filter((item) => item.visible !== false).length;
  }

  function updateHubStats() {
    const servicesItems = Array.isArray(draft.home?.services?.items) ? draft.home.services.items : [];
    const compareItems = Array.isArray(draft.home?.services?.compareItems) ? draft.home.services.compareItems : [];
    const projectItems = Array.isArray(draft.home?.projects?.items) ? draft.home.projects.items : [];
    const servicesTotal = servicesItems.length;
    const servicesVisible = countVisible(servicesItems);
    const compareTotal = compareItems.length;
    const compareVisible = countVisible(compareItems);
    const projectsTotal = projectItems.length;
    const projectsVisible = countVisible(projectItems);
    const heroPointsTotal = Array.isArray(draft.home?.hero?.points) ? draft.home.hero.points.length : 0;

    if (brandStats) brandStats.textContent = '4 campos base';
    if (heroStats) heroStats.textContent = `${heroPointsTotal} puntos activos`;
    if (servicesStats) servicesStats.textContent = `${servicesVisible}/${servicesTotal} niveles visibles`;
    if (compareStats) compareStats.textContent = `${compareVisible}/${compareTotal} comparativas visibles`;
    if (projectsStats) projectsStats.textContent = `${projectsVisible}/${projectsTotal} proyectos visibles`;
    if (contactStats) contactStats.textContent = '2 CTA configurables';
    if (footerStats) footerStats.textContent = '2 campos compartidos';
  }

  function moveItem(collection, index, direction) {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= collection.length) return false;

    const temp = collection[index];
    collection[index] = collection[nextIndex];
    collection[nextIndex] = temp;
    return true;
  }

  function renderRepeaters() {
    if (servicesEditor) {
      servicesEditor.innerHTML = draft.home.services.items.map((item, index) => createDisclosureCard(
      item.title || `Nivel o categoria ${index + 1}`,
      `${item.level || 'Nivel'} · ${item.visible !== false ? 'Visible' : 'Oculto'} · Mostrar detalles`,
      `
        <div class="admin-inline-actions">
          <button type="button" class="inline-link" data-move-item="service" data-index="${index}" data-direction="up">Subir</button>
          <button type="button" class="inline-link" data-move-item="service" data-index="${index}" data-direction="down">Bajar</button>
          <button type="button" class="inline-link" data-remove-item="service" data-index="${index}">Eliminar</button>
        </div>
        <div class="admin-grid admin-grid--three">
          <label class="admin-field admin-field--checkbox">
            <input type="checkbox" data-array-path="home.services.items.${index}.visible" ${item.visible !== false ? 'checked' : ''}>
            <span>Visible</span>
          </label>
          <label class="admin-field">
            <span>Nivel</span>
            <input type="text" data-array-path="home.services.items.${index}.level" value="${escapeHtml(item.level)}">
          </label>
          <label class="admin-field">
            <span>Tono</span>
            <select data-array-path="home.services.items.${index}.tone">${createToneOptions(item.tone)}</select>
          </label>
          <label class="admin-field">
            <span>Titulo</span>
            <input type="text" data-array-path="home.services.items.${index}.title" value="${escapeHtml(item.title)}">
          </label>
          <label class="admin-field">
            <span>Texto auxiliar</span>
            <input type="text" data-array-path="home.services.items.${index}.meta" value="${escapeHtml(item.meta)}">
          </label>
          <label class="admin-field">
            <span>URL</span>
            <input type="text" data-array-path="home.services.items.${index}.url" value="${escapeHtml(item.url)}">
          </label>
        </div>
      `
      )).join('');
    }

    if (compareEditor) {
      compareEditor.innerHTML = draft.home.services.compareItems.map((item, index) => createDisclosureCard(
      item.title || `Comparativa ${index + 1}`,
      `${item.level || 'Nivel'} · ${item.visible !== false ? 'Visible' : 'Oculta'} · Mostrar detalles`,
      `
        <div class="admin-inline-actions">
          <button type="button" class="inline-link" data-move-item="compare" data-index="${index}" data-direction="up">Subir</button>
          <button type="button" class="inline-link" data-move-item="compare" data-index="${index}" data-direction="down">Bajar</button>
          <button type="button" class="inline-link" data-remove-item="compare" data-index="${index}">Eliminar</button>
        </div>
        <div class="admin-grid admin-grid--three">
          <label class="admin-field admin-field--checkbox">
            <input type="checkbox" data-array-path="home.services.compareItems.${index}.visible" ${item.visible !== false ? 'checked' : ''}>
            <span>Visible</span>
          </label>
          <label class="admin-field">
            <span>Nivel</span>
            <input type="text" data-array-path="home.services.compareItems.${index}.level" value="${escapeHtml(item.level)}">
          </label>
          <label class="admin-field">
            <span>Tono</span>
            <select data-array-path="home.services.compareItems.${index}.tone">${createToneOptions(item.tone)}</select>
          </label>
          <label class="admin-field">
            <span>Titulo</span>
            <input type="text" data-array-path="home.services.compareItems.${index}.title" value="${escapeHtml(item.title)}">
          </label>
          <label class="admin-field admin-field--full">
            <span>Bullets, uno por linea</span>
            <textarea rows="4" data-array-path="home.services.compareItems.${index}.bullets" data-list="true">${escapeHtml((item.bullets || []).join('\n'))}</textarea>
          </label>
        </div>
      `
      )).join('');
    }

    if (projectsEditor) {
      projectsEditor.innerHTML = draft.home.projects.items.map((item, index) => createDisclosureCard(
      item.title || `Proyecto ${index + 1}`,
      `${item.tag || 'Proyecto'} · ${item.visible !== false ? 'Visible' : 'Oculto'} · Mostrar detalles`,
      `
        <div class="admin-inline-actions">
          <button type="button" class="inline-link" data-move-item="project" data-index="${index}" data-direction="up">Subir</button>
          <button type="button" class="inline-link" data-move-item="project" data-index="${index}" data-direction="down">Bajar</button>
          <button type="button" class="inline-link" data-remove-item="project" data-index="${index}">Eliminar</button>
        </div>
        <div class="admin-grid admin-grid--three">
          <label class="admin-field admin-field--checkbox">
            <input type="checkbox" data-array-path="home.projects.items.${index}.visible" ${item.visible !== false ? 'checked' : ''}>
            <span>Visible</span>
          </label>
          <label class="admin-field admin-field--checkbox">
            <input type="checkbox" data-array-path="home.projects.items.${index}.featured" ${item.featured ? 'checked' : ''}>
            <span>Destacado</span>
          </label>
          <label class="admin-field">
            <span>Clave modal</span>
            <input type="text" data-array-path="home.projects.items.${index}.leadRef" value="${escapeHtml(item.leadRef)}">
          </label>
          <label class="admin-field">
            <span>Etiqueta</span>
            <input type="text" data-array-path="home.projects.items.${index}.tag" value="${escapeHtml(item.tag)}">
          </label>
          <label class="admin-field">
            <span>Titulo</span>
            <input type="text" data-array-path="home.projects.items.${index}.title" value="${escapeHtml(item.title)}">
          </label>
          <label class="admin-field">
            <span>URL del proyecto</span>
            <input type="url" data-array-path="home.projects.items.${index}.projectUrl" value="${escapeHtml(item.projectUrl)}">
          </label>
          <label class="admin-field admin-field--full">
            <span>Descripcion</span>
            <textarea rows="3" data-array-path="home.projects.items.${index}.description">${escapeHtml(item.description)}</textarea>
          </label>
          <label class="admin-field admin-field--full">
            <span>Bullets, uno por linea</span>
            <textarea rows="4" data-array-path="home.projects.items.${index}.bullets" data-list="true">${escapeHtml((item.bullets || []).join('\n'))}</textarea>
          </label>
          <label class="admin-field">
            <span>Imagen preview</span>
            <input type="text" data-array-path="home.projects.items.${index}.previewSrc" value="${escapeHtml(item.previewSrc)}">
          </label>
          <label class="admin-field">
            <span>Alt de imagen</span>
            <input type="text" data-array-path="home.projects.items.${index}.previewAlt" value="${escapeHtml(item.previewAlt)}">
          </label>
          <label class="admin-field">
            <span>Texto boton proyecto</span>
            <input type="text" data-array-path="home.projects.items.${index}.viewLabel" value="${escapeHtml(item.viewLabel)}">
          </label>
          <label class="admin-field admin-field--full">
            <span>Texto boton interes</span>
            <input type="text" data-array-path="home.projects.items.${index}.interestLabel" value="${escapeHtml(item.interestLabel)}">
          </label>
        </div>
      `
      )).join('');
    }

    updateHubStats();
  }

  function fillSimpleFields() {
    form.querySelectorAll('[name]').forEach((field) => {
      const value = getValueByPath(draft, field.name);
      if (field.dataset.list === 'true') {
        field.value = Array.isArray(value) ? value.join('\n') : '';
        return;
      }
      field.value = value ?? '';
    });
  }

  function refreshForm() {
    fillSimpleFields();
    renderRepeaters();
  }

  async function loadEditorContent() {
    const restoredLocalDraft = typeof manager.hasLocalDraft === 'function' && manager.hasLocalDraft();

    draft = manager.loadAdminContent
      ? await manager.loadAdminContent()
      : await manager.loadPublishedContent();

    if (restoredLocalDraft) {
      persistDraftLocally();
    }

    refreshForm();
    showHub();
    updateHubStats();
    setDirtyState(restoredLocalDraft);

    return {
      restoredLocalDraft
    };
  }

  function readSimpleFields() {
    form.querySelectorAll('[name]').forEach((field) => {
      const nextValue = field.dataset.list === 'true' ? readLines(field.value) : field.value.trim();
      setValueByPath(draft, field.name, nextValue);
    });

    form.querySelectorAll('[data-array-path]').forEach((field) => {
      const nextValue = field.type === 'checkbox'
        ? field.checked
        : field.dataset.list === 'true'
          ? readLines(field.value)
          : field.value.trim();
      setValueByPath(draft, field.dataset.arrayPath, nextValue);
    });
  }

  function addService() {
    draft.home.services.items.push({
      id: `service-${Date.now()}`,
      visible: true,
      level: 'Nuevo nivel',
      title: 'Nuevo servicio',
      meta: 'Ver detalles',
      url: 'index.html#servicios',
      tone: 'green'
    });
    renderRepeaters();
    persistDraftLocally();
    markDirty('Nuevo nivel agregado. Guarda para aplicarlo al sitio.');
  }

  function addCompareItem() {
    draft.home.services.compareItems.push({
      id: `compare-${Date.now()}`,
      visible: true,
      level: 'Nivel',
      title: 'Nueva comparativa',
      bullets: ['Punto 1', 'Punto 2'],
      tone: 'green'
    });
    renderRepeaters();
    persistDraftLocally();
    markDirty('Nueva tarjeta comparativa agregada. Guarda para aplicarla al sitio.');
  }

  function addProject() {
    draft.home.projects.items.push({
      id: `project-${Date.now()}`,
      visible: true,
      featured: false,
      tag: 'Nuevo proyecto',
      title: 'Nombre del proyecto',
      description: 'Describe aqui el proyecto.',
      bullets: ['Resultado 1', 'Resultado 2'],
      previewSrc: 'project-previews/aris.png',
      previewAlt: 'Vista previa del proyecto',
      projectUrl: 'https://example.com',
      viewLabel: 'Ver proyecto',
      interestLabel: 'Quiero algo parecido',
      leadRef: 'default',
      trackKey: `project-${Date.now()}`
    });
    renderRepeaters();
    persistDraftLocally();
    markDirty('Nuevo proyecto agregado. Guarda para aplicarlo al sitio.');
  }

  function removeFromCollection(type, index) {
    const numericIndex = Number(index);
    if (Number.isNaN(numericIndex)) return;

    if (type === 'service') {
      draft.home.services.items.splice(numericIndex, 1);
    }

    if (type === 'compare') {
      draft.home.services.compareItems.splice(numericIndex, 1);
    }

    if (type === 'project') {
      draft.home.projects.items.splice(numericIndex, 1);
    }

    renderRepeaters();
    persistDraftLocally();
    markDirty('Elemento eliminado del borrador. Guarda para confirmar el cambio.');
  }

  function reorderCollection(type, index, direction) {
    const numericIndex = Number(index);
    if (Number.isNaN(numericIndex)) return;

    let moved = false;

    if (type === 'service') {
      moved = moveItem(draft.home.services.items, numericIndex, direction);
    }

    if (type === 'compare') {
      moved = moveItem(draft.home.services.compareItems, numericIndex, direction);
    }

    if (type === 'project') {
      moved = moveItem(draft.home.projects.items, numericIndex, direction);
    }

    if (!moved) return;

    renderRepeaters();
    persistDraftLocally();
    markDirty('Orden actualizado en el borrador. Guarda para confirmarlo.');
  }

  form.addEventListener('input', () => {
    readSimpleFields();
    persistDraftLocally();
    markDirty();
  });

  form.addEventListener('change', () => {
    readSimpleFields();
    persistDraftLocally();
    markDirty();
  });

  form.addEventListener('click', (event) => {
    const moveButton = event.target.closest('[data-move-item]');
    if (moveButton) {
      readSimpleFields();
      reorderCollection(moveButton.dataset.moveItem, moveButton.dataset.index, moveButton.dataset.direction || 'up');
      return;
    }

    const button = event.target.closest('[data-remove-item]');
    if (!button) return;

    if (!window.confirm('Esto eliminara el elemento del borrador actual. Quieres continuar?')) {
      return;
    }

    readSimpleFields();
    removeFromCollection(button.dataset.removeItem, button.dataset.index);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!supabaseClient || !currentUser) {
      setStatus('Inicia sesion para publicar cambios en Supabase.');
      return;
    }

    readSimpleFields();
    persistDraftLocally();

    const issues = validateDraft();
    if (issues.length) {
      setStatus(buildValidationMessage(issues));
      return;
    }

    isSubmitting = true;

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus('Guardando cambios en Supabase...');

    try {
      const { error } = await supabaseClient
        .from(remoteConfig.contentTable)
        .upsert({
          slug: remoteConfig.contentSlug,
          content: draft
        }, {
          onConflict: 'slug'
        });

      if (error) {
        throw error;
      }

      if (typeof manager.clearLocalDraft === 'function') {
        manager.clearLocalDraft();
      }

      markClean('Cambios guardados en Supabase y listos para el sitio publico.');
    } catch (error) {
      setStatus(`No pude guardar en Supabase: ${error.message || 'revisa tu configuracion y politicas RLS.'}`);
    } finally {
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  addServiceButton?.addEventListener('click', () => {
    readSimpleFields();
    addService();
  });

  addCompareButton?.addEventListener('click', () => {
    readSimpleFields();
    addCompareItem();
  });

  addProjectButton?.addEventListener('click', () => {
    readSimpleFields();
    addProject();
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      readSimpleFields();
      openView(button.dataset.openView || 'brand');
    });
  });

  backButton?.addEventListener('click', () => {
    readSimpleFields();
    showHub();
  });

  resetButton?.addEventListener('click', () => {
    if (!window.confirm('Esto restaurara el borrador local a los valores iniciales. Quieres continuar?')) {
      return;
    }

    draft = manager.getDefaultContent();
    persistDraftLocally();
    refreshForm();
    markDirty('Se cargaron los valores iniciales. Guarda para publicarlos en Supabase.');
  });

  exportButton?.addEventListener('click', () => {
    readSimpleFields();
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'soul-crystal-works-content.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Configuracion exportada en JSON.');
  });

  importInput?.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedContent = JSON.parse(text);
      if (!parsedContent || typeof parsedContent !== 'object' || Array.isArray(parsedContent)) {
        throw new Error('invalid-content');
      }

      draft = typeof manager.saveContent === 'function'
        ? manager.saveContent(parsedContent)
        : parsedContent;
      refreshForm();
      const issues = validateDraft();
      if (issues.length) {
        markDirty(`Configuracion importada con observaciones. ${buildValidationMessage(issues)}`);
      } else {
        markDirty('Configuracion importada. Revisa y guarda para publicarla en Supabase.');
      }
    } catch {
      setStatus('No pude importar el archivo JSON. Verifica su formato.');
    } finally {
      importInput.value = '';
    }
  });

  async function handleSignedInState(session) {
    currentUser = session && session.user ? session.user : null;

    if (!currentUser) {
      if (sessionEmail) {
        sessionEmail.textContent = 'Sin sesion';
      }
      setPrivateAccess(false);
      setAuthStatus('Inicia sesion con tu correo administrador para abrir el panel.');
      return;
    }

    if (sessionEmail) {
      sessionEmail.textContent = currentUser.email || 'Sesion activa';
    }

    setPrivateAccess(true);
    setAuthStatus('');
    const { restoredLocalDraft } = await loadEditorContent();
    if (restoredLocalDraft) {
      markDirty('Se recupero tu borrador local. Revísalo y guarda cuando estes lista.');
      return;
    }

    markClean('Contenido publicado cargado correctamente.');
  }

  async function initializeSupabase() {
    if (!manager.hasRemoteConfig || !manager.hasRemoteConfig()) {
      setPrivateAccess(false);
      setAuthStatus('Falta configurar site-config.js con tu URL y tu anon key de Supabase.');
      if (authForm) {
        authForm.hidden = true;
      }
      return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      setPrivateAccess(false);
      setAuthStatus('No pude cargar la libreria de Supabase en esta pagina.');
      return;
    }

    supabaseClient = window.supabase.createClient(remoteConfig.url, remoteConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      setAuthStatus('No pude validar la sesion actual. Intenta iniciar de nuevo.');
      return;
    }

    await handleSignedInState(data.session);

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await handleSignedInState(session);
    });
  }

  authForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      setAuthStatus('La conexion con Supabase no esta lista todavia.');
      return;
    }

    const email = authEmail ? authEmail.value.trim() : '';
    const password = authPassword ? authPassword.value : '';

    if (!email || !password) {
      setAuthStatus('Escribe tu correo y tu contrasena para entrar.');
      return;
    }

    setAuthStatus('Abriendo sesion...');
    setAuthBusy(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthStatus(`No pude iniciar sesion: ${error.message || 'verifica tus credenciales.'}`);
        return;
      }

      setAuthStatus('Sesion iniciada. Cargando panel...');
    } finally {
      setAuthBusy(false);
    }
  });

  authMagicLinkButton?.addEventListener('click', async () => {
    if (!supabaseClient) {
      setAuthStatus('La conexion con Supabase no esta lista todavia.');
      return;
    }

    const email = authEmail ? authEmail.value.trim() : '';
    if (!email) {
      setAuthStatus('Escribe tu correo para enviarte el magic link.');
      return;
    }

    setAuthStatus('Enviando magic link...');
    setAuthBusy(true);

    try {
      const redirectTo = `${window.location.origin}/admin/`;
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      });

      if (error) {
        setAuthStatus(`No pude enviar el magic link: ${error.message || 'intenta de nuevo.'}`);
        return;
      }

      setAuthStatus('Magic link enviado. Revisa tu correo y vuelve a esta misma ruta.');
    } finally {
      setAuthBusy(false);
    }
  });

  signOutButton?.addEventListener('click', async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setStatus('Sesion cerrada.');
  });

  window.addEventListener('beforeunload', (event) => {
    if (!hasUnsavedChanges) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  });

  initializeTheme();
  refreshForm();
  showHub();
  updateHubStats();
  await initializeSupabase();
});