import { writeBatch, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import {
  batchUpdateWithActivity,
  deleteRoomData,
} from '@/services/firebase/roomLifecycle'
import { getTurnAfter } from '@/utils/turn'

export interface FoldPlayerParams {
  roomCode: string
  foldedUser: string
  users: string[]
  winner: string[]
  ranking: string[]
  playerDecks: Record<string, string[]>
  isReturn: boolean
}

/**
 * プレイヤーをフォールドさせ、users と initGameState を同時更新する。
 */
export async function foldPlayer(params: FoldPlayerParams) {
  const { roomCode, foldedUser, users, winner, ranking, playerDecks, isReturn } =
    params

  const newPlayerDecks: Record<string, string[]> = {}
  for (const user of users) {
    if (user !== foldedUser) {
      newPlayerDecks[user] = playerDecks[user]
    }
  }
  const newWinner = winner.filter((item) => item !== foldedUser)
  const nextTurn = getTurnAfter(users, foldedUser, isReturn)

  if (newWinner.length === 0) {
    await deleteRoomData(roomCode)
    return
  }

  const db = getFirestoreDB()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', roomCode), batchUpdateWithActivity({
    users: newWinner,
  }))
  batch.update(doc(db, 'initGameState', roomCode), batchUpdateWithActivity({
    gameOver: newWinner.length === 1,
    turn: nextTurn,
    playerDecks: newPlayerDecks,
    winner: newWinner,
    ranking: [...ranking, foldedUser],
    double: 1,
    missPlayer: '',
    foldedPlayer: foldedUser,
  }))
  await batch.commit()
}
