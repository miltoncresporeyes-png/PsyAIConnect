import { Header, Footer } from '@/components/layout'
import { Loader2 } from 'lucide-react'

export default function BuscarLoading() {
    return (
        <>
            <Header />

            <main className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                    <p className="text-sm text-gray-500">Buscando profesionales disponibles...</p>
                </div>
            </main>

            <Footer />
        </>
    )
}
