/**
 * ターン（手番）計算ユーティリティ
 *
 * これまで Play.vue / MiddleInfo.vue / TopInfo.vue / PlayerList.vue に
 * 重複していた「次の手番」算出ロジックをここに集約する。
 */

/** 配列上で current の次のプレイヤー（末尾なら先頭へ循環） */
export function getNextTurn(users: string[], current: string): string {
  if (users.length === 0) return ''
  const index = users.indexOf(current)
  if (index === -1) return users[0]
  return index === users.length - 1 ? users[0] : users[index + 1]
}

/** 配列上で current の前のプレイヤー（先頭なら末尾へ循環） */
export function getPrevTurn(users: string[], current: string): string {
  if (users.length === 0) return ''
  const index = users.indexOf(current)
  if (index === -1) return users[users.length - 1]
  return index === 0 ? users[users.length - 1] : users[index - 1]
}

/**
 * 進行方向を考慮した次の手番。
 * isReturn が true のときは逆回り（前のプレイヤー）。
 */
export function getTurnAfter(
  users: string[],
  current: string,
  isReturn: boolean
): string {
  return isReturn ? getPrevTurn(users, current) : getNextTurn(users, current)
}
