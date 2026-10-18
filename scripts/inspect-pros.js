const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../src/generated/client'));
const prisma = new PrismaClient();

async function main() {
    const pros = await prisma.professional.findMany({
        include: { user: true }
    });
    console.log('PROFESSIONALS:', JSON.stringify(pros, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
