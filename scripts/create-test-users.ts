/**
 * Script para crear usuarios de prueba
 * Ejecutar con: npx tsx scripts/create-test-users.ts
 */

import { PrismaClient, UserRole, HealthSystem, ProfessionalType, Gender, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Creando usuarios de prueba...\n');

    const hashedPassword = await bcrypt.hash('Paciente2024!', 12);
    const hashedPasswordPro = await bcrypt.hash('Profesional2024!', 12);

    // 1. Crear Paciente de Prueba
    console.log('👤 Creando paciente de prueba...');
    const patient = await prisma.user.upsert({
        where: { email: 'paciente.test@psyconnect.cl' },
        update: {},
        create: {
            email: 'paciente.test@psyconnect.cl',
            name: 'María González',
            password: hashedPassword,
            role: UserRole.PATIENT,
            emailVerified: new Date(),
            patientProfile: {
                create: {
                    birthDate: new Date('1995-03-15'),
                    gender: Gender.FEMALE,
                    healthSystem: HealthSystem.ISAPRE,
                    comuna: 'Las Condes',
                    region: 'Región Metropolitana',
                }
            }
        },
        include: {
            patientProfile: true
        }
    });
    console.log('✅ Paciente creado:', patient.email);

    // 2. Crear Psicólogo de Prueba
    console.log('\n👨‍⚕️ Creando psicólogo de prueba...');
    const psychologist = await prisma.user.upsert({
        where: { email: 'psicologo.test@psyconnect.cl' },
        update: {},
        create: {
            email: 'psicologo.test@psyconnect.cl',
            name: 'Dr. Carlos Morales',
            password: hashedPasswordPro,
            role: UserRole.PROFESSIONAL,
            emailVerified: new Date(),
            professional: {
                create: {
                    professionalType: ProfessionalType.PSYCHOLOGIST,
                    licenseNumber: '12345',
                    bio: 'Psicólogo clínico con más de 10 años de experiencia en terapia cognitivo-conductual. Especializado en ansiedad, depresión y terapia de pareja.',
                    slug: 'dr-carlos-morales',
                    specialties: ['Terapia Cognitivo-Conductual', 'Ansiedad', 'Depresión', 'Terapia de pareja'],
                    sessionPrice: 35000,
                    sessionDuration: 50,
                    modality: 'BOTH',
                    isActive: true,
                    isPublic: true,
                    comuna: 'Providencia',
                    region: 'Región Metropolitana',
                    verificationStatus: VerificationStatus.VERIFIED,
                    verifiedAt: new Date(),
                    yearsExperience: 10,
                }
            }
        },
        include: {
            professional: true
        }
    });
    console.log('✅ Psicólogo creado:', psychologist.email);

    // 3. Crear Psiquiatra de Prueba
    console.log('\n👨‍⚕️ Creando psiquiatra de prueba...');
    const psychiatrist = await prisma.user.upsert({
        where: { email: 'psiquiatra.test@psyconnect.cl' },
        update: {},
        create: {
            email: 'psiquiatra.test@psyconnect.cl',
            name: 'Dra. Ana Rodríguez',
            password: hashedPasswordPro,
            role: UserRole.PROFESSIONAL,
            emailVerified: new Date(),
            professional: {
                create: {
                    professionalType: ProfessionalType.PSYCHIATRIST,
                    licenseNumber: '54321',
                    bio: 'Médico psiquiatra con amplia experiencia en el tratamiento de trastornos del ánimo, ansiedad y manejo psicofarmacológico.',
                    slug: 'dra-ana-rodriguez',
                    specialties: ['Psiquiatría General', 'Trastornos del ánimo', 'Trastornos de ansiedad', 'Psicofarmacología'],
                    sessionPrice: 50000,
                    sessionDuration: 45,
                    modality: 'BOTH',
                    isActive: true,
                    isPublic: true,
                    comuna: 'Ñuñoa',
                    region: 'Región Metropolitana',
                    verificationStatus: VerificationStatus.VERIFIED,
                    verifiedAt: new Date(),
                    yearsExperience: 12,
                }
            }
        },
        include: {
            professional: true
        }
    });
    console.log('✅ Psiquiatra creada:', psychiatrist.email);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ USUARIOS DE PRUEBA CREADOS EXITOSAMENTE\n');
    console.log('📧 CREDENCIALES DE ACCESO:\n');
    console.log('👤 PACIENTE:');
    console.log('   Email: paciente.test@psyconnect.cl');
    console.log('   Contraseña: Paciente2024!\n');
    console.log('👨‍⚕️ PSICÓLOGO:');
    console.log('   Email: psicologo.test@psyconnect.cl');
    console.log('   Contraseña: Profesional2024!\n');
    console.log('👨‍⚕️ PSIQUIATRA:');
    console.log('   Email: psiquiatra.test@psyconnect.cl');
    console.log('   Contraseña: Profesional2024!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
