const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../src/generated/client'));
const { encryptClinicalNote } = require(path.join(__dirname, '../src/lib/encryption'));
const prisma = new PrismaClient();

async function main() {
    const patient = await prisma.user.findUnique({
        where: { email: 'paciente.test@psyconnect.cl' }
    });
    const psychologist = await prisma.professional.findFirst({
        where: { user: { email: 'psicologo.test@psyconnect.cl' } },
        include: { user: true }
    });
    const psychiatrist = await prisma.professional.findFirst({
        where: { user: { email: 'psiquiatra.test@psyconnect.cl' } },
        include: { user: true }
    });

    if (!patient || !psychologist || !psychiatrist) {
        console.error('Missing test users/professionals in DB');
        return;
    }

    console.log('Found users:', {
        patient: patient.name,
        psychologist: psychologist.user.name,
        psychiatrist: psychiatrist.user.name
    });

    // Clean existing test appointments for patient if any
    await prisma.clinicalNote.deleteMany({
        where: { appointment: { patientId: patient.id } }
    });
    await prisma.payment.deleteMany({
        where: { appointment: { patientId: patient.id } }
    });
    await prisma.appointment.deleteMany({
        where: { patientId: patient.id }
    });

    // 1. Cita con Psicólogo (Completada hace 14 días)
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 14);

    const apt1 = await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychologist.id,
            scheduledAt: pastDate1,
            duration: 50,
            modality: 'ONLINE',
            status: 'COMPLETED',
            consultationReason: 'Dificultad para conciliar el sueño y niveles elevados de estrés laboral.',
        }
    });

    const note1EncryptedContent = encryptClinicalNote(
        "Paciente consulta por sintomatología ansiosa persistente de 3 meses de evolución, vinculada a sobrecarga laboral. " +
        "Se observa ánimo reactivo, sin ideación de autoagresión. Presenta rumiación nocturna e insomnio de conciliación. " +
        "Se inicia abordaje psicoeducativo y reestructuración cognitiva."
    );
    const note1EncryptedIndicaciones = encryptClinicalNote(
        "1. Registro de pensamientos automáticos en horario vespertino.\n" +
        "2. Higiene del sueño: suspender pantallas 45 min antes de acostarse.\n" +
        "3. Práctica diaria de técnica de respiración diafragmática (4x4) guiada en plataforma.\n" +
        "4. Control en 2 semanas."
    );

    await prisma.clinicalNote.create({
        data: {
            appointmentId: apt1.id,
            professionalId: psychologist.id,
            encryptedContent: note1EncryptedContent,
            encryptedIndicaciones: note1EncryptedIndicaciones,
            diagnosticTag: 'F41.1 Trastorno de Ansiedad Generalizada (Leve - Moderado)',
            treatmentType: 'Psicoterapia Cognitivo-Conductual (TCC)',
            isFinalized: true,
            finalizedAt: pastDate1,
            signedAt: pastDate1,
            signature: `FIRMADO DIGITALMENTE POR ${psychologist.user.name} - REGISTRO SIS ${psychologist.licenseNumber}`,
            contentHash: 'hash-clinico-test-001',
        }
    });

    // 2. Cita con Psiquiatra (Completada hace 5 días)
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 5);

    const apt2 = await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychiatrist.id,
            scheduledAt: pastDate2,
            duration: 45,
            modality: 'ONLINE',
            status: 'COMPLETED',
            consultationReason: 'Interconsulta por insomnio severo y somatización.',
        }
    });

    const note2EncryptedContent = encryptClinicalNote(
        "Evaluación médica psiquiátrica de derivación. Paciente concuerda con cuadro adaptativo con reactividad afectiva y respuesta tensional. " +
        "Examen mental: Orientada en tiempo y espacio, lenguaje coherente, afecto ansioso. " +
        "Se complementa tratamiento con pauta psicofarmacológica transitoria y plan de control bimensual."
    );
    const note2EncryptedIndicaciones = encryptClinicalNote(
        "1. Mantener psicoterapia semanal con psicólogo tratante.\n" +
        "2. Farmacoterapia: Según receta electrónica retenida emitida en sesión.\n" +
        "3. Evitar consumo de cafeína después de las 16:00 hrs.\n" +
        "4. Próxima evaluación clínica y ajuste farmacológico en 30 días."
    );

    await prisma.clinicalNote.create({
        data: {
            appointmentId: apt2.id,
            professionalId: psychiatrist.id,
            encryptedContent: note2EncryptedContent,
            encryptedIndicaciones: note2EncryptedIndicaciones,
            diagnosticTag: 'F43.2 Trastorno de Adaptación con síntomas ansiosos mixtos',
            treatmentType: 'Manejo Psiquiátrico Multidisciplinario',
            isFinalized: true,
            finalizedAt: pastDate2,
            signedAt: pastDate2,
            signature: `FIRMADO DIGITALMENTE POR ${psychiatrist.user.name} - REGISTRO SIS ${psychiatrist.licenseNumber}`,
            contentHash: 'hash-clinico-test-002',
        }
    });

    // 3. Próxima cita programada (en 3 días)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 3);
    upcomingDate.setHours(15, 30, 0, 0);

    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychologist.id,
            scheduledAt: upcomingDate,
            duration: 50,
            modality: 'ONLINE',
            status: 'CONFIRMED',
            consultationReason: 'Sesión de seguimiento TCC - Revisión de registro de pensamientos y sueño.',
        }
    });

    console.log('Seed clinical patient data populated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
