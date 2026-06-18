<template>
  <Teleport to="body">
    <Transition name="toast">
      <p v-if="show" class="toast" role="status" aria-live="polite">
        {{ message }}
      </p>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
}>()
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom, 0px));
  z-index: 2000;
  transform: translateX(-50%);
  max-width: calc(100vw - #{$spacing-md * 2});
  margin: 0;
  padding: $spacing-sm $spacing-md;
  font-family: 'Carter One', sans-serif;
  font-size: 0.9rem;
  line-height: 1.4;
  text-align: center;
  color: #fff;
  background: rgba(34, 34, 34, 0.92);
  border-radius: $border-radius-md;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  pointer-events: none;

  @include respond-to(md) {
    font-size: 1rem;
    padding: $spacing-sm $spacing-lg;
  }
}

.toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-leave-active {
  animation: toast-out 0.25s ease-in forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
}
</style>
