document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  const compareToggle = document.getElementById('compareToggle');
  const compareGrid = document.getElementById('serviceCompareGrid');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const leadModal = document.getElementById('leadReferralModal');
  const legalModal = document.getElementById('legalModal');
  const legalModalEyebrow = document.getElementById('legalModalEyebrow');
  const legalModalTitle = document.getElementById('legalModalTitle');
  const legalModalContent = document.getElementById('legalModalContent');
  const legalTriggerButtons = document.querySelectorAll('[data-legal-trigger]');
  const closeLegalButtons = document.querySelectorAll('[data-close-legal-modal]');
  const leadEyebrow = document.getElementById('leadReferralEyebrow');
  const leadTitle = document.getElementById('leadReferralTitle');
  const leadCopy = document.getElementById('leadReferralCopy');
  const leadCta = document.getElementById('leadReferralCta');
  const closeLeadButtons = document.querySelectorAll('[data-close-lead-modal]');
  const THEME_STORAGE_KEY = 'scw-theme-v2';

  const referralMessages = {
    beautyfast: {
      banner: 'Vienes desde una tienda real enfocada en ventas. Si quieres un ecommerce con esa misma intención, puedo crearlo para tu negocio.',
      eyebrow: 'Tienda online real',
      title: '¿Quieres una tienda como El Secreto de Aris?',
      copy: 'Acabas de ver un ecommerce real con carrito, búsqueda, onboarding y experiencia de compra pensada para convertir. Si tu negocio necesita algo así, puedo diseñarlo contigo.',
      whatsappText: 'Hola, acabo de ver el proyecto El Secreto de Aris y quiero una tienda online parecida para mi negocio.',
      ctaLabel: 'Quiero mi tienda online'
    },
    flexiway: {
      banner: 'Vienes desde una interfaz funcional y clara. Si necesitas una web o sistema con esa lógica, también puedo construirlo.',
      eyebrow: 'Interfaz funcional',
      title: '¿Quieres una web o sistema como Flexiway?',
      copy: 'Si necesitas una solución más operativa, clara y rápida para mostrar o gestionar procesos, puedo diseñar una experiencia ajustada a tu flujo real.',
      whatsappText: 'Hola, vi el proyecto Flexiway y quiero una pagina o sistema parecido para mi negocio.',
      ctaLabel: 'Quiero algo parecido'
    },
    default: {
      banner: 'Si te gustó uno de mis proyectos, puedo crear una versión personalizada para tu negocio.',
      eyebrow: 'Proyecto real',
      title: '¿Quieres una pagina como la que acabas de ver?',
      copy: 'Diseño webs elegantes, rápidas y pensadas para comunicar mejor y convertir más. Si tu negocio necesita una presencia digital más fuerte, hablemos.',
      whatsappText: 'Hola, vengo desde tu portafolio y quiero una pagina web para mi negocio.',
      ctaLabel: 'Quiero una para mi negocio'
    }
  };

  const legalModalContentMap = {
    terms: {
      eyebrow: 'Marco legal informativo',
      title: 'Términos y condiciones',
      html: `
        <p>Este contenido funciona como una referencia informativa mientras se publica la versión legal definitiva de Soul Crystal Works.</p>
        <p>Cada proyecto se cotiza de forma individual en función del alcance, complejidad visual, estructura necesaria, integraciones y nivel de personalización requerido.</p>
        <ul>
          <li>El inicio del trabajo queda sujeto a la validación del alcance, calendario y condiciones comerciales acordadas para el proyecto.</li>
          <li>Las rondas de revisión se definen antes de comenzar para mantener el proceso ordenado y evitar desviaciones fuera del alcance aprobado.</li>
          <li>Los materiales, textos, imágenes o accesos que deba aportar el cliente pueden afectar la planificación si no se reciben en el plazo previsto.</li>
          <li>La entrega final, publicación o cesión editable se realiza según la etapa pactada y después de la aprobación correspondiente.</li>
        </ul>
        <p>Al contratar o utilizar estos servicios se entiende aceptada esta versión informativa de términos y condiciones hasta la publicación del documento legal definitivo.</p>
      `
    },
    delivery: {
      eyebrow: 'Planificación estimada',
      title: 'Plazos y entregas',
      html: `
        <p>Los tiempos publicados son estimaciones iniciales basadas en los niveles de servicio presentados en el sitio.</p>
        <ul>
          <li>Landing Page: entre 2 y 4 días para una presencia digital enfocada en captación y presentación comercial.</li>
          <li>E-commerce: entre 5 y 12 días para catálogo, categorías y flujo de pedidos por WhatsApp.</li>
          <li>Sistema Web Completo: entre 2 y 4 semanas para procesos más amplios, carrito, checkout, gestión o paneles.</li>
        </ul>
        <p>Estas referencias pueden ajustarse según rondas de revisión, complejidad visual, integraciones externas, volumen de contenido y tiempos de respuesta del cliente.</p>
        <p>La fecha concreta de entrega se confirma una vez aprobado el alcance final y validadas las condiciones del proyecto.</p>
      `
    }
  };

  function getReferralConfig(ref) {
    return referralMessages[ref] || referralMessages.default;
  }

  const ANALYTICS_EVENTS_KEY = 'scw-analytics-events';
  const ANALYTICS_SUMMARY_KEY = 'scw-analytics-summary';
  const ANALYTICS_SESSION_KEY = 'scw-analytics-session-id';

  function getSessionId() {
    let sessionId = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
    if (!sessionId) {
      sessionId = `scw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(ANALYTICS_SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  function readJsonStorage(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJsonStorage(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures silently.
    }
  }

  function trackEvent(name, data = {}) {
    const event = {
      name,
      data,
      path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      sessionId: getSessionId(),
      timestamp: new Date().toISOString()
    };

    const events = readJsonStorage(localStorage, ANALYTICS_EVENTS_KEY, []);
    events.push(event);
    writeJsonStorage(localStorage, ANALYTICS_EVENTS_KEY, events.slice(-200));

    const summary = readJsonStorage(localStorage, ANALYTICS_SUMMARY_KEY, {});
    summary[name] = (summary[name] || 0) + 1;
    writeJsonStorage(localStorage, ANALYTICS_SUMMARY_KEY, summary);

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, data);
    }

    return event;
  }

  window.scwAnalytics = {
    trackEvent,
    getEvents: () => readJsonStorage(localStorage, ANALYTICS_EVENTS_KEY, []),
    getSummary: () => readJsonStorage(localStorage, ANALYTICS_SUMMARY_KEY, {}),
    clear: () => {
      localStorage.removeItem(ANALYTICS_EVENTS_KEY);
      localStorage.removeItem(ANALYTICS_SUMMARY_KEY);
    }
  };

  function setLeadContent(ref, origin) {
    const config = getReferralConfig(ref);

    if (leadEyebrow) leadEyebrow.textContent = config.eyebrow;
    if (leadTitle) leadTitle.textContent = config.title;
    if (leadCopy) leadCopy.textContent = config.copy;
    if (leadCta) {
      const whatsappText = `${config.whatsappText} (origen: ${origin})`;
      leadCta.href = `https://wa.me/18493990014?text=${encodeURIComponent(whatsappText)}`;
      leadCta.textContent = config.ctaLabel;
    }
  }

  function applyTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);

    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', nextTheme === 'dark' ? '#0f172a' : '#f5f1ff');
    }

    if (themeToggle) {
      const isDark = nextTheme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      const label = themeToggle.querySelector('.theme-toggle__label');
      const icon = themeToggle.querySelector('.theme-toggle__icon');
      if (label) label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
      if (icon) icon.textContent = isDark ? '☀' : '◐';
    }
  }

  function readStoredTheme() {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
    } catch {
      return null;
    }
  }

  function saveStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }

  function initializeTheme() {
    applyTheme('light');

    const storedTheme = readStoredTheme();
    if (storedTheme) {
      applyTheme(storedTheme);
    }

    themeToggle?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      saveStoredTheme(nextTheme);
      applyTheme(nextTheme);
      trackEvent('theme_toggle', { theme: nextTheme });
    });
  }

  function initializeComparisonToggle() {
    if (!compareToggle || !compareGrid) return;

    compareGrid.hidden = true;
    compareToggle.setAttribute('aria-expanded', 'false');
    compareToggle.setAttribute('aria-label', 'Ver comparación');

    compareToggle.addEventListener('click', () => {
      const isExpanded = compareToggle.getAttribute('aria-expanded') === 'true';
      compareToggle.setAttribute('aria-expanded', String(!isExpanded));
      compareToggle.setAttribute('aria-label', isExpanded ? 'Ver comparación' : 'Ocultar comparación');
      compareGrid.hidden = isExpanded;
    });
  }

  function initializeSparkleCursor() {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const layer = document.createElement('div');
    layer.className = 'sparkle-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    let lastSparkleAt = 0;
    let lastX = 0;
    let lastY = 0;

    function spawnSparkles(clientX, clientY) {
      const now = Date.now();
      if (now - lastSparkleAt < 42) return;

      if (Math.abs(clientX - lastX) < 4 && Math.abs(clientY - lastY) < 4) return;

      lastSparkleAt = now;
      lastX = clientX;
      lastY = clientY;

      for (let index = 0; index < 2; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${clientX + (Math.random() * 22 - 11)}px`;
        sparkle.style.top = `${clientY + (Math.random() * 22 - 11)}px`;
        sparkle.style.setProperty('--sparkle-size', `${Math.round(Math.random() * 6 + 8)}px`);
        sparkle.style.setProperty('--sparkle-hue', `${Math.round(Math.random() * 36 + 250)}deg`);
        sparkle.style.setProperty('--sparkle-rotate', `${Math.round(Math.random() * 90)}deg`);
        layer.appendChild(sparkle);
        window.setTimeout(() => sparkle.remove(), 900);
      }
    }

    document.addEventListener('pointermove', (event) => {
      spawnSparkles(event.clientX, event.clientY);
    }, { passive: true });

    document.addEventListener('mousemove', (event) => {
      spawnSparkles(event.clientX, event.clientY);
    }, { passive: true });
  }

  function shouldAutoOpenReferralModal(ref, source, campaign) {
    return campaign === 'project-lead' && ref === 'beautyfast' && source === 'footer';
  }

  function clearReferralParamsFromUrl() {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('ref');
    currentUrl.searchParams.delete('source');
    currentUrl.searchParams.delete('campaign');
    const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState({}, document.title, nextUrl);
  }

  function openLeadModal(ref = 'default', origin = 'auto') {
    if (!leadModal) return;
    setLeadContent(ref, origin);
    trackEvent('lead_modal_open', { ref, origin });
    leadModal.hidden = false;
    leadModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lead-modal-open');
  }

  function closeLeadModal() {
    if (!leadModal) return;
    leadModal.hidden = true;
    leadModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lead-modal-open');
  }

  function initializeProjectToggles() {
    const toggleButtons = document.querySelectorAll('[data-project-toggle]');
    if (!toggleButtons.length) return;

    toggleButtons.forEach((button) => {
      if (button.dataset.scwToggleBound === 'true') return;

      const targetId = button.getAttribute('aria-controls');
      const detailPanel = targetId ? document.getElementById(targetId) : null;
      if (!detailPanel) return;

      detailPanel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Ver detalles';
      button.dataset.scwToggleBound = 'true';

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        button.textContent = isExpanded ? 'Ver detalles' : 'Ocultar detalles';
        detailPanel.hidden = isExpanded;
      });
    });
  }

  function bindTrackedElements() {
    const elements = document.querySelectorAll('[data-track]');
    elements.forEach((element) => {
      if (element.dataset.scwTrackBound === 'true') return;

      element.dataset.scwTrackBound = 'true';
      element.addEventListener('click', () => {
        trackEvent(element.dataset.track || 'interaction', {
          label: element.dataset.trackLabel || '',
          text: element.textContent.trim().slice(0, 80)
        });
      });
    });
  }

  function openLegalModal(type = 'terms') {
    if (!legalModal || !legalModalContent) return;

    const content = legalModalContentMap[type] || legalModalContentMap.terms;
    if (legalModalEyebrow) legalModalEyebrow.textContent = content.eyebrow;
    if (legalModalTitle) legalModalTitle.textContent = content.title;
    legalModalContent.innerHTML = content.html;

    legalModal.hidden = false;
    legalModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('legal-modal-open');
    trackEvent('legal_modal_open', { type });
  }

  function closeLegalModal() {
    if (!legalModal) return;
    legalModal.hidden = true;
    legalModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('legal-modal-open');
  }

  window.abrirModal = function abrirModal(ref = 'default', origin = 'portfolio-detail') {
    openLeadModal(ref, origin);
  };

  initializeTheme();
  initializeSparkleCursor();
  initializeComparisonToggle();
  initializeProjectToggles();

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      trackEvent('nav_toggle', { state: isOpen ? 'open' : 'closed' });
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  closeLeadButtons.forEach((button) => {
    button.addEventListener('click', closeLeadModal);
  });

  legalTriggerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openLegalModal(button.dataset.legalTrigger || 'terms');
    });
  });

  closeLegalButtons.forEach((button) => {
    button.addEventListener('click', closeLegalModal);
  });

  bindTrackedElements();

  if (leadModal) {
    leadModal.addEventListener('click', (event) => {
      if (event.target === leadModal || event.target.hasAttribute('data-close-lead-modal')) {
        closeLeadModal();
      }
    });
  }

  if (legalModal) {
    legalModal.addEventListener('click', (event) => {
      if (event.target === legalModal || event.target.hasAttribute('data-close-legal-modal')) {
        closeLegalModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLeadModal();
      closeLegalModal();
      if (navMenu?.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || 'default';
  const source = params.get('source') || 'direct';
  const campaign = params.get('campaign');

  trackEvent('page_view', {
    ref,
    source,
    campaign: campaign || '',
    title: document.title
  });

  if (shouldAutoOpenReferralModal(ref, source, campaign)) {
    const bannerKey = `scw-ref-banner:${ref}:${source}`;
    const modalKey = `scw-ref-modal:${ref}:${source}`;

    setLeadContent(ref, source);
    trackEvent('referral_visit', { ref, source, campaign });

    sessionStorage.setItem(bannerKey, 'disabled');

    if (!sessionStorage.getItem(modalKey)) {
      sessionStorage.setItem(modalKey, 'shown');
      window.setTimeout(() => openLeadModal(ref, source), 700);
    }

    clearReferralParamsFromUrl();
  }

  document.addEventListener('scw:content-applied', () => {
    initializeProjectToggles();
    bindTrackedElements();
  });
});

function trackWhatsApp(origin = 'general') {
  if (window.scwAnalytics) {
    window.scwAnalytics.trackEvent('whatsapp_click', { origin });
  }
  console.log(`Lead por WhatsApp desde ${origin}`);
}
