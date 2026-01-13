<template>
  <div class="homepage">
    <div class="homepage-menu">
      <img class="homepage-logo" :src="logoImage" alt="Logo" />
      <div class="homepage-form">
        <FormHost v-if="!joinRoomCode" :room-code="roomCode" />
        <FormClient v-else :room-code="roomCode" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import randomCodeGenerator from '@/utils/randomCodeGenerator'
import FormHost from '@/components/organisms/FormHost.vue'
import FormClient from '@/components/organisms/FormClient.vue'
import logoImage from '@/assets/images/logo.png'

const route = useRoute()
const roomStore = useRoomStore()

const joinRoomCode = computed(() => {
  const code = route.query.roomCode
  return typeof code === 'string' ? code : null
})

const roomCode = computed(() => {
  return joinRoomCode.value || randomCodeGenerator(5)
})

onMounted(() => {
  // ブラウザの戻るボタンを無効化
  window.history.pushState(null, '', window.location.href)
  window.addEventListener('popstate', () => {
    window.history.go(1)
  })

  if (joinRoomCode.value) {
    roomStore.setRoomCode(joinRoomCode.value)
  }
})
</script>

<style lang="scss" scoped>
.homepage {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-lg;
  background-image: url('@/assets/images/Landing-Page-mobileG.gif');
  background-size: cover;
  background-position: center;
  overflow-y: auto;
  margin: 0;

  @include respond-to(md) {
    background-image: url('@/assets/images/Landing-Page.gif');
  }
}

.homepage-menu {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;
  width: 100%;
  max-width: 500px;

  > img {
    width: 55%;

    @include respond-to(md) {
      width: 200px;
    }
  }
}

.homepage-logo {
  width: 200px;
  height: auto;
  object-fit: contain;
}

.homepage-form {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}
</style>
