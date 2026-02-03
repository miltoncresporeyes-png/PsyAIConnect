'use client'

import { Calendar, Clock, User, Activity } from 'lucide-react'

interface MetricsCardsProps {
    totalSessions: number
    lastSessionDate?: string
    nextSessionDate?: string
    professionalName?: string
    professionalType?: string
}

export function MetricsCards({
    totalSessions,
    lastSessionDate,
    nextSessionDate,
    professionalName,
    professionalType
}: MetricsCardsProps) {
    // Format next session to be more compact
    const formatNextSession = (date?: string) => {
        if (!date) return 'No agendada'
        // Shorten the date format
        return date
            .replace(', ', ' ')
            .replace(' p. m.', '')
            .replace(' a. m.', '')
            .replace(':00', 'h')
    }

    // Format professional name to be compact
    const formatProfessional = (name?: string) => {
        if (!name) return 'Sin asignar'
        // If name is too long, shorten it
        if (name.length > 18) {
            const parts = name.split(' ')
            if (parts.length >= 2) {
                return `${parts[0]} ${parts[1].charAt(0)}.`
            }
        }
        return name
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Sesiones totales */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sesiones</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
                <p className="text-xs text-gray-400">realizadas</p>
            </div>

            {/* Última sesión */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última sesión</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                    {lastSessionDate || 'Sin registro'}
                </p>
            </div>

            {/* Próxima sesión */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Próxima sesión</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 whitespace-nowrap" title={nextSessionDate}>
                    {formatNextSession(nextSessionDate)}
                </p>
            </div>

            {/* Profesional actual */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-secondary-50 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-secondary-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profesional</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 whitespace-nowrap" title={professionalName}>
                    {formatProfessional(professionalName)}
                </p>
                {professionalType && (
                    <p className="text-xs text-gray-400">{professionalType}</p>
                )}
            </div>
        </div>
    )
}
