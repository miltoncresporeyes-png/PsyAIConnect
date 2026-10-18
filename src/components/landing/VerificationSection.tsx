'use client'

import { ShieldCheck, FileText, UserCheck, Eye } from 'lucide-react'

const CHECKS = [
  {
    icon: FileText,
    title: 'Validación de Título e Identidad',
    description:
      'Para registrarse se exige cédula de identidad y título profesional legalizado expedido por una universidad reconocida en Chile.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    icon: Eye,
    title: 'Registro Superintendencia de Salud',
    description:
      'Verificamos que cada profesional esté habilitado en el Registro Nacional de Prestadores Individuales de la Superintendencia de Salud.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
  {
    icon: UserCheck,
    title: 'Aprobación o rechazo con motivo',
    description:
      'Ningún perfil se publica de forma automática. Si la documentación está incompleta o no corresponde, la solicitud se rechaza con explicación.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: 'Datos protegidos',
    description:
      'Los documentos y datos personales se tratan conforme a la Ley 19.628 de Protección de Datos Personales.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
]

export function VerificationSection() {
  return (
    <section
      className="py-14 md:py-18 bg-slate-50 border-y border-slate-100"
      aria-labelledby="verification-heading"
    >
      <div className="container-wide">
        <header className="max-w-2xl mx-auto text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 font-semibold text-sm rounded-full mb-4 uppercase tracking-wide">
            Confianza y transparencia
          </span>
          <h2 id="verification-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ¿Cómo se revisan los perfiles profesionales?
          </h2>
          <p className="text-gray-600">
            Antes de que un profesional pueda atender en PsyDoctor, su solicitud pasa por revisión de
            documentación e identidad a cargo de nuestro equipo. Este es el proceso completo:
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHECKS.map((check) => {
            const Icon = check.icon
            return (
              <div
                key={check.title}
                className={`flex flex-col gap-3 rounded-2xl border ${check.border} ${check.bg} p-5`}
              >
                <div className={`w-10 h-10 rounded-lg ${check.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${check.color}`} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{check.title}</h3>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">{check.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          La revisión de documentos <strong>no sustituye</strong> la verificación de colegiatura ni de
          antecedentes, que depende de cada profesional y de sus gremios. Ante dudas sobre un perfil, escríbenos a{' '}
          <a href="mailto:confianza@psydoctor.cl" className="text-teal-600 font-medium hover:underline">
            confianza@psydoctor.cl
          </a>
        </p>
      </div>
    </section>
  )
}
