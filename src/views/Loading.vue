<template>
  <div class="loading">
    <h1 style="margin: 50% 0">{{ t('loading.now') }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.loading {
  @include flex-center;
  min-height: 100vh;
  color: white;
  text-align: center;
}
</style>
