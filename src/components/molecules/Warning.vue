<template>
  <Transition name="warning">
    <p v-if="show" class="warning" role="alert" :class="`warning--${variant}`">
      <span class="warning__icon" aria-hidden="true">!</span>
      <span class="warning__message">{{ message }}</span>
    </p>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    show: boolean
    message: string
    variant?: 'error' | 'info'
  }>(),
  {
    variant: 'error',
  }
)
</script>

<style lang="scss" scoped>
.warning {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  width: min(100%, 320px);
  margin: 0 auto;
  padding: $spacing-sm $spacing-md;
  font-family: 'Carter One', sans-serif;
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, #ff5a52 0%, #e53935 100%);
  border: 2px solid #b71c1c;
  border-radius: $border-radius-md;
  box-shadow: 0 4px 0 #8b0000, 0 6px 16px rgba(0, 0, 0, 0.25);
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);

  @include respond-to(md) {
    width: min(100%, 360px);
    font-size: 0.95rem;
    padding: $spacing-sm $spacing-lg;
  }

  &--info {
    color: #5d4037;
    background: linear-gradient(180deg, #fff8e1 0%, #ffecb3 100%);
    border-color: #ffb300;
    box-shadow: 0 4px 0 #f57f17, 0 6px 16px rgba(0, 0, 0, 0.15);
    text-shadow: none;
  }
}

.warning__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4em;
  height: 1.4em;
  font-size: 0.9em;
  font-weight: bold;
  line-height: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);

  .warning--info & {
    background: rgba(245, 127, 23, 0.2);
    color: #e65100;
  }
}

.warning__message {
  flex: 1;
}

.warning-enter-active {
  animation: warning-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.warning-leave-active {
  animation: warning-out 0.25s ease-in forwards;
}

@keyframes warning-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes warning-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(-6px) scale(0.95);
  }
}
</style>
