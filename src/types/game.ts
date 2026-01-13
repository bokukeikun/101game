import type { Timestamp } from 'firebase/firestore'

export interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  joinedAt: Timestamp
  cards?: string[]
  status: 'waiting' | 'ready' | 'playing' | 'finished'
}

export interface Room {
  id: string
  code: string
  hostId: string
  status: 'waiting' | 'playing' | 'finished'
  players: Player[]
  currentRound: number
  maxRounds: number
  createdAt: Timestamp
  updatedAt: Timestamp
  settings: {
    maxPlayers: number
    gameMode: string
  }
}

export interface Game {
  id: string
  roomId: string
  roomCode: string
  players: {
    id: string
    name: string
    finalScore: number
    rank: number
  }[]
  startedAt: Timestamp
  finishedAt: Timestamp
  duration: number
}
