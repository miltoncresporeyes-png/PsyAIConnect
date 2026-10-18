const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../src/generated/client'));
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
    });
    console.log('USERS:', users);

    const appointments = await prisma.appointment.findMany({
        include: {
            clinicalNotes: true,
            professional: { include: { user: true } },
            patient: true,
        }
    });
    console.log('APPOINTMENTS COUNT:', appointments.length);
    console.log('APPOINTMENTS:', JSON.stringify(appointments, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
