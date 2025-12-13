// Theme definitions for public event pages
export type ThemeId =
  | 'minimal'
  | 'futuristic'
  | 'elegant'
  | 'bold'
  | 'glassmorphism'
  | 'aurora'

export interface ThemeStyle {
  background: string
  overlay?: string
  cardBg: string
  textColor: string
  mutedColor: string
  borderColor: string
  shadow: string
  radius: string
  fontHeading?: string
  fontBody?: string
  accentStyle: string
  animation?: string
  isDark: boolean
}

// Luma-inspired heavy design themes
export const THEME_STYLES: Record<ThemeId, ThemeStyle> = {
  minimal: {
    // Ultra-clean, vast white space, subtle details
    background: '#ffffff',
    overlay:
      'radial-gradient(circle at 50% 0%, rgba(0,0,0,0.03) 0%, transparent 50%)',
    cardBg: '#ffffff',
    textColor: '#09090b', // zinc-950
    mutedColor: '#71717a', // zinc-500
    borderColor: '#e4e4e7', // zinc-200
    shadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    radius: '8px',
    accentStyle: 'subtle',
    isDark: false,
  },
  futuristic: {
    // Deep dark, neon glows, grid patterns
    background: '#020617', // slate-950
    overlay: `
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `, // Grid pattern
    cardBg: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
    textColor: '#f8fafc', // slate-50
    mutedColor: '#94a3b8', // slate-400
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 0 40px -10px rgba(124, 58, 237, 0.15)',
    radius: '2px',
    accentStyle: 'neon',
    isDark: true,
  },
  elegant: {
    // Rich, warm, expensive feel, heavy blurs
    background: '#fdfbf7', // Warm off-white
    overlay:
      'radial-gradient(circle at top right, rgba(255, 228, 230, 0.4), transparent 40%), radial-gradient(circle at bottom left, rgba(253, 230, 138, 0.4), transparent 40%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    textColor: '#451a03', // amber-950
    mutedColor: '#78350f', // amber-900/50
    borderColor: '#fed7aa', // orange-200
    shadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    radius: '24px',
    accentStyle: 'gradient',
    isDark: false,
  },
  bold: {
    // Neo-brutalist, high contrast, sharp edges
    background: '#fffff0', // Ivory
    overlay:
      'repeating-linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), repeating-linear-gradient(45deg, #e5e7eb 25%, #fffff0 25%, #fffff0 75%, #e5e7eb 75%, #e5e7eb)',
    cardBg: '#ffffff',
    textColor: '#000000',
    mutedColor: '#4b5563',
    borderColor: '#000000',
    shadow: '6px 6px 0px 0px #000000',
    radius: '0px',
    accentStyle: 'solid',
    isDark: false,
  },
  glassmorphism: {
    // Heavy glass / Apple-style
    background: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)',
    overlay: '',
    cardBg: 'rgba(255, 255, 255, 0.25)', // More opacity for readability
    textColor: '#ffffff',
    mutedColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    radius: '16px',
    accentStyle: 'glass',
    isDark: true,
  },
  aurora: {
    // Animated Aurora Borealis
    background: '#000000',
    overlay: '', // handled by component
    cardBg: 'rgba(0, 0, 0, 0.5)', // Darker translucent
    textColor: '#ffffff',
    mutedColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 0 40px -10px rgba(0,0,0,0.5)',
    radius: '12px',
    accentStyle: 'neon',
    animation: 'aurora',
    isDark: true,
  },
}

export interface EventAppearance {
  theme?: ThemeId
  primaryColor?: string
  backgroundColor?: string
}

// Helper to get relative luminance
function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Return true if color is light (needs dark text)
export function isLightColor(color: string): boolean {
  try {
    const clean = color.replace(/\s/g, '').toLowerCase()
    let r = 0,
      g = 0,
      b = 0

    if (clean.startsWith('#')) {
      const hex = clean.replace('#', '')
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
      } else if (hex.length === 6 || hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
        // ignore alpha for contrast check against background
      } else {
        return true // Default to light
      }
    } else if (clean.startsWith('rgb')) {
      const match = clean.match(/(\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        r = parseInt(match[1])
        g = parseInt(match[2])
        b = parseInt(match[3])
      } else {
        return true
      }
    } else {
      // Fallback for named colors - assume light unless known dark
      if (
        ['black', 'navy', 'dark', 'midnight', 'purple', 'brown', 'maroon'].some(
          (c) => clean.includes(c)
        )
      )
        return false
      return true
    }

    if (isNaN(r) || isNaN(g) || isNaN(b)) return true

    const lum = getLuminance(r, g, b)
    // Threshold: WCAG recommends contrast ratio 4.5:1.
    // Luminance of White is 1. Luminance of Black is 0.
    // Contrast with Black: (L + 0.05) / 0.05
    // Contrast with White: 1.05 / (L + 0.05)
    // We want the one that gives higher contrast.
    // Intersection point is around L = 0.179 (approx).
    // If L > 0.179, Black text provides better contrast.
    return lum > 0.179
  } catch (e) {
    return true
  }
}

