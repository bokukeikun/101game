<template>
  <div class="spinner" :class="{ 'spinner--small': small }">
    <div class="spinner__circle"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  small?: boolean
}>()
</script>

<style lang="scss" scoped>
.spinner {
  @include flex-center;
  width: 40px;
  height: 40px;

  &--small {
    width: 20px;
    height: 20px;
  }

  &__circle {
    width: 100%;
    height: 100%;
    border: 3px solid rgba($primary-color, 0.3);
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
