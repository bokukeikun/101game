<template>
  <ul ref="listRef" class="player-list" :style="{ height: playerListHeight }">
    <PlayerListItem
      v-for="(item, i) in users"
      :key="`Player${i}`"
      :item="item"
      :i="i"
      :is-host="isHost"
      :turn="turn"
      :users="users"
      :restart-users="restartUsers"
      :turn-timeout="turnTimeout"
      :seconds-left="secondsLeft"
      :card-count="playerDecks[item]?.length ?? 0"
      :presence="presenceMap[item] ?? 'unknown'"
      @open="handleOpen"
    />
    <Modal
      :open="open"
      @close="handleClose"
    >
      <div class="modal-content">
        <h2>{{ t('waiting.confirmDelete') }}</h2>
        <button class="game-button red game-button--in-game" @click="deleteHandler(deleteUser)">
          {{ t('common.deleteUser') }}
        </button>
      </div>
    </Modal>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { writeBatch, getDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import PlayerListItem from '@/components/molecules/PlayerListItem.vue'
import Modal from '@/components/molecules/Modal.vue'
import { getTurnAfter } from '@/utils/turn'

interface Props {
  height?: number
  roomCode: string
  playerDecks: Record<string, string[]>
  winner: string[]
  isReturn: boolean
  users: string[]
  restartUsers: string[]
  isHost: boolean
  turn: string
  turnTimeout?: number
  secondsLeft?: number
  presenceMap?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  turnTimeout: 0,
  secondsLeft: 0,
  presenceMap: () => ({}),
})

const { t } = useI18n()

const open = ref(false)
const deleteUser = ref('')
const listRef = ref<HTMLElement | null>(null)

// ターンが変わったら、現在のプレイヤーを横スクロールで中央に表示する
watch(
  () => props.turn,
  async () => {
    await nextTick()
    const activeEl = listRef.value?.querySelector('.is-active') as HTMLElement | null
    activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
)

const playerListHeight = computed(() => {
  return props.height ? `${(props.height * 12) / 100}px` : '11vh'
})

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
    const newPlayerDecks: Record<string, string[]> = {}
    for (let i = 0; i < props.users.length; i++) {
      if (props.users[i] !== userToDelete) {
        newPlayerDecks[props.users[i]] = props.playerDecks[props.users[i]]
      }
    }
    const newWinner = props.winner.filter((item) => item !== userToDelete)
    const nextTurn = getTurnAfter(props.users, userToDelete, props.isReturn)

    const db = getFirestoreDB()
    const usersData = await getDoc(doc(db, 'users', props.roomCode))
    const newUsers = usersData
      .data()
      ?.restartUsers.filter((user: string) => userToDelete !== user) || []

    const batch = writeBatch(db)
    batch.update(doc(db, 'users', props.roomCode), {
      restartUsers: newUsers,
      users: newUsers,
    })
    batch.update(doc(db, 'initGameState', props.roomCode), {
      gameOver: newWinner.length === 1,
      winner: newWinner,
      turn: nextTurn,
      playerDecks: newPlayerDecks,
    })
    await batch.commit()
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}
</script>

<style lang="scss" scoped>
.player-list {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  list-style: none;
  padding: 1vh $spacing-sm 0;
  margin: 0;
  overflow-x: auto;
  white-space: nowrap;
  scroll-padding-inline: 12px;
  -webkit-overflow-scrolling: touch;
  height: 11vh;
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
