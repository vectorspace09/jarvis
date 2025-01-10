import { ReactNode } from 'react'

// This matches the exact type that next-themes expects
type Attribute = 'class' | 'data-theme' | 'data-mode'

export interface ThemeProviderProps {
  children: ReactNode
  attribute?: Attribute | Attribute[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  forcedTheme?: string
  themes?: string[]
  value?: { [x: string]: string }
  nonce?: string
  storageKey?: string
} 