<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="homepage-join">
      <input
        v-model="name"
        class="input-name"
        type="text"
        name="name"
        maxlength="7"
        placeholder="Name"
        :disabled="loading"
      />
      <button type="submit" class="game-button green" :disabled="loading || name.length === 0">
        <Spinner v-if="loading" small />
        <span v-else>JOIN GAME</span>
      </button>
    </div>
    <Warning :show="isGameStart" message="This Room has already started" />
    <Warning :show="isNameExist" message="The name is already in use" />
    <Warning :show="isNameLength" message="Up to 6 characters" />
    <Warning :show="isRoomFull" message="This Room is Full" />
    <Warning :show="!!errorMessage" :message="errorMessage" />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import Spinner from '@/components/atoms/Spinner.vue'
import Warning from '@/components/molecules/Warning.vue'

const props = defineProps<{
  roomCode: string
}>()

const router = useRouter()
const roomStore = useRoomStore()

const name = ref('')
const loading = ref(false)
const isNameLength = ref(false)
const isNameExist = ref(false)
const isRoomFull = ref(false)
const isGameStart = ref(false)
const errorMessage = ref('')

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const sleepSetFunction = async (setFunc: (value: boolean) => void) => {
  setFunc(true)
  await sleep(2000)
  setFunc(false)
}

const handleSubmit = async () => {
  if (name.value.length === 0) return

  if (name.value.length > 6) {
    await sleepSetFunction((val) => {
      isNameLength.value = val
    })
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const db = getFirestoreDB()
    const initGameStateData = await getDoc(doc(db, 'initGameState', props.roomCode))
    const startFlag = initGameStateData.data()?.startFlag ?? false

    if (startFlag) {
      isGameStart.value = true
      await sleep(2000)
      isGameStart.value = false
      loading.value = false
      return
    }

    const usersData = await getDoc(doc(db, 'users', props.roomCode))
    const userData = usersData.data()
    if (!userData) {
      errorMessage.value = 'ルームが見つかりません'
      await sleep(3000)
      errorMessage.value = ''
      loading.value = false
      return
    }

    const users = userData.users || []
    const restartUsers = userData.restartUsers || []

    if (users.includes(name.value)) {
      await sleepSetFunction((val) => {
        isNameExist.value = val
      })
    } else if (users.length >= 6) {
      await sleepSetFunction((val) => {
        isRoomFull.value = val
      })
    } else {
      await updateDoc(doc(db, 'users', props.roomCode), {
        restartUsers: [...restartUsers, name.value],
        users: [...users, name.value],
      })
      roomStore.setCurrentUser(`C${name.value}`)
      router.replace(`/play?roomCode=${props.roomCode}&currentUser=C${name.value}`)
    }
  } catch (error: any) {
    console.error('Error joining room:', error)
    // Firebase設定エラーの場合
    if (error.code === 'failed-precondition' || error.message?.includes('Firebase')) {
      errorMessage.value = 'Firebase設定エラー: .env.localファイルを確認してください'
    } else if (error.code === 'permission-denied') {
      errorMessage.value = '権限エラー: Firestoreのセキュリティルールを確認してください'
    } else if (error.code === 'not-found') {
      errorMessage.value = 'ルームが見つかりません'
    } else {
      errorMessage.value = `エラーが発生しました: ${error.message || '不明なエラー'}`
    }
    await sleep(3000)
    errorMessage.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.homepage-join {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  width: 100%;
}

.input-name {
  width: 80%;
  max-width: 300px;
  font-family: 'Carter One', sans-serif;
  font-size: 1em;
  line-height: 2.5em;
  border-radius: 5px;
  padding: 0.5em 1em;
  border: none;
  outline: none;
  text-align: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// ゲームボタンのスタイルはgame.scssで定義
</style>
