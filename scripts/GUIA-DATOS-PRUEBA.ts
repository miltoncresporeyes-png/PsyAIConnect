/**
 * GUÍA RÁPIDA: Crear datos de prueba para reembolso
 * 
 * Sigue estos pasos en Prisma Studio (http://localhost:5555):
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  GUÍA: Crear datos de prueba para el flujo de reembolso       ║
╚════════════════════════════════════════════════════════════════╝

📋 PASOS A SEGUIR EN PRISMA STUDIO:

1️⃣  Abre Prisma Studio en tu navegador:
    http://localhost:5555

2️⃣  Identifica tu paciente:
    - Ve a la tabla "User"
    - Busca tu usuario paciente (role = PATIENT)
    - Copia su ID

3️⃣  Encuentra un profesional:
    - Ve a la tabla "Professional"
    - Escoge uno activo (isActive = true)
    - Copia su ID

4️⃣  Crea 3 CITAS COMPLETADAS:
    - Ve a la tabla "Appointment"
    - Haz clic en "Add record" (3 veces)
    
    Para cada cita:
    ✅ patientId: [ID del paso 2]
    ✅ professionalId: [ID del paso 3]
    ✅ scheduledAt: Fecha pasada (ej: hace 1 mes)
    ✅ duration: 50
    ✅ modality: ONLINE
    ✅ status: COMPLETED  ⚠️ IMPORTANTE
    ✅ consultationReason: "Sesión de psicoterapia"

5️⃣  Para CADA cita creada, crea su PAGO:
    - Ve a la tabla "Payment"
    - Haz clic en "Add record"
    
    ✅ appointmentId: [ID de la cita]
    ✅ amount: 35000
    ✅ currency: CLP
    ✅ method: CREDIT_CARD
    ✅ status: COMPLETED  ⚠️ IMPORTANTE
    ✅ transactionId: "TEST-[número único]"
    ✅ commission: 3990  (11.4% de 35000)
    ✅ paidAt: [misma fecha que scheduledAt]

6️⃣  Para CADA cita creada, crea su BOLETA (Invoice):
    - Ve a la tabla "Invoice"
    - Haz clic en "Add record"
    
    ✅ appointmentId: [ID de la cita]
    ✅ invoiceNumber: "BH-202501001" (único)
    ✅ issueDate: [misma fecha que scheduledAt]
    ✅ brutAmount: 35000
    ✅ siiRetention: 5337  (15.25% de 35000)
    ✅ netAmount: 25673  (35000 - 5337 - 3990)
    ✅ healthSystem: PRIVATE
    ✅ status: PAID
    ✅ paidAt: [misma fecha que scheduledAt]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERIFICACIÓN:

Después de crear los datos, verifica:
- 3 citas con status = COMPLETED
- 3 pagos con status = COMPLETED
- 3 boletas (invoices) vinculadas

🎯 PRUEBA EL FLUJO:

1. Inicia sesión como el paciente
2. Ve a "Dashboard" → "Solicitar Reembolso"
3. Deberías ver las 3 sesiones disponibles
4. Selecciónalas y genera el kit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TIP: Si ya tienes Prisma Studio abierto, solo refresca la página.
`)
