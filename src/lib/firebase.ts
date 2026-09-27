import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { 
  UserProfile, 
  BudgetPeriod, 
  IncomeItem, 
  ExpenseCategory, 
  Transaction, 
  JournalEntry, 
  BalanceSheetData, 
  ConsultationBooking,
  AccountTier,
  PaymentDetails
} from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (with databaseId support)
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export interface UserFinanceDataPayload {
  period: BudgetPeriod;
  income: IncomeItem[];
  categories: ExpenseCategory[];
  transactions: Transaction[];
  journalEntries?: JournalEntry[];
  balanceSheet?: BalanceSheetData;
  consultations?: ConsultationBooking[];
  activeCurrencyCode?: string;
  lastSyncedAt?: string;
}

// -------------------------------------------------------------
// AUTHENTICATION HELPERS
// -------------------------------------------------------------

/**
 * Register a new user with Email & Password in Firebase Auth + create user profile in Firestore
 */
export async function registerWithFirebase(
  name: string,
  email: string,
  pass: string,
  preferredCurrency: string = 'QAR',
  tier: AccountTier = 'pro',
  paymentDetails?: PaymentDetails
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const fbUser = userCredential.user;

  // Update display name in Firebase Auth
  await updateProfile(fbUser, { displayName: cleanName });

  const today = new Date();
  const endDate = new Date(today.getTime() + (tier === 'pro' ? 365 : 60) * 24 * 60 * 60 * 1000);

  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || cleanEmail.substring(0, 2).toUpperCase();

  const userProfile: UserProfile = {
    id: fbUser.uid,
    name: cleanName,
    email: cleanEmail,
    role: 'premium',
    tier: 'pro',
    paymentDetails: paymentDetails,
    avatarInitials: initials,
    joinedDate: today.toISOString().split('T')[0],
    preferredCurrency: preferredCurrency,
    isFreeTrialActive: false,
    complimentaryConsultations: 5,
  };

  // Save profile to Firestore
  try {
    if (!isQuotaExceeded) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, {
        ...userProfile,
        updatedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (err) {
    checkAndHandleQuotaError(err);
    console.warn('Firestore profile save warning (using local fallback):', err);
  }

  return userProfile;
}

/**
 * Sign In existing user with Email & Password
 */
export async function loginWithFirebase(
  email: string,
  pass: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const fbUser = userCredential.user;

  return await fetchOrCreateUserProfile(fbUser);
}

/**
 * Sign In with Google Popup
 */
export async function loginWithGoogleFirebase(
  preferredCurrency: string = 'QAR',
  tier: AccountTier = 'pro'
): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  return await fetchOrCreateUserProfile(fbUser, preferredCurrency, tier);
}

/**
 * Anonymous Demo Sign In for instant access (Free Demo Account)
 */
export async function loginAnonymouslyDemo(
  type: 'premium' | 'member' = 'member',
  preferredCurrency: string = 'QAR'
): Promise<UserProfile> {
  const credential = await signInAnonymously(auth);
  const fbUser = credential.user;

  const today = new Date();
  const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days demo

  const demoUser: UserProfile = {
    id: fbUser.uid,
    name: 'حساب تجريبي (Free Demo)',
    email: `demo.${fbUser.uid.substring(0, 6)}@demo.moneymanager.life`,
    role: 'member',
    tier: 'demo',
    avatarInitials: 'DM',
    joinedDate: today.toISOString().split('T')[0],
    preferredCurrency: preferredCurrency,
    isFreeTrialActive: true,
    trialStartDate: today.toISOString().split('T')[0],
    trialEndDate: endDate.toISOString().split('T')[0],
    trialDaysRemaining: 14,
    complimentaryConsultations: 0,
  };

  try {
    if (!isQuotaExceeded) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, {
        ...demoUser,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (err) {
    checkAndHandleQuotaError(err);
    console.warn('Anonymous user profile Firestore warning:', err);
  }

  return demoUser;
}

/**
 * Sign Out from Firebase
 */
export async function logoutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Fetch profile from Firestore or construct a default profile from FirebaseUser
 */
async function fetchOrCreateUserProfile(
  fbUser: FirebaseUser, 
  preferredCurrency: string = 'QAR',
  defaultTier: AccountTier = 'pro'
): Promise<UserProfile> {
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || 'User',
        email: data.email || fbUser.email || '',
        role: 'premium',
        tier: 'pro',
        paymentDetails: data.paymentDetails,
        avatarInitials: data.avatarInitials || (fbUser.displayName ? fbUser.displayName.substring(0, 2).toUpperCase() : 'US'),
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
        preferredCurrency: data.preferredCurrency || preferredCurrency,
        isFreeTrialActive: false,
        complimentaryConsultations: 5,
      };
    }
  } catch (err) {
    checkAndHandleQuotaError(err);
    console.warn('Failed to load profile from Firestore:', err);
  }

  // Fallback if document not found
  const name = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User');
  const today = new Date();

  const fallback: UserProfile = {
    id: fbUser.uid,
    name: name,
    email: fbUser.email || '',
    role: 'premium',
    tier: 'pro',
    avatarInitials: name.substring(0, 2).toUpperCase(),
    joinedDate: today.toISOString().split('T')[0],
    preferredCurrency: preferredCurrency,
    isFreeTrialActive: false,
    complimentaryConsultations: 5,
  };

  try {
    if (!isQuotaExceeded) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, fallback, { merge: true });
    }
  } catch (e) {
    checkAndHandleQuotaError(e);
    console.error('Error saving fallback profile:', e);
  }

  return fallback;
}

