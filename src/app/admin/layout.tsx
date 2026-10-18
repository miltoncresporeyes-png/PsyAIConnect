'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    DollarSign,
    LogOut,
    Menu,
    X,
    Bell,
    AlertCircle
} from 'lucide-react'

const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/validacion-medicos', label: 'Validación Médicos', icon: Stethoscope, alert: true },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/admin/finanzas', label: 'Finanzas', icon: DollarSign },
]

interface PendingCount {
    pendingProfessionals: number
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [pendingCount, setPendingCount] = useState<PendingCount>({ pendingProfessionals: 0 })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/403')
        }
    }, [status, session, router])

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const response = await fetch('/api/admin/pending-count')
                if (response.ok) {
                    const data = await response.json()
                    setPendingCount(data)
                }
            } catch (error) {
                console.error('Error fetching pending count:', error)
            }
        }
        fetchPendingCount()
    }, [])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100 sidebar-layout">
            <meta name="robots" content="noindex, nofollow" />
            
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h1 className="text-xl font-bold truncate">PsyAI Admin</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 hover:bg-slate-800 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            const showAlert = item.alert && pendingCount.pendingProfessionals > 0

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors truncate ${
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </div>
                                    {showAlert && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse flex-shrink-0 ml-2">
                                            {pendingCount.pendingProfessionals}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {session.user.name?.[0] || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session.user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content min-w-0">
                <header className="main-content-header">
                    <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex-1 lg:flex-none"></div>

                        <div className="flex items-center gap-3">
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                <Bell className="w-5 h-5 text-gray-600" />
                                {pendingCount.pendingProfessionals > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="main-content-body">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}