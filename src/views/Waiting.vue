<template>
  <div class="waiting">
    <WaitingList
      :users="roomStore.users"
      :room-code="roomStore.roomCode"
      :is-host="roomStore.isHost"
    >
      <Warning
        v-if="isOnlyHost"
        :show="isOnlyHost"
        :message="soloWarningMessage"
        variant="info"
      />
      <div v-if="roomStore.isHost" class="waiting__host-actions">
        <div class="waiting__primary-actions">
          <button
            class="game-button red game-button--in-game"
            @click="handleStart"
            :disabled="loading"
          >
            {{ t('common.start') }}
          </button>
          <button
            class="game-button orange game-button--in-game"
            @click="handleCopyLink"
          >
            {{ t('waiting.copyInviteLink') }}
          </button>
        </div>
        <button
          class="game-button game-button--in-game"
          @click="$emit('quitHost')"
        >
          {{ t('common.quit') }}
        </button>
      </div>
      <div v-else class="waiting__client-actions">
        <p class="waiting__client-message">{{ t('waiting.waitForHost') }}</p>
        <button
          class="game-button game-button--in-game"
          @click="$emit('quitClient')"
        >
          {{ t('common.quit') }}
        </button>
      </div>
      <button type="button" class="waiting__guide-link" @click="guideOpen = true">
        {{ t('guide.open') }}
      </button>
    </WaitingList>
    <GameGuide :open="guideOpen" @close="guideOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { useRoomStore } from '@/stores/room'
import packOfCards from '@/utils/packOfCards'
import shuffleArray from '@/utils/shuffleArray'
import getRandomInt from '@/utils/getRandomInt'
import WaitingList from '@/components/organisms/WaitingList.vue'
import Warning from '@/components/molecules/Warning.vue'
import GameGuide from '@/components/molecules/GameGuide.vue'

defineEmits<{
  (e: 'quitHost'): void
  (e: 'quitClient'): void
}>()

const roomStore = useRoomStore()
const { t } = useI18n()

const loading = ref(false)
const isOnlyHost = ref(false)
const guideOpen = ref(false)

const soloWarningMessage = computed(() => {
  return `${t('waiting.cantStartAlone')} ${t('waiting.inviteOthers')}`
})

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
    const shuffledCards = shuffleArray([...packOfCards])

    const decks: Record<string, string[]> = {}
    const users = [...roomStore.users]
    for (let i = 0; i < users.length; i++) {
      decks[users[i]] = shuffledCards.splice(0, 3)
    }
    const drawCardPile = shuffledCards

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
    alert(t('waiting.copied'))
  } catch (error) {
    console.error('Failed to copy:', error)
    const textarea = document.createElement('textarea')
    textarea.value = url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert(t('waiting.copied'))
  }
}
</script>

<style lang="scss" scoped>
.waiting {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: $spacing-sm $spacing-md;
  background-color: #c69239;
  background-size: cover;
  background-position: center;
  background-image: url('@/assets/images/backgrounds/waitingBackgroundImg.png');
}

.waiting__host-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  width: 100%;
}

.waiting__primary-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  gap: $spacing-sm;
  width: 100%;
}

.waiting__client-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  width: 100%;
}

.waiting__client-message {
  margin: 0;
  font-family: 'Carter One', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: white;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.35);
}

.waiting__guide-link {
  display: block;
  margin: $spacing-md auto 0;
  padding: $spacing-xs $spacing-sm;
  border: none;
  background: transparent;
  color: white;
  font-family: 'Carter One', sans-serif;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.35);
}
</style>
