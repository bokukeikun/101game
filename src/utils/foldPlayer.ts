import { writeBatch, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
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

  const db = getFirestoreDB()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', roomCode), {
    users: newWinner,
  })
  batch.update(doc(db, 'initGameState', roomCode), {
    gameOver: newWinner.length === 1,
    turn: nextTurn,
    playerDecks: newPlayerDecks,
    winner: newWinner,
    ranking: [...ranking, foldedUser],
    double: 1,
    missPlayer: '',
    foldedPlayer: foldedUser,
  })
  await batch.commit()
}
