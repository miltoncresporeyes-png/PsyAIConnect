import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database with Chilean health insurance data...')

    // ============================================
    // ISAPRES DE CHILE
    // ============================================

    const isapres = [
        {
            code: 'COL',
            name: 'Colmena Golden Cross',
            legalName: 'Isapre Colmena Golden Cross S.A.',
            rut: '96501450-4',
        },
        {
            code: 'BAN',
            name: 'Banmédica',
            legalName: 'Isapre Banmédica S.A.',
            rut: '97041120-0',
        },
        {
            code: 'CON',
            name: 'Consalud',
            legalName: 'Isapre Consalud S.A.',
            rut: '96856780-2',
        },
        {
            code: 'CVI',
            name: 'Cruz Blanca',
            legalName: 'Isapre Cruz Blanca S.A.',
            rut: '96502530-K',
        },
        {
            code: 'VNV',
            name: 'Vida Tres',
            legalName: 'Isapre Vida Tres S.A.',
            rut: '76362949-K',
        },
        {
            code: 'NMS',
            name: 'Nueva Masvida',
            legalName: 'Isapre Nueva Masvida S.A.',
            rut: '78699270-1',
        },
    ]

    console.log('📋 Creating Isapres...')

    for (const isapreData of isapres) {
        const isapre = await prisma.isapre.upsert({
            where: { code: isapreData.code },
            update: isapreData,
            create: isapreData,
        })
        console.log(`  ✅ ${isapre.name}`)
    }

    // ============================================
    // TRAMOS DE FONASA
    // ============================================

    const fonasaTramos = [
        {
            tramo: 'A',
            name: 'Grupo A - Indigentes',
            description: 'Personas carentes de recursos o indigentes',
            copaymentPercentage: 0,
        },
        {
            tramo: 'B',
            name: 'Grupo B - Beneficiarios',
            description: 'Trabajadores con ingresos mensuales menores o iguales a $406.000',
            copaymentPercentage: 10,
        },
        {
            tramo: 'C',
            name: 'Grupo C - Beneficiarios',
            description: 'Trabajadores con ingresos mensuales entre $406.001 y $592.000',
            copaymentPercentage: 10,
        },
        {
            tramo: 'D',
            name: 'Grupo D - Beneficiarios',
            description: 'Trabajadores con ingresos mensuales mayores a $592.000',
            copaymentPercentage: 20,
        },
    ]

    console.log('\n📋 Creating Fonasa Tramos...')

    for (const tramoData of fonasaTramos) {
        const tramo = await prisma.fonasaTramo.upsert({
            where: { tramo: tramoData.tramo },
            update: tramoData,
            create: tramoData,
        })
        console.log(`  ✅ ${tramo.name}`)
    }

    console.log('\n✅ Seeding of coverage data completed!\n')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
