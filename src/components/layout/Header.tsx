'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, LayoutDashboard, UserCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Logo } from './Logo'
import { CrisisBanner } from './CrisisBanner'

export function Header() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const t = useTranslations('nav')

    const isLoggedIn = status === 'authenticated' && session?.user
    const isWaitlist = process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true'

    const navigation = isWaitlist
        ? [
              { name: 'Lista de Espera', href: '/#lista-espera' },
              { name: 'Programa Fundadores', href: '/#fundadores' },
              { name: 'Cómo funciona', href: '/#como-funciona' },
              { name: 'Preguntas frecuentes', href: '/#faq' },
          ]
        : [
              { name: 'Buscar Profesional', href: '/buscar' },
              { name: 'Soy Profesional (Fundadores)', href: '/profesionales' },
              { name: t('planes'),       href: '/planes' },
              { name: t('howItWorks'),   href: '/#como-funciona' },
          ]

    return (
        <header className="sticky top-0 z-50 w-full shadow-sm shadow-slate-900/[0.04]">
            {/* ── Emergency banner ────────────────────────────────────────────── */}
            <CrisisBanner />

            {/* ── Top utility bar ─────────────────────────────────────────────── */}
            {!isWaitlist && (
                <div className="hidden md:block bg-teal-950">
                    <div className="container-wide flex h-9 items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-teal-300/80">
                            <Sparkles className="h-3 w-3 text-teal-400" aria-hidden="true" />
                            <span className="font-medium tracking-wide">{t('trustBadge')}</span>
                        </div>
                        <Suspense fallback={null}>
                            <LanguageSwitcher variant="dark" />
                        </Suspense>
                    </div>
                </div>
            )}

            {/* ── Main navigation ─────────────────────────────────────────────── */}
            <div className="border-b border-slate-200/60 bg-white/96 backdrop-blur-xl">
                <nav className="container-wide w-full max-w-full">
                    <div className="flex h-[62px] items-center justify-between gap-4 w-full max-w-full min-w-0">

                        {/* Logo */}
                        <Link href="/" className="group flex shrink-0 items-center gap-3 py-1">
                            <div className="relative flex items-center justify-center rounded-2xl bg-slate-900/5 p-1 transition-all duration-300 group-hover:bg-teal-500/10 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-teal-500/20">
                                <Logo variant="icon" size={42} className="transition-transform duration-300" />
                            </div>
                            <span className="font-heading text-lg sm:text-[21px] font-bold tracking-tight text-slate-950 inline">
                                Psy<span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent">Doctor</span>
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {!isWaitlist && (
                                <Link
                                    href="/buscar"
                                    className="ml-1.5 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:bg-teal-50 whitespace-nowrap"
                                >
                                    {t('trySearch')}
                                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                </Link>
                            )}
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden lg:flex items-center gap-2 shrink-0">
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        aria-expanded={isUserMenuOpen}
                                        className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:shadow-sm whitespace-nowrap"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-teal-100 flex-shrink-0">
                                            {session.user.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt=""
                                                    width={24}
                                                    height={24}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="h-3.5 w-3.5 text-teal-600" />
                                            )}
                                        </div>
                                        <span className="truncate max-w-[120px]">{session.user.name?.split(' ')[0] || 'Usuario'}</span>
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-900/10">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                {t('dashboard')}
                                            </Link>
                                            <Link
                                                href="/dashboard/perfil"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <UserCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                {t('myProfile')}
                                            </Link>
                                            <div className="my-1 border-t border-slate-100" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                <LogOut className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                {t('logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : isWaitlist ? (
                                <Link
                                    href="/#lista-espera"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-200 hover:-translate-y-px hover:bg-teal-500 hover:shadow-lg whitespace-nowrap"
                                >
                                    Unirme a la lista
                                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 whitespace-nowrap"
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href="/registro"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-200 hover:-translate-y-px hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0 whitespace-nowrap"
                                    >
                                        {t('startNow')}
                                        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile: lang + hamburger */}
                        <div className="flex items-center gap-2 lg:hidden shrink-0">
                            {!isWaitlist && (
                                <Suspense fallback={null}>
                                    <LanguageSwitcher compact />
                                </Suspense>
                            )}
                            <button
                                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-expanded={isMenuOpen}
                                aria-label="Abrir menú"
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile drawer ──────────────────────────────────────── */}
                    {isMenuOpen && (
                        <div className="border-t border-slate-100 pb-5 pt-3 lg:hidden">
                            <div className="flex flex-col gap-0.5">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {!isWaitlist && (
                                    <Link
                                        href="/buscar"
                                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t('trySearch')}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t('dashboard')}
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                        >
                                            {t('logout')}
                                        </button>
                                    </>
                                ) : isWaitlist ? (
                                    <Link
                                        href="/#lista-espera"
                                        className="rounded-xl bg-teal-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-teal-600/15 transition-colors hover:bg-teal-500"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Unirme a la lista
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                        >
                                            {t('login')}
                                        </Link>
                                        <Link
                                            href="/registro"
                                            className="rounded-xl bg-teal-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-teal-600/15 transition-colors hover:bg-teal-500"
                                        >
                                            {t('startFree')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}