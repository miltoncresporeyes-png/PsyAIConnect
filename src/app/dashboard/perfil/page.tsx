'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    User, Phone, Calendar, Heart,
    Brain, Shield, ChevronLeft, Check, Loader2,
    Edit2, Save, X, AlertCircle, Briefcase, Award,
    ExternalLink, Linkedin, Globe, MapPin
} from 'lucide-react'
import { ComunaAutocomplete } from '@/components/ui/ComunaAutocomplete'
import { PhoneInput } from '@/components/ui/PhoneInput'

// Options for select fields (same as completar-perfil)
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
    { value: 'MALE', label: 'Prefiero profesional hombre' },
    { value: 'FEMALE', label: 'Prefiero profesional mujer' },
    { value: 'NO_PREFERENCE', label: 'Sin preferencia' },
]

const EMERGENCY_RELATIONSHIP = [
    { value: 'FAMILY', label: 'Familiar' },
    { value: 'PARTNER', label: 'Pareja' },
    { value: 'FRIEND', label: 'Amigo/a' },
    { value: 'OTHER', label: 'Otro' },
]

interface ProfileData {
    // User data
    name: string
    email: string
    phone: string

    // Profile data
    birthDate: string
    gender: string
    region: string
    comuna: string
    occupation: string
    occupationStatus: string
    maritalStatus: string
    hasChildren: boolean | null
    healthSystem: string
    previousTherapy: boolean | null
    consultationReason: string
    interestAreas: string[]
    modalityPreference: string
    professionalGenderPref: string

    // Emergency contact
    emergencyName: string
    emergencyRelationship: string
    emergencyPhone: string
}

interface ProfessionalProfileData {
    id: string
    professionalType: string
    licenseNumber: string | null
    bio: string | null
    slug: string
    specialties: string[]
    modality: string
    sessionPrice: number
    sessionDuration: number
    verificationStatus: string
    linkedinUrl: string | null
    profileImageUrl: string | null
    comuna: string | null
    region: string | null
    officeAddress: string | null
}

const emptyProfile: ProfileData = {
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    region: '',
    comuna: '',
    occupation: '',
    occupationStatus: '',
    maritalStatus: '',
    hasChildren: null,
    healthSystem: '',
    previousTherapy: null,
    consultationReason: '',
    interestAreas: [],
    modalityPreference: '',
    professionalGenderPref: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
}

type Section = 'personal' | 'context' | 'consultation' | 'emergency'

