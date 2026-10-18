'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Loader2, Mail, Lock, Eye, EyeOff, User, UserCog, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'

type UserType = 'patient' | 'professional'
const PENDING_REGISTRATION_KEY = 'pendingRegistrationContext'

type AppLocale = 'es' | 'en' | 'fr' | 'pt'

function resolveLocale(locale: string): AppLocale {
  if (locale === 'en' || locale === 'fr' || locale === 'pt') return locale
  return 'es'
}

const copy = {
  es: {
    patientTitle: 'Crea tu cuenta',
    patientSubtitle: 'Encuentra tu profesional de salud mental',
    professionalTitle: 'Registro Profesional',
    professionalSubtitle: 'Comienza a recibir pacientes en PsyDoctor',
    selectTitle: 'Crea tu cuenta',
    selectSubtitle: 'Como quieres usar PsyDoctor?',
    patientOptionTitle: 'Busco un profesional',
    patientOptionDesc: 'Quiero encontrar un psicologo o psiquiatra para comenzar mi proceso.',
    professionalOptionTitle: 'Soy profesional',
    professionalOptionDesc: 'Soy psicologo/a o psiquiatra y quiero ofrecer mis servicios.',
    backHome: 'Volver al inicio',
    switchType: 'Cambiar tipo de cuenta',
    professionalAccount: 'Cuenta profesional',
    patientAccount: 'Cuenta paciente',
    divider: 'o con email',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Tu nombre',
    email: 'Email',
    password: 'Contrasena',
    passwordPlaceholder: 'Minimo 8 caracteres',
    confirmPassword: 'Confirmar contrasena',
    confirmPasswordPlaceholder: 'Repite tu contrasena',
    termsPrefix: 'Acepto los',
    terms: 'Terminos y Condiciones',
    termsAnd: 'y la',
    privacy: 'Politica de Privacidad',
    alreadyAccount: 'Ya tienes cuenta?',
    login: 'Inicia sesion',
    passwordMismatch: 'Las contrasenas no coinciden',
    passwordMin: 'La contrasena debe tener al menos 8 caracteres',
    mustAccept: 'Debes aceptar los terminos y condiciones',
    sendCodeError: 'Error al enviar codigo de verificacion',
    registerError: 'Error al registrar',
    google: 'Continuar con Google',
    createPatient: 'Crear cuenta de paciente',
    createProfessional: 'Crear cuenta profesional',
  },
  en: {
    patientTitle: 'Create your account',
    patientSubtitle: 'Find your mental health professional',
    professionalTitle: 'Professional Registration',
    professionalSubtitle: 'Start receiving patients on PsyDoctor',
    selectTitle: 'Create your account',
    selectSubtitle: 'How do you want to use PsyDoctor?',
    patientOptionTitle: 'I need a professional',
    patientOptionDesc: 'I want to find a psychologist or psychiatrist to start my process.',
    professionalOptionTitle: 'I am a professional',
    professionalOptionDesc: 'I am a psychologist or psychiatrist and I want to offer my services.',
    backHome: 'Back to home',
    switchType: 'Change account type',
    professionalAccount: 'Professional account',
    patientAccount: 'Patient account',
    divider: 'or with email',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your name',
    email: 'Email',
    password: 'Password',
    passwordPlaceholder: 'Minimum 8 characters',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat your password',
    termsPrefix: 'I accept the',
    terms: 'Terms and Conditions',
    termsAnd: 'and the',
    privacy: 'Privacy Policy',
    alreadyAccount: 'Already have an account?',
    login: 'Sign in',
    passwordMismatch: 'Passwords do not match',
    passwordMin: 'Password must have at least 8 characters',
    mustAccept: 'You must accept the terms and conditions',
    sendCodeError: 'Error sending verification code',
    registerError: 'Registration error',
    google: 'Continue with Google',
    createPatient: 'Create patient account',
    createProfessional: 'Create professional account',
  },
  fr: {
    patientTitle: 'Creez votre compte',
    patientSubtitle: 'Trouvez votre professionnel de sante mentale',
    professionalTitle: 'Inscription Professionnelle',
    professionalSubtitle: 'Commencez a recevoir des patients sur PsyDoctor',
    selectTitle: 'Creez votre compte',
    selectSubtitle: 'Comment voulez-vous utiliser PsyDoctor ?',
    patientOptionTitle: 'Je cherche un professionnel',
    patientOptionDesc: 'Je veux trouver un psychologue ou un psychiatre pour commencer mon parcours.',
    professionalOptionTitle: 'Je suis professionnel',
    professionalOptionDesc: 'Je suis psychologue ou psychiatre et je veux proposer mes services.',
    backHome: "Retour a l'accueil",
    switchType: 'Changer le type de compte',
    professionalAccount: 'Compte professionnel',
    patientAccount: 'Compte patient',
    divider: 'ou avec email',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Votre nom',
    email: 'Email',
    password: 'Mot de passe',
    passwordPlaceholder: 'Minimum 8 caracteres',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Repetez votre mot de passe',
    termsPrefix: "J'accepte les",
    terms: "Conditions d'utilisation",
    termsAnd: 'et la',
    privacy: 'Politique de Confidentialite',
    alreadyAccount: 'Vous avez deja un compte ?',
    login: 'Se connecter',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordMin: 'Le mot de passe doit contenir au moins 8 caracteres',
    mustAccept: 'Vous devez accepter les conditions',
    sendCodeError: "Erreur lors de l'envoi du code de verification",
    registerError: "Erreur lors de l'inscription",
    google: 'Continuer avec Google',
    createPatient: 'Creer un compte patient',
    createProfessional: 'Creer un compte professionnel',
  },
  pt: {
    patientTitle: 'Crie sua conta',
    patientSubtitle: 'Encontre seu profissional de saude mental',
    professionalTitle: 'Cadastro Profissional',
    professionalSubtitle: 'Comece a receber pacientes no PsyDoctor',
    selectTitle: 'Crie sua conta',
    selectSubtitle: 'Como voce quer usar o PsyDoctor?',
    patientOptionTitle: 'Busco um profissional',
    patientOptionDesc: 'Quero encontrar um psicologo ou psiquiatra para iniciar meu processo.',
    professionalOptionTitle: 'Sou profissional',
    professionalOptionDesc: 'Sou psicologo/a ou psiquiatra e quero oferecer meus servicos.',
    backHome: 'Voltar ao inicio',
    switchType: 'Alterar tipo de conta',
    professionalAccount: 'Conta profissional',
    patientAccount: 'Conta de paciente',
    divider: 'ou com email',
    fullName: 'Nome completo',
    fullNamePlaceholder: 'Seu nome',
    email: 'Email',
    password: 'Senha',
    passwordPlaceholder: 'Minimo de 8 caracteres',
    confirmPassword: 'Confirmar senha',
    confirmPasswordPlaceholder: 'Repita sua senha',
    termsPrefix: 'Aceito os',
    terms: 'Termos e Condicoes',
    termsAnd: 'e a',
    privacy: 'Politica de Privacidade',
    alreadyAccount: 'Ja tem conta?',
    login: 'Entrar',
    passwordMismatch: 'As senhas nao coincidem',
    passwordMin: 'A senha deve ter pelo menos 8 caracteres',
    mustAccept: 'Voce deve aceitar os termos e condicoes',
    sendCodeError: 'Erro ao enviar codigo de verificacao',
    registerError: 'Erro ao registrar',
    google: 'Continuar com Google',
    createPatient: 'Criar conta de paciente',
    createProfessional: 'Criar conta profissional',
  },
} as const

