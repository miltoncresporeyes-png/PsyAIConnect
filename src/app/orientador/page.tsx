'use client'

import { useState } from 'react'
import { ChevronRight, Heart, Brain, Users, Clock, Calendar, MapPin, CreditCard, DollarSign, ArrowLeft } from 'lucide-react'

// ============================================
// Types & Configuration
// ============================================

type QuestionType = 'single-choice' | 'multi-choice' | 'scale'

interface Option {
    id: string
    label: string
    icon?: React.ReactNode
    description?: string
}

interface Question {
    id: string
    type: QuestionType
    title: string
    subtitle?: string
    options: Option[]
    required: boolean
}

const questions: Question[] = [
    {
        id: 'reason',
        type: 'single-choice',
        title: '¿Qué te trae por acá?',
        subtitle: 'Selecciona el motivo principal de tu consulta',
        required: true,
        options: [
            {
                id: 'anxiety',
                label: 'Ansiedad o estrés',
                icon: <Brain className="w-6 h-6" />,
                description: 'Preocupación excesiva, nerviosismo, ataques de pánico'
            },
            {
                id: 'depression',
                label: 'Tristeza o depresión',
                icon: <Heart className="w-6 h-6" />,
                description: 'Desmotivación, sensación de vacío, pérdida de interés'
            },
            {
                id: 'relationships',
                label: 'Problemas de pareja o familia',
                icon: <Users className="w-6 h-6" />,
                description: 'Conflictos, comunicación, separaciones'
            },
            {
                id: 'trauma',
                label: 'Duelo o experiencia traumática',
                icon: <Heart className="w-6 h-6" />,
                description: 'Pérdida de seres queridos, eventos difíciles del pasado'
            },
            {
                id: 'growth',
                label: 'Crecimiento personal',
                icon: <Brain className="w-6 h-6" />,
                description: 'Autoconocimiento, desarrollo de habilidades, objetivos'
            },
        ],
    },
    {
        id: 'urgency',
        type: 'single-choice',
        title: '¿Qué tan urgente sientes que necesitas ayuda?',
        subtitle: 'Esto nos ayuda a priorizar tu atención',
        required: true,
        options: [
            {
                id: 'immediate',
                label: 'Necesito ayuda lo antes posible',
                icon: <Clock className="w-6 h-6 text-red-500" />,
                description: 'En las próximas 24-48 horas'
            },
            {
                id: 'soon',
                label: 'Me gustaría empezar pronto',
                icon: <Clock className="w-6 h-6 text-amber-500" />,
                description: 'En la próxima semana'
            },
            {
                id: 'flexible',
                label: 'Tengo flexibilidad de tiempo',
                icon: <Clock className="w-6 h-6 text-green-500" />,
                description: 'En las próximas 2-3 semanas'
            },
        ],
    },
    {
        id: 'modality',
        type: 'single-choice',
        title: '¿Cómo prefieres tus sesiones?',
        subtitle: 'Puedes cambiar esto después si lo necesitas',
        required: true,
        options: [
            {
                id: 'online',
                label: 'Online (videollamada)',
                icon: <MapPin className="w-6 h-6" />,
                description: 'Desde la comodidad de tu hogar'
            },
            {
                id: 'presencial',
                label: 'Presencial',
                icon: <MapPin className="w-6 h-6" />,
                description: 'En la consulta del profesional'
            },
            {
                id: 'hybrid',
                label: 'Ambas (híbrido)',
                icon: <MapPin className="w-6 h-6" />,
                description: 'Flexibilidad para elegir cada vez'
            },
        ],
    },
    {
        id: 'insurance',
        type: 'single-choice',
        title: '¿Tienes previsión de salud?',
        subtitle: 'Te mostraremos profesionales que pueden ayudarte con reembolsos',
        required: true,
        options: [
            {
                id: 'fonasa',
                label: 'Fonasa',
                icon: <CreditCard className="w-6 h-6" />,
                description: 'Bono modalidad libre elección'
            },
            {
                id: 'isapre_consalud',
                label: 'Isapre Consalud',
                icon: <CreditCard className="w-6 h-6" />,
                description: 'Reembolso según plan'
            },
            {
                id: 'isapre_colmena',
                label: 'Isapre Colmena',
                icon: <CreditCard className="w-6 h-6" />,
                description: 'Reembolso según plan'
            },
            {
                id: 'isapre_other',
                label: 'Otra Isapre',
                icon: <CreditCard className="w-6 h-6" />,
                description: 'Banmédica, Vida Tres, Cruz Blanca, etc.'
            },
            {
                id: 'none',
                label: 'Sin previsión',
                icon: <DollarSign className="w-6 h-6" />,
                description: 'Pago particular'
            },
        ],
    },
    {
        id: 'budget',
        type: 'single-choice',
        title: '¿Cuál es tu presupuesto por sesión?',
        subtitle: 'Te ayudaremos a encontrar profesionales dentro de tu rango',
        required: true,
        options: [
            { id: 'low', label: 'Hasta $25.000', description: 'Opciones accesibles' },
            { id: 'medium', label: '$25.000 - $40.000', description: 'Rango medio' },
            { id: 'high', label: '$40.000 - $60.000', description: 'Profesionales senior' },
            { id: 'premium', label: 'Más de $60.000', description: 'Especialistas premium' },
        ],
    },
]

// ============================================
// Component
// ============================================

