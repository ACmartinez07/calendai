'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Settings,
  Link as LinkIcon,
  CalendarCheck,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reservas', href: '/dashboard/bookings', icon: CalendarCheck },
  { name: 'Tipos de Evento', href: '/dashboard/events', icon: Calendar },
  { name: 'Disponibilidad', href: '/dashboard/availability', icon: Clock },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-1 flex-col border-r bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Calendar className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">
            Calend<span className="text-blue-600">AI</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Link público */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LinkIcon className="h-4 w-4" />
              <span>Tu link público</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Configura tu perfil para obtener tu link
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
