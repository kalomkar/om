import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { TeacherAccount } from '../types';

const TEACHERS_COLLECTION = 'teachers';
const LOCAL_STORAGE_KEY = 'college_teacher_accounts';
const CURRENT_TEACHER_KEY = 'active_teacher_session';

// Official Primary Teacher Account requested by college
export const PRIMARY_TEACHER: TeacherAccount = {
  teacherId: '9771',
  name: 'Faculty / Incharge Teacher',
  password: '123456',
  department: 'SRN Mehta College Kalburgi',
  role: 'admin',
  createdAt: '2026-09-14T00:00:00.000Z',
};

/**
 * Get locally cached teacher accounts
 */
export function getLocalTeacherAccounts(): TeacherAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [PRIMARY_TEACHER];
    const list: TeacherAccount[] = JSON.parse(raw);
    if (!list.some(t => t.teacherId === PRIMARY_TEACHER.teacherId)) {
      list.unshift(PRIMARY_TEACHER);
    }
    return list;
  } catch {
    return [PRIMARY_TEACHER];
  }
}

/**
 * Save teachers to local cache
 */
function saveLocalTeacherAccounts(teachers: TeacherAccount[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(teachers));
  } catch {}
}

/**
 * Fetch all registered teachers from Google Cloud Firestore
 */
export async function fetchTeachersFromFirestore(): Promise<TeacherAccount[]> {
  try {
    const colRef = collection(db, TEACHERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: TeacherAccount[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as TeacherAccount);
    });

    // Ensure PRIMARY_TEACHER always exists in Firestore as well
    if (!list.some(t => t.teacherId === PRIMARY_TEACHER.teacherId)) {
      try {
        await setDoc(doc(db, TEACHERS_COLLECTION, PRIMARY_TEACHER.teacherId), PRIMARY_TEACHER);
        list.unshift(PRIMARY_TEACHER);
      } catch (err) {
        console.warn('Auto-seed primary teacher to Firestore note:', err);
      }
    }

    // Merge with local
    const mergedMap = new Map<string, TeacherAccount>();
    [PRIMARY_TEACHER, ...getLocalTeacherAccounts(), ...list].forEach(t => {
      mergedMap.set(t.teacherId, t);
    });
    const all = Array.from(mergedMap.values());
    saveLocalTeacherAccounts(all);
    return all;
  } catch (err) {
    console.warn('Using local teachers fallback:', err);
    return getLocalTeacherAccounts();
  }
}

/**
 * Realtime subscription to teacher accounts
 */
export function subscribeToTeachers(onUpdate: (teachers: TeacherAccount[]) => void) {
  try {
    const colRef = collection(db, TEACHERS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: TeacherAccount[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as TeacherAccount);
        });
        if (!list.some(t => t.teacherId === PRIMARY_TEACHER.teacherId)) {
          list.unshift(PRIMARY_TEACHER);
        }
        saveLocalTeacherAccounts(list);
        onUpdate(list);
      },
      (err) => {
        console.warn('Realtime teachers listener note:', err);
        onUpdate(getLocalTeacherAccounts());
      }
    );
  } catch {
    onUpdate(getLocalTeacherAccounts());
    return () => {};
  }
}

/**
 * Register and add a new teacher account (saves to Firestore + local)
 */
export async function addTeacherAccount(account: TeacherAccount): Promise<TeacherAccount> {
  const cleanId = account.teacherId.trim();
  const newAccount: TeacherAccount = {
    ...account,
    teacherId: cleanId,
    name: account.name.trim(),
    password: account.password.trim(),
    department: account.department?.trim() || 'SRN Mehta College',
    role: account.role || 'teacher',
    createdAt: new Date().toISOString()
  };

  // 1. Update local cache
  const current = getLocalTeacherAccounts().filter(t => t.teacherId !== cleanId);
  current.push(newAccount);
  saveLocalTeacherAccounts(current);

  // 2. Persist to Google Cloud Firestore
  try {
    const docRef = doc(db, TEACHERS_COLLECTION, cleanId);
    await setDoc(docRef, JSON.parse(JSON.stringify(newAccount)));
    console.log(`[Firestore] Teacher account ${cleanId} successfully created`);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${TEACHERS_COLLECTION}/${cleanId}`);
  }

  return newAccount;
}

/**
 * Delete a teacher account (Primary 9771 cannot be deleted)
 */
export async function deleteTeacherAccount(teacherId: string): Promise<boolean> {
  if (teacherId === PRIMARY_TEACHER.teacherId) {
    throw new Error('Primary Administrator (9771) cannot be deleted.');
  }

  // 1. Remove from local
  const current = getLocalTeacherAccounts().filter(t => t.teacherId !== teacherId);
  saveLocalTeacherAccounts(current);

  // 2. Remove from Firestore
  try {
    const docRef = doc(db, TEACHERS_COLLECTION, teacherId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore teacher delete note:', err);
    return true;
  }
}

/**
 * Validate credentials against Primary 9771 / 123456 or any newly added teacher
 */
export async function authenticateTeacher(
  enteredId: string, 
  enteredPass: string
): Promise<{ success: boolean; teacher?: TeacherAccount; error?: string }> {
  const cleanId = enteredId.trim();
  const cleanPass = enteredPass.trim();

  // Fast-path: Check Primary credentials (9771 / 123456)
  if (cleanId === PRIMARY_TEACHER.teacherId && cleanPass === PRIMARY_TEACHER.password) {
    saveActiveTeacherSession(PRIMARY_TEACHER);
    return { success: true, teacher: PRIMARY_TEACHER };
  }

  // Check Local Cache
  const localList = getLocalTeacherAccounts();
  const localMatch = localList.find(
    t => t.teacherId.toLowerCase() === cleanId.toLowerCase() && t.password === cleanPass
  );
  if (localMatch) {
    saveActiveTeacherSession(localMatch);
    return { success: true, teacher: localMatch };
  }

  // Check Firestore directly for newly added teachers from other devices
  try {
    const docRef = doc(db, TEACHERS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const teacherData = snap.data() as TeacherAccount;
      if (teacherData.password === cleanPass) {
        saveActiveTeacherSession(teacherData);
        // also save to local cache
        const updated = [...localList.filter(t => t.teacherId !== cleanId), teacherData];
        saveLocalTeacherAccounts(updated);
        return { success: true, teacher: teacherData };
      } else {
        return { success: false, error: 'गलत पासवर्ड (Incorrect Password) - कृपया पुनः प्रयास करें।' };
      }
    }
  } catch (err) {
    console.warn('Firestore auth check error:', err);
  }

  return { 
    success: false, 
    error: 'गलत Teacher ID या पासवर्ड। कृपया ID: 9771 एवं Password: 123456 या आपका नया बनाया गया खाता उपयोग करें।' 
  };
}

/**
 * Active session tracking
 */
export function saveActiveTeacherSession(teacher: TeacherAccount) {
  try {
    localStorage.setItem(CURRENT_TEACHER_KEY, JSON.stringify(teacher));
    localStorage.setItem('teacher_logged_in', 'true');
  } catch {}
}

export function getActiveTeacherSession(): TeacherAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_TEACHER_KEY);
    return raw ? JSON.parse(raw) : PRIMARY_TEACHER;
  } catch {
    return PRIMARY_TEACHER;
  }
}

export function clearActiveTeacherSession() {
  try {
    localStorage.removeItem(CURRENT_TEACHER_KEY);
    localStorage.removeItem('teacher_logged_in');
  } catch {}
}
