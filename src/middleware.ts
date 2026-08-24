import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const adminRoutes = ['/admin']
const supportedLocales = new Set(['es', 'en', 'fr', 'pt'])

function applySecurityHeaders(response: NextResponse) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    response.headers.set(
        'Permissions-Policy',
        'camera=(self), microphone=(self), geolocation=()'
    )

    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: https: blob:; " +
            "connect-src 'self' https: wss:; " +
            "frame-src 'self' https://www.flow.cl https://sandbox.flow.cl; " +
            "form-action 'self' https://www.flow.cl https://sandbox.flow.cl; " +
            "base-uri 'self'; " +
            "object-src 'none'; " +
            "frame-ancestors 'none';"
        )
    }

    return response
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    console.log(`[Middleware] Incoming request for: ${pathname}`)

    // ── 0. Rewrite locale-prefixed paths to base routes when needed ─────────
    const localeMatch = pathname.match(/^\/(en|fr|pt)(\/.*)?$/)
    if (localeMatch) {
        const locale = localeMatch[1]
        const restPath = localeMatch[2] || '/'
        const shouldStayLocalizedRoute = restPath === '/' || restPath.startsWith('/debug')

        if (!shouldStayLocalizedRoute) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = restPath
            console.log(`[Middleware] Section 0: Redirecting from ${pathname} to ${redirectUrl.pathname}`)

            const redirectResponse = NextResponse.redirect(redirectUrl)
            redirectResponse.cookies.set('NEXT_LOCALE', locale, { path: '/' })
            return applySecurityHeaders(redirectResponse)
        }
    }

    // ── 1. Admin auth guard (before i18n processing) ─────────────
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            console.log(`[Middleware] Admin Guard: Redirecting to login: ${loginUrl.toString()}`)
            return NextResponse.redirect(loginUrl)
        }

        if (token.role !== 'ADMIN') {
            console.log(`[Middleware] Admin Guard: Redirecting to 403`)
            return NextResponse.redirect(new URL('/403', request.url))
        }
    }

    // ── 2. i18n locale detection solo en rutas localizadas ────────
    const isLocalizedRoot = pathname === '/' || /^\/(es|en|fr|pt)(\/|$)/.test(pathname)
    const isLocalizedDebug = /^\/(es|en|fr|pt)\/debug(\/|$)/.test(pathname)

    if (isLocalizedRoot || isLocalizedDebug) {
        const response = intlMiddleware(request)
        console.log(`[Middleware] Section 2 response: status=${response.status}, location=${response.headers.get('location')}, x-middleware-rewrite=${response.headers.get('x-middleware-rewrite')}`)
        const locationHeader = response.headers.get('location')
        if (locationHeader) {
            console.log(`[Middleware] Section 2: intlMiddleware redirecting to ${locationHeader}`)
        } else {
            console.log(`[Middleware] Section 2: intlMiddleware processing route without redirect`)
        }
        return applySecurityHeaders(response)
    }

    const requestHeaders = new Headers(request.headers)
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value

    if (cookieLocale && supportedLocales.has(cookieLocale)) {
        requestHeaders.set('x-next-intl-locale', cookieLocale)
    }

    const passthrough = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    console.log(`[Middleware] Passthrough for: ${pathname}`)
    return applySecurityHeaders(passthrough)
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
}
