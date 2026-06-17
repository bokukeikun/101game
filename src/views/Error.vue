<template>
  <div class="error">
    <div class="error-top-info">
      <div class="error-logo-container">
        <img class="error-logo" :src="logoImage" alt="logo" />
      </div>
    </div>
    <h1>{{ t('errorPage.title') }}</h1>
    <p>{{ t('errorPage.message') }}</p>
    <router-link class="error__link" to="/">
      <button class="game-button red game-button--in-game">{{ t('errorPage.goBackHome') }}</button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import logoImage from '@/assets/images/logo.png'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.error {
  min-height: 100vh;
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl;
  text-align: center;
  background-color: $background-color;
}

.error-top-info {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: $spacing-md;
}

.error-logo-container {
  width: 25%;
}

.error-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

h1 {
  font-size: $font-size-xl;
  color: $text-primary;
  margin: $spacing-lg 0;
}

p {
  font-size: $font-size-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.error__link {
  width: 100%;
  max-width: 320px;
  text-decoration: none;
}
</style>
