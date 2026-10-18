'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Settings,
  Heart,
  MessageSquare,
  FileCheck2,
  Lock,
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

  // Menú profesional según especificación: Hoy, Agenda, Pacientes, Ingresos, Mi perfil, Verificación, Ajustes
  const professionalItems: NavItem[] = [
    { label: 'Hoy', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Agenda', href: '/dashboard/disponibilidad', icon: Calendar },
    { label: 'Pacientes', href: '/dashboard/pacientes', icon: Users, badge: hasPendingAppointments },
    { label: 'Ingresos', href: '/dashboard/reportes', icon: DollarSign },
    { label: 'Mi perfil', href: '/dashboard/perfil', icon: UserCheck },
    { label: 'Ajustes', href: '/dashboard/cuenta', icon: Settings },
  ]

  // Menú paciente según especificación: Inicio, Mis citas, Mi profesional, Pagos, Mensajes, Privacidad, Mi cuenta
  const patientItems: NavItem[] = [
    { label: 'Inicio', href: '/dashboard', icon: Heart },
    { label: 'Mis citas', href: '/dashboard/citas', icon: Calendar },
    { label: 'Profesional', href: '/dashboard/profesional-asignado', icon: Users },
    { label: 'Pagos', href: '/dashboard/pagos', icon: DollarSign },
    { label: 'Mensajes', href: '/dashboard/mensajes', icon: MessageSquare },
    { label: 'Privacidad', href: '/dashboard/privacidad', icon: Lock },
    { label: 'Mi cuenta', href: '/dashboard/cuenta', icon: Settings },
  ]

  const items = isProfessional ? professionalItems : patientItems

  return (
    <nav
      aria-label="Navegación móvil del panel"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] md:hidden overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center justify-around min-w-full">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-200 shrink-0 ${
                isActive
                  ? 'text-teal-900 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4.5 w-4.5 transition-transform ${isActive ? 'stroke-[2.5] text-teal-800' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-4 rounded-full bg-teal-800" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
