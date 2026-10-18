'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Settings,
  Heart,
  MessageSquare,
  Lock,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface DesktopDashboardSidebarProps {
  isProfessional: boolean
  hasPendingAppointments?: boolean
  userName?: string | null
  userEmail?: string | null
}

export function DesktopDashboardSidebar({
  isProfessional,
  hasPendingAppointments,
  userName,
  userEmail,
}: DesktopDashboardSidebarProps) {
  const pathname = usePathname()

  interface SidebarItem {
    label: string
    href: string
    icon: any
    badge?: boolean
  }

  const professionalItems: SidebarItem[] = [
    { label: 'Hoy', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Agenda', href: '/dashboard/disponibilidad', icon: Calendar },
    { label: 'Pacientes', href: '/dashboard/pacientes', icon: Users, badge: hasPendingAppointments },
    { label: 'Ingresos', href: '/dashboard/reportes', icon: DollarSign },
    { label: 'Mi perfil', href: '/dashboard/perfil', icon: UserCheck },
    { label: 'Verificación', href: '/dashboard/perfil#verificacion', icon: ShieldCheck },
    { label: 'Ajustes', href: '/dashboard/cuenta', icon: Settings },
  ]

  const patientItems: SidebarItem[] = [
    { label: 'Inicio', href: '/dashboard', icon: Heart },
    { label: 'Mis citas', href: '/dashboard/citas', icon: Calendar },
    { label: 'Mi profesional', href: '/dashboard/profesional-asignado', icon: Users },
    { label: 'Pagos y boletas', href: '/dashboard/pagos', icon: DollarSign },
    { label: 'Mensajes', href: '/dashboard/mensajes', icon: MessageSquare },
    { label: 'Privacidad y consentimientos', href: '/dashboard/privacidad', icon: Lock },
    { label: 'Mi cuenta', href: '/dashboard/cuenta', icon: Settings },
  ]

  const items = isProfessional ? professionalItems : patientItems

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="mb-6 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-800 truncate">{userName || 'Mi Cuenta'}</p>
        <p className="text-[11px] text-slate-500 truncate">{userEmail || ''}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
          {isProfessional ? 'Panel Profesional' : 'Panel de Paciente'}
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-800 stroke-[2.2]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-700" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
