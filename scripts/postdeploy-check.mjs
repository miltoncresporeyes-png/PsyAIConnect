#!/usr/bin/env node
/**
 * scripts/postdeploy-check.mjs
 * Verificación posterior al despliegue para PsyAI Connect en Railway.
 * Sin dependencias externas.
 *
 * Uso:
 *   node scripts/postdeploy-check.mjs https://tu-dominio.up.railway.app
 *   node scripts/postdeploy-check.mjs http://localhost:3000
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const targetArg = process.argv[2] || process.env.BASE_URL;

if (!targetArg) {
  console.error('❌ Error: Debes especificar la URL base.');
  console.error('Uso: node scripts/postdeploy-check.mjs <BASE_URL>');
  process.exit(1);
}

const rawBase = targetArg.replace(/\/$/, '');
const isHttps = rawBase.startsWith('https://');

let passedTests = 0;
let failedTests = 0;

function request(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(
        u,
        {
          method: options.method || 'GET',
          headers: {
            'User-Agent': 'PsyAI-PostDeploy-Check/1.0',
            ...(options.headers || {}),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode || 0,
              headers: res.headers,
              body: data,
            });
          });
        }
      );

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy(new Error('Timeout de conexión (10s)'));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

function assertTest(name, condition, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

async function runChecks() {
  console.log(`\n🔍 Iniciando post-deploy check en: ${rawBase}\n`);

  // 1. Healthcheck: GET /api/health debe responder 200 con { ok: true } y no-store
  try {
    const res = await request(`${rawBase}/api/health`);
    assertTest(
      'GET /api/health responde 200',
      res.statusCode === 200,
      `Status recibido: ${res.statusCode}`
    );

    let isJsonOk = false;
    try {
      const parsed = JSON.parse(res.body);
      isJsonOk = parsed.ok === true;
    } catch {
      isJsonOk = false;
    }
    assertTest('GET /api/health devuelve {"ok": true}', isJsonOk, `Cuerpo: ${res.body.slice(0, 80)}`);

    const cc = res.headers['cache-control'] || '';
    assertTest(
      'GET /api/health contiene Cache-Control: no-store',
      cc.includes('no-store'),
      `Cache-Control: ${cc}`
    );
  } catch (err) {
    assertTest('GET /api/health accesible', false, err.message);
  }

  // 2. Modo Waitlist Redirects: /reservar, /buscar, /registro deben redirigir (307/308 o 3xx)
  const waitlistPaths = ['/reservar', '/buscar', '/registro'];
  for (const path of waitlistPaths) {
    try {
      const res = await request(`${rawBase}${path}`);
      const isRedirect = res.statusCode >= 300 && res.statusCode < 400;
      assertTest(
        `Ruta ${path} redirige en modo waitlist (3xx)`,
        isRedirect,
        `Status recibido: ${res.statusCode}`
      );
    } catch (err) {
      assertTest(`Ruta ${path} responde`, false, err.message);
    }
  }

  // 3. Seguridad: /api/seed responde 403 o 404 (o no autorizado)
  try {
    const res = await request(`${rawBase}/api/seed`);
    const isProtected = res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 401;
    assertTest(
      'GET /api/seed bloqueado o no disponible (401/403/404)',
      isProtected,
      `Status recibido: ${res.statusCode}`
    );
  } catch (err) {
    assertTest('GET /api/seed verificado', false, err.message);
  }

  // 4. Cabeceras de seguridad en la raíz /
  try {
    const res = await request(`${rawBase}/`);
    const h = res.headers;

    assertTest(
      'X-Frame-Options presente (DENY o SAMEORIGIN)',
      h['x-frame-options'] === 'DENY' || h['x-frame-options'] === 'SAMEORIGIN',
      `Header: ${h['x-frame-options']}`
    );

    assertTest(
      'X-Content-Type-Options: nosniff',
      h['x-content-type-options'] === 'nosniff',
      `Header: ${h['x-content-type-options']}`
    );

    assertTest(
      'Referrer-Policy configurada',
      Boolean(h['referrer-policy']),
      `Header: ${h['referrer-policy']}`
    );

    assertTest(
      'Content-Security-Policy configurada',
      Boolean(h['content-security-policy']),
      `CSP presente: ${Boolean(h['content-security-policy'])}`
    );

    if (isHttps) {
      const hsts = h['strict-transport-security'] || '';
      assertTest(
        'Strict-Transport-Security presente en HTTPS (max-age=31536000)',
        hsts.includes('max-age=31536000'),
        `HSTS: ${hsts}`
      );
    } else {
      console.log('  ℹ️  [SKIP] Strict-Transport-Security omitido (se evaluó sobre HTTP sin TLS)');
    }
  } catch (err) {
    assertTest('Verificación de cabeceras en /', false, err.message);
  }

  // 5. Mitigación de imágenes: /_next/image debe estar deshabilitado (404) por images.unoptimized = true
  try {
    const resLocal = await request(`${rawBase}/_next/image?url=%2Flogo.svg&w=64&q=75`);
    assertTest(
      'GET /_next/image deshabilitado para recursos locales (404 unoptimized)',
      resLocal.statusCode === 404,
      `Status recibido: ${resLocal.statusCode}`
    );

    const resRemote = await request(`${rawBase}/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1&w=64&q=75`);
    assertTest(
      'GET /_next/image deshabilitado para URLs remotas (404 unoptimized)',
      resRemote.statusCode === 404,
      `Status recibido: ${resRemote.statusCode}`
    );
  } catch (err) {
    assertTest('Verificación de mitigación de optimización de imágenes', false, err.message);
  }

  // Resumen final
  console.log(`\n========================================`);
  console.log(`Resultados: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runChecks().catch((err) => {
  console.error('Fatal error running checks:', err);
  process.exit(1);
});
