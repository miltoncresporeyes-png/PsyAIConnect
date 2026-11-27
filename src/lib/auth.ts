import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import crypto from "crypto"
import { RECENT_EMAIL_VERIFICATION_MS } from "@/lib/twoFactor"
import { prisma } from "@/lib/prisma"

// Cookie que el registro de profesionales fija antes de ir a Google, para que la
// intención del usuario se conserve y la cuenta nazca ya como profesional.
export const PENDING_USER_TYPE_COOKIE = "pendingUserType"

function createProfessionalSlug(name: string | null | undefined, userId: string) {
    const base = (name || "profesional")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
    return `${base || "profesional"}-${userId.slice(0, 6)}`
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as any),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: "PATIENT",
                }
            },
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email y contraseña son requeridos")
                }

                const user = await prisma.user.findFirst({
                    where: { email: { equals: credentials.email.trim(), mode: "insensitive" } },
                })

                if (!user || !user.password) {
                    throw new Error("Usuario no encontrado")
                }

                // El segundo paso (código por correo) se exige aquí, en el
                // servidor, y no solo en la interfaz de registro.
                if (!user.emailVerified) {
                    throw new Error("Debes verificar tu correo antes de iniciar sesión. Completa el registro para recibir un código.")
                }

                if (user.isActive === false) {
                    throw new Error("Tu cuenta se encuentra suspendida. Contacta a soporte.")
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error("Contraseña incorrecta")
                }

                // Recien verificado el correo con codigo: no se pide un segundo codigo.
                const justVerified =
                    user.emailVerified != null &&
                    Date.now() - user.emailVerified.getTime() < RECENT_EMAIL_VERIFICATION_MS

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    skipMfa: justVerified,
                }
            },
        }),
    ],
    events: {
        // Alta nueva con Google: si venía desde el registro de profesionales,
        // la cuenta se crea como PROFESSIONAL desde el inicio.
        async createUser({ user }) {
            try {
                const intent = cookies().get(PENDING_USER_TYPE_COOKIE)?.value
                if (intent !== "professional") return

                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "PROFESSIONAL" },
                })
                const existing = await prisma.professional.findUnique({
                    where: { userId: user.id },
                    select: { id: true },
                })
                if (!existing) {
                    await prisma.professional.create({
                        data: {
                            userId: user.id,
                            professionalType: "PSYCHOLOGIST",
                            slug: createProfessionalSlug(user.name, user.id),
                            sessionPrice: 50000,
                        },
                    })
                }
            } catch (error) {
                console.error("[auth] No se pudo aplicar la intención profesional:", error)
            }
        },
    },
    callbacks: {
        // Impide mezclar tipos de cuenta: si la persona eligió "paciente" o
        // "profesional" y su correo ya existe con el otro rol, se rechaza con un
        // mensaje claro en lugar de entrar silenciosamente a la vista equivocada.
        async signIn({ account, user }) {
            if (account?.provider !== "google" || !user.email) return true
            try {
                const intent = cookies().get(PENDING_USER_TYPE_COOKIE)?.value
                if (intent !== "professional" && intent !== "patient") return true

                const existing = await prisma.user.findFirst({
                    where: { email: { equals: user.email, mode: "insensitive" } },
                    select: { role: true },
                })
                if (!existing) return true

                const isProfessional = existing.role === "PROFESSIONAL"
                if (intent === "professional" && !isProfessional) return "/registro?error=cuenta_paciente"
                if (intent === "patient" && isProfessional) return "/login?error=cuenta_profesional&tipo=profesional"
            } catch (error) {
                console.error("[auth] Error validando tipo de cuenta:", error)
            }
            return true
        },
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id
                // Segundo paso (OTP): cada inicio de sesion nace pendiente y solo
                // se completa con la prueba guardada en la BD (ver api/auth/2fa).
                token.sid = crypto.randomUUID()
                token.mfa = Boolean(user.skipMfa)
                // El rol se lee de la BD: el objeto `user` del proveedor puede traer
                // el valor inicial (PATIENT) antes de que se aplique la intención.
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true },
                })
                token.role = dbUser?.role ?? user.role
            }

            // En trigger "update" NUNCA se acepta `session.role` del cliente:
            // cualquier usuario podría llamar update({ role: "ADMIN" }) y escalar
            // privilegios. Se relee el rol desde la base de datos.
            if (trigger === "update" && token.id && token.mfa === false && token.sid) {
                const challenge = await prisma.loginChallenge.findUnique({
                    where: { sessionId: token.sid as string },
                    select: { userId: true, verifiedAt: true },
                })
                if (challenge?.verifiedAt && challenge.userId === token.id) {
                    token.mfa = true
                }
            }

            if (trigger === "update" && token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { role: true, isActive: true },
                })
                if (dbUser) {
                    token.role = dbUser.role
                }
            }

            return token
        },
        async session({ session, token }) {
            // Con el segundo paso pendiente la sesion no expone usuario: asi las
            // rutas de API que exigen session.user responden 401 hasta confirmar.
            if (token.mfa === false) {
                return { expires: session.expires, mfaPending: true } as typeof session
            }
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },
    },
}
