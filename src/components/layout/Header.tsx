'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, LayoutDashboard, UserCircle, ArrowRight } from 'lucide-react'
import { Logo } from './Logo'
import { CrisisBanner } from './CrisisBanner'
import { PatientWaitlistModal } from '@/components/waitlist/PatientWaitlistModal'
import { ImmediateHelpModal } from '@/components/dashboard/ImmediateHelpModal'

export function Header() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)

    const isLoggedIn = status === 'authenticated' && session?.user

    const navigation = [
        { name: 'Cómo funciona', href: '/#como-funciona' },
        { name: 'Para profesionales', href: '/profesionales' },
        { name: 'Planes', href: '/planes' },
    ]

    return (
        <header className="sticky top-0 z-50 w-full shadow-sm shadow-slate-900/[0.04]">
            {/* ── Emergency banner ── */}
            <CrisisBanner />

            {/* ── Main navigation ── */}
            <div className="border-b border-slate-200/60 bg-white/96 backdrop-blur-xl">
                <nav className="container-wide w-full max-w-full">
                    <div className="flex h-[62px] items-center justify-between gap-4 w-full max-w-full min-w-0">

                        {/* Logo */}
                        <Link href="/" className="group flex shrink-0 items-center gap-2.5 py-1">
                            <div className="relative flex items-center justify-center rounded-xl p-0.5 transition-transform duration-200 group-hover:scale-105">
                                <Logo variant="icon" size={38} className="transition-transform duration-200" />
                            </div>
                            <span className="font-heading text-lg sm:text-[20px] font-bold tracking-tight text-slate-900 inline">
                                Psy<span className="text-teal-800">Doctor</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop CTA: Iniciar sesión + Ayuda Inmediata + único botón principal 'Avísame cuando abran' */}
                        <div className="hidden lg:flex items-center gap-2 shrink-0">
                            <ImmediateHelpModal />
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
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/dashboard/perfil"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <UserCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                Mi Perfil
                                            </Link>
                                            <div className="my-1 border-t border-slate-100" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                <LogOut className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 whitespace-nowrap"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setIsWaitlistModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-900 whitespace-nowrap cursor-pointer"
                                    >
                                        Avísame cuando abran
                                        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger & Immediate Help */}
                        <div className="flex items-center gap-2 lg:hidden shrink-0">
                            <ImmediateHelpModal />
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

                    {/* ── Mobile drawer ── */}
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
                            </div>

                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Iniciar sesión
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                setIsWaitlistModalOpen(true)
                                            }}
                                            className="rounded-xl bg-teal-800 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-900"
                                        >
                                            Avísame cuando abran
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            <PatientWaitlistModal
                isOpen={isWaitlistModalOpen}
                onClose={() => setIsWaitlistModalOpen(false)}
            />
        </header>
    )
}