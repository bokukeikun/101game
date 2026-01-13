<template>
  <div
    class="game"
    :class="{
      'background-img-g': gameStore.startFlag,
      'background-color-r': !gameStore.startFlag,
    }"
    :style="{ height: gameHeight }"
  >
    <TopInfo
      :height="height"
      :room-code="roomCode"
      :is-host="roomStore.isHost"
      :current-user="currentUser"
      :winner="gameStore.winner"
      :is-return="gameStore.isReturn"
      :player-decks="gameStore.playerDecks"
      :users="roomStore.users"
      @quit-host="quitHostHandler"
    />
    <Loading v-if="gameStore.loading" />
    <template v-else>
      <template v-if="roomStore.restartUsers.length">
        <template v-if="roomStore.restartUsers.includes(currentUser)">
          <Waiting
            v-if="!gameStore.startFlag"
            @quit-host="quitHostHandler"
            @quit-client="quitClientHandler"
          />
          <template v-else>
            <Ranking
              v-if="gameStore.gameOver"
              @quit-host="quitHostHandler"
            />
            <Play v-else />
          </template>
        </template>
        <Rejoin v-else :room-code="roomCode" />
      </template>
      <RoomClosed v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import Loading from '@/views/Loading.vue'
import Waiting from '@/views/Waiting.vue'
import Play from '@/views/Play.vue'
import Ranking from '@/views/Ranking.vue'
import Rejoin from '@/views/Rejoin.vue'
import RoomClosed from '@/views/RoomClosed.vue'
import TopInfo from '@/components/organisms/TopInfo.vue'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const gameStore = useGameStore()

const height = ref(window.innerHeight)
const gameHeight = ref(height.value ? `${height.value}px` : '100vh')

let unsubscribeUsers: (() => void) | null = null
let unsubscribeGameState: (() => void) | null = null

const roomCode = computed(() => roomStore.roomCode)
const currentUser = computed(() => {
  const user = roomStore.currentUser
  // HまたはCプレフィックスを除去
  return user.startsWith('H') || user.startsWith('C') ? user.slice(1) : user
})

onMounted(() => {
  // URLパラメータから情報を取得
  const roomCodeParam = route.query.roomCode as string
  const currentUserParam = route.query.currentUser as string

  if (!roomCodeParam || !currentUserParam) {
    router.push('/')
    return
  }

  roomStore.setRoomCode(roomCodeParam)
  roomStore.setCurrentUser(currentUserParam)

  // ウィンドウサイズの更新
  const updateHeight = () => {
    height.value = window.innerHeight
    gameHeight.value = `${height.value}px`
  }
  window.addEventListener('resize', updateHeight)

  // ブラウザの戻るボタンを無効化
  window.history.pushState(null, '', window.location.href)
  const handlePopState = () => {
    window.history.go(1)
  }
  window.addEventListener('popstate', handlePopState)

  // ページ離脱時の警告
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }
  window.addEventListener('beforeunload', handleBeforeUnload)

  // ホストの場合のみinitGameStateを初期化
  if (roomStore.isHost) {
    const playedCardsPile = ['N00']
    setDoc(doc(getFirestoreDB(), 'initGameState', roomCodeParam), {
      startFlag: false,
      gameOver: false,
      winner: [],
      turn: '',
      playerDecks: {},
      currentNumber: playedCardsPile[0].slice(-2),
      currentCardType: playedCardsPile[0].charAt(0),
      totalNumber: 0,
      playedCardsPile: [...playedCardsPile],
      drawCardPile: [],
      double: 1,
      isReturn: false,
      ranking: [],
      missPlayer: '',
    }).catch((error) => {
      console.error('Error initializing game state:', error)
    })
  }

  // Usersの監視
  const usersRef = doc(getFirestoreDB(), 'users', roomCodeParam)
  unsubscribeUsers = onSnapshot(
    usersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        roomStore.setUsers({
          users: data.users || [],
          restartUsers: data.restartUsers || [],
        })
        gameStore.setLoading(false)
      } else {
        gameStore.setLoading(false)
      }
    },
    (error) => {
      console.error('Error watching users:', error)
      gameStore.setLoading(false)
    }
  )

  // initGameStateの監視
  const gameStateRef = doc(getFirestoreDB(), 'initGameState', roomCodeParam)
  unsubscribeGameState = onSnapshot(
    gameStateRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        gameStore.setGameState({
          startFlag: data.startFlag || false,
          gameOver: data.gameOver !== undefined ? data.gameOver : true,
          winner: data.winner || [],
          turn: data.turn || '',
          playerDecks: data.playerDecks || {},
          currentNumber: data.currentNumber || '',
          currentCardType: data.currentCardType || '',
          totalNumber: data.totalNumber || 0,
          playedCardsPile: data.playedCardsPile || ['N00'],
          drawCardPile: data.drawCardPile || [],
          double: data.double || 1,
          isReturn: data.isReturn || false,
          ranking: data.ranking || [],
          missPlayer: data.missPlayer || '',
        })
        height.value = window.innerHeight
        gameHeight.value = `${height.value}px`
      } else {
        gameStore.setLoading(false)
      }
    },
    (error) => {
      console.error('Error watching game state:', error)
      gameStore.setLoading(false)
    }
  )

  return () => {
    window.removeEventListener('resize', updateHeight)
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

onUnmounted(() => {
  if (unsubscribeUsers) unsubscribeUsers()
  if (unsubscribeGameState) unsubscribeGameState()
})

// ホストがQuitボタンを押した時のハンドル
const quitHostHandler = async () => {
  gameStore.setLoading(true)
  try {
    await updateDoc(doc(getFirestoreDB(), 'users', roomCode.value), {
      restartUsers: [],
      users: [],
    })
    await deleteDoc(doc(getFirestoreDB(), 'initGameState', roomCode.value))
    await deleteDoc(doc(getFirestoreDB(), 'users', roomCode.value))
  } catch (error) {
    console.error('Error quitting as host:', error)
  } finally {
    gameStore.setLoading(false)
    roomStore.reset()
    gameStore.reset()
    router.push('/')
  }
}

// クライアントがQuitボタンを押した時のハンドル
const quitClientHandler = async () => {
  gameStore.setLoading(true)
  try {
    const newUsers = roomStore.restartUsers.filter(
      (user) => currentUser.value !== user
    )
    await updateDoc(doc(getFirestoreDB(), 'users', roomCode.value), {
      restartUsers: newUsers,
      users: newUsers,
    })
  } catch (error) {
    console.error('Error quitting as client:', error)
  } finally {
    gameStore.setLoading(false)
    router.push(`/?roomCode=${roomCode.value}`)
  }
}
</script>

<style lang="scss" scoped>
.game {
  background-size: cover;
  width: 100%;
  padding: 0 1vw;
  overflow-y: auto;
}

.background-img-g {
  background-image: url('@/assets/images/backgrounds/backgroundImgG.png');
}

.background-color-r {
  background-image: url('@/assets/images/backgrounds/backgroundImgG.png');
}
</style>
