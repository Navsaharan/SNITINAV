'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'



interface MenuItem {
  title: string
  href?: string
  children?: MenuItem[]
}

interface HeaderProps {
  navigation?: MenuItem[]
}

// Original navigation structure from snpitc.in (fallback)
const defaultNavigation: MenuItem[] = [
  { title: 'Home', href: '/' },
  {
    title: 'About Us',
    children: [
      { title: 'About Institute', href: '/about-institute' },
      { title: 'Introduction of Institute', href: '/introduction-institute' },
      { title: 'Scheme Running in The Institute', href: '/scheme-running' },
    ]
  },
  {
    title: 'Admissions',
    children: [
      { title: 'Admission Criteria', href: '/admission-criteria' },
      { title: 'Trades Affilated To NCVT and SCVT', href: '/ncvt-scvt-affilated' },
      { title: 'Summary of Trades Affilated To NCVT', href: '/ncvt-affilated' },
      { title: 'Summary of Trades Affilated To SCVT', href: '/scvt-affilated' },
      { title: 'Application Format', href: '/application-format' },
      { title: 'Fee Structure', href: '/fee-structure' },
    ]
  },
  {
    title: 'Facilities',
    children: [
      { title: 'Infrastructure,Buliding and Workshop', href: '/infrastructure' },
      { title: 'Trade Specific Infrastructure', href: '/ts-infrastructure' },
      { title: 'Electric Power Supply', href: '/electric-power' },
      { title: 'Library', href: '/library' },
      { title: 'Computer lab', href: '/computer-lab' },
      { title: 'Sports', href: '/sports' },
    ]
  },
  {
    title: 'Trainee',
    children: [
      { title: 'Achievements By Trainees', href: '/achievements-by-trainees' },
      { title: 'Records of Trainees', href: '/records-of-trainees' },
      { title: 'Attendance of Trainees', href: '/attendance-of-trainee' },
      { title: 'Certificates Issued To Trainees', href: '/certificate-issued' },
      { title: 'PROGRESS CARD', href: '/progress-card' },
      { title: 'Placements', href: '/placements' },
      { title: 'Results', href: '/results' },
      { title: 'Energy Consumption', href: '/ee-consumption-pspm' },
      { title: 'Raw Material Consumption', href: '/rm-consumption-pspm' },
    ]
  },
  {
    title: 'Staff',
    children: [
      { title: 'Faculty', href: '/faculty' },
      { title: 'Administrative Staff', href: '/administrative-staff' },
      { title: 'Attendance of Instructor', href: '/attendance-instructor' },
    ]
  },
  {
    title: 'More',
    children: [
      {
        title: 'Industry Institute linkage',
        href: '/industry-linkages',
        children: [
          { title: 'Name of the Industry Partner', href: '/industry-partner' },
          { title: 'Major Activities / Contributions', href: '/major-activities' },
          { title: 'Industry Visit / Industrial Tour', href: '/industry-visit' },
          { title: 'Guest Faculty', href: '/guest-faculty' },
          { title: 'Workshop & Seminars', href: '/workshop-seminar' },
        ]
      },
      { title: 'Activities', href: '/activities' },
      { title: 'RTI', href: '/rti' },
      { title: 'Inspection Details', href: '/inspection-details' },
      { title: 'State Directorate', href: '/state-directorate' },
      { title: 'Certificate ISO', href: '/iso-certificate' },
      { title: 'Funds Status', href: '/fund-status' },
      { title: 'DGET And State Govt. Orders', href: '/dget-orders' },
      { title: 'Rating Of Institute', href: '/ratting' },
      { title: 'Grievance Redressal Mechanism', href: '/grm' },
      { title: 'Maintenance Expenditure', href: '/building-maintenance' },
    ]
  },
  { title: 'Gallery', href: '/gallery' },
  { title: 'Feedback', href: '/feedback' },
  { title: 'Contact', href: '/contact' },
  { title: 'Student Portal', href: '/student/login' },
  { title: 'Site Map', href: '/sitemap' },
]

