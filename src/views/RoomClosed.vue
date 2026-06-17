<template>
  <div class="room-closed">
    <h1>{{ t('roomClosed.title') }}</h1>
    <router-link class="room-closed__link" to="/">
      <button class="game-button red game-button--in-game">{{ t('common.backHome') }}</button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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

.room-closed__link {
  width: 100%;
  max-width: 320px;
  text-decoration: none;
}
</style>
