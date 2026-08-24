'use client'

import { Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function CrisisBanner() {
    const t = useTranslations('crisis')

    return (
        <div className="crisis-banner">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <Phone className="w-4 h-4" />
                <span>
                    <strong>{t('emergency')}</strong> {t('call')}{' '}
                    <a href="tel:6003607777" className="font-bold">
                        600 360 7777
                    </a>{' '}
                    {t('healthRespond')}{' '}
                    <a href="tel:131" className="font-bold">
                        131
                    </a>{' '}
                    {t('ambulance')}
                </span>
            </div>
        </div>
    )
}
