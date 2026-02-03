'use client'

import { Calendar, CheckCircle2, FileText, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface Session {
    id: string
    date: Date
    professional: string
    notes?: string
    completed: boolean
}

interface MiCaminoTimelineProps {
    sessions: Session[]
    startDate: Date
}

export function MiCaminoTimeline({ sessions, startDate }: MiCaminoTimelineProps) {
    const [showAllSessions, setShowAllSessions] = useState(false)

    const completedSessions = sessions.filter(s => s.completed)
    const displaySessions = showAllSessions ? completedSessions : completedSessions.slice(0, 5)
    const totalDuration = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    const adherenceRate = sessions.length > 0
        ? Math.round((completedSessions.length / sessions.length) * 100)
        : 0

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6 md:p-8 border border-purple-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h2 className="text-2xl font-heading font-bold text-gray-900">Mi Camino</h2>
                    </div>
                    <p className="text-sm text-gray-600">Tu progreso terapéutico visualizado</p>
                </div>

                {/* Stats Summary */}
                <div className="hidden md:flex gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">{completedSessions.length}</div>
                        <div className="text-xs text-gray-600">Sesiones</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-700">{totalDuration}</div>
                        <div className="text-xs text-gray-600">Semanas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-teal-700">{adherenceRate}%</div>
                        <div className="text-xs text-gray-600">Asistencia</div>
                    </div>
                </div>
            </div>

            {/* Mobile Stats */}
            <div className="md:hidden grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-purple-700">{completedSessions.length}</div>
                    <div className="text-xs text-gray-600">Sesiones</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-indigo-700">{totalDuration}</div>
                    <div className="text-xs text-gray-600">Semanas</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-teal-700">{adherenceRate}%</div>
                    <div className="text-xs text-gray-600">Asistencia</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Progreso general</span>
                    <span className="text-purple-700 font-semibold">{adherenceRate}% de adherencia</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-purple-200">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 rounded-full"
                        style={{ width: `${adherenceRate}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    {adherenceRate >= 80
                        ? "¡Excelente compromiso con tu proceso! 🎉"
                        : "Cada sesión es un paso adelante. Sigue así 💪"}
                </p>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-purple-200" />

                <div className="space-y-6">
                    {displaySessions.map((session, index) => {
                        const isFirst = index === 0
                        const isLast = index === displaySessions.length - 1

                        return (
                            <div key={session.id} className="relative flex gap-4 md:gap-6">
                                {/* Timeline Dot */}
                                <div className={`relative z-10 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isFirst
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 ring-4 ring-purple-100'
                                        : 'bg-white border-2 border-purple-300'
                                    }`}>
                                    {isFirst ? (
                                        <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                                    ) : (
                                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-purple-400" />
                                    )}
                                </div>

                                {/* Session Card */}
                                <div className={`flex-1 bg-white rounded-2xl p-4 md:p-5 shadow-sm border ${isFirst ? 'border-purple-200 shadow-md' : 'border-gray-200'
                                    }`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {session.date.toLocaleDateString('es-CL', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">{session.professional}</p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                            Completada
                                        </span>
                                    </div>

                                    {session.notes && (
                                        <div className="mt-3 flex items-start gap-2 bg-purple-50 rounded-lg p-3">
                                            <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {session.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Show More Button */}
                {completedSessions.length > 5 && !showAllSessions && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowAllSessions(true)}
                            className="text-purple-700 hover:text-purple-800 font-medium text-sm hover:underline transition-colors"
                        >
                            Ver todas las sesiones ({completedSessions.length})
                        </button>
                    </div>
                )}

                {/* Collapse Button */}
                {showAllSessions && completedSessions.length > 5 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowAllSessions(false)}
                            className="text-gray-600 hover:text-gray-800 font-medium text-sm hover:underline transition-colors"
                        >
                            Ver menos
                        </button>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {completedSessions.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu camino comienza aquí</h3>
                    <p className="text-sm text-gray-600 max-w-sm mx-auto">
                        Una vez completes tu primera sesión, verás tu progreso visualizado en este espacio.
                    </p>
                </div>
            )}
        </div>
    )
}

// Example usage with mock data
export function MiCaminoTimelineExample() {
    const mockSessions: Session[] = [
        {
            id: '1',
            date: new Date('2025-12-05'),
            professional: 'Dra. Fernanda Lagos',
            notes: 'Trabajamos técnicas de respiración para manejar ansiedad anticipatoria. Me sentí escuchada y comprendida.',
            completed: true,
        },
        {
            id: '2',
            date: new Date('2025-12-12'),
            professional: 'Dra. Fernanda Lagos',
            notes: 'Exploramos gatillos específicos. Tarea asignada: diario de emociones.',
            completed: true,
        },
        {
            id: '3',
            date: new Date('2025-12-19'),
            professional: 'Dra. Fernanda Lagos',
            notes: 'Revisamos el diario de emociones. Identifiqué patrones importantes.',
            completed: true,
        },
        {
            id: '4',
            date: new Date('2025-12-26'),
            professional: 'Dra. Fernanda Lagos',
            completed: false,
        },
        {
            id: '5',
            date: new Date('2026-01-02'),
            professional: 'Dra. Fernanda Lagos',
            notes: 'Sesión muy productiva sobre autocompasión. Me siento con más herramientas.',
            completed: true,
        },
    ]

    return <MiCaminoTimeline sessions={mockSessions} startDate={new Date('2025-12-05')} />
}