export function getThemeStyles(
  appearance?: EventAppearance
): ThemeStyle & { primaryColor: string } {
  const theme = appearance?.theme || 'minimal'
  const primaryColor = appearance?.primaryColor || '#000000'
  const rawBg = appearance?.backgroundColor
  const backgroundColor = rawBg?.trim()
  const baseStyles = THEME_STYLES[theme] || THEME_STYLES.minimal

  // If background color is customized, we need to ensure contrast
  let contrastStyles = {}
  let isDark = baseStyles.isDark

  if (backgroundColor) {
    const isLight = isLightColor(backgroundColor)
    // If background is light, we are NOT dark (isDark = false)
    isDark = !isLight

    if (isLight) {
      // Light background -> Dark text
      contrastStyles = {
        textColor: '#09090b',
        mutedColor: '#52525b', // darker zinc-600 for better visibility
        borderColor: '#e4e4e7',
        cardBg: '#ffffff',
        overlay: undefined, // Remove theme overlay to show custom color
      }
    } else {
      // Dark background -> Light text
      contrastStyles = {
        textColor: '#f8fafc',
        mutedColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        overlay: undefined, // Remove theme overlay to show custom color
      }
    }
  }

  return {
    ...baseStyles,
    ...contrastStyles,
    background: backgroundColor || baseStyles.background,
    primaryColor,
    isDark,
  }
}

export function getButtonStyle(
  appearance?: EventAppearance
): React.CSSProperties {
  const primaryColor = appearance?.primaryColor || '#000000'
  const theme = appearance?.theme || 'minimal'
  const styles = THEME_STYLES[theme] || THEME_STYLES.minimal

  const baseButton: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: styles.radius,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  }

  // Neon glow for futuristic
  if (theme === 'futuristic') {
    return {
      ...baseButton,
      backgroundColor: primaryColor,
      color: '#ffffff',
      boxShadow: `0 0 20px ${primaryColor}60`,
      border: `1px solid ${primaryColor}`,
      borderRadius: '2px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    }
  }

  // Brutalist shadow for bold
  if (theme === 'bold') {
    return {
      ...baseButton,
      backgroundColor: primaryColor,
      color: isLightColor(primaryColor) ? '#000000' : '#ffffff',
      border: '2px solid #000000',
      boxShadow: '4px 4px 0px 0px #000000',
      transform: 'translate(-2px, -2px)',
    }
  }

  // Elegant gradient
  if (theme === 'elegant') {
    return {
      ...baseButton,
      backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${adjustColorBrightness(primaryColor, -20)})`,
      color: '#ffffff',
      boxShadow: '0 10px 20px -10px rgba(0,0,0,0.2)',
    }
  }

  // Glass effect
  if (theme === 'glassmorphism') {
    return {
      ...baseButton,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
    }
  }

  // Default solid button
  return {
    ...baseButton,
    backgroundColor: primaryColor,
    color: isLightColor(primaryColor) ? '#000000' : '#ffffff',
    borderRadius: '4px',
  }
}

export function getCardStyle(
  appearance?: EventAppearance
): React.CSSProperties {
  const styles = getThemeStyles(appearance)

  const baseCard = {
    backgroundColor: styles.cardBg,
    color: styles.textColor,
    borderColor: styles.borderColor,
    boxShadow: styles.shadow,
    borderRadius: styles.radius,
  }

  if (appearance?.theme === 'glassmorphism') {
    return {
      ...baseCard,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    }
  }

  if (appearance?.theme === 'futuristic') {
    return {
      ...baseCard,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundImage:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent)',
    }
  }

  return baseCard
}

// Helper to darken/lighten color
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}
