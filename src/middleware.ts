import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/profesional/completar-perfil',
    '/reservar',
    '/cita',
]

// Routes that require ADMIN role
const adminRoutes = ['/admin']

// Routes that require PROFESSIONAL role
const professionalRoutes = [
    '/dashboard/pacientes',
    '/dashboard/disponibilidad',
    '/dashboard/estadisticas',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get token from JWT
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    const isAdminRoute = adminRoutes.some(route =>
        pathname.startsWith(route)
    )

    const isProfessionalRoute = professionalRoutes.some(route =>
        pathname.startsWith(route)
    )

    // Redirect to login if not authenticated
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Check admin access
    if (isAdminRoute && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check professional access
    if (isProfessionalRoute && token?.role !== 'PROFESSIONAL') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add security headers
    const response = NextResponse.next()

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    )

    // CSP header (adjust as needed for production)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: https: blob:; " +
            "connect-src 'self' https:; " +
            "frame-ancestors 'none';"
        )
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
}
