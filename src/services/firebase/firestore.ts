import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { getFirestoreDB } from './config'

/**
 * Firestore操作のヘルパー関数
 */

/**
 * ドキュメントを取得する
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(getFirestoreDB(), collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T
    }
    return null
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * ドキュメントを作成または更新する
 */
export async function setDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(getFirestoreDB(), collectionName, docId)
    await setDoc(docRef, data, { merge: true })
  } catch (error) {
    console.error(`Error setting document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * ドキュメントを更新する
 */
export async function updateDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(getFirestoreDB(), collectionName, docId)
    await updateDoc(docRef, data as any)
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * ドキュメントを削除する
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(getFirestoreDB(), collectionName, docId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * コレクションからクエリでドキュメントを取得する
 */
export async function queryCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(getFirestoreDB(), collectionName)
    const q = query(collectionRef, ...constraints)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error)
    throw error
  }
}

/**
 * サブコレクションからドキュメントを取得する
 */
export async function getSubCollection<T = DocumentData>(
  parentCollection: string,
  parentDocId: string,
  subCollection: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const subCollectionRef = collection(
      getFirestoreDB(),
      parentCollection,
      parentDocId,
      subCollection
    )
    const q = query(subCollectionRef, ...constraints)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
  } catch (error) {
    console.error(
      `Error getting subcollection ${parentCollection}/${parentDocId}/${subCollection}:`,
      error
    )
    throw error
  }
}

/**
 * よく使うクエリヘルパー
 */
export const firestoreHelpers = {
  /**
   * フィールドで等価検索
   */
  whereEqual: (field: string, value: any) => where(field, '==', value),
  
  /**
   * フィールドで並び替え（昇順）
   */
  orderByAsc: (field: string) => orderBy(field, 'asc'),
  
  /**
   * フィールドで並び替え（降順）
   */
  orderByDesc: (field: string) => orderBy(field, 'desc'),
  
  /**
   * 件数制限
   */
  limitTo: (count: number) => limit(count),
}
