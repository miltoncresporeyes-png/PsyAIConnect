'use client'

import { useState } from 'react'
import { Receipt, Calculator, ChevronDown, ChevronUp, ShieldCheck, CreditCard } from 'lucide-react'

const PREVISIONS = [
  {
    id: 'fonasa',
    label: 'Fonasa',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '🏥',
    how: 'En Fonasa la bonificación aplica mediante compra de bono MLE con profesionales en convenio. En consulta particular, el profesional emite boleta para eventuales seguros complementarios.',
    example: {
      sessionPrice: '$35.000',
      bonificacion: 'Bono MLE según convenio',
      tuPago: 'Copago según convenio',
    },
  },
  {
    id: 'isapre',
    label: 'Isapre',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    icon: '🏦',
    how: 'Con Isapre puedes usar el sistema de reembolso. Presentas la boleta electrónica y recibes el porcentaje según tu plan. Generalmente entre 50% y 90% del valor bonificado.',
    example: {
      sessionPrice: '$40.000',
      bonificacion: 'Hasta 70%',
      tuPago: '$12.000 aprox.',
    },
  },
]

function ReimbursementExample({ prevision }: { prevision: typeof PREVISIONS[0] }) {
  return (
    <div className={`mt-4 rounded-xl ${prevision.bg} border ${prevision.border} p-4`}>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
        Ejemplo para una sesión de ${prevision.example.sessionPrice}
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Precio sesión</p>
          <p className="font-bold text-gray-900 text-sm">{prevision.example.sessionPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Bonificación</p>
          <p className="font-bold text-emerald-600 text-sm">{prevision.example.bonificacion}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Tú pagas</p>
          <p className="font-bold text-teal-700 text-sm">{prevision.example.tuPago}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        *Estimación referencial. Los porcentajes exactos dependen de tu plan de salud y el profesional. Todos los profesionales de PsyDoctor emiten boleta electrónica oficial para reembolso.
      </p>
    </div>
  )
}

export function PricingGuidanceSection() {
  const [openPrevision, setOpenPrevision] = useState<string | null>('fonasa')

  return (
    <section
      className="py-16 md:py-20 bg-white"
      aria-labelledby="pricing-heading"
    >
      <div className="container-wide">
        <header className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 font-semibold text-sm rounded-full mb-4 uppercase tracking-wide">
            Precios claros y reembolsos fáciles
          </span>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Cuánto cuesta y cuánto te devuelven?
          </h2>
          <p className="text-lg text-gray-600">
            Los precios los ves antes de agendar. Sin sorpresas. Y todos nuestros profesionales emiten boleta electrónica para que reclames el reembolso que te corresponde.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            {
              icon: Receipt,
              title: 'Desde $25.000 por sesión',
              description:
                'Los precios los define cada profesional y los ves en su perfil antes de agendar. Sin costos ocultos ni cobros adicionales.',
              color: 'text-teal-600',
              bg: 'bg-teal-50',
            },
            {
              icon: Calculator,
              title: 'Usa Fonasa o Isapre',
              description:
                'Todos los profesionales emiten boleta electrónica. Puedes bonificar con Fonasa o solicitar reembolso a tu Isapre.',
              color: 'text-cyan-600',
              bg: 'bg-cyan-50',
            },
            {
              icon: ShieldCheck,
              title: 'Pago seguro en CLP',
              description:
                'Pagas en pesos chilenos con tarjeta, transferencia o los medios que cada profesional ofrezca en su perfil.',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className={`flex flex-col gap-3 rounded-2xl border border-slate-100 ${item.bg} p-6`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            )
          })}
        </div>

        {/* Prevision accordion */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            ¿Cómo funciona con tu previsión?
          </h3>
          <div className="space-y-3">
            {PREVISIONS.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border ${p.border} overflow-hidden`}
              >
                <button
                  onClick={() =>
                    setOpenPrevision(openPrevision === p.id ? null : p.id)
                  }
                  className={`w-full flex items-center justify-between gap-4 ${p.bg} px-5 py-4 text-left`}
                  aria-expanded={openPrevision === p.id}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{p.icon}</span>
                    <span className={`font-semibold ${p.color}`}>{p.label}</span>
                  </div>
                  {openPrevision === p.id ? (
                    <ChevronUp className={`w-4 h-4 ${p.color} flex-shrink-0`} />
                  ) : (
                    <ChevronDown className={`w-4 h-4 ${p.color} flex-shrink-0`} />
                  )}
                </button>

                {openPrevision === p.id && (
                  <div className="bg-white px-5 py-5 border-t border-slate-100">
                    <p className="text-sm text-gray-600 leading-relaxed">{p.how}</p>
                    <ReimbursementExample prevision={p} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            ¿No sabes qué previsión tienes?{` `}
            <a
              href="https://www.fonasa.cl/sites/fonasaudemy/content/inicio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 font-medium hover:underline"
            >
              Revisa tu plan aquí
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
