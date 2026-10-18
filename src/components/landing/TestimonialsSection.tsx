'use client'

import { Tag, Receipt, Video, Compass, ShieldCheck, Award } from 'lucide-react'

const BENEFITS = [
  {
    icon: Tag,
    title: 'Precios visibles antes de reservar',
    description:
      'Cada perfil público muestra el valor de la sesión y la modalidad. Compara y decide sin pedir cotizaciones.',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
  },
  {
    icon: Receipt,
    title: 'Boleta electrónica para tu reembolso',
    description:
      'Al completar la sesión recibes una boleta electrónica que puedes adjuntar a tu solicitud de reembolso en Isapre o Fonasa.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-100',
  },
  {
    icon: Video,
    title: 'Videollamada desde el navegador',
    description:
      'La sesión online se abre desde el navegador, con sala de espera y prueba de cámara y micrófono antes de entrar.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    icon: Compass,
    title: 'Orientación para encontrar tu profesional',
    description:
      'Un cuestionario breve te sugiere especialidad, modalidad y presupuesto antes de que empieces a buscar.',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 bg-white" aria-labelledby="benefits-heading">
      <div className="container-wide">
        <header className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 font-semibold text-sm rounded-full mb-4 uppercase tracking-wide">
            Transparencia
          </span>
          <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Qué puedes esperar de la plataforma
          </h2>
          <p className="text-lg text-gray-600">
            Todo lo que necesitas para agendar con información completa: precios, cobertura, documentos y
            tecnología de sesión en un solo lugar.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${benefit.bg} flex items-center justify-center mb-4`}
                  aria-hidden="true"
                >
                  <Icon className={`w-5 h-5 ${benefit.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <span>Solicitudes de profesional revisadas manualmente</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <span>Datos protegidos bajo Ley 19.628</span>
          </div>
        </div>
      </div>
    </section>
  )
}
