"use client"

import { useAuth } from "@/stores/auth-store"
import { useEffect, useRef } from "react"

export function AuthInitializer() {
  const checkAuth = useAuth((state) => state.checkAuth)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      checkAuth()
      initialized.current = true
    }
  }, [checkAuth])

  return null
}