export default function Header({ navigation: propNavigation }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [navigation, setNavigation] = useState<MenuItem[]>(propNavigation || defaultNavigation)
  const headerRef = useRef<HTMLElement>(null)

  // Update navigation when prop changes
  useEffect(() => {
    if (propNavigation) {
      setNavigation(propNavigation)
    } else {
      // Fallback: fetch dynamic navigation structure
      const fetchNavigation = async () => {
        try {
          const response = await fetch('/api/navigation')
          if (response.ok) {
            const data = await response.json()
            // Convert NavigationItem[] to MenuItem[] format
            const convertedNavigation: MenuItem[] = data.navigation
              .filter((item: any) => item.isVisible)
              .map((item: any) => ({
                title: item.title,
                href: item.href,
                children: item.children
                  ?.filter((child: any) => child.isVisible)
                  ?.map((child: any) => ({
                  title: child.title,
                  href: child.href,
                  children: child.children
                    ?.filter((grandchild: any) => grandchild.isVisible)
                    ?.map((grandchild: any) => ({
                      title: grandchild.title,
                      href: grandchild.href,
                    })),
                })),
            }))

          setNavigation(convertedNavigation)
        } else {
          setNavigation(defaultNavigation)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching navigation:', error)
        }
        setNavigation(defaultNavigation)
      } finally {
        // Navigation loaded
      }
    }

      fetchNavigation()
    }
  }, [propNavigation])

  const handleDropdownToggle = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title)
  }

  const handleDropdownClose = () => {
    setActiveDropdown(null)
    setActiveSubmenu(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  return (
    <header ref={headerRef} className="bg-white shadow-sm border-b border-gray-200">
      {/* Top Bar */}
      <div className="py-2 text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span>Approved by Directorate of Technical Education, Govt. of Rajasthan</span>
              <span className="hidden sm:inline">|</span>
              <span>Affiliated to NCVT (DGE&T) Govt. of India since 2009</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <span>📞 01564-275628</span>
              <span>📱 9414947801</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 relative">
                  <Image
                    src="/snitilogo.png"
                    alt="S.N. Pvt. Industrial Training Institute Logo"
                    fill
                    sizes="(max-width: 640px) 48px, (max-width: 1024px) 64px, 80px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>
            <div className="min-w-0 flex-1">
              <Link href="/" className="block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                  S.N. Pvt. Industrial Training Institute
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-tight">
                  D-117, Kaka Colony, Gandhi Vidhya Mandir, Teh.-Sardar Shahar, Dist. Churu
                </p>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="mobile-menu-button text-gray-700 hover:text-gray-900 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 pb-4">
          {navigation.map((item) => (
            <div key={item.title} className="relative flex items-center">
              {item.children && item.children.length > 0 ? (
                <div
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.title)}
                  onMouseLeave={() => {
                    setActiveDropdown(null)
                    setActiveSubmenu(null)
                  }}
                >
                  <button
                    className="flex items-center space-x-1 font-medium transition-colors py-2 h-10 px-2 rounded hover:bg-gray-100"
                    style={{
                      color: activeDropdown === item.title ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: activeDropdown === item.title ? 'var(--color-bg-secondary)' : 'transparent'
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDropdownToggle(item.title)
                    }}
                  >
                    <span>{item.title}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === item.title ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === item.title && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 shadow-xl rounded-md border z-[9999]"
                      style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="py-2">
                        {item.children.map((child) => (
                          <div key={child.title}>
                            {child.children && child.children.length > 0 ? (
                              <div
                                className="relative group"
                                onMouseEnter={() => setActiveSubmenu(child.title)}
                                onMouseLeave={() => setActiveSubmenu(null)}
                              >
                                <Link
                                  href={child.href || '#'}
                                  className="flex items-center justify-between px-4 py-3 text-sm transition-colors border-b cursor-pointer hover:bg-gray-50"
                                  style={{
                                    color: 'var(--color-text-secondary)',
                                    borderColor: 'var(--color-border-light)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                                    e.currentTarget.style.color = 'var(--color-primary)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                                  }}
                                  onClick={(e) => {
                                    // Allow navigation to the parent page
                                    if (child.href && child.href !== '#') {
                                      handleDropdownClose()
                                    } else {
                                      // Prevent default if no href, just toggle submenu
                                      e.preventDefault()
                                    }
                                  }}
                                >
                                  <span>{child.title}</span>
                                  <ChevronDown className="h-3 w-3 -rotate-90" />
                                </Link>
                                {activeSubmenu === child.title && (
                                  <div
                                    className="absolute left-full top-0 ml-1 w-64 shadow-xl rounded-md border z-[10000]"
                                    style={{
                                      backgroundColor: 'var(--color-bg-primary)',
                                      borderColor: 'var(--color-border)',
                                    }}
                                  >
                                  <div className="py-2">
                                    {child.children.map((grandchild) => (
                                      <Link
                                        key={grandchild.title}
                                        href={grandchild.href || '#'}
                                        className="block px-4 py-3 text-sm transition-colors border-b last:border-b-0 hover:bg-gray-50"
                                        style={{
                                          color: 'var(--color-text-secondary)',
                                          borderColor: 'var(--color-border-light)',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                                          e.currentTarget.style.color = 'var(--color-primary)'
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'transparent'
                                          e.currentTarget.style.color = 'var(--color-text-secondary)'
                                        }}
                                        onClick={(e) => {
                                          // Ensure navigation happens for grandchildren
                                          if (grandchild.href && grandchild.href !== '#') {
                                            handleDropdownClose()
                                            // Let the Link handle navigation
                                          } else {
                                            e.preventDefault()
                                          }
                                        }}
                                      >
                                        {grandchild.title}
                                      </Link>
                                    ))}
                                  </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Link
                                href={child.href || '#'}
                                className="block px-4 py-3 text-sm transition-colors border-b last:border-b-0 hover:bg-gray-50"
                                style={{
                                  color: 'var(--color-text-secondary)',
                                  borderColor: 'var(--color-border-light)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                                  e.currentTarget.style.color = 'var(--color-primary)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                                }}
                                onClick={(e) => {
                                  // Ensure navigation happens
                                  if (child.href && child.href !== '#') {
                                    handleDropdownClose()
                                    // Let the Link handle navigation
                                  } else {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                {child.title}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="flex items-center font-medium py-2 h-10 transition-colors hover:text-blue-600"
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.title}>
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <button
                        className="flex items-center justify-between w-full px-3 py-2 font-medium transition-colors"
                        style={{
                          color: 'var(--color-text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-secondary)'
                        }}
                        onClick={() => handleDropdownToggle(item.title)}
                      >
                        <span>{item.title}</span>
                        <ChevronDown className={`h-4 w-4 transform transition-transform ${activeDropdown === item.title ? 'rotate-180' : ''}`} />
                      </button>
                      {activeDropdown === item.title && (
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => (
                            <div key={child.title}>
                              {child.children && child.children.length > 0 ? (
                                <div>
                                  <Link
                                    href={child.href || '#'}
                                    className="block px-3 py-2 text-sm font-medium transition-colors"
                                    style={{
                                      color: 'var(--color-text-light)',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = 'var(--color-primary)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = 'var(--color-text-light)'
                                    }}
                                    onClick={() => {
                                      setMobileMenuOpen(false)
                                      setActiveDropdown(null)
                                    }}
                                  >
                                    {child.title}
                                  </Link>
                                  <div className="pl-4 space-y-1">
                                    {child.children.map((grandchild) => (
                                      <Link
                                        key={grandchild.title}
                                        href={grandchild.href || '#'}
                                        className="block px-3 py-2 text-xs transition-colors"
                                        style={{
                                          color: 'var(--color-text-light)',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-primary)'
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--color-text-light)'
                                        }}
                                        onClick={() => {
                                          setMobileMenuOpen(false)
                                          setActiveDropdown(null)
                                        }}
                                      >
                                        {grandchild.title}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <Link
                                  href={child.href || '#'}
                                  className="block px-3 py-2 text-sm transition-colors"
                                  style={{
                                    color: 'var(--color-text-light)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--color-primary)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--color-text-light)'
                                  }}
                                  onClick={() => {
                                    setMobileMenuOpen(false)
                                    setActiveDropdown(null)
                                  }}
                                >
                                  {child.title}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="block px-3 py-2 font-medium transition-colors"
                      style={{
                        color: 'var(--color-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-secondary)'
                      }}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setActiveDropdown(null)
                      }}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
