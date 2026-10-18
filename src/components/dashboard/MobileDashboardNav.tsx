'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Calendar,
    Users,
    Clock,
    FileText,
    Settings,
    HeartPulse
} from 'lucide-react'

interface NavItem {
    label: string
    href: string
    icon: any
    badge?: boolean
}

interface MobileDashboardNavProps {
    isProfessional: boolean
    hasPendingAppointments?: boolean
}

export function MobileDashboardNav({ isProfessional, hasPendingAppointments }: MobileDashboardNavProps) {
    const pathname = usePathname()

    const professionalItems: NavItem[] = [
        { label: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Citas', href: '/dashboard/citas', icon: Calendar, badge: hasPendingAppointments },
        { label: 'Pacientes', href: '/dashboard/pacientes', icon: Users },
        { label: 'Horarios', href: '/dashboard/disponibilidad', icon: Clock },
        { label: 'Cuenta', href: '/dashboard/cuenta', icon: Settings },
    ]

    const patientItems: NavItem[] = [
        { label: 'Resumen', href: '/dashboard', icon: HeartPulse },
        { label: 'Mis Citas', href: '/dashboard/citas', icon: Calendar },
        { label: 'Ficha', href: '/dashboard/documentos', icon: FileText },
        { label: 'Buscar', href: '/buscar', icon: Users },
        { label: 'Mi Cuenta', href: '/dashboard/cuenta', icon: Settings },
    ]

    const items: NavItem[] = isProfessional ? professionalItems : patientItems

    return (
        <nav
            aria-label="Navegación móvil del panel"
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] md:hidden"
        >
            <div className="flex items-center justify-around max-w-lg mx-auto">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'text-teal-800 font-bold scale-105'
                                    : 'text-slate-500 hover:text-slate-800 font-medium'
                            }`}
                        >
                            <div className="relative">
                                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                                )}
                            </div>
                            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                                {item.label}
                            </span>
                            {isActive && (
                                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-teal-800" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
