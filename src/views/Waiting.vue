<template>
  <div class="waiting" :style="{ height: waitingHeight }">
    <WaitingList
      :users="roomStore.users"
      :room-code="roomStore.roomCode"
      :height="height"
      :is-host="roomStore.isHost"
    />
    <div class="waiting__actions">
      <p v-if="isOnlyHost" class="warning">
        You can't start this alone <br />
        Invite Others
      </p>
      <div v-if="roomStore.isHost" class="waiting__host-actions">
        <button class="game-button red" @click="handleStart" :disabled="loading">
          START
        </button>
        <button class="game-button orange" @click="handleCopyLink">
          Copy Invite Link
        </button>
        <button class="game-button" @click="$emit('quitHost')">QUIT</button>
      </div>
      <div v-else class="waiting__client-actions">
        <h3>Please wait for the host to start</h3>
        <p style="margin: 2% 0">or</p>
        <button class="game-button" @click="$emit('quitClient')">QUIT</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import packOfCards from '@/utils/packOfCards'
import shuffleArray from '@/utils/shuffleArray'
import getRandomInt from '@/utils/getRandomInt'
import WaitingList from '@/components/organisms/WaitingList.vue'
import Warning from '@/components/molecules/Warning.vue'

defineEmits<{
  (e: 'quitHost'): void
  (e: 'quitClient'): void
}>()

const roomStore = useRoomStore()
const gameStore = useGameStore()

const height = computed(() => window.innerHeight)
const waitingHeight = computed(() => {
  return height.value ? `${(height.value * 85) / 100}px` : '85vh'
})
const buttonListHeight = computed(() => {
  return height.value ? `${(height.value * 20) / 100}px` : '20vh'
})

const loading = ref(false)
const isOnlyHost = ref(false)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const handleStart = async () => {
  if (roomStore.users.length === 1) {
    isOnlyHost.value = true
    await sleep(2000)
    isOnlyHost.value = false
    return
  }

  loading.value = true
  try {
    // カードをシャッフル
    const shuffledCards = shuffleArray([...packOfCards])

    // プレイヤーの手札を作成
    const decks: Record<string, string[]> = {}
    const users = [...roomStore.users]
    for (let i = 0; i < users.length; i++) {
      decks[users[i]] = shuffledCards.splice(0, 3)
    }
    const drawCardPile = shuffledCards

    // Firestoreにゲーム状態を保存
    await updateDoc(doc(getFirestoreDB(), 'initGameState', roomStore.roomCode), {
      turn: users[getRandomInt(0, users.length)],
      winner: users,
      startFlag: true,
      playerDecks: decks,
      drawCardPile: [...drawCardPile],
    })
  } catch (error) {
    console.error('Error starting game:', error)
  } finally {
    loading.value = false
  }
}

const handleCopyLink = async () => {
  const url = `${window.location.origin}/?roomCode=${roomStore.roomCode}`
  try {
    await navigator.clipboard.writeText(url)
    alert('クリップボードにコピーしました！')
  } catch (error) {
    console.error('Failed to copy:', error)
    // フォールバック: テキストエリアを使用
    const textarea = document.createElement('textarea')
    textarea.value = url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert('クリップボードにコピーしました！')
  }
}

</script>

<style lang="scss" scoped>
.waiting {
  display: flex;
  flex-direction: column;
  padding: $spacing-lg;
  background-color: #c69239;
  background-size: cover;
  background-image: url('@/assets/images/backgrounds/waitingBackgroundImg.png');
}

.waiting__actions {
  margin: 4vh 0 0;
  height: 20vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.waiting__host-actions,
.waiting__client-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.waiting__client-actions {
  h3 {
    margin: 0;
    color: $text-primary;
  }

  p {
    margin: $spacing-sm 0;
    color: $text-secondary;
  }
}

// ゲームボタンのスタイルはgame.scssで定義
</style>
