<template>
  <div class="waiting-list">
    <h1 class="waiting-list__title">{{ t('waiting.waitingForPlayer') }}</h1>
    <div class="waiting-users">
      <WaitingListItem
        v-for="(user, i) in users"
        :key="`Item${i}`"
        :user="user"
        :i="i"
        :is-host="isHost"
        @open="handleOpen"
      />
      <p v-if="users.length === 0" class="waiting-users__empty">
        {{ t('waiting.inviteOthers') }}
      </p>
      <Modal :open="open" @close="handleClose">
        <div class="modal-content">
          <h2>{{ t('waiting.confirmDelete') }}</h2>
          <button
            class="game-button red game-button--in-game"
            @click="deleteHandler(deleteUser)"
          >
            {{ t('common.deleteUser') }}
          </button>
        </div>
      </Modal>
    </div>
    <div v-if="$slots.default" class="waiting-list__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateDoc, getDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import WaitingListItem from '@/components/molecules/WaitingListItem.vue'
import Modal from '@/components/molecules/Modal.vue'

interface Props {
  users: string[]
  roomCode: string
  isHost?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHost: false,
})

const { t } = useI18n()

const open = ref(false)
const deleteUser = ref('')

const handleOpen = (user: string) => {
  deleteUser.value = user
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const deleteHandler = async (userToDelete: string) => {
  // 先にモーダルを閉じる（非同期更新の完了を待たずに UI を確定させる）
  handleClose()
  try {
    const usersData = await getDoc(doc(getFirestoreDB(), 'users', props.roomCode))
    const newUsers =
      usersData
        .data()
        ?.restartUsers.filter((user: string) => userToDelete !== user) || []

    await updateDoc(doc(getFirestoreDB(), 'users', props.roomCode), {
      restartUsers: newUsers,
      users: newUsers,
    })
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}
</script>

<style lang="scss" scoped>
.waiting-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  gap: $spacing-sm;
}

.waiting-list__title {
  flex-shrink: 0;
  font-family: 'Carter One', sans-serif;
  font-size: 1.1rem;
  font-weight: 1000;
  color: white;
  margin: 0;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);

  @include respond-to(md) {
    font-size: $font-size-xl;
  }
}

.waiting-users {
  width: 100%;
  height: 220px;
  flex-shrink: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(0, 0, 0, 0.12);
  border: 2px solid rgba(6, 52, 0, 0.45);
  border-radius: $border-radius-lg;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: $spacing-sm;

  @include respond-to(md) {
    height: 260px;
  }
}

.waiting-list__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-xs;
}

.waiting-users__empty {
  margin: $spacing-md 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: $font-size-sm;
  text-align: center;
}

.modal-content {
  text-align: center;
  padding: $spacing-lg;

  h2 {
    margin-bottom: $spacing-lg;
    color: white;
  }
}
</style>
