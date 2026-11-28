import { prisma } from './prisma'

export type AdminAction = 
    | 'APPROVE_PROFESSIONAL'
    | 'REJECT_PROFESSIONAL'
    | 'BAN_USER'
    | 'UNBAN_USER'
    | 'RESET_PASSWORD'
    | 'UPDATE_NOTES'
    | 'SET_ROLE'
    | 'CONNECT_GOOGLE_MEET'
    | 'DISCONNECT_GOOGLE_MEET'
    | 'UPDATE_TICKET'
    | 'UPDATE_PAYMENT_METHOD'
    | 'REMOVE_REVIEW'
    | 'APPROVE_REVIEW'
    | 'RESTORE_REVIEW'
    | 'DISMISS_REVIEW_REPORT'

export type TargetType = 'USER' | 'PROFESSIONAL' | 'SYSTEM'

interface LogAdminActionParams {
    adminId: string
    adminName?: string
    action: AdminAction
    targetType: TargetType
    targetId: string
    targetName?: string
    targetEmail?: string
    details?: Record<string, string | number | boolean | null>
}

export async function logAdminAction({
    adminId,
    adminName,
    action,
    targetType,
    targetId,
    targetName,
    targetEmail,
    details,
}: LogAdminActionParams) {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                adminName,
                action,
                targetType,
                targetId,
                targetName,
                targetEmail,
                details: details || undefined,
            },
        })
    } catch (error) {
        console.error('Failed to log admin action:', error)
    }
}
