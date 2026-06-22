<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="homepage-join">
      <input
        v-model="name"
        class="input-name"
        type="text"
        name="name"
        :maxlength="MAX_NAME_LENGTH"
        :placeholder="t('common.name')"
        :disabled="loading"
        @beforeinput="onBeforeInput"
        @paste="onPaste"
      />
      <button type="submit" class="game-button green game-button--in-game" :disabled="loading || name.length === 0">
        <Spinner v-if="loading" small />
        <span v-else>{{ t('home.joinGame') }}</span>
      </button>
    </div>
    <div class="form-alerts">
      <Warning :show="isGameStart" :message="t('join.roomStarted')" />
      <Warning :show="isNameExist" :message="t('join.nameInUse')" />
      <Warning :show="isNameLength" :message="t('home.nameMaxLength')" />
      <Warning :show="isRoomFull" :message="t('join.roomFull')" />
      <Warning :show="!!errorMessage" :message="errorMessage" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { doc, getDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { patchUsersDoc } from '@/services/firebase/roomLifecycle'
import { useRoomStore } from '@/stores/room'
import { useNameInput, MAX_NAME_LENGTH } from '@/composables/useNameInput'
import Spinner from '@/components/atoms/Spinner.vue'
import Warning from '@/components/molecules/Warning.vue'

const props = defineProps<{
  roomCode: string
}>()

const router = useRouter()
const roomStore = useRoomStore()
const { t } = useI18n()

const { name, isNameLength, onBeforeInput, onPaste } = useNameInput()
const loading = ref(false)
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

  if (name.value.length > MAX_NAME_LENGTH) {
    isNameLength.value = true
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
      errorMessage.value = t('join.roomNotFound')
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
      await patchUsersDoc(props.roomCode, {
        restartUsers: [...restartUsers, name.value],
        users: [...users, name.value],
      })
      roomStore.setCurrentUser(`C${name.value}`)
      router.replace(`/play?roomCode=${props.roomCode}&currentUser=C${name.value}`)
    }
  } catch (error: any) {
    console.error('Error joining room:', error)
    if (error.code === 'failed-precondition' || error.message?.includes('Firebase')) {
      errorMessage.value = t('errors.firebaseConfig')
    } else if (error.code === 'permission-denied') {
      errorMessage.value = t('errors.permissionDenied')
    } else if (error.code === 'not-found') {
      errorMessage.value = t('join.roomNotFound')
    } else {
      errorMessage.value = t('errors.unknown', {
        message: error.message || t('errors.unknownError'),
      })
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
  gap: $spacing-md;
}

.homepage-join {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  width: 100%;
  max-width: 320px;

  :deep(.game-button) {
    width: 76%;
    max-width: 230px;
  }
}

.form-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: $spacing-sm;
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
</style>
