import { initializeApp, type FirebaseApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
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

const useEmulator =
  import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

const emulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1'
const emulatorPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080)

if (import.meta.env.DEV && !firebaseConfig.projectId) {
  console.error(
    '⚠️ Firebase設定が見つかりません！\n' +
      '以下の手順で設定してください：\n' +
      '1. .env.localファイルをプロジェクトルートに作成\n' +
      '2. env.exampleを参考にFirebase設定を追加\n' +
      '3. 開発サーバーを再起動'
  )
}

if (useEmulator) {
  console.info(
    `🔧 Firestore Emulator に接続します（${emulatorHost}:${emulatorPort}）— 本番データには影響しません`
  )
} else if (
  import.meta.env.DEV &&
  firebaseConfig.projectId === 'vue-101-game'
) {
  console.warn(
    '⚠️ 本番 Firebase プロジェクト（vue-101-game）に接続しています。\n' +
      '開発用プロジェクト（.env.development.local）または yarn dev:emulator を使用してください。'
  )
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let functions: Functions | null = null
let emulatorConnected = false

export const isUsingFirestoreEmulator = (): boolean => useEmulator

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export const getFirestoreDB = (): Firestore => {
  if (!db) {
    db = getFirestore(getFirebaseApp())
    if (useEmulator && !emulatorConnected) {
      connectFirestoreEmulator(db, emulatorHost, emulatorPort)
      emulatorConnected = true
    }
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
