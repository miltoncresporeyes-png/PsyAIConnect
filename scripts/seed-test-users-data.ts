/**
 * Script para generar datos completos para usuarios de prueba
 * Ejecutar con: npx tsx scripts/seed-test-users-data.ts
 */

import { PrismaClient, AppointmentStatus, Modality, PaymentStatus } from '@prisma/client';
import { encryptClinicalNote } from '../src/lib/encryption';

const prisma = new PrismaClient();

const COMMISSION_RATE = 0.114; // 11.4%

const createDateTime = (daysOffset: number, hour: number = 10): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, 0, 0, 0);
    return date;
};

const calculateCommission = (amount: number) => {
    const commission = Math.round(amount * COMMISSION_RATE);
    return { commission, netAmount: amount - commission };
};

const generateToken = (prefix: string): string => `${prefix}_${Math.random().toString(36).substring(7)}`;

const CONSULTATION_REASONS = [
    'Manejo de ansiedad y estrés laboral',
    'Trabajo en autoestima y desarrollo personal',
    'Seguimiento de proceso terapéutico',
    'Técnicas de regulación emocional',
    'Resolución de conflictos interpersonales',
    'Manejo de cambios vitales importantes',
];

async function main() {
    console.log('🚀 Generando datos completos para usuarios de prueba...\n');

    // 1. Buscar usuarios de prueba
    const patient = await prisma.user.findUnique({
        where: { email: 'paciente.test@psyconnect.cl' },
    });

    const psychologist = await prisma.user.findUnique({
        where: { email: 'psicologo.test@psyconnect.cl' },
        include: { professional: true },
    });

    const psychiatrist = await prisma.user.findUnique({
        where: { email: 'psiquiatra.test@psyconnect.cl' },
        include: { professional: true },
    });

    if (!patient || !psychologist?.professional || !psychiatrist?.professional) {
        console.error('❌ No se encontraron los usuarios de prueba. Ejecuta primero create-test-users.ts');
        return;
    }

    console.log('✅ Usuarios de prueba encontrados\n');

    // 2. CREAR SESIONES PASADAS CON EL PSICÓLOGO (últimos 3 meses)
    console.log('📅 Creando sesiones pasadas con psicólogo...');
    const pastSessionDates = [-84, -70, -56, -42, -28, -21, -14, -7]; // 8 sesiones
    
    for (let i = 0; i < pastSessionDates.length; i++) {
        const scheduledAt = createDateTime(pastSessionDates[i], 15);
        const { commission, netAmount } = calculateCommission(psychologist.professional.sessionPrice);

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                professionalId: psychologist.professional.id,
                scheduledAt,
                duration: psychologist.professional.sessionDuration,
                modality: i % 2 === 0 ? Modality.ONLINE : Modality.IN_PERSON,
                status: AppointmentStatus.COMPLETED,
                videoLink: i % 2 === 0 ? `https://meet.google.com/${generateToken('meet')}` : null,
                consultationReason: CONSULTATION_REASONS[i % CONSULTATION_REASONS.length],
                payment: {
                    create: {
                        amount: psychologist.professional.sessionPrice,
                        commission,
                        netAmount,
                        status: PaymentStatus.COMPLETED,
                        flowToken: generateToken('flow'),
                        flowOrderId: generateToken('order'),
                        paidAt: scheduledAt,
                    },
                },
                clinicalNotes: {
                    create: {
                        professionalId: psychologist.professional.id,
                        encryptedContent: encryptClinicalNote(`Sesión ${i + 1}: Paciente muestra avances en ${CONSULTATION_REASONS[i % CONSULTATION_REASONS.length].toLowerCase()}. Se trabajaron técnicas específicas y se establecieron objetivos para la próxima sesión.`),
                    },
                },
            },
        });

        console.log(`  ✓ Sesión ${i + 1} completada (${Math.abs(pastSessionDates[i])} días atrás)`);
    }

    // 3. CREAR SESIÓN DE AYER CON PSICÓLOGO
    console.log('\n📅 Creando sesión de ayer...');
    const { commission: commYesterday, netAmount: netYesterday } = calculateCommission(psychologist.professional.sessionPrice);
    
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychologist.professional.id,
            scheduledAt: createDateTime(-1, 16),
            duration: psychologist.professional.sessionDuration,
            modality: Modality.ONLINE,
            status: AppointmentStatus.COMPLETED,
            videoLink: `https://meet.google.com/${generateToken('meet')}`,
            consultationReason: 'Revisión de avances y cierre de ciclo terapéutico mensual',
            payment: {
                create: {
                    amount: psychologist.professional.sessionPrice,
                    commission: commYesterday,
                    netAmount: netYesterday,
                    status: PaymentStatus.COMPLETED,
                    flowToken: generateToken('flow'),
                    flowOrderId: generateToken('order'),
                    paidAt: createDateTime(-1, 16),
                },
            },
            clinicalNotes: {
                create: {
                    professionalId: psychologist.professional.id,
                    encryptedContent: encryptClinicalNote('Sesión muy productiva. Paciente demuestra integración de herramientas aprendidas. Se observa mejoría significativa en manejo de ansiedad.'),
                },
            },
        },
    });
    console.log('  ✓ Sesión de ayer completada');

    // 4. CREAR PRÓXIMAS SESIONES CON PSICÓLOGO
    console.log('\n📅 Creando próximas sesiones...');
    
    // Sesión en 3 días
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychologist.professional.id,
            scheduledAt: createDateTime(3, 15),
            duration: psychologist.professional.sessionDuration,
            modality: Modality.ONLINE,
            status: AppointmentStatus.CONFIRMED,
            videoLink: `https://meet.google.com/${generateToken('meet')}`,
            consultationReason: 'Continuación de proceso terapéutico',
        },
    });
    console.log('  ✓ Sesión en 3 días agendada');

    // Sesión en 10 días
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychologist.professional.id,
            scheduledAt: createDateTime(10, 15),
            duration: psychologist.professional.sessionDuration,
            modality: Modality.IN_PERSON,
            status: AppointmentStatus.CONFIRMED,
            consultationReason: 'Sesión presencial de seguimiento',
        },
    });
    console.log('  ✓ Sesión en 10 días agendada');

    // 5. CREAR UNA SESIÓN CANCELADA
    console.log('\n📅 Creando sesión cancelada...');
    const { commission: commCancelled, netAmount: netCancelled } = calculateCommission(psychologist.professional.sessionPrice);
    
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychologist.professional.id,
            scheduledAt: createDateTime(-30, 14),
            duration: psychologist.professional.sessionDuration,
            modality: Modality.ONLINE,
            status: AppointmentStatus.CANCELLED,
            consultationReason: 'Sesión programada',
            cancelledAt: createDateTime(-29),
            cancelledBy: patient.id,
            cancellationReason: 'Imprevisto laboral',
            payment: {
                create: {
                    amount: psychologist.professional.sessionPrice,
                    commission: commCancelled,
                    netAmount: netCancelled,
                    status: PaymentStatus.REFUNDED,
                    flowToken: generateToken('flow'),
                    flowOrderId: generateToken('order'),
                    paidAt: createDateTime(-31),
                    refundedAt: createDateTime(-29),
                },
            },
        },
    });
    console.log('  ✓ Sesión cancelada creada');

    // 6. CREAR 2 SESIONES CON PSIQUIATRA (consultas esporádicas)
    console.log('\n📅 Creando sesiones con psiquiatra...');
    
    // Sesión hace 2 meses
    const { commission: comm1, netAmount: net1 } = calculateCommission(psychiatrist.professional.sessionPrice);
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychiatrist.professional.id,
            scheduledAt: createDateTime(-60, 11),
            duration: psychiatrist.professional.sessionDuration,
            modality: Modality.ONLINE,
            status: AppointmentStatus.COMPLETED,
            videoLink: `https://meet.google.com/${generateToken('meet')}`,
            consultationReason: 'Evaluación psiquiátrica inicial',
            payment: {
                create: {
                    amount: psychiatrist.professional.sessionPrice,
                    commission: comm1,
                    netAmount: net1,
                    status: PaymentStatus.COMPLETED,
                    flowToken: generateToken('flow'),
                    flowOrderId: generateToken('order'),
                    paidAt: createDateTime(-60, 11),
                },
            },
            clinicalNotes: {
                create: {
                    professionalId: psychiatrist.professional.id,
                    encryptedContent: encryptClinicalNote('Evaluación inicial: Paciente presenta sintomatología compatible con trastorno de ansiedad. Se recomienda terapia farmacológica complementaria. Evaluación clínica completa realizada.'),
                },
            },
        },
    });
    console.log('  ✓ Sesión psiquiátrica hace 2 meses');

    // Sesión hace 1 mes (control)
    const { commission: comm2, netAmount: net2 } = calculateCommission(psychiatrist.professional.sessionPrice);
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychiatrist.professional.id,
            scheduledAt: createDateTime(-30, 11),
            duration: psychiatrist.professional.sessionDuration,
            modality: Modality.ONLINE,
            status: AppointmentStatus.COMPLETED,
            videoLink: `https://meet.google.com/${generateToken('meet')}`,
            consultationReason: 'Control psiquiátrico - Ajuste de tratamiento',
            payment: {
                create: {
                    amount: psychiatrist.professional.sessionPrice,
                    commission: comm2,
                    netAmount: net2,
                    status: PaymentStatus.COMPLETED,
                    flowToken: generateToken('flow'),
                    flowOrderId: generateToken('order'),
                    paidAt: createDateTime(-30, 11),
                },
            },
            clinicalNotes: {
                create: {
                    professionalId: psychiatrist.professional.id,
                    encryptedContent: encryptClinicalNote('Control: Paciente responde bien al tratamiento. Se observa reducción significativa de sintomatología ansiosa. Se mantiene esquema terapéutico actual.'),
                },
            },
        },
    });
    console.log('  ✓ Sesión psiquiátrica hace 1 mes');

    // Próximo control psiquiátrico
    await prisma.appointment.create({
        data: {
            patientId: patient.id,
            professionalId: psychiatrist.professional.id,
            scheduledAt: createDateTime(15, 11),
            duration: psychiatrist.professional.sessionDuration,
            modality: Modality.ONLINE,
            status: AppointmentStatus.CONFIRMED,
            videoLink: `https://meet.google.com/${generateToken('meet')}`,
            consultationReason: 'Control psiquiátrico mensual',
        },
    });
    console.log('  ✓ Próximo control psiquiátrico agendado (en 15 días)');

    // 7. RESUMEN FINAL
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATOS COMPLETOS GENERADOS EXITOSAMENTE\n');
    console.log('📊 RESUMEN DE DATOS CREADOS:\n');
    console.log('👤 PACIENTE: María González (paciente.test@psyconnect.cl)');
    console.log('   ├─ 8 sesiones pasadas con psicólogo (últimos 3 meses)');
    console.log('   ├─ 1 sesión de ayer (completada)');
    console.log('   ├─ 2 próximas sesiones agendadas');
    console.log('   ├─ 1 sesión cancelada (con reembolso)');
    console.log('   ├─ 2 sesiones con psiquiatra (completadas)');
    console.log('   └─ 1 control psiquiátrico agendado\n');
    console.log('💰 PAGOS:');
    console.log('   ├─ 11 pagos completados');
    console.log('   ├─ 1 reembolso procesado');
    console.log('   └─ Total facturado: ~$470.000 CLP\n');
    console.log('📋 NOTAS CLÍNICAS:');
    console.log('   ├─ 8 notas del psicólogo');
    console.log('   └─ 2 notas del psiquiatra\n');
    console.log('🎯 PRÓXIMAS SESIONES:');
    console.log('   ├─ Psicólogo: En 3 y 10 días');
    console.log('   └─ Psiquiatra: En 15 días\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Ahora puedes iniciar sesión como paciente y ver:');
    console.log('   ✓ Historial completo de sesiones');
    console.log('   ✓ Pagos y reembolsos');
    console.log('   ✓ Próximas citas agendadas');
    console.log('   ✓ Solicitar reembolso de sesiones completadas\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
