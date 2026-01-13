<template>
  <ul class="player-list" :style="{ height: playerListHeight }">
    <PlayerListItem
      v-for="(item, i) in users"
      :key="`Player${i}`"
      :item="item"
      :i="i"
      :is-host="isHost"
      :turn="turn"
      :users="users"
      :restart-users="restartUsers"
      @open="handleOpen"
    />
    <Modal
      :open="open"
      @close="handleClose"
    >
      <div class="modal-content">
        <h2>削除しますか？</h2>
        <button class="game-button red" @click="deleteHandler(deleteUser)">
          Delete User
        </button>
      </div>
    </Modal>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { updateDoc, getDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import PlayerListItem from '@/components/molecules/PlayerListItem.vue'
import Modal from '@/components/molecules/Modal.vue'

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
}

const props = defineProps<Props>()

const open = ref(false)
const deleteUser = ref('')

const playerListHeight = computed(() => {
  return props.height ? `${(props.height * 11) / 100}px` : '11vh'
})

const handleOpen = (user: string) => {
  deleteUser.value = user
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const deleteHandler = async (userToDelete: string) => {
  try {
    const newPlayerDecks: Record<string, string[]> = {}
    for (let i = 0; i < props.users.length; i++) {
      if (props.users[i] !== userToDelete) {
        newPlayerDecks[props.users[i]] = props.playerDecks[props.users[i]]
      }
    }
    const newWinner = props.winner.filter((item) => item !== userToDelete)
    const deleteUserIndex = props.users.indexOf(userToDelete)
    const nextTurn =
      deleteUserIndex === props.users.length - 1
        ? props.users[0]
        : props.users[deleteUserIndex + 1]
    const returnNextTurn =
      deleteUserIndex === 0
        ? props.users[props.users.length - 1]
        : props.users[deleteUserIndex - 1]

    const usersData = await getDoc(doc(getFirestoreDB(), 'users', props.roomCode))
    const newUsers = usersData
      .data()
      ?.restartUsers.filter((user: string) => userToDelete !== user) || []

    await updateDoc(doc(getFirestoreDB(), 'users', props.roomCode), {
      restartUsers: newUsers,
      users: newUsers,
    })
    await updateDoc(doc(getFirestoreDB(), 'initGameState', props.roomCode), {
      gameOver: newWinner.length === 1,
      winner: newWinner,
      turn: props.isReturn ? returnNextTurn : nextTurn,
      playerDecks: newPlayerDecks,
    })
    handleClose()
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}
</script>

<style lang="scss" scoped>
.player-list {
  list-style: none;
  padding: 1vh 0 0;
  margin: 0;
  overflow-x: auto;
  white-space: nowrap;
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
