/**
 * Seed script to generate comprehensive test data for PsyConnect
 * Run with: npx tsx prisma/seed.ts
 * 
 * Creates:
 * - Demo patient with complete appointment history
 * - Demo professional with multiple patients
 * - Past completed sessions, upcoming appointments
 * - Various appointment statuses for testing
 */
import {
    PrismaClient,
    UserRole,
    ProfessionalType,
    AppointmentStatus,
    Gender,
    OccupationStatus,
    MaritalStatus,
    HealthSystem,
    Modality,
    PaymentStatus,
    ModalityPreference,
    ProfessionalGenderPreference,
    VerificationStatus,
    SubscriptionTier,
} from '../src/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const SEED_CONFIG = {
    password: 'Test1234!',
    saltRounds: 12,
    commissionRate: 0.12,
} as const;

const REGIONS_COMUNAS: Record<string, string[]> = {
    'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Florida', 'Maipú', 'Puente Alto', 'Vitacura'],
    'Valparaíso': ['Viña del Mar', 'Valparaíso', 'Quilpué', 'Villa Alemana', 'Concón'],
    'Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles'],
};

const SPECIALTIES = [
    'Ansiedad', 'Depresión', 'Estrés laboral', 'Terapia de pareja', 'Autoestima',
    'Duelo', 'Trastornos alimentarios', 'Adicciones', 'Trauma', 'TDAH',
    'TOC', 'Fobias', 'Orientación vocacional', 'Desarrollo personal', 'Manejo de emociones',
];

const PAYMENT_METHODS = ['FONASA', 'ISAPRE', 'PARTICULAR'];

const PROFESSIONAL_BIOS = [
    'Especialista en terapia cognitivo-conductual con más de 10 años de experiencia ayudando a personas a superar sus desafíos emocionales.',
    'Mi enfoque se centra en el bienestar integral, combinando técnicas tradicionales con mindfulness y autocompasión.',
    'Trabajo principalmente con adultos jóvenes, ayudándoles a navegar transiciones de vida y encontrar su propósito.',
    'Experta en terapia de pareja y familia, con énfasis en comunicación efectiva y resolución de conflictos.',
    'Me especializo en trauma y EMDR, ofreciendo un espacio seguro para la sanación emocional.',
    'Autor/a de múltiples publicaciones sobre salud mental y bienestar emocional.',
    'Conferencista internacional en temas de psicología positiva y manejo del estrés.',
    'Psicoterapeuta con experiencia en el tratamiento de trastornos de ansiedad y depresión.',
    'Investigador/a en el campo de la neurociencia aplicada a la psicología clínica.',
    'Consultor/a en desarrollo organizacional y liderazgo emocional.',
];

const CONSULTATION_REASONS = [
    'He estado sintiendo mucha ansiedad últimamente, especialmente en situaciones sociales.',
    'Estoy pasando por una etapa difícil en mi relación y necesito orientación.',
    'Me cuesta concentrarme en el trabajo y siento que no estoy rindiendo como antes.',
    'Perdí a un familiar cercano y no sé cómo procesar el duelo.',
    'Quiero trabajar en mi autoestima y confianza personal.',
    'Tengo problemas para dormir y me siento constantemente cansado/a.',
];

interface PatientData {
    name: string;
    email: string;
}

interface ProfessionalData {
    name: string;
    email: string;
    slug: string;
}

const PATIENT_NAMES: PatientData[] = [
    { name: 'María García López', email: 'maria.garcia@test.com' },
    { name: 'Juan Pérez Soto', email: 'juan.perez@test.com' },
    { name: 'Camila Rodríguez M.', email: 'camila.rodriguez@test.com' },
    { name: 'Andrés Muñoz V.', email: 'andres.munoz@test.com' },
    { name: 'Valentina Silva C.', email: 'valentina.silva@test.com' },
    { name: 'Felipe Torres R.', email: 'felipe.torres@test.com' },
    { name: 'Catalina Fernández B.', email: 'catalina.fernandez@test.com' },
    { name: 'Sebastián Díaz P.', email: 'sebastian.diaz@test.com' },
];

