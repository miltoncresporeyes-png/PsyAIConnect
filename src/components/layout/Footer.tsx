'use client'

import Link from 'next/link'
import { PaymentMethods } from '@/components/ui/PaymentMethods'
import { useTranslations } from 'next-intl'
import { Logo } from './Logo'

export function Footer() {
    const t = useTranslations('footer')

    const footerLinks = {
        producto: [
            { name: t('findPro'), href: '/buscar' },
            { name: t('joinPro'), href: '/registro?tipo=profesional' },
            { name: t('pricing'), href: '/planes' },
        ],
        recursos: [
            { name: t('orientation'), href: '/orientador' },
            { name: t('forProfessionals'), href: '/profesionales' },
            { name: t('faqLink'), href: '/faq' },
            { name: t('howItWorksLink'), href: '/#como-funciona' },
        ],
        legal: [
            { name: t('terms'), href: '/terminos' },
            { name: t('privacy'), href: '/privacidad' },
        ],
    }

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-white/5">
            <div className="container-wide py-10 md:py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">
                    {/* Brand */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Logo variant="icon" size={32} />
                            <span className="font-heading font-semibold text-xl text-white">PsyDoctor</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            {t('tagline')}
                        </p>
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} PsyDoctor SpA. {t('rights')}
                        </p>
                    </div>

                    {/* Producto */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('product')}</h4>
                        <ul className="space-y-3">
                            {footerLinks.producto.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recursos */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('resources')}</h4>
                        <ul className="space-y-3">
                            {footerLinks.recursos.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('legal')}</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Payment Methods */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-1">
                        <PaymentMethods />
                    </div>
                </div>

                {/* Legal Disclaimer */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center max-w-3xl mx-auto">
                        {t('disclaimerPrefix')}{' '}
                        <strong className="text-gray-400">600 360 7777</strong>
                        {t('disclaimerSuffix')}
                    </p>
                </div>
            </div>
        </footer>
    )
}
