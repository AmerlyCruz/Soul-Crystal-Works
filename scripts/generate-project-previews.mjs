import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'project-previews');
const workspaceRoot = path.resolve(projectRoot, '..');
const goodFinanceRoot = path.join(workspaceRoot, 'GoodFinance');
const goodFinanceScreenshotSeed = {
  financialData: {
    spent: 1730,
    budget: 3200,
    creditDueInDays: 4,
    possibleSavings: 420,
    debts: 310
  },
  ingresos: [
    { descripcion: 'Salario mensual', monto: 3200, fecha: '2026-03-01' },
    { descripcion: 'Trabajo freelance', monto: 480, fecha: '2026-03-18' }
  ],
  tarjetasCredito: [
    { nombre: 'Visa principal', monto: 640, fechaCorte: '2026-03-29', tasa: 24.5 },
    { nombre: 'MasterCard viajes', monto: 230, fechaCorte: '2026-04-03', tasa: 21.9 }
  ],
  prestamos: [
    { nombre: 'Prestamo del auto', monto: 410, fechaPago: '2026-04-07', tasa: 11.2 }
  ],
  servicios: [
    { nombre: 'Internet y móvil', monto: 95, fechaPago: '2026-03-27' },
    { nombre: 'Streaming y apps', monto: 38, fechaPago: '2026-03-30' }
  ],
  deudas: [
    { nombre: 'Saldo pendiente personal', monto: 310, fechaPago: '2026-04-11' }
  ],
  customCats: [
    { nombre: 'Comidas fuera', monto: 115, fecha: '2026-03-22' },
    { nombre: 'Transporte', monto: 92, fecha: '2026-03-21' }
  ]
};

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.html') return 'text/html; charset=utf-8';
  if (extension === '.css') return 'text/css; charset=utf-8';
  if (extension === '.js') return 'text/javascript; charset=utf-8';
  if (extension === '.json') return 'application/json; charset=utf-8';
  if (extension === '.svg') return 'image/svg+xml';
  if (extension === '.png') return 'image/png';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

async function startStaticServer(rootDir, port = 4173) {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = new URL(request.url || '/', `http://127.0.0.1:${port}`).pathname;
      const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
      const safePath = path.normalize(normalizedPath).replace(/^([.][.][/\\])+/, '');
      const filePath = path.join(rootDir, safePath);
      const content = await readFile(filePath);

      response.writeHead(200, {
        'Content-Type': getContentType(filePath),
        'Cache-Control': 'no-store'
      });
      response.end(content);
    } catch (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });

  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    })
  };
}

const previews = [
  {
    name: 'El Secreto de Aris',
    url: 'https://soulcrystal.netlify.app/',
    output: 'aris.png'
  },
  {
    name: 'Flexiway',
    url: '/index.html',
    beforeNavigate: async (page) => {
      await page.addInitScript((seed) => {
        Object.entries(seed).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        localStorage.setItem('hideStartupAlerts', 'true');
        sessionStorage.setItem('alertsShown', 'true');
      }, goodFinanceScreenshotSeed);
    },
    beforeCapture: async (page) => {
      await page.waitForTimeout(1200);
    },
    output: 'flexi.png'
  }
];

async function capturePreview(page, preview) {
  console.log(`Capturing ${preview.name} from ${preview.url}`);
  if (typeof preview.beforeNavigate === 'function') {
    await preview.beforeNavigate(page);
  }
  await page.goto(preview.url, {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }

      html {
        scroll-behavior: auto !important;
      }
    `
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  if (typeof preview.beforeCapture === 'function') {
    await preview.beforeCapture(page);
  }
  await page.waitForTimeout(1200);

  const outputPath = path.join(outputDir, preview.output);
  await page.screenshot({
    path: outputPath,
    type: 'png'
  });

  console.log(`Saved ${outputPath}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const goodFinanceServer = await startStaticServer(goodFinanceRoot);
  const resolvedPreviews = previews.map((preview) => ({
    ...preview,
    url: preview.url.startsWith('/') ? `${goodFinanceServer.url}${preview.url}` : preview.url
  }));

  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1024 },
      deviceScaleFactor: 1,
      colorScheme: 'light'
    });

    const page = await context.newPage();

    for (const preview of resolvedPreviews) {
      await capturePreview(page, preview);
    }

    await context.close();
  } finally {
    await browser.close();
    await goodFinanceServer.close();
  }
}

main().catch((error) => {
  console.error('Failed to generate project previews.');
  console.error(error);
  process.exitCode = 1;
});