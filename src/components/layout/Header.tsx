'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, LayoutDashboard, UserCircle } from 'lucide-react'

const navigation = [
    { name: 'Buscar Profesional', href: '/registro?tipo=paciente' },
    { name: 'Soy Profesional', href: '/registro?tipo=profesional' },
    { name: 'Cómo Funciona', href: '/#como-funciona' },
]

export function Header() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    const isLoggedIn = status === 'authenticated' && session?.user

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <nav className="container-wide">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="font-heading font-semibold text-xl text-gray-900">
                            PsyConnect
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons / User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden relative">
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt=""
                                                width={32}
                                                height={32}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="w-4 h-4 text-primary-600" />
                                        )}
                                    </div>
                                    <span className="text-gray-700 font-medium">
                                        {session.user.name?.split(' ')[0] || 'Usuario'}
                                    </span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard/perfil"
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <UserCircle className="w-4 h-4" />
                                            Mi Perfil
                                        </Link>
                                        <div className="border-t border-gray-100 my-1" />
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="btn-ghost">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/registro" className="btn-primary btn-sm">
                                    Comenzar Gratis
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col gap-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="btn-ghost text-center"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard/perfil"
                                            className="btn-ghost text-center"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Mi Perfil
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="btn-secondary text-center"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="btn-ghost text-center">
                                            Iniciar Sesión
                                        </Link>
                                        <Link href="/registro" className="btn-primary text-center">
                                            Comenzar Gratis
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
