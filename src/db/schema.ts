import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb, doublePrecision } from 'drizzle-orm/pg-core';

// Users table (identifying via Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  avatarInitials: text('avatar_initials'),
  preferredCurrency: text('preferred_currency').default('QAR'),
  role: text('role').default('premium'),
  tier: text('tier').default('pro'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Comprehensive user finance data snapshot table
export const userFinanceData = pgTable('user_finance_data', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(), // Firebase Auth UID
  period: text('period').notNull(),
  activeCurrencyCode: text('active_currency_code').notNull().default('QAR'),
  income: jsonb('income').notNull().$type<any[]>(),
  categories: jsonb('categories').notNull().$type<any[]>(),
  transactions: jsonb('transactions').notNull().$type<any[]>(),
  balanceSheet: jsonb('balance_sheet').notNull().$type<any>(),
  consultations: jsonb('consultations').$type<any[]>(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relational transactions table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.uid],
  }),
}));