const PROFESSIONAL_NAMES: ProfessionalData[] = [
    { name: 'Dra. Carolina Mendoza', email: 'carolina.mendoza@test.com', slug: 'dra-carolina-mendoza' },
    { name: 'Dr. Carlos Mendoza', email: 'carlos.mendoza@test.com', slug: 'dr-carlos-mendoza' },
    { name: 'Ps. Andrea Valenzuela', email: 'andrea.valenzuela@test.com', slug: 'ps-andrea-valenzuela' },
    { name: 'Ps. Rodrigo Figueroa', email: 'rodrigo.figueroa@test.com', slug: 'ps-rodrigo-figueroa' },
    { name: 'Dra. Isabel Contreras', email: 'isabel.contreras@test.com', slug: 'dra-isabel-contreras' },
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomFromMany = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

const generatePhone = (): string => `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`;

const generateLicenseNumber = (): string => `${Math.floor(100000 + Math.random() * 900000)}`;

const generateToken = (prefix: string): string => `${prefix}_${Math.random().toString(36).substring(7)}`;

const calculateCommission = (amount: number): { commission: number; netAmount: number } => {
    const commission = Math.round(amount * SEED_CONFIG.commissionRate);
    return { commission, netAmount: amount - commission };
};

// Create a specific date with time
const createDateTime = (daysOffset: number, hour: number = 10): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, 0, 0, 0);
    return date;
};

// ==========================================
// DATA GENERATION HELPERS
// ==========================================

const getDefaultAvailability = () => [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '14:00' },
    { dayOfWeek: 5, startTime: '10:00', endTime: '17:00' },
];

// ==========================================
// SEEDER FUNCTIONS
// ==========================================

async function clearDatabase(): Promise<void> {
    console.log('🧹 Cleaning existing data...');

    await prisma.payment.deleteMany();
    await prisma.clinicalNote.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.emergencyContact.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.professional.deleteMany();
    await prisma.consentLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.emailVerificationCode.deleteMany();
    await prisma.waitlistEntry.deleteMany();
    await prisma.user.deleteMany();
}

interface CreatedUser {
    id: string;
    name: string | null;
    professional?: {
        id: string;
        sessionPrice: number;
        sessionDuration: number;
    } | null;
}

async function createProfessional(
    data: ProfessionalData,
    hashedPassword: string,
    options?: {
        region?: string;
        comuna?: string;
        specialties?: string[];
        paymentMethods?: string[];
    }
): Promise<CreatedUser> {
    const region = options?.region || 'Región Metropolitana';
    const comuna = options?.comuna || randomFrom(REGIONS_COMUNAS[region]);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            role: UserRole.PROFESSIONAL,
            emailVerified: new Date(),
            profileCompleted: true,
            phone: generatePhone(),
            professional: {
                create: {
                    professionalType: randomFrom([
                        ProfessionalType.PSYCHOLOGIST,
                        ProfessionalType.PSYCHIATRIST,
                        ProfessionalType.CLINICAL_PSYCHOLOGIST,
                    ]),
                    licenseNumber: generateLicenseNumber(),
                    bio: randomFrom(PROFESSIONAL_BIOS),
                    slug: data.slug,
                    specialties: options?.specialties || randomFromMany(SPECIALTIES, 4),
                    modality: randomFrom([Modality.ONLINE, Modality.IN_PERSON, Modality.BOTH]),
                    sessionPrice: randomFrom([35000, 40000, 45000, 50000, 55000, 60000]),
                    sessionDuration: randomFrom([50, 60]),
                    region,
                    comuna,
                    officeAddress: randomFrom([
                        'Av. Providencia 1234, Of. 501',
                        'Av. Apoquindo 4500, Of. 802',
                        'Av. Las Condes 12000, Of. 304',
                        'Av. Vitacura 5555, Of. 203',
                        'Av. Pedro de Valdivia 100, Of. 610',
                    ]),
                    acceptedPaymentMethods: options?.paymentMethods || randomFromMany(PAYMENT_METHODS, Math.floor(Math.random() * 3) + 1),
                    targetAudience: randomFrom([
                        'Acompaña a personas que se sienten desbordadas o estancadas.',
                        'Trabaja con personas que han pasado por otros tratamientos sin éxito.',
                        'Suele acompañar procesos de cambio personal a largo plazo.',
                        'Apoya a quienes enfrentan transiciones difíciles en su vida.',
                        'Acompaña a personas que nunca han ido a terapia.',
                    ]),
                    approachDescription: randomFrom([
                        'Enfoque conversacional y cercano.',
                        'Trabajo estructurado con objetivos claros.',
                        'Avanza de forma gradual, respetando el ritmo personal.',
                        'Combina conversación con herramientas prácticas.',
                        'Escucha activa y acompañamiento sin presiones.',
                    ]),
                    yearsExperience: randomFrom([3, 5, 8, 10, 12, 15]),
                    firstSessionInfo: randomFrom([
                        'Primera sesión de conocimiento disponible',
                        'Primera sesión sin compromiso',
                        null,
                    ]),
                    verificationStatus: VerificationStatus.VERIFIED,
                    verifiedAt: new Date(),
                    subscriptionTier: SubscriptionTier.PRO,
                    isActive: true,
                    isPublic: true,
                    availability: { create: getDefaultAvailability() },
                },
            },
        },
    });

    const userWithProfessional = await prisma.user.findUnique({
        where: { id: user.id },
        include: { professional: true },
    });

    console.log(`  ✓ Created professional: ${data.name}`);
    return userWithProfessional as CreatedUser;
}

