// Opérations CRUD Firestore pour users et invoices
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Invoice, InvoiceStatus, UserProfile, UserPlan, CompanyProfile } from './types';
import { FREE_PLAN_LIMIT } from './types';

// ===================== USERS =====================

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  companyName?: string,
  companyAddress?: string,
  currency?: string,
  logoUrl?: string,
  selectedPlan: 'free' | 'premium' = 'free'
): Promise<void> {
  const initialCompany: CompanyProfile = {
    id: crypto.randomUUID(),
    name: companyName || '',
    address: companyAddress || '',
    currency: currency || 'USD',
    ...(logoUrl ? { logoUrl } : {})
  };

  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    companyName: companyName || '', // Legacy
    companyAddress: companyAddress || '', // Legacy
    currency: currency || 'USD', // Legacy
    ...(logoUrl ? { logoUrl } : {}), // Legacy
    companies: [initialCompany],
    plan: 'free',
    invoiceCount: 0,
    createdAt: Timestamp.now(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const profile = {
    ...data,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    trialEndsAt: data.trialEndsAt?.toDate(),
  } as UserProfile;

  // Migration automatique en mémoire pour récupérer l'ancienne entreprise
  // même si une nouvelle a déjà été créée (le tableau 'companies' existe déjà)
  if (profile.companyName) {
    const hasLegacyCompany = profile.companies?.some(c => c.id === profile.uid + '-default');
    if (!hasLegacyCompany) {
      const legacyCompany = {
        id: profile.uid + '-default',
        name: profile.companyName,
        address: profile.companyAddress || '',
        currency: profile.currency || 'USD',
        ...(profile.logoUrl ? { logoUrl: profile.logoUrl } : {})
      };
      profile.companies = [legacyCompany, ...(profile.companies || [])];
    }
  }

  return profile;
}

export async function updateUserPlan(uid: string, plan: UserPlan): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { plan });
}

// ===================== INVOICES =====================

export async function createInvoice(
  data: Omit<Invoice, 'id' | 'createdAt'>
): Promise<string> {
  const ref = doc(collection(db, 'invoices'));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: Timestamp.now(),
    dueDate: Timestamp.fromDate(data.dueDate),
  });
  // Incrémenter le compteur de factures du user
  await updateDoc(doc(db, 'users', data.userId), {
    invoiceCount: increment(1),
  });
  return ref.id;
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      dueDate: data.dueDate?.toDate() ?? new Date(),
    } as Invoice;
  });
}

export async function getRecentInvoices(userId: string, count = 5): Promise<Invoice[]> {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      dueDate: data.dueDate?.toDate() ?? new Date(),
    } as Invoice;
  });
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const snap = await getDoc(doc(db, 'invoices', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    dueDate: data.dueDate?.toDate() ?? new Date(),
  } as Invoice;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), { status });
}

export async function deleteInvoice(id: string, userId: string): Promise<void> {
  await deleteDoc(doc(db, 'invoices', id));
  await updateDoc(doc(db, 'users', userId), {
    invoiceCount: increment(-1),
  });
}

// ===================== PAYWALL =====================

export async function canCreateInvoice(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  if (profile.plan === 'premium') return true;

  if (profile.plan === 'trial' && profile.trialEndsAt) {
    if (new Date() <= profile.trialEndsAt) {
      return true; // Accès illimité pendant l'essai
    }
  }

  // Si on est en Free ou que l'essai est expiré
  // Compter les factures du mois en cours
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
  );
  const snap = await getDocs(q);
  return snap.size < FREE_PLAN_LIMIT;
}

// Stats pour le dashboard
export async function getMonthlyStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
  );
  const snap = await getDocs(q);
  const invoices = snap.docs.map((d) => d.data());

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const pendingCount = invoices.filter(
    (inv) => inv.status === 'sent' || inv.status === 'draft'
  ).length;

  return {
    totalRevenue,
    invoiceCount: invoices.length,
    pendingCount,
    paidCount: invoices.filter((inv) => inv.status === 'paid').length,
  };
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data);
}

export async function deleteUserData(uid: string): Promise<void> {
  const q = query(collection(db, 'invoices'), where('userId', '==', uid));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  
  batch.delete(doc(db, 'users', uid));
  await batch.commit();
}
