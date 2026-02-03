'use client'

import { ArrowRight, Calendar, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface PrimaryActionProps {
    hasProfessional: boolean
    professionalName?: string
}

export function PrimaryAction({ hasProfessional, professionalName }: PrimaryActionProps) {
    if (hasProfessional) {
        return (
            <div className="bg-primary-50 rounded-xl border border-primary-100 p-5 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-primary-700 mb-1">Continuar con tu proceso</p>
                        <p className="text-xs text-primary-600/70">
                            Revisa tus próximas sesiones con {professionalName}
                        </p>
                    </div>
                    <Link
                        href="/dashboard/citas"
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        Ver mis sesiones
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-700 mb-1">
                        No tienes un profesional asignado en este momento.
                    </p>
                    <p className="text-xs text-gray-500">
                        Cuando estés listo/a, podemos ayudarte a encontrar apoyo.
                    </p>
                </div>
                <Link
                    href="/buscar"
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Encontrar apoyo
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
