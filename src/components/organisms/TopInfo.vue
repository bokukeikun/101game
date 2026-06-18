<template>
  <div class="top-info" :style="{ height: topInfoHeight }">
    <div class="top-info-left">
      <img
        class="top-info-img"
        :src="logoImage"
        alt="logo"
        @click="handleOpen"
      />
      <Modal :open="open" @close="handleClose">
        <div class="modal-content">
          <h2>{{ t('waiting.confirmGoHome') }}</h2>
          <button
            class="game-button red game-button--in-game"
            @click="isHost ? quitHostHandler() : goHomeClientHandler()"
          >
            {{ t('common.backHome') }}
          </button>
        </div>
      </Modal>
    </div>
    <h1>{{ t('common.gameCode') }}: {{ roomCode }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/molecules/Modal.vue'
import logoImage from '@/assets/images/logo.png'
import { useGameActions } from '@/composables/useGameActions'

interface Props {
  height?: number
  roomCode: string
  isHost: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()
const { leaveDuringPlay } = useGameActions()

const emit = defineEmits<{
  (e: 'quitHost'): void
}>()

const open = ref(false)

const topInfoHeight = computed(() => {
  return props.height ? `${(props.height * 10) / 100}px` : '10vh'
})

const handleOpen = () => {
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const goHomeClientHandler = async () => {
  await leaveDuringPlay()
  handleClose()
}

const quitHostHandler = () => {
  emit('quitHost')
  handleClose()
}
</script>

<style lang="scss" scoped>
.top-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: $spacing-sm $spacing-md;
  width: 100%;

  h1 {
    font-size: $font-size-lg;
    color: white;
    margin: 0;
    padding-right: 48px;
    text-align: right;
    line-height: 1.3;
  }
}

.top-info-left {
  width: 25%;
}

.top-info-img {
  height: 48px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.modal-content {
  text-align: center;
  padding: $spacing-lg;

  h2 {
    margin-bottom: $spacing-lg;
    color: white;
  }
}
</style>
