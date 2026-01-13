<template>
  <div class="ranking">
    <h1 class="top-info-text">RANKING</h1>
    <div class="ranking-users" :style="{ height: rankingUsersHeight }">
      <RankingListItem :i="1" :item="winner" />
      <RankingListItem
        v-for="(item, i) in reversedRanking"
        :key="`Ranking${i + 2}`"
        :i="i + 2"
        :item="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RankingListItem from '@/components/molecules/RankingListItem.vue'

interface Props {
  height?: number
  ranking: string[]
  winner: string
}

const props = defineProps<Props>()

const rankingUsersHeight = computed(() => {
  return props.height ? `${(props.height * 35) / 100}px` : '35vh'
})

const reversedRanking = computed(() => {
  return [...props.ranking].reverse()
})
</script>

<style lang="scss" scoped>
.ranking {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
}

.top-info-text {
  font-family: 'Carter One', sans-serif;
  font-size: $font-size-xl;
  font-weight: 1000;
  color: white;
  margin-bottom: $spacing-md;
}

.ranking-users {
  height: 35vh;
  width: 95%;
  margin: 2.5%;
  overflow-y: auto;
  background-color: #c69239;
  border: 1px solid #063400cf;
  border-radius: 5px;
  box-shadow: rgb(0 0 0 / 25%) 0px 54px 55px,
    rgb(0 0 0 / 12%) 0px -12px 30px, rgb(0 0 0 / 12%) 0px 4px 6px,
    rgb(0 0 0 / 17%) 0px 12px 13px, rgb(0 0 0 / 9%) 0px -3px 5px;
  padding: $spacing-sm;
}
</style>
