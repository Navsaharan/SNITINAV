'use client'

import { Suspense } from 'react'
import Header from './header'

interface MenuItem {
  title: string
  href?: string
  children?: MenuItem[]
}

interface NavigationWrapperProps {
  menuItems: MenuItem[]
}

export default function NavigationWrapper({ menuItems }: NavigationWrapperProps) {
  return (
    <Suspense fallback={<div>Loading navigation...</div>}>
      <Header navigation={menuItems} />
    </Suspense>
  )
}
