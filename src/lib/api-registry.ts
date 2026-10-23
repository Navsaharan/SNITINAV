export type ApiAuth = 'public' | 'session' | 'admin'

export interface ApiRouteDefinition {
  path: string
  methods: string[]
  auth: ApiAuth
  area: string
  description: string
  dynamic?: boolean
  probePath?: string
  probeExpectedStatuses?: number[]
}

/**
 * The API manager's source of truth for the route surface shipped by SNITINAV.
 * Dynamic routes are intentionally listed without a probe path because they need
 * a real entity id. Safe GET routes can be probed from the admin UI.
 */
export const apiRouteDefinitions: ApiRouteDefinition[] = [
  { path: '/api/health', methods: ['GET', 'POST'], auth: 'public', area: 'System', description: 'Application and database health checks', probePath: '/api/health', probeExpectedStatuses: [200, 503] },
  { path: '/api/csrf', methods: ['GET'], auth: 'public', area: 'Auth', description: 'CSRF token endpoint' },
  { path: '/api/auth/[...nextauth]', methods: ['GET', 'POST'], auth: 'public', area: 'Auth', description: 'NextAuth sign-in, callback, and session handlers' },
  { path: '/api/auth/device-context', methods: ['GET'], auth: 'public', area: 'Auth', description: 'Reports the current admin device context', probePath: '/api/auth/device-context' },
  { path: '/api/auth/change-password', methods: ['POST'], auth: 'session', area: 'Auth', description: 'Change the authenticated administrator password' },
  { path: '/api/auth/logout', methods: ['POST'], auth: 'session', area: 'Auth', description: 'End the active administrator session' },
  { path: '/api/navigation', methods: ['GET'], auth: 'public', area: 'Content', description: 'Read the published navigation tree', probePath: '/api/navigation' },
  { path: '/api/pages', methods: ['GET'], auth: 'session', area: 'Content', description: 'List and search CMS pages', probePath: '/api/pages' },
  { path: '/api/pages/[id]', methods: ['GET', 'PUT', 'DELETE'], auth: 'session', area: 'Content', description: 'Read, update, or delete one CMS page', dynamic: true },
  { path: '/api/content', methods: ['GET', 'POST'], auth: 'session', area: 'Content', description: 'List or create page content blocks', probePath: '/api/content' },
  { path: '/api/content/[id]', methods: ['GET', 'PUT', 'DELETE'], auth: 'session', area: 'Content', description: 'Read, update, or delete one content block', dynamic: true },
  { path: '/api/faculty', methods: ['GET', 'POST', 'PUT'], auth: 'session', area: 'Content', description: 'List, create, and reorder faculty records', probePath: '/api/faculty' },
  { path: '/api/faculty/[id]', methods: ['GET', 'PUT', 'DELETE'], auth: 'session', area: 'Content', description: 'Read, update, or delete one faculty record', dynamic: true },
  { path: '/api/media', methods: ['GET', 'POST'], auth: 'session', area: 'Media', description: 'List or upload media files', probePath: '/api/media' },
  { path: '/api/media/[id]', methods: ['GET', 'PUT', 'DELETE'], auth: 'admin', area: 'Media', description: 'Read, update, or delete one media file', dynamic: true },
  { path: '/api/slideshow', methods: ['GET', 'PUT'], auth: 'public', area: 'Media', description: 'Read or update homepage slideshow items', probePath: '/api/slideshow' },
  { path: '/api/placeholders', methods: ['GET', 'PUT', 'DELETE'], auth: 'session', area: 'Media', description: 'Manage image placeholders', probePath: '/api/placeholders' },
  { path: '/api/placeholder-image', methods: ['GET'], auth: 'public', area: 'Media', description: 'Generate a placeholder image response', probePath: '/api/placeholder-image' },
  { path: '/api/files/[...path]', methods: ['GET', 'POST'], auth: 'session', area: 'Media', description: 'Read or write managed files', dynamic: true },
  { path: '/api/contact', methods: ['GET', 'POST'], auth: 'session', area: 'Communication', description: 'Submit or review contact messages' },
  { path: '/api/contact/[id]', methods: ['PATCH', 'DELETE'], auth: 'session', area: 'Communication', description: 'Update or delete one contact message', dynamic: true },
  { path: '/api/analytics/page-view', methods: ['POST'], auth: 'public', area: 'Analytics', description: 'Record a public page view' },
  { path: '/api/settings/public', methods: ['GET'], auth: 'public', area: 'Settings', description: 'Read settings safe for public rendering', probePath: '/api/settings/public' },
  { path: '/api/settings', methods: ['GET', 'PUT'], auth: 'session', area: 'Settings', description: 'Read or update site settings', probePath: '/api/settings' },
  { path: '/api/settings/api-credentials', methods: ['GET', 'PUT', 'DELETE'], auth: 'admin', area: 'Settings', description: 'Manage encrypted CMS integration credentials', probePath: '/api/settings/api-credentials' },
  { path: '/api/cms/status', methods: ['GET'], auth: 'session', area: 'Integrations', description: 'Check configured CMS integration status', probePath: '/api/cms/status' },
  { path: '/api/cms/sanity', methods: ['GET', 'POST', 'DELETE'], auth: 'session', area: 'Integrations', description: 'Read or mutate Sanity content', dynamic: true },
  { path: '/api/cms/storyblok', methods: ['GET', 'POST'], auth: 'session', area: 'Integrations', description: 'Read or publish Storyblok content', dynamic: true },
  { path: '/api/monitoring', methods: ['GET', 'POST', 'PUT'], auth: 'session', area: 'System', description: 'Read and manage monitoring rules and alerts', probePath: '/api/monitoring' },
  { path: '/api/admin', methods: ['GET', 'POST', 'PUT'], auth: 'session', area: 'Admin', description: 'Admin dashboard, actions, and configuration', probePath: '/api/admin' },
  { path: '/api/admin/api-manager', methods: ['GET'], auth: 'session', area: 'Admin', description: 'API inventory and live diagnostic metadata', probePath: '/api/admin/api-manager' },
  { path: '/api/admin/dashboard-stats', methods: ['GET'], auth: 'session', area: 'Admin', description: 'Dashboard KPI statistics', probePath: '/api/admin/dashboard-stats' },
  { path: '/api/admin/audit', methods: ['GET'], auth: 'admin', area: 'Admin', description: 'Paginated admin audit log', probePath: '/api/admin/audit' },
  { path: '/api/admin/navigation', methods: ['GET', 'POST', 'PUT'], auth: 'session', area: 'Admin', description: 'Manage the full navigation hierarchy', probePath: '/api/admin/navigation' },
  { path: '/api/admin/navigation/[id]', methods: ['GET', 'PUT', 'DELETE'], auth: 'session', area: 'Admin', description: 'Read, update, or delete one navigation item', dynamic: true },
  { path: '/api/users', methods: ['GET', 'POST'], auth: 'session', area: 'Admin', description: 'List or create admin users', probePath: '/api/users' },
  { path: '/api/users/[id]', methods: ['GET', 'PUT', 'DELETE'], auth: 'session', area: 'Admin', description: 'Read, update, or delete one admin user', dynamic: true },
]

export const apiRouteSummary = {
  total: apiRouteDefinitions.length,
  methods: [...new Set(apiRouteDefinitions.flatMap(route => route.methods))].sort(),
  probeable: apiRouteDefinitions.filter(route => route.probePath).length,
  dynamic: apiRouteDefinitions.filter(route => route.dynamic).length,
}
