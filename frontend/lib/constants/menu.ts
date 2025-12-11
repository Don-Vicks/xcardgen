import { BarChart3, Home, Layers, LayoutTemplate, Settings } from 'lucide-react'

export const routes = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: Home,
  },
  {
    href: '/dashboard/events',
    label: 'xCards',
    icon: Layers,
  },
  {
    href: '/dashboard/templates',
    label: 'Templates',
    icon: LayoutTemplate,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
]
