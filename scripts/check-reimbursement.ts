
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
    try {
        console.log('Checking ReimbursementRequests...');
        const requests = await prisma.reimbursementRequest.findMany({
            include: {
                appointments: {
                    include: {
                        invoice: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${requests.length} requests.`);

        requests.forEach((req: any) => {
            console.log(`Request ID: ${req.id}`);
            console.log(`Status: ${req.status}`);
            console.log(`Appointments: ${req.appointments.length}`);
            req.appointments.forEach((apt: any) => {
                console.log(`  - Apt ID: ${apt.id}, Date: ${apt.scheduledAt}, Invoice: ${apt.invoice ? 'YES' : 'NO'}`);
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
