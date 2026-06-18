<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="game-guide">
      <button
        type="button"
        class="game-guide__close"
        :aria-label="t('guide.close')"
        @click="$emit('close')"
      >
        ×
      </button>
      <h2 class="game-guide__title">{{ t('guide.title') }}</h2>

      <p class="game-guide__goal">{{ t('guide.goal') }}</p>

      <h3 class="game-guide__subtitle">{{ t('guide.cardsTitle') }}</h3>
      <ul class="game-guide__list">
        <li v-for="card in cards" :key="card.key" class="game-guide__item">
          <img
            class="game-guide__card"
            :src="getCardImage(card.img)"
            :alt="card.label"
          />
          <div class="game-guide__text">
            <span class="game-guide__label">{{ card.label }}</span>
            <span class="game-guide__effect">{{ t(`guide.cards.${card.key}`) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Modal from '@/components/molecules/Modal.vue'

defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()

const cards = [
  { key: 'number', img: 'N07', label: '1 – 10' },
  { key: 'n50', img: 'N50', label: '50' },
  { key: 'minus', img: 'M10', label: '-1 / -10' },
  { key: 'pass', img: 'Pas', label: 'PASS' },
  { key: 'turn', img: 'Trn', label: 'TURN' },
  { key: 'double', img: 'Dbl', label: 'DOUBLE' },
  { key: 'hundred', img: 'Hnd', label: '101' },
]

const getCardImage = (cardName: string) => {
  try {
    return new URL(
      `../../assets/images/cards-front/${cardName}.png`,
      import.meta.url
    ).href
  } catch (error) {
    console.error(`Error loading card image: ${cardName}`, error)
    return ''
  }
}
</script>

<style lang="scss" scoped>
.game-guide {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  text-align: left;
}

.game-guide__close {
  position: absolute;
  top: -#{$spacing-xs};
  right: -#{$spacing-xs};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;

  @media (hover: hover) {
    &:hover {
      background: rgba(255, 255, 255, 0.28);
    }
  }
}

.game-guide__title {
  margin: 0 0 $spacing-sm;
  padding-right: $spacing-xl;
  color: #fff;
  font-size: 1.3rem;
  text-align: center;
}

.game-guide__goal {
  margin: 0 0 $spacing-md;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.6;
}

.game-guide__subtitle {
  margin: 0 0 $spacing-sm;
  color: #ffd766;
  font-size: 1rem;
  text-align: center;
}

.game-guide__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.game-guide__item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-xs $spacing-sm;
  background: rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-md;
}

.game-guide__card {
  flex: 0 0 auto;
  width: 40px;
  aspect-ratio: 5 / 7;
  object-fit: contain;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
}

.game-guide__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.game-guide__label {
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
}

.game-guide__effect {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  line-height: 1.4;
}
</style>