async function createPatient(
    data: PatientData,
    hashedPassword: string,
    options?: {
        region?: string;
        comuna?: string;
    }
): Promise<CreatedUser> {
    const region = options?.region || randomFrom(Object.keys(REGIONS_COMUNAS));
    const comuna = options?.comuna || randomFrom(REGIONS_COMUNAS[region]);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            role: UserRole.PATIENT,
            emailVerified: new Date(),
            profileCompleted: true,
            phone: generatePhone(),
            patientProfile: {
                create: {
                    birthDate: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    gender: randomFrom([Gender.MALE, Gender.FEMALE, Gender.NON_BINARY, Gender.PREFER_NOT_SAY]),
                    region,
                    comuna,
                    occupation: randomFrom(['Ingeniero/a', 'Profesor/a', 'Estudiante', 'Diseñador/a', 'Contador/a', 'Médico/a']),
                    occupationStatus: randomFrom([OccupationStatus.EMPLOYED, OccupationStatus.SELF_EMPLOYED, OccupationStatus.STUDENT]),
                    maritalStatus: randomFrom([MaritalStatus.SINGLE, MaritalStatus.IN_RELATIONSHIP, MaritalStatus.MARRIED]),
                    hasChildren: Math.random() > 0.5,
                    healthSystem: randomFrom([HealthSystem.FONASA, HealthSystem.ISAPRE, HealthSystem.PRIVATE]),
                    previousTherapy: Math.random() > 0.3,
                    consultationReason: randomFrom(CONSULTATION_REASONS),
                    interestAreas: randomFromMany(SPECIALTIES, 3),
                    modalityPreference: randomFrom([ModalityPreference.ONLINE, ModalityPreference.IN_PERSON, ModalityPreference.BOTH]),
                    professionalGenderPref: randomFrom([
                        ProfessionalGenderPreference.MALE,
                        ProfessionalGenderPreference.FEMALE,
                        ProfessionalGenderPreference.NO_PREFERENCE,
                    ]),
                    emergencyContact: {
                        create: {
                            name: `Contacto de ${data.name.split(' ')[0]}`,
                            relationship: randomFrom(['FAMILY', 'PARTNER', 'FRIEND']),
                            phone: generatePhone(),
                        },
                    },
                },
            },
        },
    });

    console.log(`  ✓ Created patient: ${data.name}`);
    return user;
}

interface AppointmentInput {
    patientId: string;
    patientName: string | null;
    professionalId: string;
    professionalName: string | null;
    sessionPrice: number;
    sessionDuration: number;
    scheduledAt: Date;
    status: AppointmentStatus;
    modality?: Modality;
}

