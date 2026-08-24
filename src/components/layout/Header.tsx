'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, LayoutDashboard, UserCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Logo } from './Logo'

export function Header() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const t = useTranslations('nav')

    const isLoggedIn = status === 'authenticated' && session?.user

    const navigation = [
        { name: t('patient'),      href: '/registro?tipo=paciente' },
        { name: t('professional'), href: '/registro?tipo=profesional' },
        { name: t('howItWorks'),   href: '/#como-funciona' },
    ]

    return (
        <>
            {/* ── Top utility bar ─────────────────────────────────────────────── */}
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

            {/* ── Main navigation ─────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/96 backdrop-blur-xl shadow-sm shadow-slate-900/[0.04]">
                <nav className="container-wide">
                    <div className="flex h-[62px] items-center justify-between gap-4">

                        {/* Logo */}
                        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                            <Logo variant="icon" size={32} className="transition-transform duration-300 group-hover:scale-105" />
                            <span className="font-heading text-[17px] font-semibold tracking-tight text-slate-900">
                                Psy<span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Doctor</span>
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-0.5">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/buscar"
                                className="ml-1.5 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:bg-teal-50"
                            >
                                {t('trySearch')}
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center gap-2">
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        aria-expanded={isUserMenuOpen}
                                        className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:shadow-sm"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-teal-100">
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
                                        {session.user.name?.split(' ')[0] || 'Usuario'}
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-900/10">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                                {t('dashboard')}
                                            </Link>
                                            <Link
                                                href="/dashboard/perfil"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <UserCircle className="h-4 w-4 text-slate-400" />
                                                {t('myProfile')}
                                            </Link>
                                            <div className="my-1 border-t border-slate-100" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                <LogOut className="h-4 w-4 text-slate-400" />
                                                {t('logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href="/registro"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-200 hover:-translate-y-px hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
                                    >
                                        {t('startNow')}
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile: lang + hamburger */}
                        <div className="flex items-center gap-2 md:hidden">
                            <Suspense fallback={null}>
                                <LanguageSwitcher compact />
                            </Suspense>
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
                        <div className="border-t border-slate-100 pb-5 pt-3 md:hidden">
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
                                <Link
                                    href="/buscar"
                                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('trySearch')}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
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
            </header>
        </>
    )
}
