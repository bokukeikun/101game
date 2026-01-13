<template>
  <div class="play">
    <PlayerList
      :height="height"
      :room-code="roomCode"
      :player-decks="gameStore.playerDecks"
      :winner="gameStore.winner"
      :is-return="gameStore.isReturn"
      :users="roomStore.users"
      :restart-users="roomStore.restartUsers"
      :is-host="roomStore.isHost"
      :turn="gameStore.turn"
    />
    <MiddleInfo
      :height="height"
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
    />
    <div class="warning-info" :style="{ height: warningInfoHeight }">
      <Warning
        v-if="gameStore.missPlayer"
        :show="!!gameStore.missPlayer"
        :message="
          gameStore.turn === currentUser
            ? 'Invalid Value'
            : `${gameStore.missPlayer} Miss !`
        "
      />
    </div>
    <div
      class="player-deck-container"
      :style="{ height: playerDeckContainerHeight }"
    >
      <p
        class="player-deck-text"
        :class="{ 'current-user': gameStore.turn === currentUser }"
      >
        {{ gameStore.turn === currentUser ? 'Your Turn !' : currentUser }}
      </p>
      <div
        class="player-deck"
        :style="{
          pointerEvents: gameStore.turn === currentUser ? 'auto' : 'none',
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import PlayerList from '@/components/organisms/PlayerList.vue'
import MiddleInfo from '@/components/organisms/MiddleInfo.vue'
import Warning from '@/components/molecules/Warning.vue'

const roomStore = useRoomStore()
const gameStore = useGameStore()

const height = computed(() => window.innerHeight)
const currentUser = computed(() => {
  const user = roomStore.currentUser
  return user.startsWith('H') || user.startsWith('C') ? user.slice(1) : user
})

const playerDeckContainerHeight = computed(() => {
  return height.value ? `${(height.value * 30) / 100}px` : '30vh'
})

const warningInfoHeight = computed(() => {
  return height.value ? `${(height.value * 8) / 100}px` : '8vh'
})

const playerDeck = computed(() => {
  return gameStore.playerDecks[currentUser.value] || []
})

const roomCode = computed(() => roomStore.roomCode)

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
          const newDouble = gameStore.double - 1
          const currentUserIndex = roomStore.users.indexOf(currentUser.value)
          const nextTurn = newDouble
            ? currentUser.value
            : currentUserIndex === roomStore.users.length - 1
              ? roomStore.users[0]
              : roomStore.users[currentUserIndex + 1]
          const returnNextTurn = newDouble
            ? currentUser.value
            : currentUserIndex === 0
              ? roomStore.users[roomStore.users.length - 1]
              : roomStore.users[currentUserIndex - 1]

          await updateDoc(
            doc(getFirestoreDB(), 'initGameState', roomCode.value),
            {
              turn: gameStore.isReturn ? returnNextTurn : nextTurn,
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
            }
          )
        }
      } else {
        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            missPlayer: currentUser.value,
          }
        )
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
        const currentUserIndex = roomStore.users.indexOf(currentUser.value)
        const nextTurn =
          currentUserIndex === roomStore.users.length - 1
            ? roomStore.users[0]
            : roomStore.users[currentUserIndex + 1]
        const returnNextTurn =
          currentUserIndex === 0
            ? roomStore.users[roomStore.users.length - 1]
            : roomStore.users[currentUserIndex - 1]

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: gameStore.isReturn ? returnNextTurn : nextTurn,
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
            missPlayer: '',
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
        const newDouble = gameStore.double - 1
        const currentUserIndex = roomStore.users.indexOf(currentUser.value)
        const nextTurn = newDouble
          ? currentUser.value
          : currentUserIndex === roomStore.users.length - 1
            ? roomStore.users[0]
            : roomStore.users[currentUserIndex + 1]
        const returnNextTurn = newDouble
          ? currentUser.value
          : currentUserIndex === 0
            ? roomStore.users[roomStore.users.length - 1]
            : roomStore.users[currentUserIndex - 1]

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: gameStore.isReturn ? returnNextTurn : nextTurn,
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
        const newDouble = gameStore.double * 2
        const currentUserIndex = roomStore.users.indexOf(currentUser.value)
        const nextTurn =
          currentUserIndex === roomStore.users.length - 1
            ? roomStore.users[0]
            : roomStore.users[currentUserIndex + 1]
        const returnNextTurn =
          currentUserIndex === 0
            ? roomStore.users[roomStore.users.length - 1]
            : roomStore.users[currentUserIndex - 1]

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: gameStore.isReturn ? returnNextTurn : nextTurn,
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
        const currentUserIndex = roomStore.users.indexOf(currentUser.value)
        const nextTurn =
          currentUserIndex === roomStore.users.length - 1
            ? roomStore.users[0]
            : roomStore.users[currentUserIndex + 1]
        const returnNextTurn =
          currentUserIndex === 0
            ? roomStore.users[roomStore.users.length - 1]
            : roomStore.users[currentUserIndex - 1]
        const newIsReturn = !gameStore.isReturn

        await updateDoc(
          doc(getFirestoreDB(), 'initGameState', roomCode.value),
          {
            turn: newIsReturn ? returnNextTurn : nextTurn,
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
            missPlayer: '',
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.warning-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
  height: 8vh;
}

.player-deck-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
  margin: 0;
  height: 30vh;
}

.player-deck-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  margin-bottom: $spacing-sm;
  height: 6vh;

  &.current-user {
    color: #e4ff00;
    font-weight: 1000;
  }
}

.player-deck {
  display: flex;
  align-items: center;
  height: 80%;
  gap: $spacing-xs;
  flex-wrap: nowrap;
  justify-content: center;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.card {
  width: 29%;
  height: 100%;
  max-height: 150px;
  margin: 0 2%;
  border-radius: 7px;
  cursor: pointer;
  transition: transform 350ms;
  object-fit: contain;

  &:hover {
    transform: scale(1.08);
    opacity: 1;
  }
}
</style>