export default function OrientadorInteligentePage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [showResults, setShowResults] = useState(false)
    const [loading, setLoading] = useState(false)
    const [professionals, setProfessionals] = useState<any[]>([])

    const currentQuestion = questions[currentStep]
    const progress = ((currentStep + 1) / questions.length) * 100

    const fetchMatchingProfessionals = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/orientador/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answers),
            })

            if (!response.ok) {
                throw new Error('Error al obtener profesionales')
            }

            const data = await response.json()
            setProfessionals(data)
        } catch (error) {
            console.error('Error fetching professionals:', error)
            // Fallback to empty array if error
            setProfessionals([])
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (questionId: string, answerId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }))

        // Auto-advance after selection
        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(prev => prev + 1)
            } else {
                // Fetch matching professionals before showing results
                fetchMatchingProfessionals().then(() => {
                    setShowResults(true)
                })
            }
        }, 300)
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    if (showResults) {
        return <ResultsScreen
            answers={answers}
            professionals={professionals}
            loading={loading}
            onRestart={() => {
                setCurrentStep(0)
                setAnswers({})
                setShowResults(false)
                setProfessionals([])
            }}
        />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Back Button */}
            {currentStep > 0 && (
                <button
                    onClick={handleBack}
                    className="fixed top-6 left-6 z-40 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Atrás</span>
                </button>
            )}

            {/* Progress Counter */}
            <div className="fixed top-6 right-6 z-40">
                <span className="text-sm font-medium text-gray-500">
                    {currentStep + 1} de {questions.length}
                </span>
            </div>

            {/* Question Container */}
            <div className="flex-1 flex items-center justify-center px-4 py-20">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3 leading-tight">
                            {currentQuestion.title}
                        </h1>
                        {currentQuestion.subtitle && (
                            <p className="text-lg text-gray-600">
                                {currentQuestion.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid gap-3 md:gap-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = answers[currentQuestion.id] === option.id

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                                    className={`
                                        group relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-200
                                        hover:scale-[1.02] hover:shadow-lg
                                        animate-in fade-in slide-in-from-bottom-2 duration-500
                                        ${isSelected
                                            ? 'bg-primary-50 border-primary-500 shadow-md'
                                            : 'bg-white border-gray-200 hover:border-primary-300'
                                        }
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        {option.icon && (
                                            <div className={`
                                                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                                ${isSelected
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600'
                                                }
                                            `}>
                                                {option.icon}
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 mb-1">
                                                {option.label}
                                            </div>
                                            {option.description && (
                                                <div className="text-sm text-gray-600">
                                                    {option.description}
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className={`
                                            flex-shrink-0 w-5 h-5 transition-all
                                            ${isSelected
                                                ? 'text-primary-600 translate-x-1'
                                                : 'text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1'
                                            }
                                        `} />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Results Screen Component
// ============================================

interface ResultsScreenProps {
    answers: Record<string, string>
    professionals: any[]
    loading: boolean
    onRestart: () => void
}

function ResultsScreen({ answers, professionals, loading, onRestart }: ResultsScreenProps) {
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-900">Buscando los mejores profesionales para ti...</p>
                    <p className="text-gray-600 mt-2">Analizando compatibilidad</p>
                </div>
            </div>
        )
    }

    if (professionals.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
                <div className="max-w-2xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                        No encontramos profesionales disponibles en este momento
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Estamos trabajando para agregar más profesionales a nuestra plataforma. Intenta ajustar tus preferencias.
                    </p>
                    <button onClick={onRestart} className="btn-primary">
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
            <div className="container-wide py-12">
                {/* Header */}
                <div className="max-w-4xl mx-auto mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-6">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-700">Análisis completado</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
                        Encontramos {professionals.length} profesionales para ti
                    </h1>
                    <p className="text-xl text-gray-600">
                        Basados en tus respuestas, estos especialistas son los más adecuados para tu proceso
                    </p>
                </div>

                {/* Professionals Grid */}
                <div className="max-w-5xl mx-auto space-y-6">
                    {professionals.map((prof, index) => (
                        <div
                            key={prof.id}
                            className="bg-white rounded-3xl border-2 border-gray-200 hover:border-primary-300 p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left: Image & Match Score */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                                            <Users className="w-16 h-16 text-primary-600" />
                                        </div>
                                        {/* Match Badge */}
                                        <div className="absolute -top-2 -right-2 bg-primary-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                                            <span className="text-sm font-bold">{prof.matchScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                                            {prof.name}
                                        </h3>
                                        <p className="text-gray-600">
                                            {prof.specialty} • {prof.experience}
                                        </p>
                                    </div>

                                    {/* Match Score Explanation */}
                                    <div className="bg-primary-50 rounded-xl p-4 mb-4 border border-primary-100">
                                        <p className="text-sm font-semibold text-primary-900 mb-1">
                                            {prof.matchScore}% de afinidad con tu motivo de consulta
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Especializado en {prof.expertise.join(', ')}
                                        </p>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center gap-2text-sm">
                                            <CreditCard className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                <strong className="text-green-700">✓</strong> Acepta {prof.acceptsInsurance}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700">{prof.price} por sesión (50 min)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700">{prof.modalities.join(' y ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                Disponible: <strong className="text-primary-700">{prof.nextAvailable}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: CTA */}
                                <div className="flex flex-col justify-center gap-3">
                                    <Link
                                        href={`/profesional/${prof.slug}`}
                                        className="btn-primary px-6 py-3 text-center whitespace-nowrap"
                                    >
                                        Ver perfil y agendar
                                    </Link>
                                    <Link
                                        href={`/profesional/${prof.slug}#availability`}
                                        className="btn-ghost px-6 py-2 text-sm"
                                    >
                                        Ver disponibilidad
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="max-w-5xl mx-auto mt-12 text-center">
                    <p className="text-gray-600 mb-4">
                        ¿Ninguno de estos profesionales se ajusta a lo que buscas?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={onRestart} className="btn-outline">
                            Refinar búsqueda
                        </button>
                        <button className="btn-ghost">
                            Ver todos los profesionales
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
