'use client'

import { useState, useEffect } from 'react'
import { Header, Footer } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, User, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Professional {
    id: string
    slug: string
    professionalType: string
    user: {
        name: string | null
        image: string | null
    }
}

interface Appointment {
    id: string
    status: string
    scheduledAt: string
    professional: Professional
}

export default function ProfessionalsHistoryPage() {
    const [loading, setLoading] = useState(true)
    const [professionals, setProfessionals] = useState<(Professional & { lastSeen: Date })[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/citas')
                if (!res.ok) throw new Error('Error fetching appointments')

                const appointments: Appointment[] = await res.json()

                // Filter completed and process unique professionals
                const completed = appointments.filter(a => a.status === 'COMPLETED' || new Date(a.scheduledAt) < new Date())

                const profMap = new Map<string, Professional & { lastSeen: Date }>()

                completed.forEach(apt => {
                    const profId = apt.professional.id
                    const date = new Date(apt.scheduledAt)

                    if (!profMap.has(profId)) {
                        profMap.set(profId, {
                            ...apt.professional,
                            lastSeen: date
                        })
                    } else {
                        const current = profMap.get(profId)!
                        if (date > current.lastSeen) {
                            profMap.set(profId, { ...current, lastSeen: date })
                        }
                    }
                })

                setProfessionals(Array.from(profMap.values()))
            } catch (error) {
                console.error('Error loading history:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide max-w-5xl mx-auto px-4">
                    <div className="mb-8">
                        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary-600 mb-2 inline-block">
                            ← Volver al Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Profesionales Consultados</h1>
                        <p className="text-gray-600">Historial de profesionales con los que te has atendido</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : professionals.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Aún no hay historial</h3>
                            <p className="text-gray-500 mb-6">Cuando completes tus primeras sesiones, los profesionales aparecerán aquí.</p>
                            <Link href="/buscar">
                                <Button>Buscar Profesional</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {professionals.map((prof) => (
                                <div key={prof.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
                                            {prof.user.image ? (
                                                <Image
                                                    src={prof.user.image}
                                                    alt={prof.user.name || 'Profesional'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-xl">
                                                    {(prof.user.name || 'P')[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">{prof.user.name}</h3>
                                            <p className="text-sm text-gray-500 mb-1">{prof.professionalType.replace('_', ' ')}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Última vez: {prof.lastSeen.toLocaleDateString('es-CL')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-50">
                                        <Link href={`/reservar/${prof.slug}`} className="w-full">
                                            <Button className="w-full gap-2" size="sm">
                                                Reservar Nuevo Turno
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/profesional/${prof.slug}`} className="w-full">
                                            <Button variant="outline" className="w-full gap-2" size="sm">
                                                Ver Perfil
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
