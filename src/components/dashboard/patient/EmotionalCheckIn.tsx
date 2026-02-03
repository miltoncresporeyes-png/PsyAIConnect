'use client'

import { useState } from 'react'

export function EmotionalCheckIn() {
    const [selected, setSelected] = useState<string | null>(null)

    const options = [
        { id: 'bad', label: 'Mal', emoji: '😔' },
        { id: 'regular', label: 'Regular', emoji: '😐' },
        { id: 'good', label: 'Bien', emoji: '🙂' },
        { id: 'very-good', label: 'Muy bien', emoji: '😊' },
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            {!selected ? (
                <>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">¿Cómo te sientes hoy?</h3>
                    <p className="text-xs text-gray-400 mb-3">No tienes que sentirte bien para estar aquí.</p>
                    <div className="grid grid-cols-4 gap-2">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelected(option.id)}
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                            >
                                <span className="text-xl mb-1">{option.emoji}</span>
                                <span className="text-[10px] text-gray-500">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-2">
                    <p className="text-sm text-gray-600 mb-1">Gracias por compartirlo.</p>
                    <p className="text-xs text-gray-400">No hay respuestas correctas.</p>
                    <button
                        onClick={() => setSelected(null)}
                        className="text-xs text-primary-600 mt-2 hover:underline"
                    >
                        Cambiar
                    </button>
                </div>
            )}
        </div>
    )
}
