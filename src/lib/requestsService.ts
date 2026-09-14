import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { StudentRequest } from '../types';

const COLLECTION_NAME = 'requests';

/**
 * Save a new student request to Firestore cloud database
 */
export async function saveRequestToFirestore(request: StudentRequest): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${request.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, request.id);
    // Remove any undefined properties for Firestore compliance
    const sanitizedData = JSON.parse(JSON.stringify(request));
    await setDoc(docRef, sanitizedData);
    console.log(`[Firestore] Successfully saved request ${request.id}`);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Update request status or remarks in Firestore
 */
export async function updateRequestInFirestore(
  id: string, 
  updates: Partial<StudentRequest>
): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const sanitizedUpdates = JSON.parse(JSON.stringify({
      ...updates,
      updatedAt: new Date().toISOString()
    }));
    await updateDoc(docRef, sanitizedUpdates);
    console.log(`[Firestore] Successfully updated request ${id}`);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Fetch all requests from Firestore
 */
export async function fetchAllRequestsFromFirestore(): Promise<StudentRequest[]> {
  const colPath = COLLECTION_NAME;
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const items: StudentRequest[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as StudentRequest);
    });
    return items;
  } catch (error) {
    throw handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

/**
 * Realtime listener for Firestore: listens for any submission or status change instantly!
 */
export function subscribeToRequests(
  onUpdate: (requests: StudentRequest[]) => void,
  onError?: (error: any) => void
) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: StudentRequest[] = [];
        snapshot.forEach(docSnap => {
          items.push(docSnap.data() as StudentRequest);
        });
        onUpdate(items);
      },
      (err) => {
        console.error('[Firestore Realtime Error]', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('[Firestore Subscribe Error]', err);
    return () => {};
  }
}

/**
 * Delete a request from Firestore
 */
export async function deleteRequestFromFirestore(id: string): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
