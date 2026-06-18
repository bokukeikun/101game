<template>
  <div class="play">
    <PlayerList
      :height="playAreaHeight"
      :room-code="roomCode"
      :player-decks="gameStore.playerDecks"
      :winner="gameStore.winner"
      :is-return="gameStore.isReturn"
      :users="roomStore.users"
      :restart-users="roomStore.restartUsers"
      :is-host="roomStore.isHost"
      :turn="gameStore.turn"
      :turn-timeout="gameStore.turnTimeout"
      :seconds-left="secondsLeft"
      :presence-map="presenceMap"
    />
    <MiddleInfo
      :height="playAreaHeight"
      :room-code="roomCode"
      :current-user="currentUser"
      :turn="gameStore.turn"
      :played-cards-pile="gameStore.playedCardsPile"
      :total-number="gameStore.totalNumber"
      :player-decks="gameStore.playerDecks"
      :is-return="gameStore.isReturn"
      :ranking="gameStore.ranking"
      :winner="gameStore.winner"
      :users="roomStore.users"
      :draw-count="gameStore.drawCardPile.length"
      :double="gameStore.double"
      @total-blocked="onTotalBlocked"
    />
    <div class="warning-info" :style="{ height: warningInfoHeight }">
      <Warning
        v-if="showMissWarning || showTotalWarning"
        :show="showMissWarning || showTotalWarning"
        :message="showMissWarning ? missMessage : t('play.cantCheckTotal')"
        :variant="showMissWarning ? 'error' : 'info'"
      />
    </div>
    <div
      class="player-deck-container"
      :style="{ height: playerDeckContainerHeight }"
    >
      <p
        class="player-deck-text"
        :class="{ 'current-user': gameStore.isMyTurn }"
      >
        {{ gameStore.isMyTurn ? t('common.yourTurn') : currentUser }}
        <span v-if="gameStore.double > 1" class="must-play">
          {{ t('play.mustPlay', { n: gameStore.double }) }}
        </span>
      </p>
      <div
        class="player-deck"
        :style="{
          pointerEvents: gameStore.isMyTurn ? 'auto' : 'none',
        }"
      >
        <img
          v-for="(card, i) in playerDeck"
          :key="`Card${i}`"
          class="card"
          :src="getCardImage(card)"
          :alt="`card-${card}`"
          @click="onCardPlayedHandler(card)"
        />
      </div>
    </div>
    <Toast :show="showFoldToast" :message="foldToastMessage" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import PlayerList from '@/components/organisms/PlayerList.vue'
import MiddleInfo from '@/components/organisms/MiddleInfo.vue'
import Warning from '@/components/molecules/Warning.vue'
import Toast from '@/components/molecules/Toast.vue'
import { getTurnAfter } from '@/utils/turn'
import { foldPlayer } from '@/utils/foldPlayer'
import { usePresence, type PresenceState } from '@/composables/usePresence'

const roomStore = useRoomStore()
const gameStore = useGameStore()
const { t } = useI18n()
const { getPresence } = usePresence()

const presenceMap = computed(() => {
  const map: Record<string, PresenceState> = {}
  for (const user of roomStore.users) {
    map[user] = getPresence(user)
  }
  return map
})

const height = computed(() => window.innerHeight)
const currentUser = computed(() => roomStore.currentPlayerName)

const playAreaHeight = computed(() => {
  return height.value ? Math.round((height.value * 90) / 100) : 0
})

const playerDeckContainerHeight = computed(() => {
  return playAreaHeight.value
    ? `${(playAreaHeight.value * 34) / 100}px`
    : '30vh'
})

const warningInfoHeight = computed(() => {
  return playAreaHeight.value ? `${(playAreaHeight.value * 8) / 100}px` : '8vh'
})

const playerDeck = computed(() => {
  return gameStore.playerDecks[currentUser.value] || []
})

const roomCode = computed(() => roomStore.roomCode)

// 手番タイムアウト（カウントダウン + 時間切れでフォールド）
const secondsLeft = ref(0)
let timerId: ReturnType<typeof setInterval> | null = null

const clearTurnTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

const startTurnTimer = () => {
  clearTurnTimer()
  if (
    !gameStore.turnTimeout ||
    !gameStore.startFlag ||
    gameStore.gameOver ||
    !gameStore.turn
  ) {
    secondsLeft.value = 0
    return
  }
  secondsLeft.value = gameStore.turnTimeout
  timerId = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) {
      clearTurnTimer()
      handleTurnTimeout()
    }
  }, 1000)
}

