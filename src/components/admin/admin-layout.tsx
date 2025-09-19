'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Menu,
  X,
  Home,
  FileText,
  Image,
  ImageIcon,
  Settings,
  Users,
  MessageSquare,
  LogOut,
  Palette,
  Lock,
  TestTube,
  Navigation,
  Mail,
  CreditCard,
  Shield,
  BarChart3,
  Database,
  UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExtendedUser {
  role: string
  id: string
  email: string
  name?: string | null
}

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'Navigation', href: '/admin/navigation', icon: Navigation },
  { name: 'Editor Test', href: '/admin/editor-test', icon: TestTube },
  { name: 'Media', href: '/admin/media', icon: Image },
  { name: 'Images', href: '/admin/images', icon: ImageIcon },
  { name: 'Faculty', href: '/admin/faculty', icon: Users },
  {
    name: 'Email Management',
    href: '/admin/email',
    icon: Mail,
    submenu: [
      { name: 'Email Accounts', href: '/admin/email/accounts', icon: UserCheck },
      { name: 'Email Monitoring', href: '/admin/email/monitoring', icon: Shield },
      { name: 'Email Analytics', href: '/admin/email/analytics', icon: BarChart3 }
    ]
  },
  {
    name: 'Payment Management',
    href: '/admin/payments',
    icon: CreditCard,
    submenu: [
      { name: 'Payment Catalog', href: '/admin/payments/catalog', icon: Database },
      { name: 'Transactions', href: '/admin/payments/transactions', icon: BarChart3 },
      { name: 'Gateway Config', href: '/admin/payments/gateways', icon: Settings }
    ]
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Colors', href: '/admin/colors', icon: Palette },
  { name: 'Password', href: '/admin/password', icon: Lock },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const { data: session } = useSession()

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const NavigationItem = ({ item, isMobile = false }: { item: any, isMobile?: boolean }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = expandedMenus.includes(item.name)
    const isActive = pathname === item.href || (hasSubmenu && item.submenu.some((sub: any) => pathname === sub.href))

    if (hasSubmenu) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={cn(
              "group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md",
              isActive
                ? "bg-blue-100 text-blue-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </div>
            <svg
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded ? "rotate-90" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.submenu.map((subItem: any) => (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    pathname === subItem.href
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <subItem.icon className="mr-3 h-4 w-4" />
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
          isActive
            ? "bg-blue-100 text-blue-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-semibold">Admin Panel</span>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <NavigationItem key={item.name} item={item} isMobile={true} />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <span className="text-xl font-semibold text-gray-900">Admin Panel</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </nav>
          
          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-gray-500">{(session?.user as ExtendedUser)?.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
