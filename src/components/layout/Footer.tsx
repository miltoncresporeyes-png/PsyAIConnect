import Link from 'next/link'

const footerLinks = {
    producto: [
        { name: 'Buscar Profesional', href: '/registro?tipo=paciente' },
        { name: 'Soy Profesional', href: '/registro?tipo=profesional' },
        { name: 'Precios', href: '/planes' },
    ],
    recursos: [
        { name: 'Blog', href: '/blog' },
        { name: 'Preguntas Frecuentes', href: '/faq' },
        { name: 'Cómo Funciona', href: '/#como-funciona' },
    ],
    legal: [
        { name: 'Términos de Uso', href: '/terminos' },
        { name: 'Política de Privacidad', href: '/privacidad' },
        { name: 'Consentimiento Informado', href: '/consentimiento' },
    ],
}

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container-wide py-12 md:py-16">
                {/* Payment Methods */}
                <div className="mb-12 pb-8 border-b border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-400">Métodos de pago aceptados</span>
                        <div className="flex items-center gap-2">
                            {/* Mastercard */}
                            <div className="bg-gray-800 p-1.5 rounded h-8 w-12 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="7" cy="12" r="7" fill="#EB001B" />
                                    <circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" />
                                </svg>
                            </div>
                            {/* Visa */}
                            <div className="bg-gray-800 p-1.5 rounded h-8 w-12 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.824 15.698L12.448 5.618H15.021L13.397 15.698H10.824ZM20.785 15.808C20.73 15.808 18.913 14.774 17.653 14.774C16.321 14.774 15.342 15.466 15.328 16.891C15.314 17.971 16.321 18.577 17.078 18.936C17.848 19.309 18.114 19.543 18.114 19.888C18.114 20.44 17.442 20.688 16.784 20.688C15.93 20.688 15.159 20.44 14.753 20.247L14.333 21.434C14.711 21.613 15.803 21.902 16.924 21.916C18.926 21.916 20.252 20.938 20.266 19.419C20.266 18.179 19.482 17.614 18.535 17.159C17.513 16.649 16.868 16.332 16.882 15.836C16.882 15.395 17.372 14.899 18.282 14.899C18.955 14.899 20.015 15.202 20.407 15.395L20.785 15.808ZM23.824 15.698L24.58 20.081C24.636 20.302 24.692 20.591 24.734 20.826L24.776 20.895L27.604 5.618H25.042C24.468 5.618 23.95 5.949 23.726 6.473L20.266 22.846H22.956L23.824 15.698ZM9.114 5.618L6.468 12.633L6.188 11.2C5.908 9.946 4.984 6.845 4.9 5.618H0.756L0.728 5.866C1.498 6.032 2.45 6.252 2.758 6.445C3.066 6.638 3.122 6.859 3.234 7.231L5.378 17.27H8.204L13.784 5.618H9.114Z" fill="white" transform="scale(0.8) translate(4, 2)" />
                                </svg>
                            </div>
                            {/* Amex / Generic Card */}
                            <div className="bg-blue-600 p-1 rounded h-8 w-12 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white text-center leading-tight">AMERICAN<br />EXPRESS</span>
                            </div>
                            {/* Webpay Plus Badge (Chile Standard) */}
                            <div className="bg-white p-1 rounded h-8 w-auto min-w-12 px-2 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-orange-600 tracking-tighter">Webpay</span>
                                <span className="text-[10px] font-bold text-gray-800 ml-0.5">Plus</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="font-heading font-semibold text-xl text-white">
                                PsyConnect
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Conectamos pacientes con profesionales de salud mental verificados en Chile.
                        </p>
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} PsyConnect SpA. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Producto */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Producto</h4>
                        <ul className="space-y-3">
                            {footerLinks.producto.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recursos */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Recursos</h4>
                        <ul className="space-y-3">
                            {footerLinks.recursos.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>



                {/* Legal Disclaimer */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center max-w-3xl mx-auto">
                        PsyConnect SpA es una plataforma de intermediación tecnológica, no un prestador de servicios de salud.
                        Los profesionales son independientes y responsables de su práctica.
                        En caso de emergencia, llama al <strong className="text-gray-400">600 360 7777</strong> o acude a urgencias.
                    </p>
                </div>
            </div>
        </footer>
    )
}
