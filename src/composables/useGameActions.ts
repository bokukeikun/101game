import { useRouter } from 'vue-router'
import { updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import { getTurnAfter } from '@/utils/turn'

/**
 * ゲームの終了・退出処理を一元化する composable。
 *
 * これまで Game.vue / Ranking.vue / TopInfo.vue に重複していた
 * ホストのゲーム終了・参加者の退出ロジックをここへ集約する。
 */
export function useGameActions() {
  const router = useRouter()
  const roomStore = useRoomStore()
  const gameStore = useGameStore()

  const stripPrefix = (user: string) =>
    user.startsWith('H') || user.startsWith('C') ? user.slice(1) : user

  /**
   * ホストがゲームを終了し、待機画面へ戻す（全員の参加者は維持）。
   */
  async function returnToWaitingAsHost() {
    const playedCardsPile = ['N00']
    try {
      await updateDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode), {
        users: [...roomStore.restartUsers],
      })
      await updateDoc(doc(getFirestoreDB(), 'initGameState', roomStore.roomCode), {
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
      })
    } catch (error) {
      console.error('Error returning to waiting:', error)
    }
  }

  /**
   * ホストがルームを閉じる（全員終了）。
   * 参加者・ゲーム状態のドキュメントを削除し、ホームへ戻る。
   */
  async function closeRoomAsHost() {
    gameStore.setLoading(true)
    try {
      await updateDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode), {
        restartUsers: [],
        users: [],
      })
      await deleteDoc(doc(getFirestoreDB(), 'initGameState', roomStore.roomCode))
      await deleteDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode))
    } catch (error) {
      console.error('Error ending game as host:', error)
    } finally {
      gameStore.setLoading(false)
      roomStore.reset()
      gameStore.reset()
      router.push('/')
    }
  }

  /**
   * 参加者がプレイ中に退出する。
   * 自分を参加者一覧から外し、手番・手札・勝者を更新する。
   * （スナップショット更新で本人は Rejoin 画面へ遷移する）
   */
  async function leaveDuringPlay() {
    const currentUser = stripPrefix(roomStore.currentUser)
    const newPlayerDecks: Record<string, string[]> = {}
    for (const user of roomStore.users) {
      if (user !== currentUser) {
        newPlayerDecks[user] = gameStore.playerDecks[user]
      }
    }
    const newWinner = gameStore.winner.filter((user) => user !== currentUser)
    const nextTurn = getTurnAfter(
      roomStore.users,
      currentUser,
      gameStore.isReturn
    )

    try {
      await updateDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode), {
        restartUsers: newWinner,
        users: newWinner,
      })
      await updateDoc(doc(getFirestoreDB(), 'initGameState', roomStore.roomCode), {
        gameOver: newWinner.length === 1,
        turn: nextTurn,
        playerDecks: newPlayerDecks,
        winner: newWinner,
        missPlayer: '',
        foldedPlayer: '',
      })
    } catch (error) {
      console.error('Error leaving during play:', error)
    }
  }

  /**
   * 参加者が待機画面（ゲーム開始前）で退出する。
   * 自分を一覧から外し、招待コード付きホームへ戻る。
   */
  async function leaveWaitingRoom() {
    gameStore.setLoading(true)
    const currentUser = stripPrefix(roomStore.currentUser)
    try {
      const newUsers = roomStore.restartUsers.filter(
        (user) => user !== currentUser
      )
      await updateDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode), {
        restartUsers: newUsers,
        users: newUsers,
      })
    } catch (error) {
      console.error('Error leaving waiting room:', error)
    } finally {
      gameStore.setLoading(false)
      router.push(`/?roomCode=${roomStore.roomCode}`)
    }
  }

  /**
   * 手番の制限時間（秒）を設定する。0 でオフ。最大 60 秒。
   * ホストが設定し、Firestore 経由で全員に共有される。
   */
  async function setTurnTimeout(seconds: number) {
    const clamped = Math.max(0, Math.min(60, Math.round(seconds)))
    try {
      await updateDoc(doc(getFirestoreDB(), 'initGameState', roomStore.roomCode), {
        turnTimeout: clamped,
      })
    } catch (error) {
      console.error('Error setting turn timeout:', error)
    }
  }

  return {
    returnToWaitingAsHost,
    closeRoomAsHost,
    leaveDuringPlay,
    leaveWaitingRoom,
    setTurnTimeout,
  }
}
