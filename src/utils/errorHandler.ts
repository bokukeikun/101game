/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * ルーム関連のエラークラス
 */
export class RoomError extends Error {
  constructor(
    message: string,
    public code: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'ROOM_CLOSED' | 'INVALID_CODE'
  ) {
    super(message)
    this.name = 'RoomError'
  }
}

/**
 * エラーハンドリング関数
 */
export function handleError(error: unknown): string {
  if (error instanceof RoomError) {
    // ルーム関連のエラー
    switch (error.code) {
      case 'ROOM_NOT_FOUND':
        return 'ルームが見つかりません。ルームコードを確認してください。'
      case 'ROOM_FULL':
        return 'ルームが満員です。'
      case 'ROOM_CLOSED':
        return 'このルームは既に閉じられています。'
      case 'INVALID_CODE':
        return '無効なルームコードです。'
      default:
        return error.message
    }
  } else if (error instanceof AppError) {
    // アプリケーションエラー
    console.error(`[${error.code}] ${error.message}`)
    return error.message
  } else if (error instanceof Error) {
    // 一般的なエラー
    console.error(error.message)
    
    // Firebaseエラーの処理
    if ('code' in error) {
      const firebaseError = error as { code: string; message: string }
      switch (firebaseError.code) {
        case 'permission-denied':
          return '権限がありません。'
        case 'not-found':
          return 'データが見つかりません。'
        case 'unavailable':
          return 'サービスが利用できません。しばらく待ってから再度お試しください。'
        case 'already-exists':
          return '既に存在するデータです。'
        default:
          return firebaseError.message || 'エラーが発生しました。'
      }
    }
    
    return error.message || '予期しないエラーが発生しました。'
  } else {
    // 予期しないエラー
    console.error('予期しないエラー:', error)
    return '予期しないエラーが発生しました。'
  }
}

/**
 * Firestoreエラーコードのマッピング
 */
export const FIRESTORE_ERROR_CODES = {
  PERMISSION_DENIED: 'permission-denied',
  NOT_FOUND: 'not-found',
  UNAVAILABLE: 'unavailable',
  ALREADY_EXISTS: 'already-exists',
} as const
