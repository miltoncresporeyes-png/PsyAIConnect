/**
 * Token Management for Email Verification and Password Reset
 * Uses secure random tokens with expiration
 */

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Token expiration times
const TOKEN_EXPIRY = {
    VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET: 60 * 60 * 1000,    // 1 hour
}

type TokenType = 'VERIFICATION' | 'PASSWORD_RESET'

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a verification token for a user
 */
export async function createVerificationToken(email: string): Promise<string> {
    const token = generateSecureToken()
    const expires = new Date(Date.now() + TOKEN_EXPIRY.VERIFICATION)

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    })

    // Create new token
    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    })

    return token
}

/**
 * Verify and consume a verification token
 * Returns the email if valid, null otherwise
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!verificationToken) {
        return null
    }

    // Check if expired
    if (verificationToken.expires < new Date()) {
        // Delete expired token
        await prisma.verificationToken.delete({
            where: { token },
        })
        return null
    }

    // Delete the token (one-time use)
    await prisma.verificationToken.delete({
        where: { token },
    })

    return verificationToken.identifier
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(email: string): Promise<string> {
    const token = generateSecureToken()
    const expires = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET)

    // We'll use the VerificationToken model for password resets too
    // by prefixing the identifier
    const identifier = `reset:${email}`

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier },
    })

    // Create new token
    await prisma.verificationToken.create({
        data: {
            identifier,
            token,
            expires,
        },
    })

    return token
}

/**
 * Verify and consume a password reset token
 * Returns the email if valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
    const resetToken = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!resetToken) {
        return null
    }

    // Check if it's a reset token
    if (!resetToken.identifier.startsWith('reset:')) {
        return null
    }

    // Check if expired
    if (resetToken.expires < new Date()) {
        await prisma.verificationToken.delete({
            where: { token },
        })
        return null
    }

    // Delete the token (one-time use)
    await prisma.verificationToken.delete({
        where: { token },
    })

    // Return email without prefix
    return resetToken.identifier.replace('reset:', '')
}

/**
 * Clean up expired tokens (can be run as a cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.verificationToken.deleteMany({
        where: {
            expires: {
                lt: new Date(),
            },
        },
    })

    return result.count
}
