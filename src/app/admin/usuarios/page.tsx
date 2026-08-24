'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Users, Search } from 'lucide-react'

interface User {
    id: string
    name: string | null
    email: string
    role: string
    isActive: boolean
    createdAt: Date
    _count: { appointments: number }
}

export default function UsuariosPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/403')
        }
    }, [status, session, router])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users')
                if (response.ok) {
                    const data = await response.json()
                    setUsers(data)
                }
            } catch (error) {
                console.error('Error fetching users:', error)
            } finally {
                setIsLoading(false)
            }
        }
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchUsers()
        }
    }, [status, session])

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        return null
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const roleLabels: Record<string, string> = {
        PATIENT: 'Paciente',
        PROFESSIONAL: 'Profesional',
        ADMIN: 'Administrador',
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
                <p className="text-gray-500">Gestión de usuarios de la plataforma</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">Todos los roles</option>
                    <option value="PATIENT">Pacientes</option>
                    <option value="PROFESSIONAL">Profesionales</option>
                    <option value="ADMIN">Administradores</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/users/${user.id}`)}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name || 'Sin nombre'}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {user.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {roleLabels[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{user._count.appointments}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString('es-CL')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
