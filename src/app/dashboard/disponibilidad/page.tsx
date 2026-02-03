'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { Loader2, Save, Clock, Plus, Trash2, ChevronRight } from 'lucide-react'
import { BackToDashboard } from '@/components/ui/BackToDashboard'

const DAYS_OF_WEEK = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
]

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7 // Start at 7:00
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

interface AvailabilitySlot {
    id?: string
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
}

// Helper outside component since it doesn't depend on props/state
const getDefaultSlots = (): AvailabilitySlot[] => {
    // Default: Mon-Fri, 9:00-18:00
    return [1, 2, 3, 4, 5].map(day => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
    }))
}

export default function DisponibilidadPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [slots, setSlots] = useState<AvailabilitySlot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const fetchAvailability = useCallback(async () => {
        try {
            const response = await fetch('/api/profesional/disponibilidad')
            if (response.ok) {
                const data = await response.json()
                setSlots(data.length > 0 ? data : getDefaultSlots())
            } else {
                setSlots(getDefaultSlots())
            }
        } catch (err) {
            setSlots(getDefaultSlots())
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchAvailability()
        }
    }, [status, router, fetchAvailability])

    const addSlot = (dayOfWeek: number) => {
        setSlots(prev => [...prev, {
            dayOfWeek,
            startTime: '09:00',
            endTime: '18:00',
            isActive: true,
        }])
    }

    const removeSlot = (index: number) => {
        setSlots(prev => prev.filter((_, i) => i !== index))
    }

    const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string | boolean | number) => {
        setSlots(prev => prev.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        ))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError('')
        setSuccess(false)

        try {
            const response = await fetch('/api/profesional/disponibilidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slots: slots.filter(s => s.isActive) }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al guardar')
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar')
        } finally {
            setIsSaving(false)
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    // Group slots by day
    const slotsByDay = DAYS_OF_WEEK.map(day => ({
        ...day,
        slots: slots
            .map((slot, index) => ({ ...slot, index }))
            .filter(slot => slot.dayOfWeek === day.value),
    }))

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide">
                    <div className="max-w-3xl mx-auto">
                        {/* Back to Dashboard */}
                        <BackToDashboard />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-heading font-bold text-gray-900">
                                    Mi disponibilidad
                                </h1>
                                <p className="text-gray-600">
                                    Configura los horarios en que puedes atender pacientes
                                </p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Guardar
                            </button>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                ¡Disponibilidad guardada correctamente!
                            </div>
                        )}

                        {/* Schedule Grid */}
                        <div className="space-y-4">
                            {slotsByDay.map(day => (
                                <div key={day.value} className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">{day.label}</h3>
                                        <button
                                            onClick={() => addSlot(day.value)}
                                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar horario
                                        </button>
                                    </div>

                                    {day.slots.length === 0 ? (
                                        <p className="text-gray-500 text-sm">Sin horario definido</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {day.slots.map(slot => (
                                                <div key={slot.index} className="flex items-center gap-4">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.isActive}
                                                            onChange={(e) => updateSlot(slot.index, 'isActive', e.target.checked)}
                                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        />
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                    </label>

                                                    <select
                                                        value={slot.startTime}
                                                        onChange={(e) => updateSlot(slot.index, 'startTime', e.target.value)}
                                                        className="input w-auto py-2"
                                                        disabled={!slot.isActive}
                                                    >
                                                        {TIME_SLOTS.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>

                                                    <span className="text-gray-500">a</span>

                                                    <select
                                                        value={slot.endTime}
                                                        onChange={(e) => updateSlot(slot.index, 'endTime', e.target.value)}
                                                        className="input w-auto py-2"
                                                        disabled={!slot.isActive}
                                                    >
                                                        {TIME_SLOTS.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={() => removeSlot(slot.index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Info */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                            <p>
                                <strong>Tip:</strong> Los pacientes solo podrán agendar en los horarios que definas aquí.
                                Asegúrate de bloquear los horarios que ya tengas ocupados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
