/**
 * Temporary endpoint to create ReimbursementRequest table
 * POST /api/admin/create-reimbursement-table
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        // Create ReimbursementRequest table using raw SQL
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "ReimbursementRequest" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "patientId" TEXT NOT NULL,
                "month" INTEGER NOT NULL,
                "year" INTEGER NOT NULL,
                "totalAmount" INTEGER NOT NULL,
                "estimatedReimbursement" INTEGER NOT NULL,
                "healthSystem" TEXT NOT NULL,
                "isapreId" TEXT,
                "hasMedicalReferral" BOOLEAN NOT NULL DEFAULT false,
                "notes" TEXT,
                "status" TEXT NOT NULL DEFAULT 'DRAFT',
                "kitPdfUrl" TEXT,
                "submittedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE,
                FOREIGN KEY ("isapreId") REFERENCES "Isapre"("id") ON DELETE SET NULL
            );
        `)

        // Add reimbursementRequestId column to Appointment table if it doesn't exist
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Appointment" 
            ADD COLUMN IF NOT EXISTS "reimbursementRequestId" TEXT;
        `)

        // Add foreign key constraint
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'Appointment_reimbursementRequestId_fkey'
                ) THEN
                    ALTER TABLE "Appointment"
                    ADD CONSTRAINT "Appointment_reimbursementRequestId_fkey"
                    FOREIGN KEY ("reimbursementRequestId") 
                    REFERENCES "ReimbursementRequest"("id") 
                    ON DELETE SET NULL;
                END IF;
            END $$;
        `)

        return NextResponse.json({
            success: true,
            message: 'Tabla ReimbursementRequest creada exitosamente'
        })
    } catch (error) {
        console.error('Error creating table:', error)
        return NextResponse.json(
            { error: 'Error al crear tabla', details: String(error) },
            { status: 500 }
        )
    }
}
