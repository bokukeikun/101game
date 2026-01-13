<template>
  <div class="room-closed">
    <h1>This room was closed</h1>
    <router-link to="/">
      <button class="game-button red">Back Home</button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
// No logic needed
</script>

<style lang="scss" scoped>
.room-closed {
  @include flex-center;
  flex-direction: column;
  min-height: 100vh;
  padding: $spacing-xl;
  text-align: center;

  h1 {
    color: white;
    font-size: $font-size-xl;
    margin-bottom: $spacing-lg;
  }
}

.game-button {
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-lg;
  font-weight: bold;
  border: 2px solid white;
  border-radius: $border-radius-md;
  background-color: $error-color;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: darken($error-color, 10%);
    transform: scale(1.05);
  }

  &.red {
    background-color: $error-color;
  }
}
</style>
