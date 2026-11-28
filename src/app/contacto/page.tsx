import { redirect } from 'next/navigation'

/** Varias paginas enlazan a /contacto: lleva al canal de soporte y feedback. */
export default function ContactoPage() {
    redirect('/soporte')
}
