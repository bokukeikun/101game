import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserData, InitGameState } from '@/types/room'

export const useRoomStore = defineStore('room', () => {
  const roomCode = ref<string>('')
  const currentUser = ref<string>('')
  const users = ref<string[]>([])
  const restartUsers = ref<string[]>([])
  const isHost = ref<boolean>(false)
  const startFlag = ref<boolean>(false)
  const isRoomFull = ref<boolean>(false)

  const canJoin = computed(() => {
    return !startFlag.value && users.value.length < 6 && !isRoomFull.value
  })

  function setRoomCode(code: string) {
    roomCode.value = code
  }

  function setCurrentUser(user: string) {
    currentUser.value = user
    isHost.value = user.startsWith('H')
  }

  function setUsers(data: UserData) {
    users.value = data.users
    restartUsers.value = data.restartUsers
    isRoomFull.value = data.users.length >= 6
  }

  function setStartFlag(flag: boolean) {
    startFlag.value = flag
  }

  function addUser(name: string) {
    if (!users.value.includes(name) && users.value.length < 6) {
      users.value.push(name)
      restartUsers.value.push(name)
    }
  }

  function reset() {
    roomCode.value = ''
    currentUser.value = ''
    users.value = []
    restartUsers.value = []
    isHost.value = false
    startFlag.value = false
    isRoomFull.value = false
  }

  return {
    roomCode,
    currentUser,
    users,
    restartUsers,
    isHost,
    startFlag,
    isRoomFull,
    canJoin,
    setRoomCode,
    setCurrentUser,
    setUsers,
    setStartFlag,
    addUser,
    reset,
  }
})
