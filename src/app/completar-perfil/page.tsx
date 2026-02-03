'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User, Phone, MapPin, Calendar, Heart, Briefcase,
    Brain, AlertCircle, ChevronRight, ChevronLeft,
    Check, Loader2, Shield, Sparkles
} from 'lucide-react'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { ComunaAutocomplete } from '@/components/ui/ComunaAutocomplete'

// Step configuration
const STEPS = [
    { id: 1, title: 'Datos Personales', icon: User, description: 'Tu información básica' },
    { id: 2, title: 'Contexto', icon: Heart, description: 'Sobre tu situación actual' },
    { id: 3, title: 'Motivo de Consulta', icon: Brain, description: 'Lo que te trae aquí' },
    { id: 4, title: 'Emergencia', icon: Shield, description: 'Contacto de seguridad' },
]

// Options for select fields
const GENDER_OPTIONS = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'NON_BINARY', label: 'No binario' },
    { value: 'OTHER', label: 'Otro' },
    { value: 'PREFER_NOT_SAY', label: 'Prefiero no decir' },
]

const REGIONS = [
    'Región Metropolitana',
    'Valparaíso',
    'Biobío',
    'Araucanía',
    'Los Lagos',
    'O\'Higgins',
    'Maule',
    'Coquimbo',
    'Antofagasta',
    'Los Ríos',
    'Tarapacá',
    'Atacama',
    'Ñuble',
    'Arica y Parinacota',
    'Magallanes',
    'Aysén',
]

const OCCUPATION_STATUS = [
    { value: 'EMPLOYED', label: 'Empleado/a' },
    { value: 'SELF_EMPLOYED', label: 'Independiente' },
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'UNEMPLOYED', label: 'Sin empleo actual' },
    { value: 'RETIRED', label: 'Jubilado/a' },
    { value: 'HOMEMAKER', label: 'Labores del hogar' },
]

const MARITAL_STATUS = [
    { value: 'SINGLE', label: 'Soltero/a' },
    { value: 'IN_RELATIONSHIP', label: 'En pareja' },
    { value: 'MARRIED', label: 'Casado/a' },
    { value: 'DIVORCED', label: 'Divorciado/a' },
    { value: 'WIDOWED', label: 'Viudo/a' },
]

const HEALTH_SYSTEM = [
    { value: 'FONASA', label: 'FONASA' },
    { value: 'ISAPRE', label: 'ISAPRE' },
    { value: 'PRIVATE', label: 'Particular' },
    { value: 'NONE', label: 'Sin previsión' },
]

const INTEREST_AREAS = [
    'Ansiedad',
    'Depresión',
    'Estrés laboral',
    'Relaciones de pareja',
    'Autoestima',
    'Duelo',
    'Trastornos alimentarios',
    'Adicciones',
    'Trauma',
    'Fobias',
    'TOC',
    'TDAH',
    'Orientación vocacional',
    'Desarrollo personal',
    'Manejo de emociones',
]

const MODALITY_PREFERENCE = [
    { value: 'ONLINE', label: 'Online (videollamada)' },
    { value: 'IN_PERSON', label: 'Presencial' },
    { value: 'BOTH', label: 'Ambas opciones' },
]

const PROFESSIONAL_GENDER_PREF = [
    { value: 'MALE', label: 'Prefiero un profesional hombre' },
    { value: 'FEMALE', label: 'Prefiero una profesional mujer' },
    { value: 'NO_PREFERENCE', label: 'No tengo preferencia' },
]

const EMERGENCY_RELATIONSHIP = [
    { value: 'FAMILY', label: 'Familiar' },
    { value: 'PARTNER', label: 'Pareja' },
    { value: 'FRIEND', label: 'Amigo/a' },
    { value: 'OTHER', label: 'Otro' },
]

// Form data interface
interface ProfileFormData {
    // Step 1: Personal Data
    phone: string
    birthDate: string
    gender: string
    region: string
    comuna: string

    // Step 2: Context
    occupation: string
    occupationStatus: string
    maritalStatus: string
    hasChildren: string
    healthSystem: string
    previousTherapy: string

    // Step 3: Consultation Reason
    consultationReason: string
    interestAreas: string[]
    modalityPreference: string
    professionalGenderPref: string

    // Step 4: Emergency Contact
    emergencyName: string
    emergencyRelationship: string
    emergencyPhone: string
}

