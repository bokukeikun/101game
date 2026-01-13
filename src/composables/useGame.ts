import { ref, computed, onUnmounted } from 'vue'
import { doc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import type { Game } from '@/types/game'

/**
 * ゲーム状態のリアルタイム監視を行うcomposable
 */
export function useGame(gameId: string) {
  const game = ref<Game | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let unsubscribe: (() => void) | null = null

  if (gameId) {
    const gameRef = doc(getFirestoreDB(), 'games', gameId)
    
    unsubscribe = onSnapshot(
      gameRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          game.value = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Game
          error.value = null
        } else {
          game.value = null
        }
        loading.value = false
      },
      (err) => {
        error.value = err
        loading.value = false
        console.error('Error watching game:', err)
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

  const isFinished = computed(() => game.value !== null)
  const players = computed(() => game.value?.players || [])
  const sortedPlayers = computed(() => {
    return [...players.value].sort((a, b) => a.rank - b.rank)
  })
  const winner = computed(() => {
    return sortedPlayers.value[0] || null
  })

  return {
    game,
    loading,
    error,
    isFinished,
    players,
    sortedPlayers,
    winner,
  }
}
