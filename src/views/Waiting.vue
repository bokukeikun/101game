<template>
  <div class="waiting">
    <WaitingList
      :users="roomStore.users"
      :room-code="roomStore.roomCode"
      :is-host="roomStore.isHost"
      :restart-users="roomStore.restartUsers"
    >
      <Warning
        v-if="isOnlyHost"
        :show="isOnlyHost"
        :message="soloWarningMessage"
        variant="info"
      />
      <div v-if="roomStore.isHost" class="waiting__host-actions">
        <label class="waiting__random-toggle">
          <input
            v-model="randomOrder"
            type="checkbox"
            class="waiting__random-checkbox"
          />
          <span>{{ t('waiting.randomOrder') }}</span>
        </label>
        <div class="waiting__primary-actions">
          <button
            class="game-button red game-button--in-game"
            @click="handleStart"
            :disabled="loading"
          >
            {{ t('common.start') }}
          </button>
          <button
            class="game-button game-button--in-game"
            :class="linkCopied ? 'green' : 'orange'"
            @click="handleCopyLink"
          >
            {{ linkCopied ? t('waiting.copiedShort') : t('waiting.copyInviteLink') }}
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
        <div class="waiting__primary-actions">
          <button
            class="game-button game-button--in-game"
            @click="$emit('quitClient')"
          >
            {{ t('common.quit') }}
          </button>
        </div>
      </div>
      <button type="button" class="waiting__guide-link" @click="guideOpen = true">
        {{ t('guide.open') }}
      </button>
    </WaitingList>
    <GameGuide :open="guideOpen" @close="guideOpen = false" />
    <Toast :show="linkCopied" :message="t('waiting.copied')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { doc, writeBatch } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { batchUpdateWithActivity } from '@/services/firebase/roomLifecycle'
import { useRoomStore } from '@/stores/room'
import packOfCards from '@/utils/packOfCards'
import shuffleArray from '@/utils/shuffleArray'
import WaitingList from '@/components/organisms/WaitingList.vue'
import Warning from '@/components/molecules/Warning.vue'
import GameGuide from '@/components/molecules/GameGuide.vue'
import Toast from '@/components/molecules/Toast.vue'

defineEmits<{
  (e: 'quitHost'): void
  (e: 'quitClient'): void
}>()

const roomStore = useRoomStore()
const { t } = useI18n()

const loading = ref(false)
const isOnlyHost = ref(false)
const guideOpen = ref(false)
const randomOrder = ref(false)
const linkCopied = ref(false)

let copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null

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

    // 開始順（＝手番の進行順）。ランダム指定時はシャッフル、
    // そうでなければホストがドラッグで並べた現在の順番で開始する。
    const orderedUsers = randomOrder.value
      ? shuffleArray([...roomStore.users])
      : [...roomStore.users]

    const decks: Record<string, string[]> = {}
    for (let i = 0; i < orderedUsers.length; i++) {
      decks[orderedUsers[i]] = shuffledCards.splice(0, 3)
    }
    const drawCardPile = shuffledCards

    const db = getFirestoreDB()
    const batch = writeBatch(db)
    // 手番進行は users の並び順に依存するため、開始順を users にも反映する。
    batch.update(doc(db, 'users', roomStore.roomCode), batchUpdateWithActivity({
      users: orderedUsers,
    }))
    batch.update(doc(db, 'initGameState', roomStore.roomCode), batchUpdateWithActivity({
      // 先頭のプレイヤーから開始する。
      turn: orderedUsers[0],
      winner: orderedUsers,
      startFlag: true,
      playerDecks: decks,
      drawCardPile: [...drawCardPile],
    }))
    await batch.commit()
  } catch (error) {
    console.error('Error starting game:', error)
  } finally {
    loading.value = false
  }
}

const showCopyFeedback = () => {
  linkCopied.value = true
  if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer)
  copyFeedbackTimer = setTimeout(() => {
    linkCopied.value = false
    copyFeedbackTimer = null
  }, 2500)
}

const handleCopyLink = async () => {
  const url = `${window.location.origin}/?roomCode=${roomStore.roomCode}`
  try {
    await navigator.clipboard.writeText(url)
    showCopyFeedback()
  } catch (error) {
    console.error('Failed to copy:', error)
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (copied) showCopyFeedback()
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

.waiting__host-actions,
.waiting__client-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  width: 100%;

  :deep(.game-button) {
    width: 50%;
  }
}

.waiting__primary-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  width: 100%;
}

.waiting__random-toggle {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  color: white;
  font-family: 'Carter One', sans-serif;
  font-size: 0.9rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  user-select: none;
}

.waiting__random-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #d34a36;
  cursor: pointer;
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
