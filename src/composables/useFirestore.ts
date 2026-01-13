import { ref, onUnmounted } from 'vue'
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'

export function useFirestore<T = DocumentData>(collectionName: string, docId: string) {
  const data = ref<T | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let unsubscribe: (() => void) | null = null

  const docRef = doc(getFirestoreDB(), collectionName, docId)
  unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        data.value = { id: snapshot.id, ...snapshot.data() } as T
      } else {
        data.value = null
      }
      loading.value = false
    },
    (err) => {
      error.value = err
      loading.value = false
    }
  )

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return { data, loading, error }
}
