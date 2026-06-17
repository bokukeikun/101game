<template>
  <div id="app">
    <LanguageSettings />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import LanguageSettings from '@/components/molecules/LanguageSettings.vue'
</script>

<style lang="scss">
#app {
  min-height: 100vh;
}
</style>
