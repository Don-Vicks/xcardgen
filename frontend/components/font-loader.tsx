"use client"

import { useEffect } from "react"

export function FontLoader({ fonts }: { fonts: string[] }) {
  useEffect(() => {
    if (fonts.length === 0) return

    const uniqueFonts = Array.from(new Set(fonts))
    const linkId = 'dynamic-google-fonts'
    let link = document.getElementById(linkId) as HTMLLinkElement

    if (!link) {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // Google Fonts Format: family=Font1:wght@400;700&family=Font2...
    // We'll load weight 400 and 700 for simplicity
    const query = uniqueFonts
      .map(font => `family=${font.replace(/ /g, '+')}:wght@400;700`)
      .join('&')

    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`

  }, [fonts])

  return null
}
