'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader, ListContainer, ListItem } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import {
    Loader2, FileText, Calendar, Clock, ChevronRight,
    Lock
} from 'lucide-react'

interface Patient {
    id: string
    name: string
    email: string
    image: string | null
    appointmentCount: number
    lastAppointment?: string
}

export default function PacientesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [patients, setPatients] = useState<Patient[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchPatients()
        }
    }, [status, router])

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/profesional/pacientes')
            if (response.ok) {
                const data = await response.json()
                setPatients(data)
            }
        } catch {
            console.error('Error fetching patients')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    )

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <>
            <Header />

            <PageContainer variant="dashboard" size="medium">
                {/* Back to Dashboard */}
                <BackToDashboard />

                <PageHeader
                    title="Mis pacientes"
                    description="Historial y notas clínicas de tus pacientes"
                    actions={
                        <div className="max-w-md w-full">
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    }
                />

                {/* Patients List */}
                {filteredPatients.length === 0 ? (
                    <div className="dashboard-panel p-10 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay pacientes aún
                        </h3>
                        <p className="text-gray-600">
                            Aquí aparecerán los pacientes que hayan tenido citas contigo.
                        </p>
                    </div>
                ) : (
                    <ListContainer divided>
                        {filteredPatients.map(patient => (
                            <ListItem
                                key={patient.id}
                                action={<ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                            >
                                <Link href={`/dashboard/pacientes/${patient.id}`} className="flex w-full items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                        {patient.image ? (
                                            <Image
                                                src={patient.image}
                                                alt={patient.name}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-primary-600">
                                                {patient.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {patient.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                {patient.appointmentCount} sesiones
                                            </span>
                                            {patient.lastAppointment && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                                    Última: {new Date(patient.lastAppointment).toLocaleDateString('es-CL')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </ListItem>
                        ))}
                    </ListContainer>
                )}

                {/* Info box */}
                <div className="mt-6 p-4 bg-blue-50 rounded-[22px] text-sm text-blue-700 flex items-start gap-3 border border-blue-100">
                    <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                        Las notas clínicas están cifradas con AES-256. Solo tú puedes acceder a ellas.
                        Los pacientes pueden solicitar una copia de sus datos en cualquier momento.
                    </p>
                </div>
            </PageContainer>

            <Footer />
        </>
    )
}