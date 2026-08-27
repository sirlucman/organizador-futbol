#!/usr/bin/env node
/* Sirve la aplicación con los datos de fixture del test de layout, para mirarla
 * en un navegador de verdad.
 *
 *     node tools/servir-fixture.js
 *     node tools/servir-fixture.js --rol=jugador --puerto=8123
 *
 * Existe porque los escenarios que el test mide no se pueden abrir contra
 * staging sin modificarla: el más importante es la pantalla de carga de
 * resultado, que sólo aparece con la inscripción cerrada, y cerrarla en staging
 * es una escritura real. Acá se sirve el index.html del repo con los tres
 * <script> del CDN de Firebase reemplazados por el doble de tests/fixtures-app.js,
 * así que la aplicación arranca completa, con datos, sin red y sin tocar nada.
 *
 * Es la contraparte manual de tests/layout.test.js: mismo index.html, mismos
 * datos, mismo estado. Lo que el test no puede juzgar —si una fila envuelta se
 * ve bien— se mira acá.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { docsDesde, fakeFirebase } = require('../tests/fixtures-app.js');

const RAIZ = path.join(__dirname, '..');
const arg = (n, def) => {
  const m = process.argv.find(a => a.startsWith(`--${n}=`));
  return m ? m.slice(n.length + 3) : def;
};
const ROL = arg('rol', 'admin');
const PUERTO = Number(arg('puerto', 8123));

const TIPOS = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.css': 'text/css' };

/* Se saca el <script> del CDN (que necesitaría red y credenciales) y se pone el
   doble en su lugar, antes de que corra el script de la aplicación. */
function inyectar(html, rol) {
  const doble = `<script>(${fakeFirebase.toString()})(${JSON.stringify({ datos: docsDesde(), rol })});</script>`;
  return html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+"><\/script>\s*/g, '')
             .replace('</head>', `${doble}\n</head>`);
}

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const abs = path.join(RAIZ, rel);
  if (!abs.startsWith(RAIZ) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404); return res.end('no está'); }
  const tipo = TIPOS[path.extname(abs)] || 'application/octet-stream';
  if (path.extname(abs) === '.html') {
    res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
    return res.end(inyectar(fs.readFileSync(abs, 'utf8'), ROL));
  }
  res.writeHead(200, { 'Content-Type': tipo });
  fs.createReadStream(abs).pipe(res);
});

server.listen(PUERTO, '127.0.0.1', () => {
  console.log(`\n  Aplicación con datos de fixture, rol "${ROL}":\n`);
  console.log(`      http://127.0.0.1:${PUERTO}/index.html\n`);
  console.log('  El login está falseado: entra directo, con cualquier usuario y contraseña.');
  console.log('  No hay red ni escritura: staging y producción no se tocan.\n');
  console.log('  Las tres pantallas que cambiaron:');
  console.log('    · Partidos → 27 de agosto  → panel de equipos con los inputs de goles (.team-player-row)');
  console.log('    · Partidos → 3 de septiembre → lista de convocados con los botones (.conv-row)');
  console.log('    · Partidos → la lista misma  → chip de estado + acciones (.match-card-top)\n');
  console.log('  Cuánto desborda, desde la consola del navegador:');
  console.log('      document.documentElement.scrollWidth - document.documentElement.clientWidth\n');
  console.log('  Ctrl+C para cortar.\n');
});
