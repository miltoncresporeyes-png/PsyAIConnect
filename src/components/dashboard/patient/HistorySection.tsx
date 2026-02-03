'use client'

import { FileText, Users, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface HistorySectionProps {
    hasHistory: boolean
}

export function HistorySection({ hasHistory }: HistorySectionProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Mi historial</h3>
            <p className="text-xs text-gray-500 mb-4">
                Tu información organizada y bajo tu control.
            </p>

            <div className="space-y-2">
                <Link
                    href="/dashboard/historial/profesionales"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
                            <Users className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700">Profesionales consultados</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                    href="/dashboard/citas"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
                            <Calendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700">Fechas de atención</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                    href="/dashboard/documentos"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
                            <FileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700">Documentos compartidos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
            </div>

            {!hasHistory && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                    Aún no hay registros en tu historial.
                </p>
            )}
        </div>
    )
}
