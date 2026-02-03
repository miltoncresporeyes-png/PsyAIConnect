import { Award, Shield, Users } from 'lucide-react'

export function AdministrativeValueSection() {
    return (
        <section className="py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-y border-gray-200">
            <div className="container-wide">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                    {/* Main Badge */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-primary-700" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Diseñado por expertos en gestión y salud
                            </p>
                            <p className="text-xs text-gray-600">
                                Infraestructura que no falla
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-gray-300" />

                    {/* Secondary Trust Elements */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-600" strokeWidth={2} />
                            <span className="text-xs text-gray-700 font-medium">
                                Cumplimiento normativo
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" strokeWidth={2} />
                            <span className="text-xs text-gray-700 font-medium">
                                +500 profesionales activos
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
