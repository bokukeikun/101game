import { ref, onMounted, onUnmounted } from 'vue'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'

const HEARTBEAT_MS = 8000 // 自分の生存を書き込む間隔
const CLOCK_MS = 4000 // 経過判定用の時計更新間隔
const OFFLINE_MS = 20000 // この時間更新がなければオフライン扱い

export type PresenceState = 'online' | 'offline' | 'unknown'

/**
 * ハートビート方式の簡易プレゼンス（オンライン/接続状態）。
 *
 * 各クライアントが `presence/{roomCode}` に自分の最終更新時刻を書き込み、
 * 一定時間更新が無いプレイヤーをオフラインとみなす。
 */
export function usePresence() {
  const roomStore = useRoomStore()
  const presence = ref<Record<string, number>>({})
  const now = ref(Date.now())

  let unsubscribe: (() => void) | null = null
  let beatTimer: ReturnType<typeof setInterval> | null = null
  let clockTimer: ReturnType<typeof setInterval> | null = null

  const beat = () => {
    const code = roomStore.roomCode
    const name = roomStore.currentPlayerName
    if (!code || !name) return
    setDoc(
      doc(getFirestoreDB(), 'presence', code),
      { [name]: Date.now() },
      { merge: true }
    ).catch((error) => {
      console.error('Error writing presence:', error)
    })
  }

  onMounted(() => {
    beat()
    beatTimer = setInterval(beat, HEARTBEAT_MS)
    clockTimer = setInterval(() => {
      now.value = Date.now()
    }, CLOCK_MS)

    const code = roomStore.roomCode
    if (code) {
      unsubscribe = onSnapshot(
        doc(getFirestoreDB(), 'presence', code),
        (snapshot) => {
          presence.value = (snapshot.data() as Record<string, number>) || {}
        },
        (error) => {
          console.error('Error watching presence:', error)
        }
      )
    }
  })

  onUnmounted(() => {
    if (beatTimer) clearInterval(beatTimer)
    if (clockTimer) clearInterval(clockTimer)
    if (unsubscribe) unsubscribe()
  })

  /** プレイヤーの接続状態。記録が無ければ 'unknown'（中立） */
  const getPresence = (name: string): PresenceState => {
    const last = presence.value[name]
    if (!last) return 'unknown'
    return now.value - last < OFFLINE_MS ? 'online' : 'offline'
  }

  return { getPresence }
}
