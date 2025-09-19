export interface ColorSettings {
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

export const defaultColors: ColorSettings = {
  // Brand Colors
  primary_color: '#1a365d',      // Dark blue - 7.2:1 contrast on white
  secondary_color: '#c53030',    // Dark red - 5.9:1 contrast on white
  accent_color: '#2d7d32',       // Dark green - 5.4:1 contrast on white

  // Text Colors
  text_primary: '#000000',       // Pure black - 21:1 contrast on white (maximum accessibility)
  text_secondary: '#2d3748',     // Dark gray - 12.6:1 contrast on white
  text_light: '#6b7280',         // Light gray for subtle text
  text_dark: '#111827',          // Very dark gray for emphasis

  // Background Colors
  background_primary: '#ffffff', // Pure white background
  background_secondary: '#f7fafc', // Very light gray - maintains high contrast
  background_tertiary: '#edf2f7', // Slightly darker light gray

  // Interface Colors
  border_color: '#cbd5e0',       // Medium gray for borders
  border_light: '#e2e8f0',       // Light gray for subtle borders
  border_dark: '#a0aec0',        // Darker gray for prominent borders

  // Interactive Colors
  link_color: '#1a365d',         // Same as primary for consistency
  link_hover: '#2c5282',         // Lighter blue for hover state
  button_primary: '#1a365d',     // Primary button color
  button_secondary: '#4a5568',   // Secondary button color

  // Status Colors
  success_color: '#38a169',      // Green for success states
  warning_color: '#d69e2e',      // Orange for warning states
  error_color: '#e53e3e',        // Red for error states
  info_color: '#3182ce',         // Blue for info states
}

export function applyColorsToDOM(colors: ColorSettings) {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Brand Colors
  root.style.setProperty('--color-primary', colors.primary_color)
  root.style.setProperty('--color-secondary', colors.secondary_color)
  root.style.setProperty('--color-accent', colors.accent_color)

  // Text Colors
  root.style.setProperty('--color-text-primary', colors.text_primary)
  root.style.setProperty('--color-text-secondary', colors.text_secondary)
  root.style.setProperty('--color-text-light', colors.text_light)
  root.style.setProperty('--color-text-dark', colors.text_dark)

  // Background Colors
  root.style.setProperty('--color-bg-primary', colors.background_primary)
  root.style.setProperty('--color-bg-secondary', colors.background_secondary)
  root.style.setProperty('--color-bg-tertiary', colors.background_tertiary)

  // Interface Colors
  root.style.setProperty('--color-border', colors.border_color)
  root.style.setProperty('--color-border-light', colors.border_light)
  root.style.setProperty('--color-border-dark', colors.border_dark)

  // Interactive Colors
  root.style.setProperty('--color-link', colors.link_color)
  root.style.setProperty('--color-link-hover', colors.link_hover)
  root.style.setProperty('--color-button-primary', colors.button_primary)
  root.style.setProperty('--color-button-secondary', colors.button_secondary)

  // Status Colors
  root.style.setProperty('--color-success', colors.success_color)
  root.style.setProperty('--color-warning', colors.warning_color)
  root.style.setProperty('--color-error', colors.error_color)
  root.style.setProperty('--color-info', colors.info_color)
}

export async function loadAndApplyColors() {
  if (typeof window === 'undefined') return

  try {
    const response = await fetch('/api/settings')
    if (response.ok) {
      const settings = await response.json()
      const colors: ColorSettings = {
        // Brand Colors
        primary_color: settings.primary_color?.value || defaultColors.primary_color,
        secondary_color: settings.secondary_color?.value || defaultColors.secondary_color,
        accent_color: settings.accent_color?.value || defaultColors.accent_color,

        // Text Colors
        text_primary: settings.text_primary?.value || defaultColors.text_primary,
        text_secondary: settings.text_secondary?.value || defaultColors.text_secondary,
        text_light: settings.text_light?.value || defaultColors.text_light,
        text_dark: settings.text_dark?.value || defaultColors.text_dark,

        // Background Colors
        background_primary: settings.background_primary?.value || defaultColors.background_primary,
        background_secondary: settings.background_secondary?.value || defaultColors.background_secondary,
        background_tertiary: settings.background_tertiary?.value || defaultColors.background_tertiary,

        // Interface Colors
        border_color: settings.border_color?.value || defaultColors.border_color,
        border_light: settings.border_light?.value || defaultColors.border_light,
        border_dark: settings.border_dark?.value || defaultColors.border_dark,

        // Interactive Colors
        link_color: settings.link_color?.value || defaultColors.link_color,
        link_hover: settings.link_hover?.value || defaultColors.link_hover,
        button_primary: settings.button_primary?.value || defaultColors.button_primary,
        button_secondary: settings.button_secondary?.value || defaultColors.button_secondary,

        // Status Colors
        success_color: settings.success_color?.value || defaultColors.success_color,
        warning_color: settings.warning_color?.value || defaultColors.warning_color,
        error_color: settings.error_color?.value || defaultColors.error_color,
        info_color: settings.info_color?.value || defaultColors.info_color,
      }

      console.log('Loading colors from database:', colors)
      applyColorsToDOM(colors)
      return colors
    }
  } catch (error) {
    console.error('Error loading colors:', error)
  }

  // Fallback to default colors
  applyColorsToDOM(defaultColors)
  return defaultColors
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const { r, g, b } = rgb
  const newR = Math.min(255, Math.round(r + (255 - r) * percent / 100))
  const newG = Math.min(255, Math.round(g + (255 - g) * percent / 100))
  const newB = Math.min(255, Math.round(b + (255 - b) * percent / 100))

  return rgbToHex(newR, newG, newB)
}

export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const { r, g, b } = rgb
  const newR = Math.max(0, Math.round(r * (100 - percent) / 100))
  const newG = Math.max(0, Math.round(g * (100 - percent) / 100))
  const newB = Math.max(0, Math.round(b * (100 - percent) / 100))

  return rgbToHex(newR, newG, newB)
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000000'

  const { r, g, b } = rgb
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

// WCAG Contrast Ratio Calculation Functions
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const { r, g, b } = rgb

  // Convert to relative luminance
  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

export function meetsWCAGContrast(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

export function findAccessibleTextColor(background: string): string {
  // Test black text first (preferred)
  if (meetsWCAGContrast('#000000', background, 'AA')) {
    return '#000000'
  }

  // Test white text
  if (meetsWCAGContrast('#ffffff', background, 'AA')) {
    return '#ffffff'
  }

  // If neither works, find the best contrast
  const blackRatio = getContrastRatio('#000000', background)
  const whiteRatio = getContrastRatio('#ffffff', background)

  return blackRatio > whiteRatio ? '#000000' : '#ffffff'
}
