<template>
  <div class="waiting-user">
    <div class="waiting-item">
      <div class="waiting-icon" aria-hidden="true">
        <span class="icon">👤</span>
      </div>
      <div class="waiting-item__info">
        <span class="waiting-label">Player {{ i + 1 }}</span>
        <span class="waiting-name">{{ user }}</span>
      </div>
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

defineProps<Props>()

const emit = defineEmits<{
  (e: 'open', user: string): void
}>()

const handleOpen = (user: string) => {
  emit('open', user)
}
</script>

<style lang="scss" scoped>
.waiting-user {
  margin-bottom: $spacing-xs;

  &:last-child {
    margin-bottom: 0;
  }
}

.waiting-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.14);
  border-radius: $border-radius-md;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.waiting-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  @include flex-center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
}

.icon {
  font-size: 18px;
}

.waiting-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.waiting-label {
  font-family: 'Carter One', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.waiting-name {
  font-family: 'Carter One', sans-serif;
  font-size: 1rem;
  font-weight: 1000;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-button {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: $spacing-xs;
  color: $error-color;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.7;
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.delete-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 22px;
  line-height: 1;

  &.invisible {
    opacity: 0;
  }
}
</style>