async function createAppointment(input: AppointmentInput): Promise<void> {
    const modality = input.modality || randomFrom([Modality.ONLINE, Modality.IN_PERSON]);
    const { commission, netAmount } = calculateCommission(input.sessionPrice);

    let paymentStatus: PaymentStatus;
    switch (input.status) {
        case AppointmentStatus.PENDING:
            paymentStatus = PaymentStatus.PENDING;
            break;
        case AppointmentStatus.CANCELLED:
            paymentStatus = PaymentStatus.REFUNDED;
            break;
        case AppointmentStatus.COMPLETED:
            paymentStatus = PaymentStatus.COMPLETED;
            break;
        case AppointmentStatus.NO_SHOW:
            paymentStatus = PaymentStatus.FAILED;
            break;
        default:
            paymentStatus = PaymentStatus.PENDING;
    }

    const isCancelled = input.status === AppointmentStatus.CANCELLED;
    const isPending = input.status === AppointmentStatus.PENDING;

    await prisma.appointment.create({
        data: {
            patientId: input.patientId,
            professionalId: input.professionalId,
            scheduledAt: input.scheduledAt,
            duration: input.sessionDuration,
            modality,
            status: input.status,
            videoLink: modality === Modality.ONLINE
                ? `https://meet.google.com/abc-defg-${generateToken('')}`
                : null,
            consultationReason: randomFrom(CONSULTATION_REASONS),
            cancelledAt: isCancelled ? new Date() : null,
            cancelledBy: isCancelled ? (Math.random() > 0.5 ? input.patientId : input.professionalId) : null,
            cancellationReason: isCancelled
                ? randomFrom(['Imprevisto personal', 'Enfermedad', 'Cambio de horario'])
                : null,
            payment: {
                create: {
                    amount: input.sessionPrice,
                    commission,
                    netAmount,
                    status: paymentStatus,
                    flowToken: generateToken('flow'),
                    flowOrderId: generateToken('order'),
                    paidAt: !isPending && !isCancelled ? input.scheduledAt : null,
                    refundedAt: isCancelled ? new Date() : null,
                },
            },
        },
    });
}

// ==========================================
// DEMO ACCOUNTS WITH COMPREHENSIVE DATA
// ==========================================

async function createDemoPatient(hashedPassword: string): Promise<CreatedUser> {
    const user = await prisma.user.create({
        data: {
            email: 'paciente@demo.com',
            name: 'Paciente Demo',
            password: hashedPassword,
            role: UserRole.PATIENT,
            emailVerified: new Date(),
            profileCompleted: true,
            phone: '+56 9 1234 5678',
            patientProfile: {
                create: {
                    birthDate: new Date(1990, 5, 15),
                    gender: Gender.FEMALE,
                    region: 'Región Metropolitana',
                    comuna: 'Providencia',
                    occupation: 'Ingeniera de Software',
                    occupationStatus: OccupationStatus.EMPLOYED,
                    maritalStatus: MaritalStatus.SINGLE,
                    hasChildren: false,
                    healthSystem: HealthSystem.ISAPRE,
                    previousTherapy: true,
                    consultationReason: 'Buscando herramientas para manejar el estrés laboral y encontrar mayor equilibrio.',
                    interestAreas: ['Estrés laboral', 'Manejo de emociones', 'Desarrollo personal'],
                    modalityPreference: ModalityPreference.BOTH,
                    professionalGenderPref: ProfessionalGenderPreference.NO_PREFERENCE,
                },
            },
        },
    });

    console.log('  ✓ Created demo patient: paciente@demo.com');
    return user;
}

