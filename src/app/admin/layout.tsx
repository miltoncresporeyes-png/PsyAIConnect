'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    LogOut,
    Menu,
    X,
    Bell,
    AlertCircle,
    Sparkles,
    Video,
    CalendarDays,
    CreditCard,
    Activity,
    ScrollText,
    LifeBuoy,
    Wallet,
    Star,
} from 'lucide-react'

interface MenuItem {
    href: string
    label: string
    icon: typeof LayoutDashboard
    alert?: boolean
}

const menuGroups: { title: string; items: MenuItem[] }[] = [
    { title: 'Resumen', items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        title: 'Personas',
        items: [
            { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
            { href: '/admin/validacion-medicos', label: 'Validación Médicos', icon: Stethoscope, alert: true },
            { href: '/admin/fundadores', label: 'Postulaciones Fundadores', icon: Sparkles, alert: true },
        ],
    },
    {
        title: 'Operación',
        items: [
            { href: '/admin/citas', label: 'Citas', icon: CalendarDays },
            { href: '/admin/salas', label: 'Salas de video', icon: Video },
            { href: '/admin/opiniones', label: 'Opiniones', icon: Star, alert: true },
            { href: '/admin/tickets', label: 'Tickets de soporte', icon: LifeBuoy, alert: true },
        ],
    },
    {
        title: 'Negocio',
        items: [
            { href: '/admin/suscripciones', label: 'Suscripciones', icon: CreditCard },
            { href: '/admin/medios-de-pago', label: 'Medios de pago', icon: Wallet },
        ],
    },
    {
        title: 'Sistema',
        items: [
            { href: '/admin/sistema', label: 'Salud del sistema', icon: Activity },
            { href: '/admin/auditoria', label: 'Auditoría', icon: ScrollText },
        ],
    },
]
const menuItems = menuGroups.flatMap((g) => g.items)

interface PendingCount {
    pendingProfessionals: number
    pendingFounders?: number
    newTickets?: number
    pendingReviews?: number
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

    // Menu movil: se cierra con Escape
    useEffect(() => {
        if (!sidebarOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [sidebarOpen])

    if (status === 'loading') {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        return null
    }

    const currentItem = menuItems.find((item) =>
        item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(item.href + '/')
    )
    const totalPending =
        (pendingCount.pendingProfessionals || 0) + (pendingCount.pendingFounders || 0) + (pendingCount.newTickets || 0) + (pendingCount.pendingReviews || 0)

    return (
        // Armazon de aplicacion: ocupa exactamente la ventana (dvh), sin scroll en el documento.
        // La barra lateral y el contenido tienen su propio scroll, asi todo cabe en el espacio de trabajo.
        <div className="flex h-dvh w-full overflow-hidden bg-gray-100">
            <meta name="robots" content="noindex, nofollow" />

            {/* Barra lateral: cajon en celular/tablet, columna fija desde lg */}
            <aside
                aria-label="Navegación de administración"
                className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 max-w-[85vw] shrink-0 flex-col bg-slate-900 text-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-700 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
                    <h1 className="truncate text-xl font-bold">PsyDoctor Admin</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú"
                        className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-800 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="pb-2">
                            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                {group.title}
                            </p>
                            {group.items.map((item) => {
                                const Icon = item.icon
                                const isActive =
                                    item.href === '/admin'
                                        ? pathname === '/admin'
                                        : pathname === item.href || pathname.startsWith(item.href + '/')
                                const badgeCount =
                                    item.href === '/admin/fundadores'
                                        ? (pendingCount.pendingFounders || 0)
                                        : item.href === '/admin/tickets'
                                          ? (pendingCount.newTickets || 0)
                                          : item.href === '/admin/opiniones'
                                            ? (pendingCount.pendingReviews || 0)
                                            : (pendingCount.pendingProfessionals || 0)
                                const showAlert = item.alert && badgeCount > 0

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={isActive ? 'page' : undefined}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                                            isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden />
                                            <span className="truncate text-sm">{item.label}</span>
                                        </div>
                                        {showAlert && (
                                            <span className="ml-2 flex-shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                                {badgeCount}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-slate-700 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium">
                            {session.user.name?.[0] || 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{session.user.name}</p>
                            <p className="truncate text-xs text-slate-400">{session.user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Columna principal: encabezado fijo + area de contenido con scroll propio */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="z-30 shrink-0 border-b border-gray-200 bg-white pt-[env(safe-area-inset-top)] shadow-sm">
                    <div className="flex items-center gap-1 px-2 py-1 sm:px-4 lg:px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Abrir menú"
                            aria-expanded={sidebarOpen}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <p className="min-w-0 flex-1 truncate px-1 text-sm font-semibold text-slate-700">
                            {currentItem?.label ?? 'Panel de administración'}
                        </p>

                        <Link
                            href="/admin"
                            aria-label={totalPending > 0 ? `Pendientes: ${totalPending}` : 'Sin pendientes'}
                            className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-gray-100"
                        >
                            <Bell className="h-5 w-5 text-gray-600" />
                            {totalPending > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white">
                                    {totalPending > 99 ? '99+' : totalPending}
                                </span>
                            )}
                        </Link>
                    </div>
                </header>

                <main
                    id="admin-main"
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
                >
                    {/* Ancho maximo en pantallas muy grandes, centrado; margenes segun el tamano */}
                    <div className="mx-auto w-full max-w-[1600px] min-w-0 p-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-5 lg:p-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Fondo del menu movil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden
                />
            )}
        </div>
    )
}
