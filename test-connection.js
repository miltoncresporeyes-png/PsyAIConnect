// Script para probar conexión a Supabase
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

async function testConnection() {
    console.log('🔍 Probando conexión a Supabase...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 60) + '...');
    console.log('DIRECT_URL:', process.env.DIRECT_URL?.substring(0, 60) + '...\n');

    try {
        // Test basic connection
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log('✅ Conexión básica EXITOSA!\n');

        // Count users
        const userCount = await prisma.user.count();
        console.log('📊 Usuarios en la base de datos:', userCount);

        // Count professionals
        const proCount = await prisma.professional.count();
        console.log('👨‍⚕️ Profesionales en la base de datos:', proCount);

        console.log('\n✅ TODO OK - La base de datos está conectada correctamente!');

    } catch (error) {
        console.error('\n❌ ERROR de conexión:');
        console.error('Mensaje:', error.message);
        if (error.code) console.error('Código:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