async function createDemoProfessional(hashedPassword: string): Promise<CreatedUser> {
    const user = await prisma.user.create({
        data: {
            email: 'profesional@demo.com',
            name: 'Ps. Demo Profesional',
            password: hashedPassword,
            role: UserRole.PROFESSIONAL,
            emailVerified: new Date(),
            profileCompleted: true,
            phone: '+56 9 8765 4321',
            professional: {
                create: {
                    professionalType: ProfessionalType.PSYCHOLOGIST,
                    licenseNumber: '123456',
                    bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual. Más de 8 años de experiencia trabajando con adultos.',
                    slug: 'ps-demo-profesional',
                    specialties: ['Ansiedad', 'Depresión', 'Estrés laboral', 'Autoestima'],
                    modality: Modality.BOTH,
                    sessionPrice: 45000,
                    sessionDuration: 50,
                    region: 'Región Metropolitana',
                    comuna: 'Providencia',
                    officeAddress: 'Av. Providencia 2000, Oficina 301',
                    acceptedPaymentMethods: ['FONASA', 'ISAPRE', 'PARTICULAR'],
                    linkedinUrl: 'https://www.linkedin.com/in/demo-profesional/',
                    verificationStatus: VerificationStatus.VERIFIED,
                    verifiedAt: new Date(),
                    subscriptionTier: SubscriptionTier.PRO,
                    isActive: true,
                    isPublic: true,
                    availability: { create: getDefaultAvailability() },
                },
            },
        },
    });

    const userWithProfessional = await prisma.user.findUnique({
        where: { id: user.id },
        include: { professional: true },
    });

    console.log('  ✓ Created demo professional: profesional@demo.com');
    return userWithProfessional as CreatedUser;
}

