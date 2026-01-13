import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getFunctions, type Functions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

// Firebase設定が不完全な場合の警告
if (import.meta.env.DEV && !firebaseConfig.projectId) {
  console.error(
    '⚠️ Firebase設定が見つかりません！\n' +
    '以下の手順で設定してください：\n' +
    '1. .env.localファイルをプロジェクトルートに作成\n' +
    '2. env.exampleを参考にFirebase設定を追加\n' +
    '3. 開発サーバーを再起動'
  )
}

// シングルトンパターンで初期化
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let functions: Functions | null = null

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export const getFirestoreDB = (): Firestore => {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export const getFirebaseFunctions = (): Functions => {
  if (!functions) {
    functions = getFunctions(getFirebaseApp())
  }
  return functions
}
