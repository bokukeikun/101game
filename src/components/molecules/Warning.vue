<template>
  <p v-if="show" class="warning">{{ message }}</p>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
}>()
</script>

<style lang="scss" scoped>
.warning {
  color: red;
  background-color: white;
  font-weight: bold;
  padding: 5px;
  margin: 3px;
  border-radius: 4px;
}
</style>
