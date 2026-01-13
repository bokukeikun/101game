import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

/**
 * ルームを作成する
 */
export const createRoom = functions.https.onCall(async (data, context) => {
  try {
    const { hostName, maxPlayers, gameMode } = data

    if (!hostName || !maxPlayers || !gameMode) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'hostName, maxPlayers, and gameMode are required'
      )
    }

    // ルームコードを生成（5桁の英数字）
    const roomCode = generateRoomCode()
    
    // ルームドキュメントを作成
    const roomRef = db.collection('rooms').doc()
    const roomId = roomRef.id

    await roomRef.set({
      code: roomCode,
      hostId: context.auth?.uid || '',
      status: 'waiting',
      players: [],
      currentRound: 0,
      maxRounds: 10,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        maxPlayers,
        gameMode,
      },
    })

    // ホストプレイヤーを追加
    const playerRef = roomRef.collection('players').doc(context.auth?.uid || '')
    await playerRef.set({
      id: context.auth?.uid || '',
      name: hostName,
      score: 0,
      isHost: true,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'waiting',
    })

    return {
      roomId,
      roomCode,
      success: true,
    }
  } catch (error) {
    console.error('Error creating room:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create room'
    )
  }
})

/**
 * ルームに参加する
 */
export const joinRoom = functions.https.onCall(async (data, context) => {
  try {
    const { roomCode, playerName } = data

    if (!roomCode || !playerName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'roomCode and playerName are required'
      )
    }

    // ルームを検索
    const roomsSnapshot = await db
      .collection('rooms')
      .where('code', '==', roomCode)
      .limit(1)
      .get()

    if (roomsSnapshot.empty) {
      return {
        roomId: '',
        playerId: '',
        success: false,
        message: 'ルームが見つかりません',
      }
    }

    const roomDoc = roomsSnapshot.docs[0]
    const roomData = roomDoc.data()
    const roomId = roomDoc.id

    // ルームの状態を確認
    if (roomData.status !== 'waiting') {
      return {
        roomId,
        playerId: '',
        success: false,
        message: 'このルームは既にゲームが開始されています',
      }
    }

    // プレイヤー数を確認
    const playersSnapshot = await roomDoc.ref.collection('players').get()
    if (playersSnapshot.size >= roomData.settings.maxPlayers) {
      return {
        roomId,
        playerId: '',
        success: false,
        message: 'ルームが満員です',
      }
    }

    // 既存のプレイヤー名を確認
    const existingPlayers = playersSnapshot.docs.map((doc) => doc.data().name)
    if (existingPlayers.includes(playerName)) {
      return {
        roomId,
        playerId: '',
        success: false,
        message: 'この名前は既に使用されています',
      }
    }

    // プレイヤーを追加
    const playerId = context.auth?.uid || `player_${Date.now()}`
    const playerRef = roomDoc.ref.collection('players').doc(playerId)
    await playerRef.set({
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'waiting',
    })

    return {
      roomId,
      playerId,
      success: true,
      message: 'ルームに参加しました',
    }
  } catch (error) {
    console.error('Error joining room:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to join room'
    )
  }
})

/**
 * ゲームを開始する
 */
export const startGame = functions.https.onCall(async (data, context) => {
  try {
    const { roomId } = data

    if (!roomId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'roomId is required'
      )
    }

    const roomRef = db.collection('rooms').doc(roomId)
    const roomDoc = await roomRef.get()

    if (!roomDoc.exists) {
      return {
        success: false,
        message: 'ルームが見つかりません',
      }
    }

    const roomData = roomDoc.data()
    
    // ホストかどうかを確認
    if (roomData?.hostId !== context.auth?.uid) {
      return {
        success: false,
        message: 'ホストのみがゲームを開始できます',
      }
    }

    // プレイヤー数を確認
    const playersSnapshot = await roomRef.collection('players').get()
    if (playersSnapshot.size < 2) {
      return {
        success: false,
        message: 'ゲームを開始するには最低2人のプレイヤーが必要です',
      }
    }

    // ルームの状態を更新
    await roomRef.update({
      status: 'playing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return {
      success: true,
      message: 'ゲームを開始しました',
    }
  } catch (error) {
    console.error('Error starting game:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to start game'
    )
  }
})

/**
 * 古いルームをクリーンアップする（スケジュール実行）
 */
export const cleanupRooms = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const oneDayAgo = new Date()
      oneDayAgo.setHours(oneDayAgo.getHours() - 24)

      const oldRoomsSnapshot = await db
        .collection('rooms')
        .where('updatedAt', '<', admin.firestore.Timestamp.fromDate(oneDayAgo))
        .get()

      const batch = db.batch()
      oldRoomsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      console.log(`Cleaned up ${oldRoomsSnapshot.size} old rooms`)
      return null
    } catch (error) {
      console.error('Error cleaning up rooms:', error)
      return null
    }
  })

/**
 * ルームコードを生成する（5桁の英数字）
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
