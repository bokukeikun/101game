import { ref, onUnmounted, computed } from 'vue'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type QuerySnapshot,
} from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import type { Player } from '@/types/game'

/**
 * プレイヤーリストのリアルタイム監視を行うcomposable
 */
export function usePlayers(roomId: string) {
  const players = ref<Player[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let unsubscribe: (() => void) | null = null

  if (roomId) {
    const playersRef = collection(getFirestoreDB(), `rooms/${roomId}/players`)
    const playersQuery = query(playersRef, orderBy('joinedAt', 'asc'))

    unsubscribe = onSnapshot(
      playersQuery,
      (snapshot: QuerySnapshot) => {
        players.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Player[]
        loading.value = false
        error.value = null
      },
      (err) => {
        error.value = err
        loading.value = false
        console.error('Error watching players:', err)
      }
    )
  } else {
    loading.value = false
  }

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const playerCount = computed(() => players.value.length)
  const host = computed(() => players.value.find((p) => p.isHost))
  const readyPlayers = computed(() =>
    players.value.filter((p) => p.status === 'ready')
  )
  const isFull = computed(() => players.value.length >= 6)

  return {
    players,
    loading,
    error,
    playerCount,
    host,
    readyPlayers,
    isFull,
  }
}