const initialFormData: ProfileFormData = {
    phone: '',
    birthDate: '',
    gender: '',
    region: '',
    comuna: '',
    occupation: '',
    occupationStatus: '',
    maritalStatus: '',
    hasChildren: '',
    healthSystem: '',
    previousTherapy: '',
    consultationReason: '',
    interestAreas: [],
    modalityPreference: '',
    professionalGenderPref: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
}

export default function CompletarPerfilPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const updateField = (field: keyof ProfileFormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const toggleInterestArea = (area: string) => {
        setFormData(prev => ({
            ...prev,
            interestAreas: prev.interestAreas.includes(area)
                ? prev.interestAreas.filter(a => a !== area)
                : [...prev.interestAreas, area]
        }))
    }

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            // Transform form data for API
            const apiData = {
                phone: formData.phone || undefined,
                birthDate: formData.birthDate || undefined,
                gender: formData.gender || undefined,
                region: formData.region || undefined,
                comuna: formData.comuna || undefined,
                occupation: formData.occupation || undefined,
                occupationStatus: formData.occupationStatus || undefined,
                maritalStatus: formData.maritalStatus || undefined,
                hasChildren: formData.hasChildren === 'yes' ? true : formData.hasChildren === 'no' ? false : undefined,
                healthSystem: formData.healthSystem || undefined,
                previousTherapy: formData.previousTherapy === 'yes' ? true : formData.previousTherapy === 'no' ? false : undefined,
                consultationReason: formData.consultationReason || undefined,
                interestAreas: formData.interestAreas.length > 0 ? formData.interestAreas : undefined,
                modalityPreference: formData.modalityPreference || undefined,
                professionalGenderPref: formData.professionalGenderPref || undefined,
                emergencyName: formData.emergencyName || undefined,
                emergencyRelationship: formData.emergencyRelationship || undefined,
                emergencyPhone: formData.emergencyPhone || undefined,
            }

            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData),
            })

            if (!response.ok) {
                throw new Error('Error al guardar el perfil')
            }

            setShowSuccess(true)

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (error) {
            console.error('Profile save error:', error)
            setIsSubmitting(false)
        }
    }

    const skipStep = () => {
        if (currentStep < STEPS.length) {
            nextStep()
        } else {
            handleSubmit()
        }
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Sparkles className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-3">
                        ¡Perfil completado!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Gracias por completar tu información. Ahora podremos brindarte una mejor experiencia.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirigiendo al dashboard...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-subtle py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <span className="font-heading font-semibold text-2xl text-gray-900">
                            PsyConnect
                        </span>
                    </Link>

                    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                        Completa tu perfil
                    </h1>
                    <p className="text-gray-600">
                        Esta información nos ayudará a conectarte con el profesional ideal para ti
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        {/* Progress line */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                            <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                            />
                        </div>

                        {STEPS.map((step) => {
                            const Icon = step.icon
                            const isActive = step.id === currentStep
                            const isCompleted = step.id < currentStep

                            return (
                                <div
                                    key={step.id}
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        transition-all duration-300
                                        ${isActive
                                            ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                                            : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white border-2 border-gray-200 text-gray-400'
                                        }
                                    `}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    {/* Step 1: Personal Data */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="w-6 h-6 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-heading font-bold text-gray-900">
                                    Datos Personales
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Información básica para tu perfil
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Teléfono</label>
                                    <PhoneInput
                                        value={formData.phone}
                                        onChange={(value) => updateField('phone', value)}
                                        placeholder="Número de teléfono"
                                    />
                                </div>

                                <div>
                                    <label className="label">Fecha de nacimiento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={(e) => updateField('birthDate', e.target.value)}
                                            className="input pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label">Género</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {GENDER_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateField('gender', option.value)}
                                            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                                                ${formData.gender === option.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Región</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            value={formData.region}
                                            onChange={(e) => updateField('region', e.target.value)}
                                            className="input pl-10 appearance-none"
                                        >
                                            <option value="">Selecciona una región</option>
                                            {REGIONS.map((region) => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Comuna</label>
                                    <ComunaAutocomplete
                                        value={formData.comuna}
                                        onChange={(value) => updateField('comuna', value)}
                                        region={formData.region}
                                        placeholder="Escribe tu comuna..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Context */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Heart className="w-6 h-6 text-secondary-600" />
                                </div>
                                <h2 className="text-xl font-heading font-bold text-gray-900">
                                    Tu Contexto Actual
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Esto nos ayuda a entender mejor tu situación
                                </p>
                            </div>

                            <div>
                                <label className="label">Ocupación</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.occupation}
                                        onChange={(e) => updateField('occupation', e.target.value)}
                                        className="input pl-10"
                                        placeholder="Ej: Ingeniero, Estudiante de medicina..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Situación laboral</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {OCCUPATION_STATUS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateField('occupationStatus', option.value)}
                                            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                                                ${formData.occupationStatus === option.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Estado civil</label>
                                    <select
                                        value={formData.maritalStatus}
                                        onChange={(e) => updateField('maritalStatus', e.target.value)}
                                        className="input"
                                    >
                                        <option value="">Selecciona</option>
                                        {MARITAL_STATUS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">¿Tienes hijos?</label>
                                    <div className="flex gap-2">
                                        {['yes', 'no'].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => updateField('hasChildren', value)}
                                                className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                                                    ${formData.hasChildren === value
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }
                                                `}
                                            >
                                                {value === 'yes' ? 'Sí' : 'No'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Sistema de salud</label>
                                    <select
                                        value={formData.healthSystem}
                                        onChange={(e) => updateField('healthSystem', e.target.value)}
                                        className="input"
                                    >
                                        <option value="">Selecciona</option>
                                        {HEALTH_SYSTEM.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">¿Has ido a terapia antes?</label>
                                    <div className="flex gap-2">
                                        {['yes', 'no'].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => updateField('previousTherapy', value)}
                                                className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                                                    ${formData.previousTherapy === value
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }
                                                `}
                                            >
                                                {value === 'yes' ? 'Sí' : 'No'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Consultation Reason */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Brain className="w-6 h-6 text-accent-600" />
                                </div>
                                <h2 className="text-xl font-heading font-bold text-gray-900">
                                    Motivo de Consulta
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Cuéntanos qué te trae a buscar apoyo profesional
                                </p>
                            </div>

                            <div>
                                <label className="label">¿Qué te trae a buscar ayuda? (opcional)</label>
                                <textarea
                                    value={formData.consultationReason}
                                    onChange={(e) => updateField('consultationReason', e.target.value)}
                                    className="input min-h-[120px] resize-none"
                                    placeholder="Puedes compartir lo que quieras... Esta información es confidencial y ayudará al profesional a entenderte mejor."
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Esta información solo será visible para el profesional que elijas
                                </p>
                            </div>

                            <div>
                                <label className="label">Áreas de interés (selecciona las que apliquen)</label>
                                <div className="flex flex-wrap gap-2">
                                    {INTEREST_AREAS.map((area) => (
                                        <button
                                            key={area}
                                            type="button"
                                            onClick={() => toggleInterestArea(area)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                                ${formData.interestAreas.includes(area)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            {area}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Preferencia de modalidad</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {MODALITY_PREFERENCE.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateField('modalityPreference', option.value)}
                                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
                                                ${formData.modalityPreference === option.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Preferencia de género del profesional</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {PROFESSIONAL_GENDER_PREF.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateField('professionalGenderPref', option.value)}
                                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left
                                                ${formData.professionalGenderPref === option.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Emergency Contact */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Shield className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-xl font-heading font-bold text-gray-900">
                                    Contacto de Emergencia
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Alguien de confianza a quien contactar en caso de necesidad
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">
                                        Este contacto solo será utilizado en situaciones de emergencia relacionadas
                                        con tu bienestar. Es completamente opcional pero altamente recomendado.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="label">Nombre del contacto</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.emergencyName}
                                        onChange={(e) => updateField('emergencyName', e.target.value)}
                                        className="input pl-10"
                                        placeholder="Nombre de la persona"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Relación</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {EMERGENCY_RELATIONSHIP.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateField('emergencyRelationship', option.value)}
                                            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                                                ${formData.emergencyRelationship === option.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Teléfono del contacto</label>
                                <PhoneInput
                                    value={formData.emergencyPhone}
                                    onChange={(value) => updateField('emergencyPhone', value)}
                                    placeholder="Número de teléfono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={skipStep}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {currentStep === STEPS.length ? 'Saltar y finalizar' : 'Saltar'}
                            </button>

                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    Siguiente
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Completar perfil
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Privacy note */}
                <p className="text-xs text-gray-400 text-center mt-6">
                    🔒 Tu información está protegida y solo será compartida con los profesionales que elijas.
                    <br />
                    <Link href="/privacidad" className="underline hover:text-gray-600">
                        Conoce nuestra política de privacidad
                    </Link>
                </p>
            </div>
        </div>
    )
}
