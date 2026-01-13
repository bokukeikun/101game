<template>
  <div class="waiting-user">
    <div class="waiting-item">
      <div class="waiting-icon">
        <span class="icon">👤</span>
      </div>
      <div class="waiting-label">Player {{ i + 1 }}</div>
      <div class="waiting-name">{{ user }}</div>
      <button
        v-if="isHost"
        class="delete-button"
        :disabled="i === 0"
        @click="handleOpen(user)"
        :aria-label="`Delete ${user}`"
      >
        <span class="delete-icon" :class="{ invisible: i === 0 }">×</span>
      </button>
      <button
        v-else
        class="delete-button"
        disabled
        aria-hidden="true"
      >
        <span class="delete-icon invisible">×</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: string
  i: number
  isHost: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'open', user: string): void
}>()

const handleOpen = (user: string) => {
  emit('open', user)
}
</script>

<style lang="scss" scoped>
.waiting-user {
  margin-bottom: $spacing-sm;
}

.waiting-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-sm;
}

.waiting-icon {
  width: 40px;
  height: 40px;
  @include flex-center;
}

.icon {
  font-size: 24px;
}

.waiting-label {
  font-family: 'Carter One', sans-serif;
  font-size: 1rem;
  font-weight: 1000;
  color: white;
  min-width: 100px;
}

.waiting-name {
  font-family: 'Carter One', sans-serif;
  font-size: 1.4rem;
  font-weight: 1000;
  color: white;
  flex: 1;
}

.delete-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: $spacing-xs;
  color: $error-color;
  font-size: $font-size-lg;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.7;
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.delete-icon {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 24px;

  &.invisible {
    opacity: 0;
  }
}
</style>
