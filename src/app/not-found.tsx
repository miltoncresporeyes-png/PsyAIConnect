import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
    const t = await getTranslations('notFound')

    return (
        <>
            <Header />

            <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-16">
                <div className="text-center px-4">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="text-9xl font-heading font-bold text-primary-100">
                            404
                        </div>
                        <div className="relative -mt-16">
                            <span className="text-6xl">🔍</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        {t('description')}
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="btn-primary inline-flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            {t('goHome')}
                        </Link>
                        <Link
                            href="/buscar"
                            className="btn-secondary inline-flex items-center justify-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            {t('findPro')}
                        </Link>
                    </div>

                    {/* Help text */}
                    <p className="mt-12 text-sm text-gray-500">
                        {t('helpText')}{' '}
                        <a href="mailto:contacto@psydoctor.cl" className="text-primary-600 hover:underline">
                            contacto@psydoctor.cl
                        </a>
                    </p>
                </div>
            </div>

            <Footer />
        </>
    )
}
