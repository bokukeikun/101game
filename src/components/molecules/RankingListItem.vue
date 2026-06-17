<template>
  <div class="ranking-user">
    <div
      class="ranking-item"
      :class="{ 'is-winner': i === 1, 'is-me': isMe }"
    >
      <div class="ranking-icon">
        <span class="icon">{{ medal }}</span>
      </div>
      <div class="ranking-rank"># {{ i }}</div>
      <div class="ranking-name">{{ item }}</div>
      <span v-if="isMe" class="ranking-you">{{ t('ranking.you') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  i: number
  item: string
  isMe?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMe: false,
})

const { t } = useI18n()

const medal = computed(() => {
  switch (props.i) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return '👤'
  }
})
</script>

<style lang="scss" scoped>
.ranking-user {
  margin-bottom: $spacing-sm;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-sm;
  border: 2px solid transparent;
}

.ranking-item.is-winner {
  background: linear-gradient(135deg, #fff1c2, #ffcf4d);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7),
    0 4px 16px rgba(255, 179, 0, 0.6);
  animation: winner-glow 1.6s ease-in-out infinite;

  .ranking-rank,
  .ranking-name {
    color: #4a2e00;
    text-shadow: none;
  }

  .icon {
    font-size: 30px;
  }
}

.ranking-item.is-me {
  border-color: #52c4f8;
}

.ranking-item.is-winner.is-me {
  border-color: #ffffff;
}

.ranking-icon {
  width: 40px;
  height: 40px;
  @include flex-center;
}

.icon {
  font-size: 24px;
}

.ranking-rank {
  font-family: 'Carter One', sans-serif;
  font-size: 1rem;
  font-weight: 1000;
  color: white;
  min-width: 40px;
}

.ranking-name {
  font-family: 'Carter One', sans-serif;
  font-size: 1.4rem;
  font-weight: 1000;
  color: white;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-you {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: #52c4f8;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

@keyframes winner-glow {
  0%,
  100% {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7),
      0 4px 16px rgba(255, 179, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9),
      0 6px 24px rgba(255, 179, 0, 0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ranking-item.is-winner {
    animation: none;
  }
}
</style>
