<template>
  <div class="rejoin">
    <h1>{{ t('rejoin.title') }}</h1>
    <br />
    <div class="button-list">
      <router-link class="button-list__link" :to="`/?roomCode=${roomCode}`">
        <button class="game-button orange game-button--in-game">{{ t('common.rejoin') }}</button>
      </router-link>
      <router-link class="button-list__link" to="/">
        <button class="game-button red game-button--in-game">{{ t('common.backHome') }}</button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
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
  flex-direction: column;
  gap: $spacing-sm;
  width: 100%;
  max-width: 320px;
}

.button-list__link {
  width: 100%;
  text-decoration: none;
}
</style>
