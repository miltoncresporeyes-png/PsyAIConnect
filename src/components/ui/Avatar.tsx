'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AvatarProps {
    src?: string | null
    name?: string | null
    size?: number
    className?: string
}

/** Foto de perfil con respaldo: si la imagen no carga (o no existe), muestra la inicial. */
export function Avatar({ src, name, size = 56, className = '' }: AvatarProps) {
    const [failed, setFailed] = useState(false)
    const initial = (name?.trim().charAt(0) || '?').toUpperCase()

    return (
        <div
            className={`rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
            style={{ width: size, height: size }}
        >
            {src && !failed ? (
                <Image
                    src={src}
                    alt={name || ''}
                    width={size}
                    height={size}
                    unoptimized
                    onError={() => setFailed(true)}
                    className="object-cover"
                    style={{ width: size, height: size }}
                />
            ) : (
                <span className="font-bold text-primary-600" style={{ fontSize: size * 0.4 }}>
                    {initial}
                </span>
            )}
        </div>
    )
}

export default Avatar
