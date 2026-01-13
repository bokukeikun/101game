import { ref, onUnmounted, computed } from 'vue'
import { doc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import type { Room } from '@/types/game'
import { RoomError } from '@/utils/errorHandler'

/**
 * ルームのリアルタイム監視を行うcomposable
 */
export function useRoom(roomId: string) {
  const room = ref<Room | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let unsubscribe: (() => void) | null = null

  if (roomId) {
    const roomRef = doc(getFirestoreDB(), 'rooms', roomId)
    
    unsubscribe = onSnapshot(
      roomRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          room.value = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Room
          error.value = null
        } else {
          room.value = null
          error.value = new RoomError('ルームが見つかりません', 'ROOM_NOT_FOUND')
        }
        loading.value = false
      },
      (err) => {
        error.value = err
        loading.value = false
        console.error('Error watching room:', err)
      }
    )
  } else {
    loading.value = false
    error.value = new RoomError('ルームIDが指定されていません', 'INVALID_CODE')
  }

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const isWaiting = computed(() => room.value?.status === 'waiting')
  const isPlaying = computed(() => room.value?.status === 'playing')
  const isFinished = computed(() => room.value?.status === 'finished')
  const canStart = computed(() => {
    if (!room.value) return false
    return (
      isWaiting.value &&
      room.value.players.length >= 2 &&
      room.value.players.every((p) => p.status === 'ready' || p.isHost)
    )
  })

  return {
    room,
    loading,
    error,
    isWaiting,
    isPlaying,
    isFinished,
    canStart,
  }
}
