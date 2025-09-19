import { ReactNode } from 'react'
import NavigationProvider from './navigation-provider'
import Footer from './footer'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationProvider />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
