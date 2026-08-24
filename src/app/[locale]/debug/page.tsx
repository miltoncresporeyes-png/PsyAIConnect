'use client'

import { useTranslations } from 'next-intl'

export default function DebugLocale() {
  const t = useTranslations('nav')

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Locale Debug</h2>
      <p>Patient label: {t('patient')}</p>
    </div>
  )
}
