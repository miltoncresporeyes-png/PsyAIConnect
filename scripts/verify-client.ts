
import { prisma } from '../src/lib/prisma'

async function main() {
    try {
        console.log('Connecting...')
        const count = await prisma.reimbursementRequest.count()
        console.log(`Successfully connected! Found ${count} reimbursement requests.`)

        const requests = await prisma.reimbursementRequest.findMany({
            take: 1,
            select: { id: true, status: true, patientId: true }
        })
        console.log('Sample request:', requests[0])

    } catch (error) {
        console.error('Error verifying client:', error)
        process.exit(1)
    }
}

main()
