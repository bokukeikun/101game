<template>
  <div class="ranking-user">
    <div class="ranking-item">
      <div class="ranking-icon">
        <span class="icon">👤</span>
      </div>
      <div class="ranking-rank"># {{ i }}</div>
      <div class="ranking-name">{{ item }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  i: number
  item: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.ranking-user {
  margin-bottom: $spacing-sm;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-sm;
}

.ranking-icon {
  width: 40px;
  height: 40px;
  @include flex-center;
}

.icon {
  font-size: 24px;
}

.ranking-rank {
  font-family: 'Carter One', sans-serif;
  font-size: 1rem;
  font-weight: 1000;
  color: white;
  min-width: 40px;
}

.ranking-name {
  font-family: 'Carter One', sans-serif;
  font-size: 1.4rem;
  font-weight: 1000;
  color: white;
  flex: 1;
}
</style>