function RegistroContent() {
  const locale = resolveLocale(useLocale())
  const t = copy[locale]
  const router = useRouter()
  const searchParams = useSearchParams()

  const tipoParam = searchParams?.get('tipo')
  const preReservationToken = searchParams?.get('preReservation')

  const [step, setStep] = useState<'select' | 'form'>('select')
  const [userType, setUserType] = useState<UserType | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tipoParam === 'profesional' || tipoParam === 'professional') {
      setUserType('professional')
      setStep('form')
    } else if (tipoParam === 'paciente' || tipoParam === 'patient') {
      setUserType('patient')
      setStep('form')
    }
  }, [tipoParam])

  const handleTypeSelect = (type: UserType) => {
    setUserType(type)
    setStep('form')
  }

  const handleBack = () => {
    if (tipoParam) {
      router.push('/')
    } else {
      setStep('select')
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    if (userType) {
      sessionStorage.setItem('pendingUserType', userType)
    }
    await signIn('google', {
      callbackUrl: userType === 'professional' ? '/profesional/completar-perfil' : '/completar-perfil',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    if (password.length < 8) {
      setError(t.passwordMin)
      return
    }

    if (!acceptTerms) {
      setError(t.mustAccept)
      return
    }

    setIsLoading(true)

    try {
      const verifyResponse = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          name,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || t.sendCodeError)
      }

      sessionStorage.setItem(
        PENDING_REGISTRATION_KEY,
        JSON.stringify({
          email,
          name,
          password,
          userType: userType || 'patient',
          preReservationToken: preReservationToken || '',
        })
      )

      const verifyUrl = new URL('/verificar-codigo', window.location.origin)
      verifyUrl.searchParams.set('email', email)
      router.push(verifyUrl.pathname + verifyUrl.search)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.registerError)
    } finally {
      setIsLoading(false)
    }
  }

  const currentContent = {
    title:
      step === 'select'
        ? t.selectTitle
        : userType === 'professional'
          ? t.professionalTitle
          : t.patientTitle,
    subtitle:
      step === 'select'
        ? t.selectSubtitle
        : userType === 'professional'
          ? t.professionalSubtitle
          : t.patientSubtitle,
    icon: userType === 'professional' ? UserCog : User,
    iconBgClass: userType === 'professional' ? 'bg-secondary-100' : 'bg-primary-100',
    iconColorClass: userType === 'professional' ? 'text-secondary-600' : 'text-primary-600',
    buttonText: userType === 'professional' ? t.createProfessional : t.createPatient,
  }

  const CurrentIcon = userType ? currentContent.icon : null

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Logo variant="full" size={38} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-white/80 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-full transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al inicio
        </Link>
      </div>

      <div className="card rounded-[28px] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-7">
        {step === 'select' ? (
          <>
            <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">{t.selectTitle}</h1>
            <p className="text-gray-600 text-center mb-8">{t.selectSubtitle}</p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleTypeSelect('patient')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.patientOptionTitle}</h3>
                    <p className="text-sm text-gray-600">{t.patientOptionDesc}</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('professional')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                    <UserCog className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.professionalOptionTitle}</h3>
                    <p className="text-sm text-gray-600">{t.professionalOptionDesc}</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ArrowLeft className="w-4 h-4" />
              {tipoParam ? t.backHome : t.switchType}
            </button>

            {CurrentIcon && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${currentContent.iconBgClass} flex items-center justify-center`}>
                  <CurrentIcon className={`w-5 h-5 ${currentContent.iconColorClass}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {userType === 'professional' ? t.professionalAccount : t.patientAccount}
                </span>
              </div>
            )}

            <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">{currentContent.title}</h1>
            <p className="text-gray-600 text-center mb-8">{currentContent.subtitle}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {t.google}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">{t.divider}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">{t.fullName}</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder={t.fullNamePlaceholder}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="label">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">{t.confirmPassword}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder={t.confirmPasswordPlaceholder}
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  {t.termsPrefix}{' '}
                  <Link href="/terminos" className="text-primary-600 hover:underline">{t.terms}</Link>{' '}
                  {t.termsAnd}{' '}
                  <Link href="/privacidad" className="text-primary-600 hover:underline">{t.privacy}</Link>
                </label>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentContent.buttonText}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          {t.alreadyAccount}{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">{t.login}</Link>
        </div>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_28%),linear-gradient(180deg,_#f7fbfa_0%,_#ffffff_100%)] flex items-center justify-center py-8 px-4 md:py-10">
      <Suspense
        fallback={
          <div className="w-full max-w-md flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        }
      >
        <RegistroContent />
      </Suspense>
    </div>
  )
}
