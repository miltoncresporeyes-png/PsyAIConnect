'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PaymentMethods } from '@/components/ui/PaymentMethods'
import { Logo } from './Logo'
import { useBetaWaitlist } from '@/lib/hooks/useBetaWaitlist'

export function Footer() {
    const { message, handleSubmit, email, setEmail, isSubmitting } = useBetaWaitlist()

    const footerLinks = {
        producto: [
            { name: 'Buscar Profesional', href: '/buscar' },
            { name: 'Unirme como Profesional Fundador', href: '/registro?tipo=profesional' },
            { name: 'Planes', href: '/planes' },
        ],
        recursos: [
            { name: 'Orientador de bienestar', href: '/orientador' },
            { name: 'Para profesionales', href: '/profesionales' },
            { name: 'Preguntas Frecuentes', href: '/faq' },
            { name: 'Cómo Funciona', href: '/#como-funciona' },
        ],
        legal: [
            { name: 'Términos de Uso', href: '/terminos' },
            { name: 'Política de Privacidad', href: '/privacidad' },
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
                            Conectamos pacientes con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud.
                        </p>
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} PsyDoctor SpA. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Producto */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Producto</h4>
                        <ul className="space-y-3">
                            {footerLinks.producto.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recursos */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Recursos</h4>
                        <ul className="space-y-3">
                            {footerLinks.recursos.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & Payment Methods */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold text-white mb-2 text-sm">Novedades y bienestar</h4>
                            <p className="text-xs text-gray-400 mb-3">Recibe orientación y artículos sobre salud mental sin spam.</p>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.cl"
                                    required
                                    className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-teal-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-teal-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Suscribirme'}
                                </button>
                                {message && (
                                    <p className={`text-[11px] mt-1 ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {message.text}
                                    </p>
                                )}
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-800">
                            <PaymentMethods />
                        </div>
                    </div>
                </div>

                {/* Legal Disclaimer */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center max-w-3xl mx-auto">
                        PsyDoctor SpA es una plataforma de intermediación tecnológica, no un prestador de servicios de salud. Los profesionales son independientes y responsables de su práctica. En caso de emergencia, llama al{' '}
                        <strong className="text-gray-400">600 360 7777</strong> (Salud Responde, 24/7) o acude a urgencias.
                    </p>
                </div>
            </div>
        </footer>
    )
}
