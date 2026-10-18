/**
 * Transbank Webpay Plus REST Integration
 * Official Docs: https://www.transbankdevelopers.cl/referencia/webpay
 */

// Default Integration Test Credentials provided by Transbank
const TBK_INTEGRATION_COMMERCE_CODE = '597055555532'
const TBK_INTEGRATION_API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'

export function isTransbankProduction(): boolean {
    return process.env.TRANSBANK_ENVIRONMENT === 'production'
}

function getCommerceCode(): string {
    return process.env.TRANSBANK_COMMERCE_CODE || TBK_INTEGRATION_COMMERCE_CODE
}

function getApiKey(): string {
    return process.env.TRANSBANK_API_KEY || TBK_INTEGRATION_API_KEY
}

function getTransbankBaseUrl(): string {
    return isTransbankProduction()
        ? 'https://webpay3g.transbank.cl'
        : 'https://webpay3gint.transbank.cl'
}

export interface WebpayCreateTransactionParams {
    buyOrder: string
    sessionId: string
    amount: number
    returnUrl: string
}

export interface WebpayCreateTransactionResult {
    token: string
    url: string
}

export interface WebpayCommitTransactionResult {
    vci?: string
    amount: number
    status: 'AUTHORIZED' | 'FAILED' | 'REVERSED' | 'NULLIFIED' | 'PARTIALLY_NULLIFIED' | 'CAPTURED'
    buy_order: string
    session_id: string
    card_detail?: {
        card_number: string
    }
    accounting_date?: string
    transaction_date?: string
    authorization_code?: string
    payment_type_code?: string
    response_code: number
    installments_amount?: number
    installments_number?: number
    balance?: number
}

/**
 * Initialize a Webpay Plus transaction
 */
export async function createWebpayTransaction(
    params: WebpayCreateTransactionParams
): Promise<WebpayCreateTransactionResult> {
    const baseUrl = getTransbankBaseUrl()
    const commerceCode = getCommerceCode()
    const apiKey = getApiKey()

    const payload = {
        buy_order: params.buyOrder,
        session_id: params.sessionId,
        amount: Math.round(params.amount),
        return_url: params.returnUrl,
    }

    const response = await fetch(`${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Tbk-Api-Key-Id': commerceCode,
            'Tbk-Api-Key-Secret': apiKey,
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Webpay API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return {
        token: data.token,
        url: data.url,
    }
}

/**
 * Commit a Webpay Plus transaction with the returned token
 */
export async function commitWebpayTransaction(token: string): Promise<WebpayCommitTransactionResult> {
    const baseUrl = getTransbankBaseUrl()
    const commerceCode = getCommerceCode()
    const apiKey = getApiKey()

    const response = await fetch(`${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Tbk-Api-Key-Id': commerceCode,
            'Tbk-Api-Key-Secret': apiKey,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Webpay commit error (${response.status}): ${errorText}`)
    }

    return response.json()
}
