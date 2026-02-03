
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const requests = await prisma.reimbursementRequest.findMany({
            include: {
                patient: true,
                appointments: true
            }
        })
        console.log('Total ReimbursementRequests:', requests.length)
        requests.forEach((r: any) => {
            console.log(`REQ ID: ${r.id}`)
            console.log(`   Patient Email: ${r.patient.email}`)
            console.log(`   Patient ID: ${r.patientId}`)
            console.log(`   Status: ${r.status}`)
            console.log('---')
        })
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
