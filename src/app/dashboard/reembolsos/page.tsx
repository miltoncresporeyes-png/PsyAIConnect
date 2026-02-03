/**
 * Reimbursements Page
 * 
 * Main page for viewing and managing reimbursement requests
 */

import ReimbursementTracker from '@/components/reimbursement/ReimbursementTracker'

export default function ReimbursementsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <ReimbursementTracker />
        </div>
    )
}
