<template>
  <div
    class="middle-info"
    :style="{
      pointerEvents: turn !== currentUser ? 'none' : 'auto',
      height: middleInfoHeight,
    }"
  >
    <button
      class="game-button"
      :disabled="turn !== currentUser"
      @click="onFoldHandler"
    >
      FOLD
    </button>
    <div v-if="playedCardsPile && playedCardsPile.length > 0" class="played-card-container">
      <img
        class="played-card"
        :src="getCardImage(playedCardsPile[playedCardsPile.length - 1])"
        alt="card"
      />
    </div>
    <button
      class="game-button orange"
      @click="onTotalFlagHandler"
      :style="{
        pointerEvents: turn === currentUser ? 'none' : 'auto',
      }"
    >
      {{ totalFlag ? `　　${totalNumber}　　` : 'Check Total' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'

interface Props {
  height?: number
  roomCode: string
  currentUser: string
  turn: string
  playedCardsPile: string[]
  totalNumber: number
  playerDecks: Record<string, string[]>
  isReturn: boolean
  ranking: string[]
  winner: string[]
  users: string[]
}

const props = defineProps<Props>()

const totalFlag = ref(false)

const middleInfoHeight = computed(() => {
  return props.height ? `${(props.height * 35) / 100}px` : '35vh'
})

// カード画像の動的import用ヘルパー関数
const getCardImage = (cardName: string) => {
  try {
    // Viteの動的importを使用
    return new URL(
      `../../assets/images/cards-front/${cardName}.png`,
      import.meta.url
    ).href
  } catch (error) {
    console.error(`Error loading card image: ${cardName}`, error)
    return ''
  }
}

const onFoldHandler = async () => {
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
    users: newWinner,
  })
  await updateDoc(doc(getFirestoreDB(), 'initGameState', props.roomCode), {
    gameOver: newWinner.length === 1,
    turn: props.isReturn ? returnNextTurn : nextTurn,
    playerDecks: newPlayerDecks,
    winner: newWinner,
    ranking: [...props.ranking, props.currentUser],
    missPlayer: '',
  })
}

const onTotalFlagHandler = async () => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  totalFlag.value = !totalFlag.value
  await sleep(2000)
  totalFlag.value = false
}
</script>

<style lang="scss" scoped>
.middle-info {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  height: 35vh;
  padding: $spacing-md;
}

// ゲームボタンのスタイルはgame.scssで定義

.played-card-container {
  width: 33%;
  height: 100%;
  padding: 16% 0.5% 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.played-card {
  width: 96%;
  height: 58%;
  max-height: 140px;
  border-radius: 7px;
  align-self: center;
  cursor: pointer;
  object-fit: contain;
}
</style>
