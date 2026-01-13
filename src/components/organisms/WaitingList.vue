<template>
  <div class="waiting-list">
    <h1 class="top-info-text">Waiting for Player</h1>
    <div class="waiting-users" :style="{ height: waitingUsersHeight }">
      <WaitingListItem
        v-for="(user, i) in users"
        :key="`Item${i}`"
        :user="user"
        :i="i"
        :is-host="isHost"
        @open="handleOpen"
      />
      <Modal :open="open" @close="handleClose">
        <div class="modal-content">
          <h2>削除しますか？</h2>
          <button class="game-button red" @click="deleteHandler(deleteUser)">
            Delete User
          </button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { updateDoc, getDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import WaitingListItem from '@/components/molecules/WaitingListItem.vue'
import Modal from '@/components/molecules/Modal.vue'

interface Props {
  users: string[]
  roomCode: string
  height?: number
  isHost?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHost: false,
})

const open = ref(false)
const deleteUser = ref('')

const waitingUsersHeight = computed(() => {
  return props.height ? `${(props.height * 35) / 100}px` : '35vh'
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
    const usersData = await getDoc(doc(getFirestoreDB(), 'users', props.roomCode))
    const newUsers =
      usersData
        .data()
        ?.restartUsers.filter((user: string) => userToDelete !== user) || []

    await updateDoc(doc(getFirestoreDB(), 'users', props.roomCode), {
      restartUsers: newUsers,
      users: newUsers,
    })
    handleClose()
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
  padding: $spacing-md;
}

.top-info-text {
  font-family: 'Carter One', sans-serif;
  font-size: $font-size-xl;
  font-weight: 1000;
  color: white;
  margin-bottom: $spacing-md;
}

.waiting-users {
  height: 35vh;
  width: 95%;
  margin: 2.5%;
  overflow-y: auto;
  background-color: #c69239;
  border: 1px solid #063400cf;
  border-radius: 5px;
  box-shadow: rgb(0 0 0 / 25%) 0px 54px 55px,
    rgb(0 0 0 / 12%) 0px -12px 30px, rgb(0 0 0 / 12%) 0px 4px 6px,
    rgb(0 0 0 / 17%) 0px 12px 13px, rgb(0 0 0 / 9%) 0px -3px 5px;
  padding: $spacing-sm;
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
