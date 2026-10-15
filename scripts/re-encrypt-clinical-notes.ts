import { prisma } from '../src/lib/prisma'
import { reEncrypt } from '../src/lib/encryption'

/**
 * Script para re-cifrar notas clínicas a la clave activa actual del KeyRing
 * Uso: npx ts-node scripts/re-encrypt-clinical-notes.ts
 */
async function main() {
    console.log('🔄 Iniciando re-cifrado de notas clínicas en base de datos...')

    const notes = await prisma.clinicalNote.findMany({
        select: {
            id: true,
            encryptedData: true,
            content: true,
        },
    })

    console.log(`📋 Encontradas ${notes.length} notas clínicas.`)
    let updatedCount = 0
    let skippedCount = 0
    let failedCount = 0

    for (const note of notes) {
        if (!note.encryptedData || note.encryptedData.length === 0) {
            skippedCount++
            continue
        }

        try {
            const reEncryptedBuf = reEncrypt(note.encryptedData)
            await prisma.clinicalNote.update({
                where: { id: note.id },
                data: {
                    encryptedData: reEncryptedBuf,
                },
            })
            updatedCount++
        } catch (err) {
            console.error(`❌ Error al re-cifrar nota ID ${note.id}:`, (err as Error).message)
            failedCount++
        }
    }

    console.log(`\n✅ Resumen de re-cifrado:`)
    console.log(`   - Actualizadas: ${updatedCount}`)
    console.log(`   - Omitidas (sin datos cifrados): ${skippedCount}`)
    console.log(`   - Fallidas: ${failedCount}`)
}

main()
    .catch((e) => {
        console.error('Error fatal en re-cifrado:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
