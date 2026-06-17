<template>
  <div
    class="middle-info"
    :style="{
      pointerEvents: turn !== currentUser ? 'none' : 'auto',
      height: middleInfoHeight,
    }"
  >
    <button
      class="game-button game-button--compact fold-button"
      :disabled="turn !== currentUser"
      @click="onFoldHandler"
    >
      {{ t('common.fold') }}
    </button>
    <div v-if="playedCardsPile && playedCardsPile.length > 0" class="played-card-container">
      <span class="deck-count" :title="t('play.deck')">
        <span class="deck-count__icon" aria-hidden="true" />
        {{ t('play.deck') }} {{ drawCount }}
      </span>
      <img
        class="played-card"
        :src="getCardImage(playedCardsPile[playedCardsPile.length - 1])"
        alt="card"
      />
      <span v-if="double > 1" class="double-badge">
        {{ t('play.mustPlay', { n: double }) }}
      </span>
    </div>
    <span class="total-button-wrapper" @click="onTotalFlagHandler">
      <button
        class="game-button orange game-button--compact"
        :disabled="turn === currentUser"
      >
        {{ totalFlag ? totalNumber : t('common.checkTotal') }}
      </button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { writeBatch, doc } from 'firebase/firestore'
import { getFirestoreDB } from '@/services/firebase/config'
import { getTurnAfter } from '@/utils/turn'

interface Props {
  height?: number
  roomCode: string
  currentUser: string
  turn: string
  playedCardsPile: string[]
  totalNumber: number
  playerDecks: Record<string, string[]>
  isReturn: boolean
  ranking: string[]
  winner: string[]
  users: string[]
  drawCount?: number
  double?: number
}

const props = withDefaults(defineProps<Props>(), {
  drawCount: 0,
  double: 1,
})

const emit = defineEmits<{
  (e: 'totalBlocked'): void
}>()

const { t } = useI18n()

const totalFlag = ref(false)

const middleInfoHeight = computed(() => {
  return props.height ? `${(props.height * 38) / 100}px` : '34vh'
})

// カード画像の動的import用ヘルパー関数
const getCardImage = (cardName: string) => {
  try {
    // Viteの動的importを使用
    return new URL(
      `../../assets/images/cards-front/${cardName}.png`,
      import.meta.url
    ).href
  } catch (error) {
    console.error(`Error loading card image: ${cardName}`, error)
    return ''
  }
}

const onFoldHandler = async () => {
  const newPlayerDecks: Record<string, string[]> = {}
  for (let i = 0; i < props.users.length; i++) {
    if (props.users[i] !== props.currentUser) {
      newPlayerDecks[props.users[i]] = props.playerDecks[props.users[i]]
    }
  }
  const newWinner = props.winner.filter((item) => item !== props.currentUser)
  const nextTurn = getTurnAfter(props.users, props.currentUser, props.isReturn)

  try {
    // users と initGameState を 1 トランザクションで同時更新する。
    // 別々に updateDoc すると、users 更新後・initGameState 更新前の
    // スナップショットで turn が脱落者を指したまま進行が止まる（同期不良）。
    const db = getFirestoreDB()
    const batch = writeBatch(db)
    batch.update(doc(db, 'users', props.roomCode), {
      users: newWinner,
    })
    batch.update(doc(db, 'initGameState', props.roomCode), {
      gameOver: newWinner.length === 1,
      turn: nextTurn,
      playerDecks: newPlayerDecks,
      winner: newWinner,
      ranking: [...props.ranking, props.currentUser],
      // フォールドした人のダブル義務は次の人へ引き継がず、通常(1枚)に戻す。
      double: 1,
      missPlayer: '',
    })
    await batch.commit()
  } catch (error) {
    console.error('Error on fold:', error)
  }
}

const onTotalFlagHandler = async () => {
  // 自分のターン中はボタンが disabled。クリックは wrapper が受け取り警告を出す。
  if (props.turn === props.currentUser) {
    emit('totalBlocked')
    return
  }
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  totalFlag.value = !totalFlag.value
  await sleep(2000)
  totalFlag.value = false
}
</script>

<style lang="scss" scoped>
.middle-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-xs;
  flex-shrink: 0;
  padding: $spacing-xs $spacing-sm;
}

// フォールド / 合計を確認ボタンの固定幅（レスポンシブ）
// total はクリック検知用に span で包んでいるため両者に同じサイズを適用する。
.fold-button,
.total-button-wrapper {
  flex: 0 1 110px;
  min-width: 0;
  max-width: 110px;

  // tablet
  @include respond-to(sm) {
    flex-basis: 130px;
    max-width: 130px;
  }

  // pc
  @include respond-to(md) {
    flex-basis: 150px;
    max-width: 150px;
  }
}

.total-button-wrapper {
  // disabled ボタンは pointer-events:none のため、クリックは wrapper が受け取る。
  display: flex;
  // 親 .middle-info は自分の番以外で pointer-events:none になるため、
  // 合計確認はどちらの番でも押せるよう wrapper で auto に戻す。
  pointer-events: auto;

  .game-button {
    // wrapper 内では compact の flex-basis(28%) を無効化し、wrapper 幅に合わせる
    flex: 1 1 auto;
    width: 100%;
    max-width: none;
    // ラベル / 合計値をボタン中央に表示する
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.played-card-container {
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 42%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.deck-count {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.deck-count__icon {
  width: 9px;
  height: 13px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.55);
}

.played-card {
  width: auto;
  height: min(72%, 110px);
  max-width: 100%;
  cursor: pointer;
  object-fit: contain;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.45));
}

.double-badge {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: #e23b3b;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  font-variant-numeric: tabular-nums;
}
</style>
