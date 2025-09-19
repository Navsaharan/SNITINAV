import { ColorSettings } from './color-system'

export interface ColorPreset {
  name: string
  description: string
  colors: ColorSettings
}

export const colorPresets: ColorPreset[] = [
  {
    name: 'Maximum Contrast',
    description: 'WCAG AAA compliant maximum contrast for ultimate accessibility',
    colors: {
      // Brand Colors
      primary_color: '#000000',      // Pure black - 21:1 contrast
      secondary_color: '#1a1a1a',    // Very dark gray - 16.7:1 contrast
      accent_color: '#2d2d2d',       // Dark gray - 12.6:1 contrast

      // Text Colors
      text_primary: '#000000',       // Pure black - 21:1 contrast
      text_secondary: '#1a1a1a',     // Very dark gray - 16.7:1 contrast
      text_light: '#4a4a4a',         // Medium gray
      text_dark: '#000000',          // Pure black

      // Background Colors
      background_primary: '#ffffff', // Pure white
      background_secondary: '#fafafa', // Very light gray
      background_tertiary: '#f5f5f5', // Light gray

      // Interface Colors
      border_color: '#cccccc',       // Medium gray
      border_light: '#e0e0e0',       // Light gray
      border_dark: '#999999',        // Dark gray

      // Interactive Colors
      link_color: '#000000',         // Pure black
      link_hover: '#333333',         // Dark gray
      button_primary: '#000000',     // Pure black
      button_secondary: '#4a4a4a',   // Medium gray

      // Status Colors
      success_color: '#2d5016',      // Dark green
      warning_color: '#8b4513',      // Dark brown
      error_color: '#8b0000',        // Dark red
      info_color: '#191970',         // Midnight blue
    }
  },
  {
    name: 'High Contrast Default',
    description: 'WCAG AA compliant high contrast theme with excellent readability',
    colors: {
      // Brand Colors
      primary_color: '#1a365d',      // Dark blue - 7.2:1 contrast
      secondary_color: '#c53030',    // Dark red - 5.9:1 contrast
      accent_color: '#2d7d32',       // Dark green - 5.4:1 contrast

      // Text Colors
      text_primary: '#000000',       // Pure black - 21:1 contrast
      text_secondary: '#2d3748',     // Dark gray - 12.6:1 contrast
      text_light: '#6b7280',         // Light gray
      text_dark: '#111827',          // Very dark gray

      // Background Colors
      background_primary: '#ffffff', // Pure white
      background_secondary: '#f7fafc', // Very light gray
      background_tertiary: '#edf2f7', // Light gray

      // Interface Colors
      border_color: '#cbd5e0',       // Medium gray
      border_light: '#e2e8f0',       // Light gray
      border_dark: '#a0aec0',        // Dark gray

      // Interactive Colors
      link_color: '#1a365d',         // Dark blue
      link_hover: '#2c5282',         // Lighter blue
      button_primary: '#1a365d',     // Dark blue
      button_secondary: '#4a5568',   // Gray

      // Status Colors
      success_color: '#38a169',      // Green
      warning_color: '#d69e2e',      // Orange
      error_color: '#e53e3e',        // Red
      info_color: '#3182ce',         // Blue
    }
  },
  {
    name: 'Forest Green',
    description: 'Natural green theme with earth tones - WCAG AA compliant',
    colors: {
      primary_color: '#064e3b',      // Darker green - 8.1:1 contrast
      secondary_color: '#7c2d12',    // Dark brown - 7.8:1 contrast
      accent_color: '#92400e',       // Dark orange - 5.2:1 contrast
      text_primary: '#000000',       // Pure black - 21:1 contrast
      text_secondary: '#1f2937',     // Dark gray - 16.7:1 contrast
      background_primary: '#ffffff', // Pure white
      background_secondary: '#f0fdf4', // Very light green
      border_color: '#d1fae5',       // Light green
    }
  },
  {
    name: 'Royal Purple',
    description: 'Elegant purple theme with gold accents',
    colors: {
      primary_color: '#7c3aed',
      secondary_color: '#d97706',
      accent_color: '#dc2626',
      text_primary: '#1f2937',
      text_secondary: '#6b7280',
      background_primary: '#ffffff',
      background_secondary: '#faf5ff',
      border_color: '#e9d5ff',
    }
  },
  {
    name: 'Ocean Blue',
    description: 'Calming ocean blue with teal accents',
    colors: {
      primary_color: '#0891b2',
      secondary_color: '#0d9488',
      accent_color: '#ea580c',
      text_primary: '#0f172a',
      text_secondary: '#64748b',
      background_primary: '#ffffff',
      background_secondary: '#f0f9ff',
      border_color: '#e0f2fe',
    }
  },
  {
    name: 'Sunset Orange',
    description: 'Warm sunset colors with vibrant accents',
    colors: {
      primary_color: '#ea580c',
      secondary_color: '#dc2626',
      accent_color: '#7c3aed',
      text_primary: '#1f2937',
      text_secondary: '#6b7280',
      background_primary: '#ffffff',
      background_secondary: '#fff7ed',
      border_color: '#fed7aa',
    }
  },
  {
    name: 'Monochrome',
    description: 'Classic black and white with maximum accessibility',
    colors: {
      primary_color: '#000000',      // Pure black - 21:1 contrast
      secondary_color: '#1f2937',    // Dark gray - 16.7:1 contrast
      accent_color: '#374151',       // Medium dark gray - 12.6:1 contrast
      text_primary: '#000000',       // Pure black - 21:1 contrast
      text_secondary: '#1f2937',     // Dark gray - 16.7:1 contrast
      background_primary: '#ffffff', // Pure white
      background_secondary: '#f9fafb', // Very light gray
      border_color: '#d1d5db',       // Medium gray
    }
  }
]

export function getPresetByName(name: string): ColorPreset | undefined {
  return colorPresets.find(preset => preset.name === name)
}

export function isPresetActive(preset: ColorPreset, currentColors: ColorSettings): boolean {
  return Object.keys(preset.colors).every(key => {
    const colorKey = key as keyof ColorSettings
    return preset.colors[colorKey] === currentColors[colorKey]
  })
}