// 時間切れ時はホストのみがタイムアウトした人をフォールドさせる（AFKでも進行する）
const handleTurnTimeout = async () => {
  if (!roomStore.isHost) return
  const timedOutPlayer = gameStore.turn
  if (!timedOutPlayer) return
  if (!roomStore.users.includes(timedOutPlayer)) return
  try {
    await foldPlayer({
      roomCode: roomCode.value,
      foldedUser: timedOutPlayer,
      users: roomStore.users,
      winner: gameStore.winner,
      ranking: gameStore.ranking,
      playerDecks: gameStore.playerDecks,
      isReturn: gameStore.isReturn,
    })
  } catch (error) {
    console.error('Error on turn timeout fold:', error)
  }
}

watch(
  () => [
    gameStore.turn,
    gameStore.turnTimeout,
    gameStore.startFlag,
    gameStore.gameOver,
  ],
  startTurnTimer,
  { immediate: true }
)

onUnmounted(clearTurnTimer)

// 自分のターン中に「合計を確認」を押したときの警告表示
const showTotalWarning = ref(false)
let totalWarningTimer: ReturnType<typeof setTimeout> | null = null

const onTotalBlocked = () => {
  showTotalWarning.value = true
  if (totalWarningTimer) clearTimeout(totalWarningTimer)
  totalWarningTimer = setTimeout(() => {
    showTotalWarning.value = false
  }, 2000)
}

const showFoldToast = ref(false)
const foldToastMessage = ref('')
let foldToastTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => gameStore.foldedPlayer,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      foldToastMessage.value = t('play.folded', {
        name: newVal,
        n: gameStore.winner.length,
      })
      showFoldToast.value = true
      if (foldToastTimer) clearTimeout(foldToastTimer)
      foldToastTimer = setTimeout(() => {
        showFoldToast.value = false
      }, 2500)
    }
  }
)

onUnmounted(() => {
  if (totalWarningTimer) clearTimeout(totalWarningTimer)
  if (foldToastTimer) clearTimeout(foldToastTimer)
  clearMissWarningTimer()
})

const showMissWarning = ref(false)
let missWarningTimer: ReturnType<typeof setTimeout> | null = null

const clearMissWarningTimer = () => {
  if (missWarningTimer) {
    clearTimeout(missWarningTimer)
    missWarningTimer = null
  }
}

const displayMissWarning = () => {
  clearMissWarningTimer()
  showMissWarning.value = true
  missWarningTimer = setTimeout(async () => {
    showMissWarning.value = false
    missWarningTimer = null
    // 同じミスを繰り返しても watch が再発火するようクリアする
    if (gameStore.missPlayer) {
      try {
        await updateDoc(doc(getFirestoreDB(), 'initGameState', roomCode.value), {
          missPlayer: '',
        })
      } catch (error) {
        console.error('Error clearing miss player:', error)
      }
    }
  }, 2500)
}

watch(
  () => gameStore.missPlayer,
  (newVal) => {
    if (newVal) {
      displayMissWarning()
    } else {
      clearMissWarningTimer()
      showMissWarning.value = false
    }
  }
)

const missMessage = computed(() => {
  if (!gameStore.missPlayer) return ''
  if (gameStore.turn === currentUser.value) {
    return t('play.invalidValue', { total: gameStore.totalNumber })
  }
  return t('play.miss', { name: gameStore.missPlayer })
})

// カード画像の動的import
const getCardImage = (cardName: string) => {
  try {
    return new URL(
      `../assets/images/cards-front/${cardName}.png`,
      import.meta.url
    ).href
  } catch (error) {
    console.error(`Error loading card image: ${cardName}`, error)
    return ''
  }
}

