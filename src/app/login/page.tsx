'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Briefcase, AlertCircle, ArrowLeft } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

type UserType = 'patient' | 'professional' | null

type AppLocale = 'es' | 'en' | 'fr' | 'pt'

type LocaleCopy = {
  loginTitle: string
  selectType: string
  userAccount: string
  patientShort: string
  professionalAccount: string
  professionalShort: string
  noAccount: string
  registerFree: string
  patientAccount: string
  wrongTypeTitle: string
  wrongTypePatient: string
  wrongTypeProfessional: string
  switchType: string
  invalidCredentials: string
  genericLoginError: string
  continueGoogle: string
  or: string
  email: string
  password: string
  loginButton: string
  forgotPassword: string
  alreadyAccountPrompt: string
  backHome: string
  legalPrefix: string
  terms: string
  legalAnd: string
  privacy: string
  patient: {
    title: string
    subtitle: string
    registerText: string
  }
  professional: {
    title: string
    subtitle: string
    registerText: string
  }
}

const loginCopy: Record<AppLocale, LocaleCopy> = {
  es: {
    loginTitle: 'Iniciar Sesion',
    selectType: 'Selecciona tu tipo de cuenta',
    userAccount: 'Cuenta Usuario',
    patientShort: 'Soy paciente',
    professionalAccount: 'Cuenta Profesional',
    professionalShort: 'Psicologo/a o Psiquiatra',
    noAccount: 'No tienes cuenta?',
    registerFree: 'Registrate gratis',
    patientAccount: 'Cuenta de paciente',
    wrongTypeTitle: 'Tipo de cuenta incorrecto',
    wrongTypePatient: 'Esta cuenta esta registrada como profesional. Por favor, selecciona "Acceso Profesional" para iniciar sesion correctamente.',
    wrongTypeProfessional: 'Esta cuenta esta registrada como paciente. Por favor, selecciona "Acceso Usuario" para iniciar sesion correctamente.',
    switchType: 'Cambiar tipo de cuenta',
    invalidCredentials: 'Email o contrasena incorrectos',
    genericLoginError: 'Error al iniciar sesion',
    continueGoogle: 'Continuar con Google',
    or: 'o',
    email: 'Email',
    password: 'Contrasena',
    loginButton: 'Iniciar Sesion',
    forgotPassword: 'Olvidaste tu contrasena?',
    alreadyAccountPrompt: 'No tienes cuenta?',
    backHome: 'Volver al inicio',
    legalPrefix: 'Al iniciar sesion, aceptas nuestros',
    terms: 'Terminos',
    legalAnd: 'y',
    privacy: 'Politica de Privacidad',
    patient: {
      title: 'Iniciar como Paciente',
      subtitle: 'Accede a tu espacio personal',
      registerText: 'Crear cuenta de paciente',
    },
    professional: {
      title: 'Iniciar como Profesional',
      subtitle: 'Accede a tu panel profesional',
      registerText: 'Crear cuenta profesional',
    },
  },
  en: {
    loginTitle: 'Sign In',
    selectType: 'Select your account type',
    userAccount: 'User Account',
    patientShort: 'I am a patient',
    professionalAccount: 'Professional Account',
    professionalShort: 'Psychologist or Psychiatrist',
    noAccount: 'Do not have an account?',
    registerFree: 'Sign up for free',
    patientAccount: 'Patient account',
    wrongTypeTitle: 'Wrong account type',
    wrongTypePatient: 'This account is registered as professional. Please select "Professional Access" to sign in correctly.',
    wrongTypeProfessional: 'This account is registered as patient. Please select "User Access" to sign in correctly.',
    switchType: 'Switch account type',
    invalidCredentials: 'Incorrect email or password',
    genericLoginError: 'Sign in error',
    continueGoogle: 'Continue with Google',
    or: 'or',
    email: 'Email',
    password: 'Password',
    loginButton: 'Sign In',
    forgotPassword: 'Forgot your password?',
    alreadyAccountPrompt: 'Do not have an account?',
    backHome: 'Back to home',
    legalPrefix: 'By signing in, you accept our',
    terms: 'Terms',
    legalAnd: 'and',
    privacy: 'Privacy Policy',
    patient: {
      title: 'Sign In as Patient',
      subtitle: 'Access your personal space',
      registerText: 'Create patient account',
    },
    professional: {
      title: 'Sign In as Professional',
      subtitle: 'Access your professional panel',
      registerText: 'Create professional account',
    },
  },
  fr: {
    loginTitle: 'Connexion',
    selectType: 'Selectionnez votre type de compte',
    userAccount: 'Compte Utilisateur',
    patientShort: 'Je suis patient',
    professionalAccount: 'Compte Professionnel',
    professionalShort: 'Psychologue ou Psychiatre',
    noAccount: "Vous n'avez pas de compte ?",
    registerFree: 'Inscription gratuite',
    patientAccount: 'Compte patient',
    wrongTypeTitle: 'Type de compte incorrect',
    wrongTypePatient: 'Ce compte est enregistre comme professionnel. Veuillez selectionner "Acces Professionnel" pour vous connecter correctement.',
    wrongTypeProfessional: 'Ce compte est enregistre comme patient. Veuillez selectionner "Acces Utilisateur" pour vous connecter correctement.',
    switchType: 'Changer le type de compte',
    invalidCredentials: 'Email ou mot de passe incorrect',
    genericLoginError: 'Erreur de connexion',
    continueGoogle: 'Continuer avec Google',
    or: 'ou',
    email: 'Email',
    password: 'Mot de passe',
    loginButton: 'Connexion',
    forgotPassword: 'Mot de passe oublie ?',
    alreadyAccountPrompt: "Vous n'avez pas de compte ?",
    backHome: "Retour a l'accueil",
    legalPrefix: 'En vous connectant, vous acceptez nos',
    terms: 'Conditions',
    legalAnd: 'et',
    privacy: 'Politique de Confidentialite',
    patient: {
      title: 'Connexion Patient',
      subtitle: 'Accedez a votre espace personnel',
      registerText: 'Creer un compte patient',
    },
    professional: {
      title: 'Connexion Professionnel',
      subtitle: 'Accedez a votre espace professionnel',
      registerText: 'Creer un compte professionnel',
    },
  },
  pt: {
    loginTitle: 'Entrar',
    selectType: 'Selecione seu tipo de conta',
    userAccount: 'Conta de Usuario',
    patientShort: 'Sou paciente',
    professionalAccount: 'Conta Profissional',
    professionalShort: 'Psicologo/a ou Psiquiatra',
    noAccount: 'Nao tem conta?',
    registerFree: 'Cadastre-se gratis',
    patientAccount: 'Conta de paciente',
    wrongTypeTitle: 'Tipo de conta incorreto',
    wrongTypePatient: 'Esta conta esta registrada como profissional. Selecione "Acesso Profissional" para entrar corretamente.',
    wrongTypeProfessional: 'Esta conta esta registrada como paciente. Selecione "Acesso Usuario" para entrar corretamente.',
    switchType: 'Alterar tipo de conta',
    invalidCredentials: 'Email ou senha incorretos',
    genericLoginError: 'Erro ao entrar',
    continueGoogle: 'Continuar com Google',
    or: 'ou',
    email: 'Email',
    password: 'Senha',
    loginButton: 'Entrar',
    forgotPassword: 'Esqueceu sua senha?',
    alreadyAccountPrompt: 'Nao tem conta?',
    backHome: 'Voltar ao inicio',
    legalPrefix: 'Ao entrar, voce aceita nossos',
    terms: 'Termos',
    legalAnd: 'e',
    privacy: 'Politica de Privacidade',
    patient: {
      title: 'Entrar como Paciente',
      subtitle: 'Acesse seu espaco pessoal',
      registerText: 'Criar conta de paciente',
    },
    professional: {
      title: 'Entrar como Profissional',
      subtitle: 'Acesse seu painel profissional',
      registerText: 'Criar conta profissional',
    },
  },
}

