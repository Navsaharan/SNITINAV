'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import { Save, RotateCcw, Eye, Palette, Sparkles } from 'lucide-react'
import { colorPresets, isPresetActive } from '@/lib/color-presets'
import { ColorAccessibilityPanel } from '@/components/admin/color-accessibility-checker'

interface ExtendedUser {
  role: string
  id: string
  email: string
  name?: string | null
}

interface ColorSettings {
  // Brand Colors
  primary_color: string
  secondary_color: string
  accent_color: string

  // Text Colors
  text_primary: string
  text_secondary: string
  text_light: string
  text_dark: string

  // Background Colors
  background_primary: string
  background_secondary: string
  background_tertiary: string

  // Interface Colors
  border_color: string
  border_light: string
  border_dark: string

  // Interactive Colors
  link_color: string
  link_hover: string
  button_primary: string
  button_secondary: string

  // Status Colors
  success_color: string
  warning_color: string
  error_color: string
  info_color: string
}

const defaultColors: ColorSettings = {
  // Brand Colors
  primary_color: '#1a365d',
  secondary_color: '#c53030',
  accent_color: '#2d7d32',

  // Text Colors
  text_primary: '#000000',
  text_secondary: '#2d3748',
  text_light: '#6b7280',
  text_dark: '#111827',

  // Background Colors
  background_primary: '#ffffff',
  background_secondary: '#f7fafc',
  background_tertiary: '#edf2f7',

  // Interface Colors
  border_color: '#cbd5e0',
  border_light: '#e2e8f0',
  border_dark: '#a0aec0',

  // Interactive Colors
  link_color: '#1a365d',
  link_hover: '#2c5282',
  button_primary: '#1a365d',
  button_secondary: '#4a5568',

  // Status Colors
  success_color: '#38a169',
  warning_color: '#d69e2e',
  error_color: '#e53e3e',
  info_color: '#3182ce',
}