const onCardPlayedHandler = async (playedCard: string) => {
  const cardPlayedBy = gameStore.turn

  switch (playedCard) {
    case 'N01':
    case 'N02':
    case 'N03':
    case 'N04':
    case 'N05':
    case 'N06':
    case 'N07':
    case 'N08':
    case 'N09':
    case 'N10':
    case 'N50':
    case 'M01':
    case 'M10': {
      const cardTypeOfPlayedCard = playedCard.charAt(0)
      const numberOfPlayedCard = playedCard.slice(-2)
      const newTotalNumber =
        cardTypeOfPlayedCard === 'N'
          ? gameStore.totalNumber + Number(numberOfPlayedCard)
          : gameStore.totalNumber - Number(numberOfPlayedCard)

      if (newTotalNumber <= 101) {
        if (cardPlayedBy === currentUser.value) {
          const removeIndex = playerDeck.value.indexOf(playedCard)
          const copiedDrawCardPileArray = [...gameStore.drawCardPile]
          const drawCard = copiedDrawCardPileArray.pop()
          const updatedPlayerDeck = { ...gameStore.playerDecks }
          updatedPlayerDeck[currentUser.value] = [
            ...playerDeck.value.slice(0, removeIndex),
            ...playerDeck.value.slice(removeIndex + 1),
          ]
          if (drawCard) {
            updatedPlayerDeck[currentUser.value].push(drawCard)
          }
          // 数字カードはダブル義務を1枚消化。まだ残っていれば同じ人が続けて出す。
          const newDouble = gameStore.double - 1
          const nextTurn = newDouble
            ? currentUser.value
            : getTurnAfter(roomStore.users, currentUser.value, gameStore.isReturn)

          await updateDoc(
            doc(getFirestoreDB(), 'initGameState', roomCode.value),
            {
              turn: nextTurn,
              playerDecks: updatedPlayerDeck,
              currentNumber: numberOfPlayedCard,
              currentCardType: cardTypeOfPlayedCard,
              totalNumber: newTotalNumber,
              playedCardsPile: [
                ...gameStore.playedCardsPile.slice(
                  0,
                  gameStore.playedCardsPile.length
                ),
                playedCard,
                ...gameStore.playedCardsPile.slice(
                  gameStore.playedCardsPile.length
                ),
              ],
              drawCardPile: [...copiedDrawCardPileArray],
              double: newDouble ? newDouble : 1,
              missPlayer: '',
              foldedPlayer: '',
            }
          )
        }
      } else {
        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            missPlayer: currentUser.value,
            foldedPlayer: '',
          }
        )
        // missPlayer が同値のとき watch が動かないため、毎回ここでも表示する
        displayMissWarning()
      }
      break
    }
    case 'Pas': {
      if (cardPlayedBy === currentUser.value) {
        const removeIndex = playerDeck.value.indexOf(playedCard)
        const copiedDrawCardPileArray = [...gameStore.drawCardPile]
        const drawCard = copiedDrawCardPileArray.pop()
        const updatedPlayerDeck = { ...gameStore.playerDecks }
        updatedPlayerDeck[currentUser.value] = [
          ...playerDeck.value.slice(0, removeIndex),
          ...playerDeck.value.slice(removeIndex + 1),
        ]
        if (drawCard) {
          updatedPlayerDeck[currentUser.value].push(drawCard)
        }
        const nextTurn = getTurnAfter(
          roomStore.users,
          currentUser.value,
          gameStore.isReturn
        )

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: nextTurn,
            playerDecks: updatedPlayerDeck,
            playedCardsPile: [
              ...gameStore.playedCardsPile.slice(
                0,
                gameStore.playedCardsPile.length
              ),
              playedCard,
              ...gameStore.playedCardsPile.slice(
                gameStore.playedCardsPile.length
              ),
            ],
            drawCardPile: [...copiedDrawCardPileArray],
            // パスは効果カード1枚でOK。ダブル義務はそのまま次の人へ引き継ぐ。
            double: gameStore.double,
            missPlayer: '',
            foldedPlayer: '',
          }
        )
      }
      break
    }
    case 'Hnd': {
      if (cardPlayedBy === currentUser.value) {
        const removeIndex = playerDeck.value.indexOf(playedCard)
        const copiedDrawCardPileArray = [...gameStore.drawCardPile]
        const drawCard = copiedDrawCardPileArray.pop()
        const updatedPlayerDeck = { ...gameStore.playerDecks }
        updatedPlayerDeck[currentUser.value] = [
          ...playerDeck.value.slice(0, removeIndex),
          ...playerDeck.value.slice(removeIndex + 1),
        ]
        if (drawCard) {
          updatedPlayerDeck[currentUser.value].push(drawCard)
        }
        // 101 は数字カードと同じ扱い。ダブル義務を1枚消化し、残っていれば続けて出す。
        const newDouble = gameStore.double - 1
        const nextTurn = newDouble
          ? currentUser.value
          : getTurnAfter(roomStore.users, currentUser.value, gameStore.isReturn)

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: nextTurn,
            playerDecks: updatedPlayerDeck,
            totalNumber: 101,
            playedCardsPile: [
              ...gameStore.playedCardsPile.slice(
                0,
                gameStore.playedCardsPile.length
              ),
              playedCard,
              ...gameStore.playedCardsPile.slice(
                gameStore.playedCardsPile.length
              ),
            ],
            drawCardPile: [...copiedDrawCardPileArray],
            double: newDouble ? newDouble : 1,
            missPlayer: '',
            foldedPlayer: '',
          }
        )
      }
      break
    }
    case 'Dbl': {
      if (cardPlayedBy === currentUser.value) {
        const removeIndex = playerDeck.value.indexOf(playedCard)
        const copiedDrawCardPileArray = [...gameStore.drawCardPile]
        const drawCard = copiedDrawCardPileArray.pop()
        const updatedPlayerDeck = { ...gameStore.playerDecks }
        updatedPlayerDeck[currentUser.value] = [
          ...playerDeck.value.slice(0, removeIndex),
          ...playerDeck.value.slice(removeIndex + 1),
        ]
        if (drawCard) {
          updatedPlayerDeck[currentUser.value].push(drawCard)
        }
        // ダブルは効果カード1枚でOK。現在の必要枚数を2倍にして次の人へ渡す
        // （通常時は次の人が2枚、ダブルに重ねると4枚…と倍々に増える）。
        const newDouble = gameStore.double * 2
        const nextTurn = getTurnAfter(
          roomStore.users,
          currentUser.value,
          gameStore.isReturn
        )

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: nextTurn,
            playerDecks: updatedPlayerDeck,
            playedCardsPile: [
              ...gameStore.playedCardsPile.slice(
                0,
                gameStore.playedCardsPile.length
              ),
              playedCard,
              ...gameStore.playedCardsPile.slice(
                gameStore.playedCardsPile.length
              ),
            ],
            drawCardPile: [...copiedDrawCardPileArray],
            double: newDouble,
            missPlayer: '',
            foldedPlayer: '',
          }
        )
      }
      break
    }
    case 'Trn': {
      if (cardPlayedBy === currentUser.value) {
        const removeIndex = playerDeck.value.indexOf(playedCard)
        const copiedDrawCardPileArray = [...gameStore.drawCardPile]
        const drawCard = copiedDrawCardPileArray.pop()
        const updatedPlayerDeck = { ...gameStore.playerDecks }
        updatedPlayerDeck[currentUser.value] = [
          ...playerDeck.value.slice(0, removeIndex),
          ...playerDeck.value.slice(removeIndex + 1),
        ]
        if (drawCard) {
          updatedPlayerDeck[currentUser.value].push(drawCard)
        }
        const newIsReturn = !gameStore.isReturn
        const nextTurn = getTurnAfter(
          roomStore.users,
          currentUser.value,
          newIsReturn
        )

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: nextTurn,
            playerDecks: updatedPlayerDeck,
            playedCardsPile: [
              ...gameStore.playedCardsPile.slice(
                0,
                gameStore.playedCardsPile.length
              ),
              playedCard,
              ...gameStore.playedCardsPile.slice(
                gameStore.playedCardsPile.length
              ),
            ],
            drawCardPile: [...copiedDrawCardPileArray],
            isReturn: newIsReturn,
            // リバースは効果カード1枚でOK。向きを反転するため、ダブル義務は
            // 反転後の次の人（＝ダブルを出した人）にそのまま返る。
            double: gameStore.double,
            missPlayer: '',
            foldedPlayer: '',
          }
        )
      }
      break
    }
    default:
      break
  }
}
</script>

<style lang="scss" scoped>
.play {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.warning-info {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: $spacing-xs $spacing-sm;
}

.player-deck-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: $spacing-xs $spacing-sm $spacing-sm;
  margin: 0;
}

.player-deck-text {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin-bottom: $spacing-xs;
  flex-shrink: 0;

  &.current-user {
    color: #e4ff00;
    font-weight: 1000;
  }
}

.must-play {
  display: inline-block;
  margin-left: $spacing-xs;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e23b3b;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
}

.player-deck {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 0;
  gap: $spacing-xs;
  flex-wrap: nowrap;
  justify-content: center;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.card {
  flex: 0 0 auto;
  width: clamp(56px, 22vw, 88px);
  height: auto;
  max-height: 100%;
  aspect-ratio: 5 / 7;
  cursor: pointer;
  transition: transform 350ms;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));

  @media (hover: hover) {
    &:hover {
      transform: scale(1.08);
      opacity: 1;
    }
  }
}
</style>
