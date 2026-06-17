<template>
  <div class="waiting-list">
    <h1 class="waiting-list__title">{{ t('waiting.waitingForPlayer') }}</h1>
    <p v-if="isHost && users.length > 1" class="waiting-list__hint">
      {{ t('waiting.dragToReorder') }}
    </p>
    <div class="waiting-users">
      <draggable
        v-model="orderedUsers"
        :item-key="itemKey"
        handle=".drag-handle"
        :disabled="!isHost"
        :animation="180"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
        @end="persistOrder"
      >
        <template #item="{ element, index }">
          <WaitingListItem
            :user="element"
            :i="index"
            :is-host="isHost"
            :host-name="hostName"
            @open="handleOpen"
          />
        </template>
      </draggable>
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
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateDoc, getDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
// @ts-expect-error vuedraggable は型定義を同梱していないため
import draggable from 'vuedraggable'
import WaitingListItem from '@/components/molecules/WaitingListItem.vue'
import Modal from '@/components/molecules/Modal.vue'

interface Props {
  users: string[]
  roomCode: string
  isHost?: boolean
  restartUsers?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  isHost: false,
  restartUsers: () => [],
})

const { t } = useI18n()

const open = ref(false)
const deleteUser = ref('')

// ルーム作成者（ホスト）。並べ替えても削除保護に使う。
const hostName = computed(() => props.restartUsers[0] ?? '')

// ドラッグ並べ替え用のローカルコピー。Firestore のスナップショット更新で同期する。
const orderedUsers = ref<string[]>([...props.users])
watch(
  () => props.users,
  (val) => {
    orderedUsers.value = [...val]
  }
)

const itemKey = (el: string) => el

// ホストが並べ替えたら、その順番（＝手番の進行順）を Firestore に保存する。
// restartUsers は作成者判定（先頭）に使うため触らず、users のみ更新する。
const persistOrder = async () => {
  if (!props.isHost) return
  try {
    await updateDoc(doc(getFirestoreDB(), 'users', props.roomCode), {
      users: [...orderedUsers.value],
    })
  } catch (error) {
    console.error('Error reordering users:', error)
  }
}

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

.waiting-list__hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: $font-size-sm;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.35);
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