export default function PerfilPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [profileData, setProfileData] = useState<ProfileData>(emptyProfile)
    const [professionalData, setProfessionalData] = useState<ProfessionalProfileData | null>(null)
    const [userRole, setUserRole] = useState<string>('PATIENT')
    const [editingSection, setEditingSection] = useState<Section | null>(null)
    const [editData, setEditData] = useState<ProfileData>(emptyProfile)

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile')
                if (response.ok) {
                    const data = await response.json()

                    const profile: ProfileData = {
                        name: data.user?.name || '',
                        email: data.user?.email || '',
                        phone: data.user?.phone || '',
                        birthDate: data.patientProfile?.birthDate ? new Date(data.patientProfile.birthDate).toISOString().split('T')[0] : '',
                        gender: data.patientProfile?.gender || '',
                        region: data.patientProfile?.region || '',
                        comuna: data.patientProfile?.comuna || '',
                        occupation: data.patientProfile?.occupation || '',
                        occupationStatus: data.patientProfile?.occupationStatus || '',
                        maritalStatus: data.patientProfile?.maritalStatus || '',
                        hasChildren: data.patientProfile?.hasChildren ?? null,
                        healthSystem: data.patientProfile?.healthSystem || '',
                        previousTherapy: data.patientProfile?.previousTherapy ?? null,
                        consultationReason: data.patientProfile?.consultationReason || '',
                        interestAreas: data.patientProfile?.interestAreas || [],
                        modalityPreference: data.patientProfile?.modalityPreference || '',
                        professionalGenderPref: data.patientProfile?.professionalGenderPref || '',
                        emergencyName: data.patientProfile?.emergencyContact?.name || '',
                        emergencyRelationship: data.patientProfile?.emergencyContact?.relationship || '',
                        emergencyPhone: data.patientProfile?.emergencyContact?.phone || '',
                    }

                    setProfileData(profile)
                    setEditData(profile)
                    setProfessionalData(data.professionalProfile)
                    setUserRole(data.user?.role || 'PATIENT')
                }
            } catch (err) {
                console.error('Error fetching profile:', err)
            } finally {
                setIsLoading(false)
            }
        }

        if (status === 'authenticated') {
            fetchProfile()
        }
    }, [status])

    const startEditing = (section: Section) => {
        setEditData({ ...profileData })
        setEditingSection(section)
        setError('')
        setSuccess('')
    }

    const cancelEditing = () => {
        setEditingSection(null)
        setEditData({ ...profileData })
    }

    const updateField = (field: keyof ProfileData, value: string | string[] | boolean | null) => {
        setEditData(prev => ({ ...prev, [field]: value }))
    }

    const toggleInterestArea = (area: string) => {
        setEditData(prev => ({
            ...prev,
            interestAreas: prev.interestAreas.includes(area)
                ? prev.interestAreas.filter(a => a !== area)
                : [...prev.interestAreas, area]
        }))
    }

    const saveSection = async () => {
        setIsSaving(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: editData.phone || undefined,
                    birthDate: editData.birthDate || undefined,
                    gender: editData.gender || undefined,
                    region: editData.region || undefined,
                    comuna: editData.comuna || undefined,
                    occupation: editData.occupation || undefined,
                    occupationStatus: editData.occupationStatus || undefined,
                    maritalStatus: editData.maritalStatus || undefined,
                    hasChildren: editData.hasChildren,
                    healthSystem: editData.healthSystem || undefined,
                    previousTherapy: editData.previousTherapy,
                    consultationReason: editData.consultationReason || undefined,
                    interestAreas: editData.interestAreas.length > 0 ? editData.interestAreas : undefined,
                    modalityPreference: editData.modalityPreference || undefined,
                    professionalGenderPref: editData.professionalGenderPref || undefined,
                    emergencyName: editData.emergencyName || undefined,
                    emergencyRelationship: editData.emergencyRelationship || undefined,
                    emergencyPhone: editData.emergencyPhone || undefined,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error al guardar')
            }

            setProfileData({ ...editData })
            setEditingSection(null)
            setSuccess('Cambios guardados exitosamente')

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar los cambios')
        } finally {
            setIsSaving(false)
        }
    }

    const getLabel = (value: string | null | undefined, options: { value: string; label: string }[]) => {
        if (!value) return '—'
        const option = options.find(o => o.value === value)
        return option?.label || value
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver al Dashboard
                    </Link>

                    <div className="flex items-center gap-4">
                        {userRole === 'PROFESSIONAL' && professionalData?.profileImageUrl ? (
                            <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-white relative">
                                <img
                                    src={professionalData.profileImageUrl}
                                    alt={profileData.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden relative">
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-primary-600" />
                                )}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-heading font-bold text-gray-900">
                                Mi Perfil
                            </h1>
                            <p className="text-gray-600">
                                {profileData.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-green-800">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Sections */}
                <div className="space-y-6">
                    {userRole === 'PROFESSIONAL' && professionalData ? (
                        <>
                            {/* Professional Practice Card */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Práctica Profesional</h2>
                                    </div>
                                    <Link
                                        href="/profesional/completar-perfil"
                                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Editar Detalles
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Especialidades</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {professionalData.specialties.map((s) => (
                                                <span key={s} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-100">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Modalidad y Atención</span>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Globe className="w-4 h-4 text-gray-400" />
                                                <span>{professionalData.modality === 'BOTH' ? 'Online y Presencial' : professionalData.modality === 'ONLINE' ? 'Solo Online' : 'Solo Presencial'}</span>
                                            </div>
                                            {(professionalData.modality === 'IN_PERSON' || professionalData.modality === 'BOTH') && professionalData.officeAddress && (
                                                <div className="flex items-start gap-2 text-sm text-gray-700">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <span>{professionalData.officeAddress}, {professionalData.comuna}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Marketing & Value Proposition */}
                            <div className="card p-6 border-l-4 border-l-accent-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                                            <Award className="w-5 h-5 text-accent-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Tu Valor y Experiencia</h2>
                                    </div>
                                    <div className="flex gap-4">
                                        {professionalData.linkedinUrl && (
                                            <a href={professionalData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        <Link href={`/profesional/${professionalData.slug}`} target="_blank" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
                                            <ExternalLink className="w-4 h-4" />
                                            Ver Perfil Público
                                        </Link>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 italic text-gray-600 text-sm leading-relaxed border border-gray-100">
                                    &ldquo;{professionalData.bio || 'Aún no has escrito una biografía profesional. Tu biografía es clave para conectar con futuros pacientes.'}&rdquo;
                                </div>
                            </div>

                            {/* Professional Credentials */}
                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Credenciales y Verificación</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                                        <span className="text-sm text-gray-500">Registro SIS / Licencia</span>
                                        <span className="font-mono text-sm font-semibold">{professionalData.licenseNumber || 'Pendiente'}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                                        <span className="text-sm text-gray-500">Estado de Verificación</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${professionalData.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            professionalData.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {professionalData.verificationStatus === 'VERIFIED' ? 'VERIFICADO' :
                                                professionalData.verificationStatus === 'PENDING' ? 'EN REVISIÓN' : 'RECHAZADO'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info (Common) */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-secondary-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Datos de Contacto</h2>
                                    </div>
                                    <button onClick={() => startEditing('personal')} className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                        <Edit2 className="w-4 h-4" /> Editar
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                    <div className="flex justify-between md:justify-start gap-4">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="text-gray-900 font-medium">{profileData.email}</span>
                                    </div>
                                    <div className="flex justify-between md:justify-start gap-4">
                                        <span className="text-gray-500">Teléfono:</span>
                                        <span className="text-gray-900 font-medium">{profileData.phone || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Personal Data Section (Patient View) */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Datos Personales</h2>
                                    </div>
                                    {editingSection !== 'personal' && (
                                        <button
                                            onClick={() => startEditing('personal')}
                                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    )}
                                </div>

                                {editingSection === 'personal' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Teléfono</label>
                                                <PhoneInput
                                                    value={editData.phone}
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
                                                        value={editData.birthDate}
                                                        onChange={(e) => updateField('birthDate', e.target.value)}
                                                        className="input pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">Género</label>
                                            <div className="flex flex-wrap gap-2">
                                                {GENDER_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => updateField('gender', option.value)}
                                                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                                            ${editData.gender === option.value
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
                                                <select
                                                    value={editData.region}
                                                    onChange={(e) => updateField('region', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona una región</option>
                                                    {REGIONS.map((region) => (
                                                        <option key={region} value={region}>{region}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Comuna</label>
                                                <ComunaAutocomplete
                                                    value={editData.comuna}
                                                    onChange={(value) => updateField('comuna', value)}
                                                    region={editData.region}
                                                    placeholder="Escribe tu comuna..."
                                                />
                                            </div>
                                        </div>

                                        {/* Save/Cancel buttons */}
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                onClick={cancelEditing}
                                                className="btn-ghost flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={saveSection}
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
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Teléfono:</span>
                                            <span className="ml-2 text-gray-900">{profileData.phone || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Fecha de nacimiento:</span>
                                            <span className="ml-2 text-gray-900">
                                                {profileData.birthDate ? new Date(profileData.birthDate).toLocaleDateString('es-CL') : '—'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Género:</span>
                                            <span className="ml-2 text-gray-900">{getLabel(profileData.gender, GENDER_OPTIONS)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Ubicación:</span>
                                            <span className="ml-2 text-gray-900">
                                                {profileData.comuna && profileData.region
                                                    ? `${profileData.comuna}, ${profileData.region}`
                                                    : profileData.region || '—'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Context Section (Patient View) */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-secondary-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Contexto Personal</h2>
                                    </div>
                                    {editingSection !== 'context' && (
                                        <button
                                            onClick={() => startEditing('context')}
                                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    )}
                                </div>

                                {editingSection === 'context' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Ocupación</label>
                                                <input
                                                    type="text"
                                                    value={editData.occupation}
                                                    onChange={(e) => updateField('occupation', e.target.value)}
                                                    className="input"
                                                    placeholder="Ej: Ingeniero, Estudiante..."
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Situación laboral</label>
                                                <select
                                                    value={editData.occupationStatus}
                                                    onChange={(e) => updateField('occupationStatus', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona</option>
                                                    {OCCUPATION_STATUS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Estado civil</label>
                                                <select
                                                    value={editData.maritalStatus}
                                                    onChange={(e) => updateField('maritalStatus', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona</option>
                                                    {MARITAL_STATUS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">¿Tienes hijos?</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { value: true, label: 'Sí' },
                                                        { value: false, label: 'No' },
                                                    ].map((opt) => (
                                                        <button
                                                            key={String(opt.value)}
                                                            type="button"
                                                            onClick={() => updateField('hasChildren', opt.value)}
                                                            className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                                                ${editData.hasChildren === opt.value
                                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }
                                                            `}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Sistema de salud</label>
                                                <select
                                                    value={editData.healthSystem}
                                                    onChange={(e) => updateField('healthSystem', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona</option>
                                                    {HEALTH_SYSTEM.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">¿Terapia previa?</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { value: true, label: 'Sí' },
                                                        { value: false, label: 'No' },
                                                    ].map((opt) => (
                                                        <button
                                                            key={String(opt.value)}
                                                            type="button"
                                                            onClick={() => updateField('previousTherapy', opt.value)}
                                                            className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                                                ${editData.previousTherapy === opt.value
                                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }
                                                            `}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button onClick={cancelEditing} className="btn-ghost flex items-center gap-2">
                                                <X className="w-4 h-4" /> Cancelar
                                            </button>
                                            <button onClick={saveSection} disabled={isSaving} className="btn-primary flex items-center gap-2">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Ocupación:</span>
                                            <span className="ml-2 text-gray-900">{profileData.occupation || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Situación:</span>
                                            <span className="ml-2 text-gray-900">{getLabel(profileData.occupationStatus, OCCUPATION_STATUS)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Estado civil:</span>
                                            <span className="ml-2 text-gray-900">{getLabel(profileData.maritalStatus, MARITAL_STATUS)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Hijos:</span>
                                            <span className="ml-2 text-gray-900">
                                                {profileData.hasChildren === null ? '—' : profileData.hasChildren ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Sistema de salud:</span>
                                            <span className="ml-2 text-gray-900">{getLabel(profileData.healthSystem, HEALTH_SYSTEM)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Terapia previa:</span>
                                            <span className="ml-2 text-gray-900">
                                                {profileData.previousTherapy === null ? '—' : profileData.previousTherapy ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Consultation Section (Patient View) */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-accent-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Preferencias de Consulta</h2>
                                    </div>
                                    {editingSection !== 'consultation' && (
                                        <button
                                            onClick={() => startEditing('consultation')}
                                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    )}
                                </div>

                                {editingSection === 'consultation' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">¿Qué te trae a buscar ayuda?</label>
                                            <textarea
                                                value={editData.consultationReason}
                                                onChange={(e) => updateField('consultationReason', e.target.value)}
                                                className="input min-h-[100px] resize-none"
                                                placeholder="Describe brevemente tu situación..."
                                            />
                                        </div>

                                        <div>
                                            <label className="label">Áreas de interés</label>
                                            <div className="flex flex-wrap gap-2">
                                                {INTEREST_AREAS.map((area) => (
                                                    <button
                                                        key={area}
                                                        type="button"
                                                        onClick={() => toggleInterestArea(area)}
                                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                                            ${editData.interestAreas.includes(area)
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Modalidad preferida</label>
                                                <select
                                                    value={editData.modalityPreference}
                                                    onChange={(e) => updateField('modalityPreference', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona</option>
                                                    {MODALITY_PREFERENCE.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Preferencia de profesional</label>
                                                <select
                                                    value={editData.professionalGenderPref}
                                                    onChange={(e) => updateField('professionalGenderPref', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona</option>
                                                    {PROFESSIONAL_GENDER_PREF.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button onClick={cancelEditing} className="btn-ghost flex items-center gap-2">
                                                <X className="w-4 h-4" /> Cancelar
                                            </button>
                                            <button onClick={saveSection} disabled={isSaving} className="btn-primary flex items-center gap-2">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Motivo de consulta:</span>
                                            <p className="mt-1 text-gray-900">{profileData.consultationReason || '—'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Áreas de interés:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {profileData.interestAreas.length > 0 ? (
                                                    profileData.interestAreas.map((area) => (
                                                        <span key={area} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                                                            {area}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-900">—</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-gray-500">Modalidad:</span>
                                                <span className="ml-2 text-gray-900">{getLabel(profileData.modalityPreference, MODALITY_PREFERENCE)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Preferencia profesional:</span>
                                                <span className="ml-2 text-gray-900">{getLabel(profileData.professionalGenderPref, PROFESSIONAL_GENDER_PREF)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Emergency Contact Section (Patient Only) */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">Contacto de Emergencia</h2>
                                    </div>
                                    {editingSection !== 'emergency' && (
                                        <button
                                            onClick={() => startEditing('emergency')}
                                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    )}
                                </div>

                                {editingSection === 'emergency' ? (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <p className="text-sm text-amber-800">
                                                Este contacto solo será utilizado en situaciones de emergencia relacionadas con tu bienestar.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Nombre del contacto</label>
                                                <input
                                                    type="text"
                                                    value={editData.emergencyName}
                                                    onChange={(e) => updateField('emergencyName', e.target.value)}
                                                    className="input"
                                                    placeholder="Nombre completo"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Relación</label>
                                                <select
                                                    value={editData.emergencyRelationship}
                                                    onChange={(e) => updateField('emergencyRelationship', e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="">Selecciona</option>
                                                    {EMERGENCY_RELATIONSHIP.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">Teléfono del contacto</label>
                                            <PhoneInput
                                                value={editData.emergencyPhone}
                                                onChange={(value) => updateField('emergencyPhone', value)}
                                                placeholder="Número de teléfono"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button onClick={cancelEditing} className="btn-ghost flex items-center gap-2">
                                                <X className="w-4 h-4" /> Cancelar
                                            </button>
                                            <button onClick={saveSection} disabled={isSaving} className="btn-primary flex items-center gap-2">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Nombre:</span>
                                            <span className="ml-2 text-gray-900">{profileData.emergencyName || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Relación:</span>
                                            <span className="ml-2 text-gray-900">{getLabel(profileData.emergencyRelationship, EMERGENCY_RELATIONSHIP)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Teléfono:</span>
                                            <span className="ml-2 text-gray-900">{profileData.emergencyPhone || '—'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-400 text-center mt-8">
                    🔒 Tu información está protegida y solo será compartida con los profesionales que elijas.
                </p>
            </div>
        </div>
    )
}
