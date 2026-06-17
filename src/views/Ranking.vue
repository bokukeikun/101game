<template>
  <div class="ranking">
    <template v-if="gameStore.winner && gameStore.winner.length > 0">
      <Confetti />
      <RankingList
        :height="height"
        :ranking="gameStore.ranking"
        :winner="gameStore.winner[0] || ''"
      />
      <div class="button-list">
        <div v-if="roomStore.isHost" class="host-actions">
          <button class="game-button red game-button--in-game" @click="restartHandler">
            {{ t('common.restart') }}
          </button>
          <button class="game-button game-button--in-game" @click="quitHostHandler">
            {{ t('common.quit') }}
          </button>
        </div>
        <div v-else class="client-actions">
          <h3>{{ t('ranking.waitForRestart') }}</h3>
          <div class="loader" style="margin: 4% 50%">{{ t('common.loading') }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import { useGameActions } from '@/composables/useGameActions'
import RankingList from '@/components/organisms/RankingList.vue'
import Confetti from '@/components/atoms/Confetti.vue'

const roomStore = useRoomStore()
const gameStore = useGameStore()
const { endGameAsHost } = useGameActions()
const { t } = useI18n()

const height = computed(() => window.innerHeight)

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

const quitHostHandler = endGameAsHost
</script>

<style lang="scss" scoped>
.ranking {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: $spacing-md;
}

.button-list {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.host-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-sm;
  width: 100%;
  max-width: 360px;
}

.client-actions {
  text-align: center;

  h3 {
    color: white;
    margin-bottom: $spacing-md;
  }
}
</style>
