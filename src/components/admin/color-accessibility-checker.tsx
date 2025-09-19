'use client'

import { getContrastRatio, meetsWCAGContrast } from '@/lib/color-system'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ColorAccessibilityCheckerProps {
  foreground: string
  background: string
  label: string
}

export default function ColorAccessibilityChecker({ 
  foreground, 
  background, 
  label 
}: ColorAccessibilityCheckerProps) {
  const contrastRatio = getContrastRatio(foreground, background)
  const meetsAA = meetsWCAGContrast(foreground, background, 'AA')
  const meetsAAA = meetsWCAGContrast(foreground, background, 'AAA')

  const getStatusIcon = () => {
    if (meetsAAA) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (meetsAA) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusText = () => {
    if (meetsAAA) {
      return 'AAA (Excellent)'
    } else if (meetsAA) {
      return 'AA (Good)'
    } else {
      return 'Fails (Poor)'
    }
  }

  const getStatusColor = () => {
    if (meetsAAA) {
      return 'text-green-600'
    } else if (meetsAA) {
      return 'text-yellow-600'
    } else {
      return 'text-red-600'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xs font-bold"
          style={{ 
            backgroundColor: background, 
            color: foreground 
          }}
        >
          Aa
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-600">
            Ratio: {contrastRatio.toFixed(2)}:1
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  )
}

interface ColorAccessibilityPanelProps {
  colors: {
    primary_color: string
    secondary_color: string
    accent_color: string
    text_primary: string
    text_secondary: string
    background_primary: string
    background_secondary: string
    border_color: string
  }
}

export function ColorAccessibilityPanel({ colors }: ColorAccessibilityPanelProps) {
  const checks = [
    {
      label: 'Primary Text on White',
      foreground: colors.text_primary,
      background: colors.background_primary,
    },
    {
      label: 'Secondary Text on White',
      foreground: colors.text_secondary,
      background: colors.background_primary,
    },
    {
      label: 'Primary Color on White',
      foreground: colors.primary_color,
      background: colors.background_primary,
    },
    {
      label: 'Secondary Color on White',
      foreground: colors.secondary_color,
      background: colors.background_primary,
    },
    {
      label: 'Accent Color on White',
      foreground: colors.accent_color,
      background: colors.background_primary,
    },
    {
      label: 'Primary Text on Light Gray',
      foreground: colors.text_primary,
      background: colors.background_secondary,
    },
    {
      label: 'White Text on Primary',
      foreground: '#ffffff',
      background: colors.primary_color,
    },
    {
      label: 'White Text on Secondary',
      foreground: '#ffffff',
      background: colors.secondary_color,
    },
  ]

  const passedChecks = checks.filter(check => 
    meetsWCAGContrast(check.foreground, check.background, 'AA')
  ).length

  const excellentChecks = checks.filter(check => 
    meetsWCAGContrast(check.foreground, check.background, 'AAA')
  ).length

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Accessibility Check</h3>
        <div className="text-sm text-gray-600">
          {passedChecks}/{checks.length} pass WCAG AA
          {excellentChecks > 0 && ` (${excellentChecks} excellent)`}
        </div>
      </div>
      
      <div className="space-y-3">
        {checks.map((check, index) => (
          <ColorAccessibilityChecker
            key={index}
            foreground={check.foreground}
            background={check.background}
            label={check.label}
          />
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <div className="text-sm text-blue-800">
          <strong>WCAG Guidelines:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• AA (4.5:1): Minimum for normal text</li>
            <li>• AAA (7:1): Enhanced accessibility</li>
            <li>• Large text (18pt+) needs 3:1 (AA) or 4.5:1 (AAA)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
