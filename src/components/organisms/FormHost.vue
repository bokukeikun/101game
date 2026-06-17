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
      <button type="submit" class="game-button orange game-button--in-game" :disabled="loading || name.length === 0">
        <Spinner v-if="loading" small />
        <span v-else>{{ t('home.createGame') }}</span>
      </button>
    </div>
    <div class="form-alerts">
      <Warning :show="isNameLength" :message="t('home.nameMaxLength')" />
      <Warning :show="!!errorMessage" :message="errorMessage" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { doc, setDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
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
const errorMessage = ref('')

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const handleSubmit = async () => {
  if (name.value.length > MAX_NAME_LENGTH) {
    isNameLength.value = true
    return
  }

  if (name.value.length === 0) return

  loading.value = true
  errorMessage.value = ''
  try {
    const db = getFirestoreDB()
    await setDoc(doc(db, 'users', props.roomCode), {
      restartUsers: [name.value],
      users: [name.value],
    })
    roomStore.setCurrentUser(`H${name.value}`)
    router.replace(`/play?roomCode=${props.roomCode}&currentUser=H${name.value}`)
  } catch (error: any) {
    console.error('Error creating room:', error)
    if (error.code === 'failed-precondition' || error.message?.includes('Firebase')) {
      errorMessage.value = t('errors.firebaseConfig')
    } else if (error.code === 'permission-denied') {
      errorMessage.value = t('errors.permissionDenied')
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
