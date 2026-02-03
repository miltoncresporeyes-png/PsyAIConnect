'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, Shield, MessageCircle, CheckCircle2, Users } from 'lucide-react'

const trustIndicators = [
    { icon: Heart, text: 'Profesionales verificados' },
    { icon: Shield, text: 'Privacidad garantizada' },
    { icon: MessageCircle, text: 'Primera cita sin compromiso' },
    { icon: CheckCircle2, text: '100% confidencial' },
]

export function HeroSection() {
    return (
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
            {/* Soft decorative shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative container-wide py-4 md:py-6 lg:py-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left column: Copy */}
                    <div className="max-w-xl">
                        {/* Warm badge - more specific */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-200 mb-4">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-sm font-medium text-primary-700">Salud mental en Chile</span>
                        </div>

                        {/* Main headline - empathetic */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight mb-4 text-gray-900 text-balance">
                            Mereces sentirte bien.
                            <span className="block text-primary-600 mt-2 whitespace-nowrap">Y no tienes que hacerlo solo.</span>
                        </h1>

                        {/* Subheadline - direct benefits */}
                        <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                            <strong className="text-gray-900">Encuentra al profesional correcto en 3 minutos</strong> y mantén tu historial en un solo lugar.
                            <span className="block mt-2">Sin juicios, a tu ritmo, cuando lo necesites.</span>
                        </p>

                        {/* Trust indicators - visible above CTAs */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            {trustIndicators.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-100 shadow-sm">
                                    <item.icon className="w-4 h-4 text-primary-500" />
                                    <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                                </div>
                            ))}
                            {/* Isapre/Fonasa badge - Chilean pain point #1 */}
                            <div className="flex items-center gap-2 bg-teal-50/80 backdrop-blur-sm px-3 py-2 rounded-full border border-teal-200 shadow-sm">
                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-teal-700 font-medium">Reembolso Isapre/Fonasa</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4">
                            <Link href="/registro?tipo=paciente" className="btn-primary group">
                                Encontrar mi profesional
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="#como-funciona" className="btn-outline">
                                Ver cómo te ayudamos
                            </Link>
                        </div>
                    </div>

                    {/* Right column: Illustration */}
                    <div className="hidden lg:flex justify-center items-center">
                        <div className="relative">
                            {/* Main illustration with subtle breathing animation */}
                            <div className="relative w-[450px] h-[450px] animate-breathe">
                                <Image
                                    src="/images/hero-illustration.png"
                                    alt="Encuentra tu paz interior"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {/* Floating testimonial card - repositioned */}
                            <div className="absolute bottom-16 -left-12 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 max-w-[220px] animate-float">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                                        MR
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">María R.</p>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    &ldquo;Por fin me siento escuchada. Mi psicóloga es increíble.&rdquo;
                                </p>
                            </div>

                            {/* Stats card with icon */}
                            <div className="absolute -top-2 right-0 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-float-delayed">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary-600">+500</p>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            <p className="text-xs text-gray-500">Profesionales verificados</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom animation styles */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 4s ease-in-out infinite;
                    animation-delay: 1.5s;
                }
                .animate-breathe {
                    animation: breathe 6s ease-in-out infinite;
                }
            `}</style>
        </section>
    )
}
