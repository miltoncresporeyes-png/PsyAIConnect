import { useTranslations } from 'next-intl'

interface PaymentMethodsProps {
    showSecondary?: boolean
}

export function PaymentMethods({ showSecondary = true }: PaymentMethodsProps) {
    const t = useTranslations('payment')

    return (
        <div className="bg-white/5 rounded-xl border border-gray-800/50 p-3">
            <h4 className="mb-1 text-sm font-semibold text-white">{t('title')}</h4>
            <p className="mb-2.5 text-xs text-gray-400">{t('subtitle')}</p>

            <div className="mx-auto w-full max-w-[200px] rounded-xl bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                <img 
                    src="/images/payment-methods.png" 
                    alt="Transbank, Redcompra, Visa, Mastercard, Magna, Amex, Diners"
                    className="w-full h-auto object-contain"
                />
            </div>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium">{t('secure')}</span>
            </div>
        </div>
    )
}
