<template>
  <div class="rejoin">
    <h1>Please rejoin !</h1>
    <br />
    <div class="button-list">
      <router-link :to="`/?roomCode=${roomCode}`">
        <button class="game-button orange">Rejoin</button>
      </router-link>
      <router-link to="/">
        <button class="game-button red">Back Home</button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const roomCode = route.query.roomCode as string
</script>

<style lang="scss" scoped>
.rejoin {
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

.button-list {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;
  justify-content: center;
}

.game-button {
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-lg;
  font-weight: bold;
  border: 2px solid white;
  border-radius: $border-radius-md;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    transform: scale(1.05);
  }

  &.orange {
    background-color: #ff9800;

    &:hover {
      background-color: #f57c00;
    }
  }

  &.red {
    background-color: $error-color;

    &:hover {
      background-color: darken($error-color, 10%);
    }
  }
}
</style>
