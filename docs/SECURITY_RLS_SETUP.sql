-- =====================================================
-- PsyAI - Row Level Security (RLS) Policies
-- PostgreSQL Security Layer
-- =====================================================
-- Ejecutar: psql -d psyai -f setup-rls.sql

-- =====================================================
-- 1. HABILITAR RLS EN TABLAS SENSIBLES
-- =====================================================

-- Tabla de notas clínicas
ALTER TABLE "ClinicalNote" ENABLE ROW LEVEL SECURITY;

-- Tabla de perfiles de pacientes
ALTER TABLE "PatientProfile" ENABLE ROW LEVEL SECURITY;

-- Tabla de citas (contienen información sensible)
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

-- Tabla de consentimientos
ALTER TABLE "ConsentLog" ENABLE ROW LEVEL SECURITY;

-- Tabla de solicitudes de reembolso
ALTER TABLE "ReimbursementRequest" ENABLE ROW LEVEL SECURITY;

-- Tabla de coberturas de pacientes
ALTER TABLE "PatientCoverage" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA ClinicalNote
-- =====================================================

-- Profesional puede ver/editar solo sus propias notas
CREATE POLICY "professional_own_notes" ON "ClinicalNote"
    FOR ALL
    USING (
        "professionalId" IN (
            SELECT p."id" FROM "Professional" p
            JOIN "User" u ON p."userId" = u."id"
            WHERE u."id" = current_setting('app.current_user_id', true)::text
        )
    );

-- Paciente puede ver sus propias notas (solo contenido, no editar)
CREATE POLICY "patient_see_own_notes" ON "ClinicalNote"
    FOR SELECT
    USING (
        "appointmentId" IN (
            SELECT a."id" FROM "Appointment" a
            WHERE a."patientId" = current_setting('app.current_user_id', true)::text
        )
    );

-- =====================================================
-- 3. POLÍTICAS PARA PatientProfile
-- =====================================================

-- Usuario puede ver su propio perfil
CREATE POLICY "user_own_profile" ON "PatientProfile"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text);

-- =====================================================
-- 4. POLÍTICAS PARA Appointment
-- =====================================================

-- Paciente ve solo sus citas
CREATE POLICY "patient_own_appointments" ON "Appointment"
    FOR ALL
    USING ("patientId" = current_setting('app.current_user_id', true)::text);

-- Profesional ve solo sus citas
CREATE POLICY "professional_own_appointments" ON "Appointment"
    FOR ALL
    USING (
        "professionalId" IN (
            SELECT p."id" FROM "Professional" p
            JOIN "User" u ON p."userId" = u."id"
            WHERE u."id" = current_setting('app.current_user_id', true)::text
        )
    );

-- Admin ve todas las citas
CREATE POLICY "admin_all_appointments" ON "Appointment"
    FOR ALL
    USING (
        current_setting('app.current_user_role', true)::text = 'ADMIN'
    );

-- =====================================================
-- 5. POLÍTICAS PARA ConsentLog
-- =====================================================

-- Usuario ve solo sus consentimientos
CREATE POLICY "user_own_consents" ON "ConsentLog"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true)::text);

-- Admin ve todos para auditoría
CREATE POLICY "admin_all_consents" ON "ConsentLog"
    FOR ALL
    USING (
        current_setting('app.current_user_role', true)::text = 'ADMIN'
    );

-- =====================================================
-- 6. POLÍTICAS PARA ReimbursementRequest
-- =====================================================

-- Paciente ve solo sus solicitudes
CREATE POLICY "patient_own_reimbursements" ON "ReimbursementRequest"
    FOR ALL
    USING ("patientId" = current_setting('app.current_user_id', true)::text);

-- Admin ve todas
CREATE POLICY "admin_all_reimbursements" ON "ReimbursementRequest"
    FOR ALL
    USING (
        current_setting('app.current_user_role', true)::text = 'ADMIN'
    );

-- =====================================================
-- 7. POLÍTICAS PARA PatientCoverage
-- =====================================================

-- Usuario ve su propia cobertura
CREATE POLICY "user_own_coverage" ON "PatientCoverage"
    FOR ALL
    USING (
        "patientProfileId" IN (
            SELECT pp."id" FROM "PatientProfile" pp
            WHERE pp."userId" = current_setting('app.current_user_id', true)::text
        )
    );

-- =====================================================
-- 8. CREAR FUNCIÓN HELPER PARA SETTEAR USER CONTEXT
-- =====================================================

CREATE OR REPLACE FUNCTION set_user_context(user_id TEXT, user_role TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, false);
    PERFORM set_config('app.current_user_role', user_role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. CREAR ROLES DE BASE DE DATOS (para aplicación)
-- =====================================================

-- Rol para conexión desde la app (usará RLS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD 'change_this_password_in_production';
    END IF;
END
$$;

-- Dar permisos a app_user
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =====================================================
-- 10. VERIFICACIÓN
-- =====================================================

-- Listar políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Probar contexto (desde psql)
-- SELECT set_user_context('user-id-here', 'PATIENT');
-- SELECT * FROM "ClinicalNote"; -- debería devolver solo notas del usuario
