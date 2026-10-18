import { MetadataRoute } from 'next'

const BASE_URL = 'https://psydoctor.cl'

/**
 * Las áreas privadas se bloquean aquí Y se declaran `noindex` en su metadata
 * (bloquear en robots.txt sin noindex deja que Google indexe el título/URL).
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/dashboard/',
                    '/login',
                    '/registro',
                    '/verificar-codigo',
                    '/verificar-email',
                    '/restablecer-contrasena',
                    '/olvide-contrasena',
                    '/completar-perfil',
                    '/profesional/completar-perfil',
                    '/cita/',
                    '/pago/',
                    '/emitir-boleta',
                    '/403',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    }
}