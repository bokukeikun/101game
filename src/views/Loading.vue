<template>
  <div class="loading">
    <h1 style="margin: 50% 0">Now Loading....</h1>
  </div>
</template>

<script setup lang="ts">
// Loading component
</script>

<style lang="scss" scoped>
.loading {
  @include flex-center;
  min-height: 100vh;
  width: 100%;

  h1 {
    color: white;
    font-size: $font-size-xl;
  }
}
</style>
