import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight, ShieldCheck, UserCheck, Calendar, Search } from 'lucide-react'

interface PatientChecklistProps {
  hasProfile: boolean
  hasConsents: boolean
  hasProfessional: boolean
  hasBookedSession: boolean
}

export default function PatientOnboardingChecklist({
  hasProfile,
  hasConsents,
  hasProfessional,
  hasBookedSession,
}: PatientChecklistProps) {
  const items = [
    {
      id: 'profile',
      title: 'Completar mi perfil',
      description: 'Datos básicos de contacto para tu atención',
      done: hasProfile,
      href: '/dashboard/cuenta',
      actionLabel: 'Completar perfil',
      icon: UserCheck,
    },
    {
      id: 'consents',
      title: 'Revisar y aceptar consentimientos',
      description: 'Términos de servicio y política de privacidad',
      done: hasConsents,
      href: '/dashboard/privacidad',
      actionLabel: 'Revisar consentimientos',
      icon: ShieldCheck,
    },
    {
      id: 'find',
      title: 'Encontrar un profesional',
      description: 'Inscritos en el Registro de la Superintendencia de Salud',
      done: hasProfessional,
      href: '/buscar',
      actionLabel: 'Explorar profesionales',
      icon: Search,
    },
    {
      id: 'book',
      title: 'Reservar mi primera sesión',
      description: 'Elige el día y la hora que mejor te acomode',
      done: hasBookedSession,
      href: '/buscar',
      actionLabel: 'Reservar sesión',
      icon: Calendar,
    },
  ]

  const completedCount = items.filter((i) => i.done).length
  const progressPercent = Math.round((completedCount / items.length) * 100)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Tu inicio en PsyDoctor
          </h3>
          <p className="text-xs text-slate-500">
            Pasos sencillos para comenzar tu acompañamiento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-teal-800">{progressPercent}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                item.done
                  ? 'bg-slate-50/60 border-slate-200 text-slate-600'
                  : 'bg-white border-teal-100/90 hover:border-teal-300 shadow-xs'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="mt-0.5 sm:mt-0">
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {idx + 1}. {item.title}
                    </span>
                    {item.done && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-medium">
                        Listo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                </div>
              </div>

              {!item.done && (
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white transition self-start sm:self-auto shadow-xs shrink-0"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
