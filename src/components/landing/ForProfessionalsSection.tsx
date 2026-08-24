'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Check,
    Calendar,
    BarChart3,
    Users as UsersIcon,
    ChevronDown,
    Clock,
    UserCheck,
    FileCheck,
    Eye,
    Lock,
    Shield,
    Heart,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

const benefitIcons = [Calendar, BarChart3, UsersIcon]
const benefitNumbers = ['01', '02', '03']
const benefitStyles = [
    { iconBg: 'bg-teal-50', iconBorder: 'border-teal-100', iconColor: 'text-teal-700' },
    { iconBg: 'bg-cyan-50', iconBorder: 'border-cyan-100', iconColor: 'text-cyan-700' },
    { iconBg: 'bg-sky-50', iconBorder: 'border-sky-100', iconColor: 'text-sky-700' },
]

const supportIcons = [Clock, UserCheck, UsersIcon, FileCheck, Eye]
const ethicsIcons = [Lock, Shield, Heart]

export function ForProfessionalsSection() {
    const [isExpanded, setIsExpanded] = useState(false)
    const t = useTranslations('forProfessionals')
    const benefits = t.raw('benefits') as Array<{ title: string; description: string }>
    const features = t.raw('features') as string[]
    const support = t.raw('learnMore.support') as Array<{ title: string; description: string }>
    const ethics = t.raw('learnMore.ethics') as Array<{ title: string; description: string }>

    return (
        <section 
            id="para-profesionales"
            className="py-16 md:py-20 bg-white"
            aria-labelledby="professionals-heading"
        >
            <div className="container-wide">
                <header className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
                    <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 font-semibold text-sm rounded-full mb-4 uppercase tracking-wide">
                        {t('sectionLabel')}
                    </span>
                    <h2 id="professionals-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('heading')}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t('subheading')}
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    {benefits.map((benefit, index) => {
                        const Icon = benefitIcons[index]
                        const s = benefitStyles[index]
                        return (
                            <article 
                                key={index}
                                className="relative flex flex-col bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200/80 hover:-translate-y-0.5 transition-all duration-300"
                                role="listitem"
                            >
                                <div 
                                    className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md"
                                    aria-hidden="true"
                                >
                                    <span className="text-white text-xs font-bold">{benefitNumbers[index]}</span>
                                </div>
                                <div 
                                    className={`w-14 h-14 rounded-xl ${s.iconBg} border ${s.iconBorder} flex items-center justify-center mb-4`}
                                    aria-hidden="true"
                                >
                                    <Icon className={`w-7 h-7 ${s.iconColor}`} strokeWidth={2} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                            </article>
                        )
                    })}
                </div>

                <div className="max-w-3xl mx-auto mb-10">
                    <div className="bg-slate-50/60 rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-lg hover:border-teal-200/80 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md" aria-hidden="true">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {t('profileTitle')}
                            </h3>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6" role="list" aria-label={t('profileTitle')}>
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3" role="listitem">
                                    <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                        <Check className="w-4 h-4 text-teal-600" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-gray-700 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                {t('freePlan')}
                            </p>
                            <Link href="/planes" className="text-sm text-teal-700 font-medium hover:underline">
                                {t('viewDetail')}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto text-center mb-6">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-teal-700 font-medium hover:text-teal-600 inline-flex items-center gap-2 transition-colors"
                        aria-expanded={isExpanded}
                        aria-controls="learn-more-panel"
                    >
                        <span className="border-b border-teal-700 hover:border-teal-600">
                            {isExpanded ? t('lessBtn') : t('learnMoreBtn')}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>
                </div>

                <div
                    id="learn-more-panel"
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 mt-10' : 'max-h-0 opacity-0 mt-0'}`}
                    aria-hidden={!isExpanded}
                    hidden={!isExpanded}
                >
                    <div className="space-y-10">
                        <article className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 md:p-8 border border-teal-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                {t('learnMore.supportTitle')}
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {support.map((item, index) => {
                                    const Icon = supportIcons[index] ?? Clock
                                    return (
                                        <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </article>

                        <article className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white">
                            <h3 className="text-xl font-semibold mb-6">
                                {t('learnMore.ethicsTitle')}
                            </h3>
                            <div className="space-y-4">
                                {ethics.map((item, index) => {
                                    const Icon = ethicsIcons[index] ?? Shield
                                    return (
                                        <div key={index} className="flex items-start gap-3">
                                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                            <div>
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="text-sm text-white/80">{item.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </article>

                        <div className="text-center">
                            <p className="text-gray-600 mb-6">
                                {t('learnMore.intro')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/registro?tipo=profesional"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                                >
                                    {t('learnMore.ctaProfile')}
                                </Link>
                                <Link
                                    href="/planes"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-teal-700 border-2 border-teal-200 font-semibold rounded-xl hover:bg-teal-50 transition-all"
                                >
                                    {t('learnMore.ctaPlans')}
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                {t('learnMore.noCommitment')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