function resolveLocale(locale: string): AppLocale {
  if (locale === 'en' || locale === 'fr' || locale === 'pt') return locale
  return 'es'
}

const userTypeContent = {
  patient: {
    icon: User,
    registerLink: '/registro?tipo=paciente',
  },
  professional: {
    icon: Briefcase,
    registerLink: '/registro?tipo=profesional',
  },
}

function LoginForm({ userType, onBack }: { userType: 'patient' | 'professional'; onBack: () => void }) {
  const locale = resolveLocale(useLocale())
  const copy = loginCopy[locale]
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const error = searchParams?.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [wrongTypeError, setWrongTypeError] = useState(false)

  const content = userTypeContent[userType]
  const Icon = content.icon

  const title = userType === 'patient' ? copy.patient.title : copy.professional.title
  const subtitle = userType === 'patient' ? copy.patient.subtitle : copy.professional.subtitle
  const registerText = userType === 'patient' ? copy.patient.registerText : copy.professional.registerText

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')
    setWrongTypeError(false)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('tipo') || result.error.includes('type')) {
          setWrongTypeError(true)
        } else {
          setFormError(result.error)
        }
      } else {
        router.push(callbackUrl)
      }
    } catch {
      setFormError(copy.genericLoginError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-primary-50 rounded-full mx-auto w-fit">
        <Icon className="w-4 h-4 text-primary-700" />
        <span className="text-sm font-medium text-primary-700">
          {userType === 'patient' ? copy.patientAccount : copy.professionalAccount}
        </span>
      </div>

      {wrongTypeError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">{copy.wrongTypeTitle}</p>
              <p className="text-sm text-amber-700">
                {userType === 'patient' ? copy.wrongTypePatient : copy.wrongTypeProfessional}
              </p>
              <button
                onClick={onBack}
                className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
              >
                {copy.switchType}
              </button>
            </div>
          </div>
        </div>
      )}

      {(error || formError) && !wrongTypeError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {formError || (error === 'CredentialsSignin' ? copy.invalidCredentials : copy.genericLoginError)}
        </div>
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
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {copy.continueGoogle}
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-500">{copy.or}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">{copy.email}</label>
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
          <label htmlFor="password" className="label">{copy.password}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 pr-10"
              placeholder="••••••••"
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

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : copy.loginButton}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/olvide-contrasena" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
          {copy.forgotPassword}
        </Link>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        {copy.alreadyAccountPrompt}{' '}
        <Link href={content.registerLink} className="text-primary-600 font-medium hover:underline">
          {registerText}
        </Link>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {copy.switchType}
        </button>
      </div>

      <div className="sr-only">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </>
  )
}