// -------------------------------------------------------------
// CLOUD PERSISTENCE & REAL-TIME SYNC
// -------------------------------------------------------------

// Global flag to avoid flooding Firestore if free quota has been exhausted for the day
let isQuotaExceeded = false;
let quotaExceededNotified = false;

export function getIsQuotaExceeded(): boolean {
  return isQuotaExceeded;
}

export function setIsQuotaExceeded(val: boolean): void {
  isQuotaExceeded = val;
}

export function checkAndHandleQuotaError(error: unknown): boolean {
  const errorMsg = error instanceof Error ? error.message : String(error);
  if (
    errorMsg.includes('resource-exhausted') || 
    errorMsg.includes('Quota limit exceeded') ||
    errorMsg.includes('Free daily write units') ||
    errorMsg.includes('Free daily read units') ||
    errorMsg.includes('quota') ||
    errorMsg.includes('Quota exceeded')
  ) {
    isQuotaExceeded = true;
    if (!quotaExceededNotified) {
      quotaExceededNotified = true;
      console.warn(
        'Firestore Free Tier daily quota limit reached. Falling back to local offline storage (LocalStorage) seamlessly. Quota resets daily at midnight PST.'
      );
    }
    return true;
  }
  return false;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Save user financial dataset to Cloud Firestore with automatic offline fallback
 */
export async function saveCloudFinanceData(
  userId: string,
  payload: UserFinanceDataPayload
): Promise<void> {
  if (!userId) return;

  // If quota was already exceeded today, skip remote write and rely on LocalStorage to prevent backoff spam
  if (isQuotaExceeded) {
    return;
  }

  const path = `user_finance_data/${userId}`;
  try {
    const dataDocRef = doc(db, 'user_finance_data', userId);
    await setDoc(dataDocRef, {
      userId,
      period: payload.period,
      income: payload.income,
      categories: payload.categories,
      transactions: payload.transactions,
      journalEntries: payload.journalEntries || [],
      balanceSheet: payload.balanceSheet || null,
      consultations: payload.consultations || [],
      activeCurrencyCode: payload.activeCurrencyCode || 'QAR',
      lastSyncedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    if (checkAndHandleQuotaError(error)) {
      // Don't rethrow quota errors so the UI remains completely functional with LocalStorage
      return;
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isPermissionError = (error as any)?.code === 'permission-denied' || 
      errorMsg.includes('Missing or insufficient permissions');

    handleFirestoreError(error, OperationType.WRITE, path);

    if (isPermissionError) {
      console.warn('Firestore note: Local storage fallback activated seamlessly.');
      return;
    }
    console.warn('Firestore sync note:', errorMsg);
  }
}

/**
 * Load user financial dataset from Cloud Firestore
 */
export async function getCloudFinanceData(
  userId: string
): Promise<UserFinanceDataPayload | null> {
  if (!userId) return null;

  try {
    const dataDocRef = doc(db, 'user_finance_data', userId);
    const snap = await getDoc(dataDocRef);

    if (snap.exists()) {
      return snap.data() as UserFinanceDataPayload;
    }
    return null;
  } catch (error) {
    console.error('Failed to load finance data from Firestore:', error);
    return null;
  }
}

/**
 * Real-time subscription to cloud finance dataset
 */
export function subscribeToCloudFinanceData(
  userId: string,
  onData: (data: UserFinanceDataPayload) => void,
  onError?: (err: Error) => void
): () => void {
  if (!userId) return () => {};

  const dataDocRef = doc(db, 'user_finance_data', userId);
  return onSnapshot(
    dataDocRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserFinanceDataPayload);
      }
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Book a new consultation in Firestore
 */
export async function saveConsultationBookingToCloud(
  booking: ConsultationBooking
): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const bookingDocRef = doc(db, 'consultation_bookings', booking.id);
    await setDoc(bookingDocRef, {
      ...booking,
      createdAt: booking.createdAt || new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    checkAndHandleQuotaError(err);
    console.error('Error saving consultation booking to cloud:', err);
  }
}

/**
 * Retrieve consultation bookings for a user
 */
export async function getUserBookingsFromCloud(
  userId: string
): Promise<ConsultationBooking[]> {
  if (!userId || isQuotaExceeded) return [];
  try {
    const bookingsCol = collection(db, 'consultation_bookings');
    const q = query(bookingsCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ConsultationBooking);
  } catch (err) {
    checkAndHandleQuotaError(err);
    console.error('Error fetching bookings from cloud:', err);
    return [];
  }
}
