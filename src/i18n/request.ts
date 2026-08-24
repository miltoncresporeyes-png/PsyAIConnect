import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from './routing'
import esMessages from '../../messages/es.json'
import enMessages from '../../messages/en.json'
import frMessages from '../../messages/fr.json'
import ptMessages from '../../messages/pt.json'

const allMessages = {
    es: esMessages,
    en: enMessages,
    fr: frMessages,
    pt: ptMessages,
} as const

async function loadMessages(locale: string) {
    return allMessages[locale as keyof typeof allMessages] ?? null
}

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale

    if (!locale || !locales.includes(locale as any)) {
        locale = defaultLocale
    }

    let messages = await loadMessages(locale)

    if (!messages) {
        locale = defaultLocale
        messages = await loadMessages(locale)
        if (!messages) {
            throw new Error(`Failed to load messages for locale: ${locale}`)
        }
    }

    return {
        locale,
        messages,
    }
})
