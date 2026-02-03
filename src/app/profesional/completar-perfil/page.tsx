'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Save, User, Briefcase, DollarSign, MapPin, FileText, ChevronRight, Linkedin } from 'lucide-react'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import { ProfilePhotoUpload } from '@/components/ui/ProfilePhotoUpload'
import { Header, Footer } from '@/components/layout'

const professionalTypes = [
    { value: 'PSYCHOLOGIST', label: 'Psicólogo/a' },
    { value: 'PSYCHIATRIST', label: 'Psiquiatra' },
    { value: 'CLINICAL_PSYCHOLOGIST', label: 'Psicólogo/a Clínico' },
    { value: 'THERAPIST', label: 'Terapeuta' },
    { value: 'COUNSELOR', label: 'Consejero/a' },
]

const specialtiesOptions = [
    'Ansiedad', 'Depresión', 'Estrés', 'Relaciones', 'Autoestima',
    'Duelo', 'Trauma', 'Adicciones', 'Trastornos alimentarios',
    'TDAH', 'Terapia de pareja', 'Terapia familiar', 'Adolescentes',
    'Infanto-juvenil', 'Adulto mayor', 'Coaching', 'Sexualidad',
]

const modalityOptions = [
    { value: 'ONLINE', label: 'Solo online' },
    { value: 'IN_PERSON', label: 'Solo presencial' },
    { value: 'BOTH', label: 'Online y presencial' },
]

export default function CompletarPerfilPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Form state
    const [professionalType, setProfessionalType] = useState('PSYCHOLOGIST')
    const [licenseNumber, setLicenseNumber] = useState('')
    const [bio, setBio] = useState('')
    const [specialties, setSpecialties] = useState<string[]>([])
    const [modality, setModality] = useState('BOTH')
    const [sessionPrice, setSessionPrice] = useState(50000)
    const [sessionDuration, setSessionDuration] = useState(50)
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [profileImageUrl, setProfileImageUrl] = useState('')
    const [photoError, setPhotoError] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    const handleSpecialtyToggle = (specialty: string) => {
        setSpecialties(prev =>
            prev.includes(specialty)
                ? prev.filter(s => s !== specialty)
                : [...prev, specialty]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation: Profile Photo is mandatory
        if (!profileImageUrl) {
            setPhotoError('Debes subir una foto de perfil para continuar')
            // Scroll to top to see the error/photo component
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        setIsLoading(true)
        setError('')
        setPhotoError('')

        try {
            const response = await fetch('/api/profesional/perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professionalType,
                    licenseNumber,
                    bio,
                    specialties,
                    modality,
                    sessionPrice,
                    sessionDuration,
                    linkedinUrl,
                    profileImageUrl,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al guardar perfil')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container-wide">
                    <div className="max-w-2xl mx-auto">
                        {/* Back to Dashboard */}
                        <BackToDashboard />

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                                Completa tu perfil profesional
                            </h1>
                            <p className="text-gray-600">
                                Esta información será visible para pacientes que busquen profesionales.
                            </p>
                        </div>

                        {/* Success message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 text-center">
                                ¡Perfil guardado! Redirigiendo al dashboard...
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Profile Photo */}
                            <div className="flex justify-center pb-4">
                                <ProfilePhotoUpload
                                    value={profileImageUrl}
                                    onChange={(val) => {
                                        setProfileImageUrl(val)
                                        if (val) setPhotoError('')
                                    }}
                                    error={photoError}
                                />
                            </div>

                            {/* Professional Type */}
                            <div>
                                <label className="label flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Tipo de profesional
                                </label>
                                <select
                                    value={professionalType}
                                    onChange={(e) => setProfessionalType(e.target.value)}
                                    className="input"
                                    required
                                >
                                    {professionalTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* License Number */}
                            <div>
                                <label className="label flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Número de registro (Superintendencia de Salud)
                                </label>
                                <input
                                    type="text"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    className="input"
                                    placeholder="Opcional - para verificación"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Esto nos ayudará a verificar tu perfil más rápido.
                                </p>
                            </div>

                            {/* LinkedIn URL */}
                            <div>
                                <label className="label flex items-center gap-2">
                                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                                    Perfil de LinkedIn (Opcional)
                                </label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    className="input"
                                    placeholder="https://www.linkedin.com/in/tu-perfil/"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Para validar tu experiencia y competencias ante los pacientes.
                                </p>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="label flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Biografía profesional
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="input min-h-[120px]"
                                    placeholder="Cuéntale a tus potenciales pacientes sobre tu experiencia, enfoque terapéutico y qué pueden esperar de trabajar contigo..."
                                    required
                                />
                            </div>

                            {/* Specialties */}
                            <div>
                                <label className="label">Áreas de trabajo</label>
                                <div className="flex flex-wrap gap-2">
                                    {specialtiesOptions.map(specialty => (
                                        <button
                                            key={specialty}
                                            type="button"
                                            onClick={() => handleSpecialtyToggle(specialty)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${specialties.includes(specialty)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {specialty}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modality */}
                            <div>
                                <label className="label flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Modalidad de atención
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {modalityOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setModality(option.value)}
                                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${modality === option.value
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Precio por sesión (CLP)
                                    </label>
                                    <input
                                        type="number"
                                        value={sessionPrice}
                                        onChange={(e) => setSessionPrice(Number(e.target.value))}
                                        className="input"
                                        min={10000}
                                        step={1000}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Duración de sesión (min)</label>
                                    <select
                                        value={sessionDuration}
                                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                                        className="input"
                                    >
                                        <option value={30}>30 minutos</option>
                                        <option value={45}>45 minutos</option>
                                        <option value={50}>50 minutos</option>
                                        <option value={60}>60 minutos</option>
                                        <option value={90}>90 minutos</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || success}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Guardar perfil
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Skip link */}
                        <div className="text-center mt-6">
                            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                                Completar después →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
