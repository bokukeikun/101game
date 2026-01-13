import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import type { Room } from '@/types/game'
import { RoomError } from './errorHandler'

/**
 * ルームコードでルームを検索する
 */
export async function findRoomByCode(roomCode: string): Promise<Room | null> {
  try {
    const roomsRef = collection(getFirestoreDB(), 'rooms')
    const q = query(roomsRef, where('code', '==', roomCode), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as Room
  } catch (error) {
    console.error('Error finding room by code:', error)
    throw new RoomError('ルームの検索に失敗しました', 'INVALID_CODE')
  }
}

/**
 * ルームコードのバリデーション
 */
export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{5}$/.test(code)
}

/**
 * プレイヤー名のバリデーション
 */
export function validatePlayerName(name: string): boolean {
  return name.length >= 1 && name.length <= 20 && /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/.test(name)
}
