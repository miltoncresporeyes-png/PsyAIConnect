import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
        /** true mientras falta confirmar el codigo de segundo paso */
        mfaPending?: boolean
    }

    interface User extends DefaultUser {
        role: string
        password?: string
        /** Omite el segundo paso (justo tras verificar el correo) */
        skipMfa?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string
        role: string
        sid?: string
        mfa?: boolean
        checkedAt?: number
        deactivated?: boolean
    }
}
