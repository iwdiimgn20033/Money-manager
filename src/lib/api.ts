import { auth } from './firebase';

export async function fetchAuthHeaders(): Promise<HeadersInit> {
  const token = await auth.currentUser?.getIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function syncUserToPostgres(userData: {
  name?: string;
  avatarInitials?: string;
  preferredCurrency?: string;
}) {
  try {
    const headers = await fetchAuthHeaders();
    if (!headers['Authorization']) return null;
    const res = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('PostgreSQL user sync warning:', err);
    return null;
  }
}

export async function getPostgresFinanceData() {
  try {
    const headers = await fetchAuthHeaders();
    if (!headers['Authorization']) return null;
    const res = await fetch('/api/finance/data', {
      headers,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.warn('PostgreSQL fetch warning:', err);
    return null;
  }
}

export async function savePostgresFinanceData(payload: {
  period: string;
  activeCurrencyCode: string;
  income: any[];
  categories: any[];
  transactions: any[];
  balanceSheet: any;
  consultations?: any[];
}) {
  try {
    const headers = await fetchAuthHeaders();
    if (!headers['Authorization']) return null;
    const res = await fetch('/api/finance/data', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('PostgreSQL save warning:', err);
    return null;
  }
}
