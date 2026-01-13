import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from './config'

// Cloud Functions APIの型定義
export interface CreateRoomRequest {
  hostName: string
  maxPlayers: number
  gameMode: string
}

export interface CreateRoomResponse {
  roomId: string
  roomCode: string
  success: boolean
}

export interface JoinRoomRequest {
  roomCode: string
  playerName: string
}

export interface JoinRoomResponse {
  roomId: string
  playerId: string
  success: boolean
  message: string
}

export interface StartGameRequest {
  roomId: string
}

export interface StartGameResponse {
  success: boolean
  message: string
}

/**
 * ルームを作成する
 */
export async function createRoom(
  request: CreateRoomRequest
): Promise<CreateRoomResponse> {
  try {
    const functions = getFirebaseFunctions()
    const createRoomFunction = httpsCallable<CreateRoomRequest, CreateRoomResponse>(
      functions,
      'createRoom'
    )
    const result = await createRoomFunction(request)
    return result.data
  } catch (error) {
    console.error('Error creating room:', error)
    throw error
  }
}

/**
 * ルームに参加する
 */
export async function joinRoom(
  request: JoinRoomRequest
): Promise<JoinRoomResponse> {
  try {
    const functions = getFirebaseFunctions()
    const joinRoomFunction = httpsCallable<JoinRoomRequest, JoinRoomResponse>(
      functions,
      'joinRoom'
    )
    const result = await joinRoomFunction(request)
    return result.data
  } catch (error) {
    console.error('Error joining room:', error)
    throw error
  }
}

/**
 * ゲームを開始する
 */
export async function startGame(
  request: StartGameRequest
): Promise<StartGameResponse> {
  try {
    const functions = getFirebaseFunctions()
    const startGameFunction = httpsCallable<StartGameRequest, StartGameResponse>(
      functions,
      'startGame'
    )
    const result = await startGameFunction(request)
    return result.data
  } catch (error) {
    console.error('Error starting game:', error)
    throw error
  }
}
