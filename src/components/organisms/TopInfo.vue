<template>
  <div class="top-info" :style="{ height: topInfoHeight }">
    <div class="top-info-left">
      <img
        class="top-info-img"
        :src="logoImage"
        alt="logo"
        @click="handleOpen"
      />
      <Modal :open="open" @close="handleClose">
        <div class="modal-content">
          <h2>ホームに戻りますか？</h2>
          <button
            class="game-button red"
            @click="isHost ? quitHostHandler() : goHomeClientHandler()"
          >
            Back Home
          </button>
        </div>
      </Modal>
    </div>
    <h1>Game Code: {{ roomCode }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import Modal from '@/components/molecules/Modal.vue'
import logoImage from '@/assets/images/logo.png'

interface Props {
  height?: number
  roomCode: string
  isHost: boolean
  currentUser: string
  winner: string[]
  isReturn: boolean
  playerDecks: Record<string, string[]>
  users: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'quitHost'): void
}>()

const open = ref(false)

const topInfoHeight = computed(() => {
  return props.height ? `${(props.height * 10) / 100}px` : '10vh'
})

const handleOpen = () => {
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const goHomeClientHandler = async () => {
  const newPlayerDecks: Record<string, string[]> = {}
  for (let i = 0; i < props.users.length; i++) {
    if (props.users[i] !== props.currentUser) {
      newPlayerDecks[props.users[i]] = props.playerDecks[props.users[i]]
    }
  }
  const newWinner = props.winner.filter((item) => item !== props.currentUser)
  const currentUserIndex = props.users.indexOf(props.currentUser)
  const nextTurn =
    currentUserIndex === props.users.length - 1
      ? props.users[0]
      : props.users[currentUserIndex + 1]
  const returnNextTurn =
    currentUserIndex === 0
      ? props.users[props.users.length - 1]
      : props.users[currentUserIndex - 1]

  await updateDoc(doc(getFirestoreDB(), 'users', props.roomCode), {
    restartUsers: newWinner,
    users: newWinner,
  })
  await updateDoc(doc(getFirestoreDB(), 'initGameState', props.roomCode), {
    gameOver: newWinner.length === 1,
    turn: props.isReturn ? returnNextTurn : nextTurn,
    playerDecks: newPlayerDecks,
    winner: newWinner,
    missPlayer: '',
  })
  handleClose()
}

const quitHostHandler = () => {
  emit('quitHost')
  handleClose()
}
</script>

<style lang="scss" scoped>
.top-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  width: 100%;

  h1 {
    font-size: $font-size-lg;
    color: white;
    margin: 0;
  }
}

.top-info-left {
  width: 25%;
}

.top-info-img {
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.modal-content {
  text-align: center;
  padding: $spacing-lg;

  h2 {
    margin-bottom: $spacing-lg;
    color: white;
  }
}

.game-button {
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-lg;
  font-weight: bold;
  border: 2px solid white;
  border-radius: $border-radius-md;
  background-color: $error-color;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: darken($error-color, 10%);
    transform: scale(1.05);
  }

  &.red {
    background-color: $error-color;
  }
}
</style>
