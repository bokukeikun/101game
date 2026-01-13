import type { Timestamp } from 'firebase/firestore'

/**
 * ユーザー情報
 */
export interface User {
  id: string
  name: string
  email?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ユーザー設定
 */
export interface UserSettings {
  theme?: 'light' | 'dark'
  language?: string
  notifications?: boolean
}