function UserTypeSelector({ onSelect }: { onSelect: (type: 'patient' | 'professional') => void }) {
  const locale = resolveLocale(useLocale())
  const copy = loginCopy[locale]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">{copy.loginTitle}</h1>
      <p className="text-gray-600 text-center mb-8">{copy.selectType}</p>

      <button
        type="button"
        onClick={() => onSelect('patient')}
        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
          <User className="w-6 h-6 text-primary-700" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-900">{copy.userAccount}</p>
          <p className="text-sm text-gray-500">{copy.patientShort}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('professional')}
        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
          <Briefcase className="w-6 h-6 text-accent-700" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-900">{copy.professionalAccount}</p>
          <p className="text-sm text-gray-500">{copy.professionalShort}</p>
        </div>
      </button>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        {copy.noAccount}{' '}
        <Link href="/registro" className="text-primary-600 font-medium hover:underline">
          {copy.registerFree}
        </Link>
      </div>

      <div className="mt-4 text-center">
        <BackButton variant="chevron" className="text-sm" />
      </div>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const tipoParam = searchParams?.get('tipo')
  const locale = resolveLocale(useLocale())
  const copy = loginCopy[locale]

  const getInitialType = (): UserType => {
    if (tipoParam === 'paciente' || tipoParam === 'patient') return 'patient'
    if (tipoParam === 'profesional' || tipoParam === 'professional') return 'professional'
    return null
  }

  const [userType, setUserType] = useState<UserType>(getInitialType())

  if (!userType) {
    return <UserTypeSelector onSelect={setUserType} />
  }

  return (
    <>
      <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
        {userType === 'patient' ? copy.patient.title : copy.professional.title}
      </h1>
      <p className="text-gray-600 text-center mb-6">
        {userType === 'patient' ? copy.patient.subtitle : copy.professional.subtitle}
      </p>
      <LoginForm userType={userType} onBack={() => setUserType(null)} />
    </>
  )
}

export default function LoginPage() {
  const locale = resolveLocale(useLocale())
  const copy = loginCopy[locale]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_28%),linear-gradient(180deg,_#f7fbfa_0%,_#ffffff_100%)] flex items-center justify-center py-8 px-4 md:py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-heading font-semibold text-2xl text-gray-900">PsyDoctor</span>
          </Link>
        </div>

        <div className="card rounded-[28px] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-7">
          <Suspense fallback={<LoginFormFallback />}>
            <LoginContent />
          </Suspense>
        </div>

        <p className="text-xs text-gray-500 text-center mt-5">
          {copy.legalPrefix}{' '}
          <Link href="/terminos" className="underline">{copy.terms}</Link>{' '}
          {copy.legalAnd}{' '}
          <Link href="/privacidad" className="underline">{copy.privacy}</Link>
        </p>
      </div>
    </div>
  )
}
