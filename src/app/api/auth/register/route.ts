import { NextResponse } from 'next/server'

/**
 * Ruta retirada.
 *
 * Creaba cuentas con contraseña sin verificar el correo, lo que permitía saltar
 * el código de verificación y fijar la contraseña de un correo ajeno antes de
 * que su dueño se registrara. El registro se hace ahora solo por
 * /api/auth/verify-code (enviar, verificar y completar).
 */
export async function POST() {
    return NextResponse.json(
        { error: 'Este método de registro ya no está disponible. Usa el registro con código de verificación.' },
        { status: 410 }
    )
}
