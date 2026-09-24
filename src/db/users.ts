import { db } from './index.ts';
import { users, userFinanceData, transactions } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  avatarInitials?: string,
  preferredCurrency?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        avatarInitials: avatarInitials || null,
        preferredCurrency: preferredCurrency || 'QAR',
        role: 'premium',
        tier: 'pro',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(avatarInitials ? { avatarInitials } : {}),
          ...(preferredCurrency ? { preferredCurrency } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database operation failed. Could not sync user.', { cause: error });
  }
}

export async function getUserFinanceData(userId: string) {
  try {
    const rows = await db
      .select()
      .from(userFinanceData)
      .where(eq(userFinanceData.userId, userId));
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to get user finance data:', error);
    throw new Error('Database query failed. Could not retrieve financial data.', { cause: error });
  }
}

export async function saveUserFinanceData(userId: string, data: {
  period: string;
  activeCurrencyCode: string;
  income: any[];
  categories: any[];
  transactions: any[];
  balanceSheet: any;
  consultations?: any[];
}) {
  try {
    const result = await db
      .insert(userFinanceData)
      .values({
        userId,
        period: data.period,
        activeCurrencyCode: data.activeCurrencyCode,
        income: data.income,
        categories: data.categories,
        transactions: data.transactions,
        balanceSheet: data.balanceSheet,
        consultations: data.consultations || [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userFinanceData.userId,
        set: {
          period: data.period,
          activeCurrencyCode: data.activeCurrencyCode,
          income: data.income,
          categories: data.categories,
          transactions: data.transactions,
          balanceSheet: data.balanceSheet,
          consultations: data.consultations || [],
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to save user finance data:', error);
    throw new Error('Database operation failed. Could not save financial data.', { cause: error });
  }
}
