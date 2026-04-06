(function initializeScwContentManager() {
  const CONTENT_DATA_URL = 'data/site-content.json';
  const CONFIG_PLACEHOLDERS = new Set(['', 'YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY']);

  const DEFAULT_CONTENT = {
    brand: {
      name: 'Soul Crystal Works',
      description: 'Diseno web con direccion visual solida, estructura clara y enfoque comercial real.',
      whatsappNumber: '18493990014',
      instagramUrl: 'https://www.instagram.com/soulcrystalwebs?igsh=anc3Z25yNHQzM3F3&utm_source=qr'
    },
    home: {
      hero: {
        kicker: 'Diseno web para negocio',
        title: 'Webs claras, elegantes y listas para vender mejor.',
        lead: 'Diseno paginas y tiendas online para negocios que necesitan una presencia mas solida, mas simple de entender y mas facil de convertir en contacto o venta.',
        primaryCtaLabel: 'Quiero cotizar mi proyecto',
        primaryCtaMessage: 'Hola, quiero cotizar una pagina web con Soul Crystal Works.',
        secondaryCtaLabel: 'Ver proyectos',
        points: [
          'Diseno visual alineado a tu marca',
          'Experiencia responsive y ordenada',
          'CTA pensados para generar contacto'
        ]
      },
      services: {
        eyebrow: 'Servicios',
        title: 'Estos son mis niveles y categorias de servicio.',
        compareEyebrow: 'Comparacion rapida',
        compareTitle: 'Que cambia entre Nivel 1, Nivel 3 y Nivel 5',
        items: [
          {
            id: 'landing-page',
            visible: true,
            level: 'Nivel 1',
            title: 'Landing Page',
            meta: 'Ver detalles',
            url: 'landing-page.html',
            tone: 'green'
          },
          {
            id: 'ecommerce',
            visible: true,
            level: 'Nivel 3',
            title: 'Ecommerce',
            meta: 'Ver detalles',
            url: 'ecommerce.html',
            tone: 'gold'
          },
          {
            id: 'sistema-web',
            visible: true,
            level: 'Nivel 5',
            title: 'Sistema Web Completo',
            meta: 'Ver detalles',
            url: 'sistema-web.html',
            tone: 'red'
          },
          {
            id: 'rediseno',
            visible: true,
            level: 'Categoria',
            title: 'Rediseno',
            meta: 'Ver detalles',
            url: 'rediseno.html',
            tone: 'violet'
          }
        ],
        compareItems: [
          {
            id: 'compare-1',
            visible: true,
            level: 'Nivel 1',
            title: 'Presencia digital',
            bullets: ['1 sola pagina', 'WhatsApp y redes', '2 a 4 dias'],
            tone: 'green'
          },
          {
            id: 'compare-3',
            visible: true,
            level: 'Nivel 3',
            title: 'Catalogo con pedidos',
            bullets: ['Productos y categorias', 'Pedidos por WhatsApp', '5 a 12 dias'],
            tone: 'gold'
          },
          {
            id: 'compare-5',
            visible: true,
            level: 'Nivel 5',
            title: 'Sistema completo',
            bullets: ['Carrito y checkout', 'Base de datos y panel', '2 a 4 semanas'],
            tone: 'red'
          }
        ]
      },
      projects: {
        kicker: 'Proyectos seleccionados',
        title: 'Trabajos reales con enfoque visual y comercial.',
        description: 'Una muestra breve de como convierto una idea de negocio en una experiencia mas clara, mas creible y mejor presentada.',
        items: [
          {
            id: 'beautyfast',
            visible: true,
            featured: true,
            tag: 'E-commerce de belleza',
            title: 'El Secreto de Aris',
            description: 'Tienda online con una experiencia mas cuidada, visualmente mas fuerte y pensada para vender con menos friccion.',
            bullets: ['Catalogo y busqueda integrados', 'Compra mas clara y confiable'],
            previewSrc: 'project-previews/aris.png',
            previewAlt: 'Vista previa de El Secreto de Aris',
            projectUrl: 'https://elsecretodearis.netlify.app',
            viewLabel: 'Ver proyecto',
            interestLabel: 'Quiero una tienda asi',
            leadRef: 'beautyfast',
            trackKey: 'beautyfast'
          },
          {
            id: 'flexiway',
            visible: true,
            featured: false,
            tag: 'Interfaz funcional',
            title: 'Flexiway',
            description: 'Una interfaz mas directa y limpia, enfocada en que el usuario entienda rapido y actue sin confusion.',
            bullets: ['Lectura inmediata de la interfaz', 'Diseno limpio y funcional'],
            previewSrc: 'project-previews/flexi.png',
            previewAlt: 'Vista previa de Flexiway',
            projectUrl: 'https://darling-moxie-bbe1ae.netlify.app/',
            viewLabel: 'Ver proyecto',
            interestLabel: 'Quiero algo parecido',
            leadRef: 'flexiway',
            trackKey: 'flexiway'
          }
        ]
      },
      contact: {
        kicker: 'Contacto',
        title: 'Si tu negocio necesita una web mas clara, mas elegante y mejor enfocada, hablemos.',
        description: 'Cuentame que necesitas y te dire como lo enfocaria para que tu marca se vea mejor y convierta con mas claridad.',
        primaryLabel: 'Escribirme por WhatsApp',
        primaryMessage: 'Hola, vi tu portafolio y quiero informacion sobre una pagina web.',
        secondaryLabel: 'Ver proyectos otra vez',
        secondaryHref: '#proyectos'
      }
    },
    footer: {
      legalNote: 'Al usar estos servicios aceptas los terminos y condiciones vigentes.',
      meta: '© 2026 Soul Crystal Works'
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeContent(base, override) {
    if (Array.isArray(base)) {
      return Array.isArray(override) ? override : clone(base);
    }

    if (!base || typeof base !== 'object') {
      return override === undefined ? base : override;
    }

    const output = { ...base };
    const source = override && typeof override === 'object' ? override : {};

    Object.keys(base).forEach((key) => {
      output[key] = mergeContent(base[key], source[key]);
    });

    Object.keys(source).forEach((key) => {
      if (!(key in output)) {
        output[key] = source[key];
      }
    });

    return output;
  }

  function sanitizePhoneNumber(phoneNumber) {
    return String(phoneNumber || '').replace(/\D/g, '');
  }

  function buildWhatsAppUrl(phoneNumber, message) {
    const cleanNumber = sanitizePhoneNumber(phoneNumber);
    const finalMessage = typeof message === 'string' && message.trim() ? message.trim() : 'Hola, quiero informacion sobre una pagina web.';
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(finalMessage)}`;
  }

  function isConfiguredValue(value) {
    return typeof value === 'string' && !CONFIG_PLACEHOLDERS.has(value.trim());
  }

  function getRemoteConfig() {
    const supabaseConfig = window.SCW_SITE_CONFIG && window.SCW_SITE_CONFIG.supabase
      ? window.SCW_SITE_CONFIG.supabase
      : {};

    return {
      url: typeof supabaseConfig.url === 'string' ? supabaseConfig.url.trim().replace(/\/$/, '') : '',
      anonKey: typeof supabaseConfig.anonKey === 'string' ? supabaseConfig.anonKey.trim() : '',
      contentTable: typeof supabaseConfig.contentTable === 'string' && supabaseConfig.contentTable.trim()
        ? supabaseConfig.contentTable.trim()
        : 'site_content',
      contentSlug: typeof supabaseConfig.contentSlug === 'string' && supabaseConfig.contentSlug.trim()
        ? supabaseConfig.contentSlug.trim()
        : 'primary'
    };
  }

  function hasRemoteConfig() {
    const config = getRemoteConfig();
    return isConfiguredValue(config.url) && isConfiguredValue(config.anonKey);
  }

  function buildSupabaseHeaders(apiKey) {
    const headers = {
      apikey: apiKey
    };

    if (typeof apiKey === 'string' && apiKey.trim() && !apiKey.startsWith('sb_publishable_')) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    return headers;
  }

  async function loadSupabaseContent() {
    if (!hasRemoteConfig()) {
      return null;
    }

    const config = getRemoteConfig();
    const endpoint = `${config.url}/rest/v1/${encodeURIComponent(config.contentTable)}?slug=eq.${encodeURIComponent(config.contentSlug)}&select=content&limit=1`;

    try {
      const response = await fetch(endpoint, {
        headers: buildSupabaseHeaders(config.anonKey),
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Unable to load Supabase content: ${response.status}`);
      }

      const payload = await response.json();
      const row = Array.isArray(payload) ? payload[0] : payload;

      if (!row || !row.content || typeof row.content !== 'object') {
        return null;
      }

      return mergeContent(clone(DEFAULT_CONTENT),
                          
                          
                          
                          row.content);
    } catch {
      return null;
    }
  }

  async function loadPublishedContent() {
    const supabaseContent = await loadSupabaseContent();
    if (supabaseContent) {
      return supabaseContent;
    }

    try {
      const response = await fetch(CONTENT_DATA_URL, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Unable to load content: ${response.status}`);
      }

      return mergeContent(clone(DEFAULT_CONTENT), await response.json());
    } catch {
      return clone(DEFAULT_CONTENT);
    }
  }

  function updateText(selector, value, root) {
    const element = (root || document).querySelector(selector);
    if (element && typeof value === 'string') {
      element.textContent = value;
    }
  }

async function saveToSupabase(content) {
  if (!hasRemoteConfig()) {
    console.warn('Supabase no configurado');
    return;
  }

  const config = getRemoteConfig();

  const endpoint = `${config.url}/rest/v1/${config.contentTable}?slug=eq.${config.contentSlug}`;

  try {
    await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        ...buildSupabaseHeaders(config.anonKey),
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ content })
    });
  } catch (err) {
    console.error('Error guardando en Supabase:', err);
  }
}
  
  function updateWhatsAppLinks(content, root) {
    const phoneNumber = content.brand.whatsappNumber;
    const links = (root || document).querySelectorAll('a[href*="wa.me/"]');

    links.forEach((link) => {
      try {
        const url = new URL(link.href);
        const currentMessage = url.searchParams.get('text') || '';
        link.href = buildWhatsAppUrl(phoneNumber, currentMessage);
      } catch {
        link.href = buildWhatsAppUrl(phoneNumber, 'Hola, quiero informacion sobre una pagina web.');
      }
    });
  }

  function updateInstagramLinks(content, root) {
    const links = (root || document).querySelectorAll('a[href*="instagram.com"]');
    links.forEach((link) => {
      link.href = content.brand.instagramUrl;
    });
  }

  function renderHeroPoints(points) {
    return points
      .filter((point) => typeof point === 'string' && point.trim())
      .map((point) => `<li>${point}</li>`)
      .join('');
  }

  function renderServiceCards(items) {
    const visibleItems = items.filter((item) => item.visible !== false);
    if (!visibleItems.length) {
      return '<div class="service-link-card"><strong>No hay niveles visibles</strong><p>Activa uno desde el panel de administrador.</p></div>';
    }

    return visibleItems.map((item) => {
      const tone = item.tone || 'green';
      return `
        <a href="${item.url}" class="service-link-card service-link-card--${tone}" data-track="service_page_open" data-track-label="${item.id}">
          <span class="service-link-card__level">${item.level}</span>
          <strong>${item.title}</strong>
          <span class="service-link-card__meta">${item.meta}</span>
        </a>
      `;
    }).join('');
  }

  function renderCompareCards(items) {
    const visibleItems = items.filter((item) => item.visible !== false);
    if (!visibleItems.length) {
      return '<article class="service-compare__card"><strong>No hay comparativas visibles</strong></article>';
    }

    return visibleItems.map((item) => {
      const tone = item.tone || 'green';
      const bullets = (item.bullets || [])
        .filter((bullet) => typeof bullet === 'string' && bullet.trim())
        .map((bullet) => `<li>${bullet}</li>`)
        .join('');

      return `
        <article class="service-compare__card service-compare__card--${tone}">
          <span class="service-compare__level">${item.level}</span>
          <strong>${item.title}</strong>
          <ul>${bullets}</ul>
        </article>
      `;
    }).join('');
  }

  function renderProjectCards(items) {
    const visibleItems = items.filter((item) => item.visible !== false);
    if (!visibleItems.length) {
      return '<article class="project-card"><div class="project-card__body"><h3>No hay proyectos visibles</h3><p>Puedes activarlos otra vez desde el panel administrador.</p></div></article>';
    }

    return visibleItems.map((item) => {
      const detailId = `projectDetails-${item.id}`;
      const cardClass = item.featured ? 'project-card project-card--featured' : 'project-card';
      const bullets = (item.bullets || [])
        .filter((bullet) => typeof bullet === 'string' && bullet.trim())
        .map((bullet) => `<li>${bullet}</li>`)
        .join('');
      const trackKey = item.trackKey || item.id;
      const interestLabel = item.interestLabel || 'Quiero algo parecido';
      const leadRef = item.leadRef || 'default';

      return `
        <article class="${cardClass}">
          <div class="project-card__media">
            <div class="project-preview" aria-label="${item.previewAlt}">
              <div class="project-preview__chrome" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
              <img src="${item.previewSrc}" alt="${item.previewAlt}">
            </div>
          </div>
          <div class="project-card__body">
            <span class="project-card__tag">${item.tag}</span>
            <div class="project-card__headline">
              <h3>${item.title}</h3>
              <button type="button" class="project-card__toggle" data-project-toggle aria-expanded="false" aria-controls="${detailId}" data-track="project_toggle" data-track-label="${trackKey}-details">
                Ver detalles
              </button>
            </div>
            <div id="${detailId}" class="project-card__details" hidden>
              <p>${item.description}</p>
              <ul class="project-card__list">${bullets}</ul>
              <div class="project-card__actions">
                <a href="${item.projectUrl}" target="_blank" rel="noopener" class="button button-secondary" data-track="project_view" data-track-label="${trackKey}-view">${item.viewLabel || 'Ver proyecto'}</a>
                <button type="button" class="inline-link" onclick="abrirModal('${leadRef}', 'portfolio-detail')" data-track="project_interest" data-track-label="${trackKey}-interest">${interestLabel}</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function applySharedContent(root = document, incomingContent) {
    const content = incomingContent || clone(DEFAULT_CONTENT);
    updateText('.logo', content.brand.name, root);
    updateText('.site-footer__brand', content.brand.name, root);
    updateText('.site-footer__copy', content.brand.description, root);
    updateText('.site-footer__legal-note', content.footer.legalNote, root);
    updateText('.site-footer__meta', content.footer.meta, root);
    updateWhatsAppLinks(content, root);
    updateInstagramLinks(content, root);
    return content;
  }

  function applyHomeContent(root = document, incomingContent) {
    const content = incomingContent || clone(DEFAULT_CONTENT);
    if (!root.getElementById('hero')) {
      return content;
    }

    const hero = content.home.hero;
    const services = content.home.services;
    const projects = content.home.projects;
    const contact = content.home.contact;

    updateText('#heroKicker', hero.kicker, root);
    updateText('#heroTitle', hero.title, root);
    updateText('#heroLead', hero.lead, root);

    const heroPrimaryCta = root.getElementById('heroPrimaryCta');
    if (heroPrimaryCta) {
      heroPrimaryCta.textContent = hero.primaryCtaLabel;
      heroPrimaryCta.href = buildWhatsAppUrl(content.brand.whatsappNumber, hero.primaryCtaMessage);
    }

    updateText('#heroSecondaryCta', hero.secondaryCtaLabel, root);

    const heroPoints = root.getElementById('heroPoints');
    if (heroPoints) {
      heroPoints.innerHTML = renderHeroPoints(hero.points);
    }

    updateText('#servicesEyebrow', services.eyebrow, root);
    updateText('#servicesTitle', services.title, root);
    updateText('#compareEyebrow', services.compareEyebrow, root);
    updateText('#compareTitle', services.compareTitle, root);

    const servicesGrid = root.getElementById('servicesGrid');
    if (servicesGrid) {
      servicesGrid.innerHTML = renderServiceCards(services.items || []);
    }

    const compareGrid = root.getElementById('serviceCompareGrid');
    if (compareGrid) {
      compareGrid.innerHTML = renderCompareCards(services.compareItems || []);
    }

    updateText('#projectsKicker', projects.kicker, root);
    updateText('#projectsTitle', projects.title, root);
    updateText('#projectsDescription', projects.description, root);

    const projectGrid = root.getElementById('projectGrid');
    if (projectGrid) {
      projectGrid.innerHTML = renderProjectCards(projects.items || []);
    }

    updateText('#contactKicker', contact.kicker, root);
    updateText('#contactTitle', contact.title, root);
    updateText('#contactDescription', contact.description, root);

    const contactPrimaryCta = root.getElementById('contactPrimaryCta');
    if (contactPrimaryCta) {
      contactPrimaryCta.textContent = contact.primaryLabel;
      contactPrimaryCta.href = buildWhatsAppUrl(content.brand.whatsappNumber, contact.primaryMessage);
    }

    const contactSecondaryCta = root.getElementById('contactSecondaryCta');
    if (contactSecondaryCta) {
      contactSecondaryCta.textContent = contact.secondaryLabel;
      contactSecondaryCta.href = contact.secondaryHref || '#proyectos';
    }

    return content;
  }

  window.scwContentManager = {
    
    async getContent() {
  return await loadPublishedContent();
},

save: saveToSupabase,
buildWhatsAppUrl,
    getRemoteConfig,
    hasRemoteConfig,
    applySharedContent,
    applyHomeContent,
    
    async loadPublishedContent() {
      return loadPublishedContent();
    }
  };

  const currentContent = applySharedContent(document, clone(DEFAULT_CONTENT));
  applyHomeContent(document, currentContent);

  window.scwContentManager.whenReady = loadPublishedContent().then((publishedContent) => {
    const nextContent = applySharedContent(document, publishedContent);
    applyHomeContent(document, nextContent);
    document.dispatchEvent(new CustomEvent('scw:content-applied', {
      detail: { content: nextContent }
    }));
    return nextContent;
  });
}());
