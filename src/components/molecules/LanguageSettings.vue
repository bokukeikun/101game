<template>
  <div class="language-settings">
    <button
      type="button"
      class="language-settings__toggle"
      :aria-label="t('settings.language')"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg
        class="language-settings__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        />
      </svg>
    </button>

    <Transition name="lang-panel">
      <div v-if="open" class="language-settings__panel" role="dialog" :aria-label="t('settings.language')">
        <div class="language-settings__field">
          <label class="language-settings__field-label" for="locale-select">
            {{ t('settings.language') }}
          </label>
          <select
            id="locale-select"
            class="language-settings__select"
            :value="locale"
            @change="onLocaleChange"
          >
            <option value="ja">{{ t('settings.japanese') }}</option>
            <option value="en">{{ t('settings.english') }}</option>
          </select>
        </div>

        <hr class="language-settings__divider" />
        <button
          type="button"
          class="language-settings__option"
          @click="openGuide"
        >
          {{ t('guide.open') }}
        </button>

        <template v-if="showRoomSettings">
          <hr class="language-settings__divider" />
          <p class="language-settings__title">{{ t('settings.gameSection') }}</p>

          <div v-if="roomStore.isHost" class="language-settings__field">
            <label class="language-settings__field-label" for="turn-timeout">
              {{ t('settings.turnTimeout') }}
            </label>
            <select
              id="turn-timeout"
              class="language-settings__select"
              :value="gameStore.turnTimeout"
              @change="onTimeoutChange"
            >
              <option :value="0">{{ t('settings.turnTimeoutOff') }}</option>
              <option v-for="s in [5, 15, 30, 45, 60]" :key="s" :value="s">
                {{ t('settings.seconds', { n: s }) }}
              </option>
            </select>
          </div>

          <button
            v-if="gameStarted"
            type="button"
            class="language-settings__option language-settings__option--danger"
            @click="openConfirm"
          >
            {{ roomStore.isHost ? t('settings.endGame') : t('settings.leaveGame') }}
          </button>
        </template>
      </div>
    </Transition>

    <div v-if="open" class="language-settings__backdrop" @click="open = false" />

    <Modal :open="confirmOpen" @close="confirmOpen = false">
      <div class="language-settings__confirm">
        <h2>
          {{ roomStore.isHost ? t('settings.confirmEndGame') : t('settings.confirmLeaveGame') }}
        </h2>
        <button
          class="game-button red game-button--in-game"
          @click="handleConfirm"
        >
          {{ roomStore.isHost ? t('settings.endGame') : t('settings.leaveGame') }}
        </button>
      </div>
    </Modal>

    <GameGuide :open="guideOpen" @close="guideOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { saveLocale, type AppLocale } from '@/i18n'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import { useGameActions } from '@/composables/useGameActions'
import Modal from '@/components/molecules/Modal.vue'
import GameGuide from '@/components/molecules/GameGuide.vue'

const { t, locale } = useI18n()
const route = useRoute()
const roomStore = useRoomStore()
const gameStore = useGameStore()
const { returnToWaitingAsHost, closeRoomAsHost, leaveDuringPlay, leaveWaitingRoom, setTurnTimeout } =
  useGameActions()

const open = ref(false)
const confirmOpen = ref(false)
const guideOpen = ref(false)

// ルーム内かどうか
const inRoom = computed(() => route.name === 'Game' && !!roomStore.roomCode)

// ゲーム開始後（プレイ中・ランキング）
const gameStarted = computed(() => inRoom.value && gameStore.startFlag)

// 待機中のホスト設定、またはゲーム中の操作
const showRoomSettings = computed(
  () => inRoom.value && (roomStore.isHost || gameStarted.value)
)

const onLocaleChange = (event: Event) => {
  const next = (event.target as HTMLSelectElement).value as AppLocale
  locale.value = next
  saveLocale(next)
}

const openConfirm = () => {
  open.value = false
  confirmOpen.value = true
}

const openGuide = () => {
  open.value = false
  guideOpen.value = true
}

const onTimeoutChange = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  setTurnTimeout(value)
}

const handleConfirm = async () => {
  confirmOpen.value = false
  if (roomStore.isHost) {
    await returnToWaitingAsHost()
  } else if (gameStore.startFlag && !gameStore.gameOver) {
    await leaveDuringPlay()
  } else {
    await leaveWaitingRoom()
  }
}
</script>

<style lang="scss" scoped>
.language-settings {
  position: fixed;
  top: $spacing-md;
  right: $spacing-sm;
  z-index: 1000;

  @include respond-to(md) {
    top: $spacing-md;
    right: $spacing-md;
  }
}

.language-settings__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.2s, transform 0.2s;

  @media (hover: hover) {
    &:hover {
      background: rgba(0, 0, 0, 0.6);
      transform: scale(1.05);
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.language-settings__icon {
  width: 22px;
  height: 22px;
}

.language-settings__backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.language-settings__panel {
  position: absolute;
  top: calc(100% + $spacing-sm);
  right: 0;
  min-width: 200px;
  padding: $spacing-sm;
  background: rgba(255, 255, 255, 0.97);
  border-radius: $border-radius-md;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.language-settings__title {
  margin: 0 0 $spacing-sm;
  padding: 0 $spacing-sm;
  font-family: 'Carter One', sans-serif;
  font-size: 0.8rem;
  color: $text-secondary;
  text-align: center;
}

.language-settings__option {
  display: block;
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius-sm;
  background: transparent;
  font-family: 'Carter One', sans-serif;
  font-size: 0.95rem;
  color: $text-primary;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  @media (hover: hover) {
    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  &--danger {
    color: $error-color;
    font-weight: bold;

    @media (hover: hover) {
      &:hover {
        background: rgba(211, 47, 47, 0.1);
      }
    }
  }
}

.language-settings__divider {
  margin: $spacing-sm $spacing-sm;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.language-settings__field {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-md $spacing-sm;
}

.language-settings__field-label {
  font-size: 0.85rem;
  color: $text-secondary;
}

.language-settings__select {
  width: 100%;
  padding: $spacing-xs $spacing-sm;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: $border-radius-sm;
  background: #fff;
  color: $text-primary;
  font-size: 0.95rem;
  cursor: pointer;
}

.language-settings__confirm {
  text-align: center;
  padding: $spacing-md;

  h2 {
    margin-bottom: $spacing-lg;
    color: white;
    font-size: 1.1rem;
    line-height: 1.5;
  }
}

.lang-panel-enter-active,
.lang-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.lang-panel-enter-from,
.lang-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
