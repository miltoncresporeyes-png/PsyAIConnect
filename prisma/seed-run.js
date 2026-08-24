/**
 * Runner para el seed: registra ts-node con las opciones necesarias
 * (evita que ts-node compile el cliente Prisma generado en src/generated).
 * Uso: node prisma/seed-run.js
 */
require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: 'CommonJS',
        moduleResolution: 'node',
    },
    ignore: ['/node_modules/', 'src[\\\\/]generated'],
});

require('./seed.ts');
