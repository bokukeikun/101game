<template>
  <li class="player-list-item" :class="{ 'is-active': users[i] === turn }">
    <div class="player-chip">
      <span class="player-badge">
        {{ i + 1 }}
        <span
          v-if="presence !== 'unknown'"
          class="presence-dot"
          :class="`presence-dot--${presence}`"
        />
      </span>
      <span class="player-name-text">{{ item }}</span>
      <span class="player-cards" :aria-label="`${cardCount}`">
        <span class="player-cards__icon" aria-hidden="true" />
        {{ cardCount }}
      </span>
      <span
        v-if="users[i] === turn"
        class="turn-indicator"
        role="status"
        :aria-label="`${item} ${t('play.currentTurn')}`"
      >
        <span
          v-if="turnTimeout > 0"
          class="turn-countdown"
          :class="{ 'is-low': secondsLeft <= 5 }"
        >
          {{ secondsLeft }}
        </span>
        <template v-else>
          <span class="turn-dot" />
          <span class="turn-dot" />
          <span class="turn-dot" />
        </template>
      </span>
      <button
        v-if="isHost"
        class="delete-button"
        :disabled="item === restartUsers[0]"
        @click="handleOpen(item)"
        :aria-label="`Delete ${item}`"
      >
        <span class="delete-icon">×</span>
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  item: string
  i: number
  isHost: boolean
  turn: string
  users: string[]
  restartUsers: string[]
  turnTimeout?: number
  secondsLeft?: number
  cardCount?: number
  presence?: 'online' | 'offline' | 'unknown'
}

withDefaults(defineProps<Props>(), {
  turnTimeout: 0,
  secondsLeft: 0,
  cardCount: 0,
  presence: 'unknown',
})

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'open', user: string): void
}>()

const handleOpen = (user: string) => {
  emit('open', user)
}
</script>

<style lang="scss" scoped>
.player-list-item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin: 0;
  list-style: none;
  scroll-margin-inline: 12px;
  transition: opacity 0.25s ease;

  &:not(.is-active) {
    opacity: 0.7;
  }
}

.player-chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  max-width: 46vw;
  padding: 5px 8px 5px 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.player-badge {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.presence-dot {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid #1b3d12;

  &--online {
    background: #3ad15a;
  }

  &--offline {
    background: #9aa0a6;
  }
}

.is-active .presence-dot {
  border-color: #ffb300;
}

.player-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.92);
  font-size: $font-size-sm;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.player-cards {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.player-cards__icon {
  width: 10px;
  height: 14px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.turn-indicator {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 2px;
}

.turn-countdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(40, 22, 0, 0.85);
  color: #ffd766;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;

  &.is-low {
    background: #b3271a;
    color: #fff;
    animation: turn-countdown-pulse 0.8s ease-in-out infinite;
  }
}

@keyframes turn-countdown-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.turn-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #3a2600;
  animation: turn-dot-bounce 1.2s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.15s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }
}

.delete-button {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 2px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);
  color: #ff8a87;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    background 0.2s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.45);
      color: #ff5a56;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }
}

.delete-icon {
  display: inline-block;
}

/* アクティブ（ターン中）プレイヤーの強調 */
.is-active .player-chip {
  background: linear-gradient(180deg, #ffc233 0%, #ffb300 100%);
  border-color: rgba(255, 255, 255, 0.65);
  box-shadow:
    0 0 0 2px rgba(255, 194, 51, 0.35),
    0 4px 16px rgba(255, 179, 0, 0.5);
  animation: turn-glow 1.7s ease-in-out infinite;
}

.is-active .player-badge {
  background: rgba(40, 22, 0, 0.9);
  color: #ffd766;
}

.is-active .player-name-text {
  color: #2a1c00;
}

.is-active .player-cards {
  color: #2a1c00;
}

.is-active .player-cards__icon {
  background: rgba(40, 22, 0, 0.75);
  border-color: rgba(40, 22, 0, 0.5);
}

.is-active .delete-button {
  background: rgba(40, 22, 0, 0.2);
  color: #b3271a;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: rgba(40, 22, 0, 0.32);
      color: #8f1d12;
    }
  }
}

@keyframes turn-glow {
  0%,
  100% {
    box-shadow:
      0 0 0 2px rgba(255, 194, 51, 0.3),
      0 4px 14px rgba(255, 179, 0, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 3px rgba(255, 214, 102, 0.55),
      0 6px 22px rgba(255, 179, 0, 0.7);
  }
}

@keyframes turn-dot-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-active .player-chip {
    animation: none;
  }

  .turn-dot {
    animation: none;
    opacity: 0.9;
  }
}

@include respond-to(md) {
  .player-chip {
    max-width: 220px;
    padding: 6px 10px 6px 6px;
    gap: $spacing-sm;
  }

  .player-badge {
    width: 26px;
    height: 26px;
    font-size: 13px;
  }

  .player-name-text {
    font-size: $font-size-base;
  }

  .delete-button {
    width: 26px;
    height: 26px;
    font-size: 18px;
  }
}
</style>
