<template>
  <li class="player-list-item">
    <p class="player-name">
      <span :class="{ 'current-user': users[i] === turn }">
        {{ i + 1 }}: {{ item }}
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
      <button
        v-else
        class="delete-button"
        disabled
        aria-hidden="true"
      >
        <span class="delete-icon invisible">×</span>
      </button>
    </p>
    <div v-if="turn === item" class="loader">Loading...</div>
  </li>
</template>

<script setup lang="ts">

interface Props {
  item: string
  i: number
  isHost: boolean
  turn: string
  users: string[]
  restartUsers: string[]
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
.player-list-item {
  display: inline-block;
  width: 31%;
  height: 6vh;
  margin: 0;
  padding: 1% 0 0;
  background: rgba(255, 0, 0, 0);
  list-style: none;
}

.player-name {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-base;
  font-weight: bold;

  .current-user {
    color: $primary-color;
    font-weight: 1000;
  }
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
    opacity: 0.3;
  }
}

.delete-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;

  &.invisible {
    opacity: 0;
  }
}
</style>
