import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Timestamp } from 'firebase/firestore'

export interface GameState {
  startFlag: boolean
  gameOver: boolean
  winner: string[]
  turn: string
  playerDecks: Record<string, string[]>
  currentNumber: string
  currentCardType: string
  totalNumber: number
  playedCardsPile: string[]
  drawCardPile: string[]
  double: number
  isReturn: boolean
  ranking: string[]
  missPlayer: string
}

export const useGameStore = defineStore('game', () => {
  const loading = ref(true)
  const startFlag = ref(false)
  const gameOver = ref(true)
  const winner = ref<string[]>([])
  const turn = ref('')
  const playerDecks = ref<Record<string, string[]>>({})
  const currentNumber = ref('')
  const currentCardType = ref('')
  const totalNumber = ref(0)
  const playedCardsPile = ref<string[]>(['N00'])
  const drawCardPile = ref<string[]>([])
  const double = ref(1)
  const isReturn = ref(false)
  const ranking = ref<string[]>([])
  const missPlayer = ref('')

  const isGameActive = computed(() => startFlag.value && !gameOver.value)
  const isMyTurn = computed(() => {
    // currentUserとturnを比較する必要がある
    return false // TODO: currentUserとturnを比較
  })

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setGameState(state: Partial<GameState>) {
    if (state.startFlag !== undefined) startFlag.value = state.startFlag
    if (state.gameOver !== undefined) gameOver.value = state.gameOver
    if (state.winner !== undefined) winner.value = state.winner
    if (state.turn !== undefined) turn.value = state.turn
    if (state.playerDecks !== undefined) playerDecks.value = state.playerDecks
    if (state.currentNumber !== undefined) currentNumber.value = state.currentNumber
    if (state.currentCardType !== undefined) currentCardType.value = state.currentCardType
    if (state.totalNumber !== undefined) totalNumber.value = state.totalNumber
    if (state.playedCardsPile !== undefined) playedCardsPile.value = state.playedCardsPile
    if (state.drawCardPile !== undefined) drawCardPile.value = state.drawCardPile
    if (state.double !== undefined) double.value = state.double
    if (state.isReturn !== undefined) isReturn.value = state.isReturn
    if (state.ranking !== undefined) ranking.value = state.ranking
    if (state.missPlayer !== undefined) missPlayer.value = state.missPlayer
  }

  function reset() {
    loading.value = true
    startFlag.value = false
    gameOver.value = true
    winner.value = []
    turn.value = ''
    playerDecks.value = {}
    currentNumber.value = ''
    currentCardType.value = ''
    totalNumber.value = 0
    playedCardsPile.value = ['N00']
    drawCardPile.value = []
    double.value = 1
    isReturn.value = false
    ranking.value = []
    missPlayer.value = ''
  }

  return {
    loading,
    startFlag,
    gameOver,
    winner,
    turn,
    playerDecks,
    currentNumber,
    currentCardType,
    totalNumber,
    playedCardsPile,
    drawCardPile,
    double,
    isReturn,
    ranking,
    missPlayer,
    isGameActive,
    isMyTurn,
    setLoading,
    setGameState,
    reset,
  }
})