async function createComprehensiveTestData(
    demoPatient: CreatedUser,
    demoProfessional: CreatedUser,
    professionals: CreatedUser[],
    patients: CreatedUser[]
): Promise<void> {
    console.log('\n📅 Creating comprehensive appointment data...');

    // ==========================================
    // DEMO PATIENT'S APPOINTMENTS
    // With their assigned professional (demoProfessional)
    // ==========================================

    if (!demoProfessional.professional) return;

    console.log('  📌 Demo Patient appointments...');

    // PAST COMPLETED SESSIONS (6 sessions over the last 2 months)
    const pastSessionDates = [-56, -42, -28, -21, -14, -7]; // Days ago
    for (const daysAgo of pastSessionDates) {
        await createAppointment({
            patientId: demoPatient.id,
            patientName: demoPatient.name,
            professionalId: demoProfessional.professional.id,
            professionalName: demoProfessional.name,
            sessionPrice: demoProfessional.professional.sessionPrice,
            sessionDuration: demoProfessional.professional.sessionDuration,
            scheduledAt: createDateTime(daysAgo, 10),
            status: AppointmentStatus.COMPLETED,
            modality: Modality.ONLINE,
        });
        console.log(`    ✓ Completed session ${Math.abs(daysAgo)} days ago`);
    }

    // LAST SESSION (yesterday)
    await createAppointment({
        patientId: demoPatient.id,
        patientName: demoPatient.name,
        professionalId: demoProfessional.professional.id,
        professionalName: demoProfessional.name,
        sessionPrice: demoProfessional.professional.sessionPrice,
        sessionDuration: demoProfessional.professional.sessionDuration,
        scheduledAt: createDateTime(-1, 15),
        status: AppointmentStatus.COMPLETED,
        modality: Modality.ONLINE,
    });
    console.log('    ✓ Last session (yesterday)');

    // NEXT SESSION (in 3 days)
    await createAppointment({
        patientId: demoPatient.id,
        patientName: demoPatient.name,
        professionalId: demoProfessional.professional.id,
        professionalName: demoProfessional.name,
        sessionPrice: demoProfessional.professional.sessionPrice,
        sessionDuration: demoProfessional.professional.sessionDuration,
        scheduledAt: createDateTime(3, 10),
        status: AppointmentStatus.CONFIRMED,
        modality: Modality.ONLINE,
    });
    console.log('    ✓ Next session (in 3 days)');

    // FUTURE SCHEDULED SESSION (in 10 days)
    await createAppointment({
        patientId: demoPatient.id,
        patientName: demoPatient.name,
        professionalId: demoProfessional.professional.id,
        professionalName: demoProfessional.name,
        sessionPrice: demoProfessional.professional.sessionPrice,
        sessionDuration: demoProfessional.professional.sessionDuration,
        scheduledAt: createDateTime(10, 10),
        status: AppointmentStatus.CONFIRMED,
        modality: Modality.IN_PERSON,
    });
    console.log('    ✓ Future session (in 10 days)');

    // ONE CANCELLED SESSION
    await createAppointment({
        patientId: demoPatient.id,
        patientName: demoPatient.name,
        professionalId: demoProfessional.professional.id,
        professionalName: demoProfessional.name,
        sessionPrice: demoProfessional.professional.sessionPrice,
        sessionDuration: demoProfessional.professional.sessionDuration,
        scheduledAt: createDateTime(-35, 11),
        status: AppointmentStatus.CANCELLED,
        modality: Modality.ONLINE,
    });
    console.log('    ✓ One cancelled session');

    // ==========================================
    // DEMO PATIENT WITH OTHER PROFESSIONALS
    // (Previous therapists for continuity testing)
    // ==========================================

    console.log('  📌 Demo Patient with previous professionals...');

    // Session with a different professional (3 months ago)
    const prevProf = professionals[0];
    if (prevProf?.professional) {
        await createAppointment({
            patientId: demoPatient.id,
            patientName: demoPatient.name,
            professionalId: prevProf.professional.id,
            professionalName: prevProf.name,
            sessionPrice: prevProf.professional.sessionPrice,
            sessionDuration: prevProf.professional.sessionDuration,
            scheduledAt: createDateTime(-90, 14),
            status: AppointmentStatus.COMPLETED,
            modality: Modality.IN_PERSON,
        });
        console.log(`    ✓ Previous professional: ${prevProf.name}`);
    }

    // ==========================================
    // DEMO PROFESSIONAL'S PATIENTS
    // ==========================================

    console.log('  📌 Demo Professional patient roster...');

    // Create appointments for each patient with demo professional
    for (let i = 0; i < patients.length; i++) {
        const patient = patients[i];

        // Past sessions (2-4 sessions per patient)
        const numPastSessions = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numPastSessions; j++) {
            const daysAgo = 7 + (j * 7) + Math.floor(Math.random() * 3);
            await createAppointment({
                patientId: patient.id,
                patientName: patient.name,
                professionalId: demoProfessional.professional.id,
                professionalName: demoProfessional.name,
                sessionPrice: demoProfessional.professional.sessionPrice,
                sessionDuration: demoProfessional.professional.sessionDuration,
                scheduledAt: createDateTime(-daysAgo, 9 + i),
                status: AppointmentStatus.COMPLETED,
            });
        }

        // Some patients have upcoming appointments
        if (i < 4) {
            await createAppointment({
                patientId: patient.id,
                patientName: patient.name,
                professionalId: demoProfessional.professional.id,
                professionalName: demoProfessional.name,
                sessionPrice: demoProfessional.professional.sessionPrice,
                sessionDuration: demoProfessional.professional.sessionDuration,
                scheduledAt: createDateTime(1 + i, 9 + i),
                status: AppointmentStatus.CONFIRMED,
            });
            console.log(`    ✓ ${patient.name}: past sessions + upcoming`);
        } else {
            console.log(`    ✓ ${patient.name}: past sessions only`);
        }
    }

    // One pending appointment (waiting for confirmation)
    const pendingPatient = patients[5];
    if (pendingPatient) {
        await createAppointment({
            patientId: pendingPatient.id,
            patientName: pendingPatient.name,
            professionalId: demoProfessional.professional.id,
            professionalName: demoProfessional.name,
            sessionPrice: demoProfessional.professional.sessionPrice,
            sessionDuration: demoProfessional.professional.sessionDuration,
            scheduledAt: createDateTime(5, 16),
            status: AppointmentStatus.PENDING,
        });
        console.log(`    ✓ Pending appointment: ${pendingPatient.name}`);
    }

    // ==========================================
    // TODAY'S APPOINTMENTS FOR DEMO PROFESSIONAL
    // ==========================================

    console.log('  📌 Today\'s schedule for Demo Professional...');

    // 3 appointments today
    const todayPatients = patients.slice(0, 3);
    const todayHours = [9, 11, 15];
    for (let i = 0; i < todayPatients.length; i++) {
        await createAppointment({
            patientId: todayPatients[i].id,
            patientName: todayPatients[i].name,
            professionalId: demoProfessional.professional.id,
            professionalName: demoProfessional.name,
            sessionPrice: demoProfessional.professional.sessionPrice,
            sessionDuration: demoProfessional.professional.sessionDuration,
            scheduledAt: createDateTime(0, todayHours[i]),
            status: AppointmentStatus.CONFIRMED,
        });
        console.log(`    ✓ Today at ${todayHours[i]}:00 - ${todayPatients[i].name}`);
    }
}

