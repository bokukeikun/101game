import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type FieldValue,
} from 'firebase/firestore'
import { getFirestoreDB } from './config'

type RoomWriteData = Record<string, unknown>

/** Firestore 更新時に付与する最終アクティビティ時刻（TTL クリーンアップ用） */
export function withLastActivity<T extends RoomWriteData>(
  data: T
): T & { lastActivityAt: FieldValue } {
  return { ...data, lastActivityAt: serverTimestamp() }
}

/** batch.update 用 */
export function batchUpdateWithActivity(data: RoomWriteData) {
  return withLastActivity(data)
}

/** ルーム関連ドキュメントをすべて削除 */
export async function deleteRoomData(roomCode: string): Promise<void> {
  const db = getFirestoreDB()
  const refs = [
    doc(db, 'users', roomCode),
    doc(db, 'initGameState', roomCode),
    doc(db, 'presence', roomCode),
  ]
  await Promise.all(
    refs.map((ref) =>
      deleteDoc(ref).catch((err) => {
        console.error(`Error deleting ${ref.path}:`, err)
      })
    )
  )
}

export function isRoomEmpty(
  users: string[],
  restartUsers?: string[]
): boolean {
  const restart = restartUsers ?? users
  return users.length === 0 && restart.length === 0
}

/** users を更新。全員退出時はルームごと削除 */
export async function saveUsersOrDeleteRoom(
  roomCode: string,
  users: string[],
  restartUsers: string[]
): Promise<boolean> {
  if (isRoomEmpty(users, restartUsers)) {
    await deleteRoomData(roomCode)
    return true
  }
  await updateDoc(
    doc(getFirestoreDB(), 'users', roomCode),
    withLastActivity({ users, restartUsers })
  )
  return false
}

export async function setUsersDoc(
  roomCode: string,
  data: { users: string[]; restartUsers: string[] }
): Promise<void> {
  await setDoc(doc(getFirestoreDB(), 'users', roomCode), withLastActivity(data))
}

export async function patchUsersDoc(
  roomCode: string,
  data: RoomWriteData
): Promise<void> {
  await updateDoc(
    doc(getFirestoreDB(), 'users', roomCode),
    withLastActivity(data)
  )
}

export async function updateInitGameStateDoc(
  roomCode: string,
  data: RoomWriteData
): Promise<void> {
  await updateDoc(
    doc(getFirestoreDB(), 'initGameState', roomCode),
    withLastActivity(data)
  )
}

export async function setInitGameStateDoc(
  roomCode: string,
  data: RoomWriteData
): Promise<void> {
  await setDoc(
    doc(getFirestoreDB(), 'initGameState', roomCode),
    withLastActivity(data)
  )
}

/** 新規ルーム用の initGameState 初期値 */
export function getDefaultInitGameState(): RoomWriteData {
  const playedCardsPile = ['N00']
  return {
    startFlag: false,
    gameOver: false,
    winner: [],
    turn: '',
    playerDecks: {},
    currentNumber: playedCardsPile[0].slice(-2),
    currentCardType: playedCardsPile[0].charAt(0),
    totalNumber: 0,
    playedCardsPile: [...playedCardsPile],
    drawCardPile: [],
    double: 1,
    isReturn: false,
    ranking: [],
    missPlayer: '',
    foldedPlayer: '',
    turnTimeout: 0,
  }
}

/**
 * initGameState が無いときだけ作成する。
 * ホストのリロードで既存のゲーム状態を上書きしないためのガード。
 */
export async function ensureInitGameStateDoc(roomCode: string): Promise<void> {
  const ref = doc(getFirestoreDB(), 'initGameState', roomCode)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    await setInitGameStateDoc(roomCode, getDefaultInitGameState())
  }
}
