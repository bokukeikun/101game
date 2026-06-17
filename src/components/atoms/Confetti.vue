<template>
  <div class="confetti" aria-hidden="true">
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="confetti__piece"
      :style="piece.style"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const COLORS = ['#ffd766', '#ff6b68', '#52c4f8', '#7ed957', '#ff8fc8', '#ffffff']
const COUNT = 60

const pieces = computed(() =>
  Array.from({ length: COUNT }, (_, id) => {
    const left = Math.random() * 100
    const size = 6 + Math.random() * 8
    const delay = Math.random() * 3
    const duration = 2.5 + Math.random() * 2.5
    const color = COLORS[id % COLORS.length]
    const rotate = Math.random() * 360
    return {
      id,
      style: {
        left: `${left}%`,
        width: `${size}px`,
        height: `${size * 0.5}px`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${rotate}deg)`,
      } as Record<string, string>,
    }
  })
)
</script>

<style lang="scss" scoped>
.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1200;
}

.confetti__piece {
  position: absolute;
  top: -5%;
  border-radius: 1px;
  opacity: 0;
  animation-name: confetti-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(105vh) rotate(540deg);
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti {
    display: none;
  }
}
</style>
