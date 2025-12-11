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
  },
}

export interface EventAppearance {
  theme?: ThemeId
  primaryColor?: string
  backgroundColor?: string
}

// Helper to determine if a color is light or dark
export function isLightColor(hex: string): boolean {
  try {
    const c = hex.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return true // Fallback
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155
  } catch (e) {
    return true
  }
}

export function getThemeStyles(
  appearance?: EventAppearance
): ThemeStyle & { primaryColor: string } {
  const theme = appearance?.theme || 'minimal'
  const primaryColor = appearance?.primaryColor || '#000000'
  const backgroundColor = appearance?.backgroundColor
  const baseStyles = THEME_STYLES[theme] || THEME_STYLES.minimal

  // If background color is customized, we need to ensure contrast
  let contrastStyles = {}
  if (backgroundColor) {
    const isLight = isLightColor(backgroundColor)
    if (isLight) {
      // Light background -> Dark text
      contrastStyles = {
        textColor: '#09090b',
        mutedColor: '#71717a',
        borderColor: '#e4e4e7',
        cardBg: '#ffffff',
        // Keep shadow/radius from theme but ensure card is legible
      }
    } else {
      // Dark background -> Light text
      contrastStyles = {
        textColor: '#f8fafc',
        mutedColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
      }
    }
  }

  return {
    ...baseStyles,
    ...contrastStyles,
    background: backgroundColor || baseStyles.background,
    primaryColor,
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