// ==========================================
// MAIN FUNCTION
// ==========================================

async function main(): Promise<void> {
    console.log('🌱 Starting comprehensive seed...\n');

    await clearDatabase();

    const hashedPassword = await bcrypt.hash(SEED_CONFIG.password, SEED_CONFIG.saltRounds);

    // Create professionals
    console.log('\n👨‍⚕️ Creating professionals...');
    const professionals: CreatedUser[] = [];
    // Agregar profesional fijo para pruebas
    // Crear profesional con id fijo '6' para sincronizar con el mock
    const andresVasquez = await prisma.user.create({
        data: {
            id: '6',
            email: 'andres.vasquez@test.com',
            name: 'Dr. Andrés Vásquez Navarro',
            password: hashedPassword,
            role: UserRole.PROFESSIONAL,
            emailVerified: new Date(),
            profileCompleted: true,
            phone: generatePhone(),
            professional: {
                create: {
                    professionalType: ProfessionalType.PSYCHIATRIST,
                    licenseNumber: generateLicenseNumber(),
                    bio: 'Psiquiatra con amplia experiencia en el tratamiento de trastornos de ansiedad, depresión y trastornos del sueño. Ofrezco atención integral con enfoque biopsicosocial.',
                    slug: 'dr-andres-vasquez-navarro',
                    specialties: ['Psiquiatría Adulto', 'Ansiedad', 'Depresión'],
                    modality: Modality.BOTH,
                    sessionPrice: 40000,
                    sessionDuration: 50,
                    region: 'Valparaíso',
                    comuna: 'Viña del Mar',
                    officeAddress: 'Clínica Reñaca, Viña del Mar',
                    acceptedPaymentMethods: ['PARTICULAR', 'ISAPRE', 'FONASA'],
                    targetAudience: 'Adultos que buscan atención psiquiátrica integral.',
                    approachDescription: 'Enfoque biopsicosocial y personalizado.',
                    yearsExperience: 18,
                    firstSessionInfo: 'Primera sesión de evaluación psiquiátrica.',
                    verificationStatus: VerificationStatus.VERIFIED,
                    verifiedAt: new Date(),
                    subscriptionTier: SubscriptionTier.PRO,
                    isActive: true,
                    isPublic: true,
                    availability: { create: getDefaultAvailability() },
                },
            },
        },
    });
    professionals.push(andresVasquez);
    // Resto de profesionales
    for (const profData of PROFESSIONAL_NAMES) {
        const prof = await createProfessional(profData, hashedPassword);
        professionals.push(prof);
    }

    // Create patients
    console.log('\n👤 Creating patients...');
    const patients: CreatedUser[] = [];
    for (const patData of PATIENT_NAMES) {
        const patient = await createPatient(patData, hashedPassword);
        patients.push(patient);
    }

    // Create demo accounts
    console.log('\n🎁 Creating demo accounts...');
    const demoPatient = await createDemoPatient(hashedPassword);
    const demoProfessional = await createDemoProfessional(hashedPassword);

    // Create comprehensive test data
    await createComprehensiveTestData(demoPatient, demoProfessional, professionals, patients);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📋 Demo accounts (password: Test1234!):');
    console.log('   Patient:      paciente@demo.com');
    console.log('   Professional: profesional@demo.com');
    console.log('\n📊 Data summary:');
    console.log('   - 5 verified professionals');
    console.log('   - 8 patients with profiles');
    console.log('   - Demo patient: 10+ sessions (past & future)');
    console.log('   - Demo professional: 8 active patients');
    console.log('   - Today: 3 scheduled appointments');
    console.log('   - Includes: completed, confirmed, pending, cancelled');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