export default function ColorManagement() {
  const { data: session, status } = useSession()
  const [colors, setColors] = useState<ColorSettings>(defaultColors)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/admin/login')
    }
  }, [status])

  useEffect(() => {
    if ((session?.user as ExtendedUser)?.role === 'ADMIN') {
      fetchColors()
    } else if (session) {
      setLoading(false)
    }
  }, [session])

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settings = await response.json()
        const colorSettings: ColorSettings = {
          primary_color: settings.primary_color?.value || defaultColors.primary_color,
          secondary_color: settings.secondary_color?.value || defaultColors.secondary_color,
          accent_color: settings.accent_color?.value || defaultColors.accent_color,
          text_primary: settings.text_primary?.value || defaultColors.text_primary,
          text_secondary: settings.text_secondary?.value || defaultColors.text_secondary,
          background_primary: settings.background_primary?.value || defaultColors.background_primary,
          background_secondary: settings.background_secondary?.value || defaultColors.background_secondary,
          border_color: settings.border_color?.value || defaultColors.border_color,
        }
        setColors(colorSettings)
      }
    } catch (error) {
      console.error('Error fetching colors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
    
    if (previewMode) {
      applyColorsToDOM({ ...colors, [key]: value })
    }
  }

  const applyColorsToDOM = (colorSettings: ColorSettings) => {
    const root = document.documentElement

    // Brand Colors
    root.style.setProperty('--color-primary', colorSettings.primary_color)
    root.style.setProperty('--color-secondary', colorSettings.secondary_color)
    root.style.setProperty('--color-accent', colorSettings.accent_color)

    // Text Colors
    root.style.setProperty('--color-text-primary', colorSettings.text_primary)
    root.style.setProperty('--color-text-secondary', colorSettings.text_secondary)
    root.style.setProperty('--color-text-light', colorSettings.text_light)
    root.style.setProperty('--color-text-dark', colorSettings.text_dark)

    // Background Colors
    root.style.setProperty('--color-bg-primary', colorSettings.background_primary)
    root.style.setProperty('--color-bg-secondary', colorSettings.background_secondary)
    root.style.setProperty('--color-bg-tertiary', colorSettings.background_tertiary)

    // Interface Colors
    root.style.setProperty('--color-border', colorSettings.border_color)
    root.style.setProperty('--color-border-light', colorSettings.border_light)
    root.style.setProperty('--color-border-dark', colorSettings.border_dark)

    // Interactive Colors
    root.style.setProperty('--color-link', colorSettings.link_color)
    root.style.setProperty('--color-link-hover', colorSettings.link_hover)
    root.style.setProperty('--color-button-primary', colorSettings.button_primary)
    root.style.setProperty('--color-button-secondary', colorSettings.button_secondary)

    // Status Colors
    root.style.setProperty('--color-success', colorSettings.success_color)
    root.style.setProperty('--color-warning', colorSettings.warning_color)
    root.style.setProperty('--color-error', colorSettings.error_color)
    root.style.setProperty('--color-info', colorSettings.info_color)
  }

  const togglePreview = () => {
    setPreviewMode(!previewMode)
    if (!previewMode) {
      applyColorsToDOM(colors)
    } else {
      // Reset to original colors
      fetchColors()
    }
  }

  const resetToDefaults = () => {
    setColors(defaultColors)
    if (previewMode) {
      applyColorsToDOM(defaultColors)
    }
  }

  const applyPreset = (presetColors: ColorSettings) => {
    setColors(presetColors)
    if (previewMode) {
      applyColorsToDOM(presetColors)
    }
  }

  const saveColors = async () => {
    setSaving(true)
    try {
      const settingsArray = Object.entries(colors).map(([key, value]) => ({
        key,
        value,
        type: 'COLOR'
      }))

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsArray }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save colors')
      }

      // Apply colors permanently
      applyColorsToDOM(colors)

      // Dispatch color update event to notify other components
      window.dispatchEvent(new CustomEvent('colorUpdate'))

      alert('Colors saved successfully!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save colors')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!session) {
    return null
  }

  if ((session.user as ExtendedUser).role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You need admin privileges to manage colors.</p>
        </div>
      </AdminLayout>
    )
  }

  const colorGroups = [
    {
      title: 'Brand Colors',
      colors: [
        { key: 'primary_color', label: 'Primary Color', description: 'Main brand color used for buttons, links, and highlights' },
        { key: 'secondary_color', label: 'Secondary Color', description: 'Secondary brand color for accents and emphasis' },
        { key: 'accent_color', label: 'Accent Color', description: 'Accent color for special elements and calls-to-action' },
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'text_primary', label: 'Primary Text', description: 'Main text color for headings and body content' },
        { key: 'text_secondary', label: 'Secondary Text', description: 'Secondary text color for descriptions and metadata' },
        { key: 'text_light', label: 'Light Text', description: 'Light text color for subtle content and placeholders' },
        { key: 'text_dark', label: 'Dark Text', description: 'Dark text color for emphasis and strong content' },
      ]
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'background_primary', label: 'Primary Background', description: 'Main background color for content areas' },
        { key: 'background_secondary', label: 'Secondary Background', description: 'Secondary background for sections and cards' },
        { key: 'background_tertiary', label: 'Tertiary Background', description: 'Tertiary background for subtle sections' },
      ]
    },
    {
      title: 'Interface Colors',
      colors: [
        { key: 'border_color', label: 'Border Color', description: 'Standard color for borders, dividers, and outlines' },
        { key: 'border_light', label: 'Light Border', description: 'Light border color for subtle separations' },
        { key: 'border_dark', label: 'Dark Border', description: 'Dark border color for prominent separations' },
      ]
    },
    {
      title: 'Interactive Colors',
      colors: [
        { key: 'link_color', label: 'Link Color', description: 'Color for text links and clickable elements' },
        { key: 'link_hover', label: 'Link Hover', description: 'Color for links when hovered or focused' },
        { key: 'button_primary', label: 'Primary Button', description: 'Background color for primary action buttons' },
        { key: 'button_secondary', label: 'Secondary Button', description: 'Background color for secondary action buttons' },
      ]
    },
    {
      title: 'Status Colors',
      colors: [
        { key: 'success_color', label: 'Success Color', description: 'Color for success messages and positive states' },
        { key: 'warning_color', label: 'Warning Color', description: 'Color for warning messages and caution states' },
        { key: 'error_color', label: 'Error Color', description: 'Color for error messages and negative states' },
        { key: 'info_color', label: 'Info Color', description: 'Color for informational messages and neutral states' },
      ]
    }
  ]

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Color Palette</h1>
            <p className="text-sm text-gray-600">Customize your website&apos;s color scheme</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={togglePreview}
              className={`px-4 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                previewMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Live Preview'}
            </button>
            <button
              onClick={resetToDefaults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={saveColors}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Colors'}
            </button>
          </div>
        </div>

        {previewMode && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span className="font-medium">Live Preview Mode</span>
              <span className="ml-2">- Changes are applied in real-time. Click &quot;Save Colors&quot; to make them permanent.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color Controls */}
          <div className="space-y-6">
            {/* Color Presets */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Color Presets
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.colors)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isPresetActive(preset, colors)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset.colors.primary_color }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset.colors.secondary_color }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset.colors.accent_color }}
                        />
                      </div>
                      <span className="font-medium text-sm">{preset.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
            {colorGroups.map((group) => (
              <div key={group.title} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{group.title}</h3>
                <div className="space-y-4">
                  {group.colors.map((colorConfig) => (
                    <div key={colorConfig.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {colorConfig.label}
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={colors[colorConfig.key as keyof ColorSettings]}
                          onChange={(e) => handleColorChange(colorConfig.key as keyof ColorSettings, e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colors[colorConfig.key as keyof ColorSettings]}
                          onChange={(e) => handleColorChange(colorConfig.key as keyof ColorSettings, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#000000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{colorConfig.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Accessibility Check Panel */}
            <ColorAccessibilityPanel colors={colors} />

            {/* Preview Panel */}
            {previewMode && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
            <div className="space-y-4">
              {/* Color Swatches */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Color Swatches</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(colors).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-full h-12 rounded border border-gray-300 mb-1"
                        style={{ backgroundColor: value }}
                      />
                      <div className="text-xs text-gray-600 truncate">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample UI Elements */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Elements</h4>
                <div className="space-y-4">
                  {/* Buttons */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-600">Buttons</h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1.5 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: colors.button_primary }}
                      >
                        Primary
                      </button>
                      <button
                        className="px-3 py-1.5 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: colors.button_secondary }}
                      >
                        Secondary
                      </button>
                      <button
                        className="px-3 py-1.5 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: colors.accent_color }}
                      >
                        Accent
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-600">Links</h5>
                    <div className="space-y-1">
                      <a href="#" className="block text-sm" style={{ color: colors.link_color }}>
                        Sample Link
                      </a>
                      <a href="#" className="block text-sm" style={{ color: colors.link_hover }}>
                        Hovered Link
                      </a>
                    </div>
                  </div>

                  {/* Status Messages */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-600">Status Messages</h5>
                    <div className="space-y-2">
                      <div className="px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.success_color + '20', color: colors.success_color, border: `1px solid ${colors.success_color}40` }}>
                        Success message
                      </div>
                      <div className="px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.warning_color + '20', color: colors.warning_color, border: `1px solid ${colors.warning_color}40` }}>
                        Warning message
                      </div>
                      <div className="px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.error_color + '20', color: colors.error_color, border: `1px solid ${colors.error_color}40` }}>
                        Error message
                      </div>
                      <div className="px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.info_color + '20', color: colors.info_color, border: `1px solid ${colors.info_color}40` }}>
                        Info message
                      </div>
                    </div>
                  </div>

                  {/* Sample Card */}
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: colors.background_secondary,
                      borderColor: colors.border_color,
                      border: `1px solid ${colors.border_color}`,
                      color: colors.text_primary
                    }}
                  >
                    <h5 className="font-medium mb-2" style={{ color: colors.text_dark }}>Sample Card</h5>
                    <p className="text-sm mb-2" style={{ color: colors.text_secondary }}>
                      This is how your content will look with the selected colors.
                    </p>
                    <p className="text-xs" style={{ color: colors.text_light }}>
                      Light text for subtle information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
              </div>
              )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
