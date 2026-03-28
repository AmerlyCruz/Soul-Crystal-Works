document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  const trackedElements = document.querySelectorAll('[data-track]');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const leadModal = document.getElementById('leadReferralModal');
  const leadEyebrow = document.getElementById('leadReferralEyebrow');
  const leadTitle = document.getElementById('leadReferralTitle');
  const leadCopy = document.getElementById('leadReferralCopy');
  const leadCta = document.getElementById('leadReferralCta');
  const closeLeadButtons = document.querySelectorAll('[data-close-lead-modal]');

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

  window.abrirModal = function abrirModal(ref = 'default', origin = 'portfolio-detail') {
    openLeadModal(ref, origin);
  };

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

  trackedElements.forEach((element) => {
    element.addEventListener('click', () => {
      trackEvent(element.dataset.track || 'interaction', {
        label: element.dataset.trackLabel || '',
        text: element.textContent.trim().slice(0, 80)
      });
    });
  });

  if (leadModal) {
    leadModal.addEventListener('click', (event) => {
      if (event.target === leadModal || event.target.hasAttribute('data-close-lead-modal')) {
        closeLeadModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLeadModal();
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

  if (campaign === 'project-lead') {
    const bannerKey = `scw-ref-banner:${ref}:${source}`;
    const modalKey = `scw-ref-modal:${ref}:${source}`;

    setLeadContent(ref, source);
    trackEvent('referral_visit', { ref, source, campaign });

    sessionStorage.setItem(bannerKey, 'disabled');

    if (!sessionStorage.getItem(modalKey)) {
      sessionStorage.setItem(modalKey, 'shown');
      window.setTimeout(() => openLeadModal(ref, source), 700);
    }
  }
});

function trackWhatsApp(origin = 'general') {
  if (window.scwAnalytics) {
    window.scwAnalytics.trackEvent('whatsapp_click', { origin });
  }
  console.log(`Lead por WhatsApp desde ${origin}`);
}
