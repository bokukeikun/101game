<template>
  <div class="ranking" :style="{ height: rankingHeight }">
    <template v-if="gameStore.winner && gameStore.winner.length > 0">
      <RankingList
        :height="height"
        :ranking="gameStore.ranking"
        :winner="gameStore.winner[0] || ''"
      />
      <div class="button-list" :style="{ height: buttonListHeight }">
        <div v-if="roomStore.isHost" class="host-actions">
          <button class="game-button red" @click="restartHandler">
            RESTART
          </button>
          <button class="game-button" @click="quitHostHandler">QUIT</button>
        </div>
        <div v-else class="client-actions">
          <h3>Please wait for the host to restart</h3>
          <div class="loader" style="margin: 4% 50%">Loading...</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import RankingList from '@/components/organisms/RankingList.vue'
import Spinner from '@/components/atoms/Spinner.vue'

const router = useRouter()
const roomStore = useRoomStore()
const gameStore = useGameStore()

const height = computed(() => window.innerHeight)
const rankingHeight = computed(() => {
  return height.value ? `${(height.value * 85) / 100}px` : '85vh'
})
const buttonListHeight = computed(() => {
  return height.value ? `${(height.value * 20) / 100}px` : '20vh'
})

const restartHandler = async () => {
  const playedCardsPile = ['N00']

  await updateDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode), {
    users: [...roomStore.restartUsers],
  })

  await updateDoc(
    doc(getFirestoreDB(), 'initGameState', roomStore.roomCode),
    {
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
    }
  )
}

const quitHostHandler = async () => {
  await updateDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode), {
    restartUsers: [],
    users: [],
  })
  await deleteDoc(
    doc(getFirestoreDB(), 'initGameState', roomStore.roomCode)
  )
  await deleteDoc(doc(getFirestoreDB(), 'users', roomStore.roomCode))
  roomStore.reset()
  gameStore.reset()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.ranking {
  display: flex;
  flex-direction: column;
  padding: $spacing-md;
}

.button-list {
  margin: 4vh 0 0;
  height: 20vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.host-actions,
.client-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  align-items: center;
}

.client-actions {
  h3 {
    color: white;
    margin-bottom: $spacing-md;
  }
}

.game-button {
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-lg;
  font-weight: bold;
  border: 2px solid white;
  border-radius: $border-radius-md;
  background-color: $primary-color;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: $primary-hover;
    transform: scale(1.05);
  }

  &.red {
    background-color: $error-color;

    &:hover {
      background-color: darken($error-color, 10%);
    }
  }
}
</style>
