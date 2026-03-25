import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { accounts, categories, payments } from '../../../db/schema';

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type UpdatePayment = Omit<InsertPayment, 'id'>;

export const getTransactions = async () => {
  const result = await db
    .select({
      payment: payments,
      account: accounts,
      category: categories,
    })
    .from(payments)
    .innerJoin(accounts, eq(payments.accountId, accounts.id))
    .innerJoin(categories, eq(payments.categoryId, categories.id))
    .orderBy(desc(payments.datetime));

  return result.map((row) => ({
    ...row.payment,
    account: row.account,
    category: row.category,
  }));
};

export const createTransaction = async (data: InsertPayment) => {
  return await db.transaction(async (tx) => {
    const [payment] = await tx.insert(payments).values(data).returning();
    
    const [account] = await tx.select().from(accounts).where(eq(accounts.id, data.accountId));
    if (!account) throw new Error("Linked Account not found");

    let newBalance = account.balance;
    let newIncome = account.income;
    let newExpense = account.expense;
    
    if (data.type === 'CR') {
      newBalance += data.amount;
      newIncome += data.amount;
    } else if (data.type === 'DR') {
      newBalance -= data.amount;
      newExpense += data.amount;
    }
    
    await tx.update(accounts)
      .set({ balance: newBalance, income: newIncome, expense: newExpense })
      .where(eq(accounts.id, data.accountId));
      
    return payment;
  });
};

export const deleteTransaction = async (id: number) => {
  return await db.transaction(async (tx) => {
    const [payment] = await tx.select().from(payments).where(eq(payments.id, id));
    if (!payment) return null;
    
    const [account] = await tx.select().from(accounts).where(eq(accounts.id, payment.accountId));
    
    if (account) {
      let newBalance = account.balance;
      let newIncome = account.income;
      let newExpense = account.expense;
      
      if (payment.type === 'CR') {
        newBalance -= payment.amount;
        newIncome -= payment.amount;
      } else if (payment.type === 'DR') {
        newBalance += payment.amount;
        newExpense -= payment.amount;
      }
      
      await tx.update(accounts)
        .set({ balance: newBalance, income: newIncome, expense: newExpense })
        .where(eq(accounts.id, payment.accountId));
    }
      
    const result = await tx.delete(payments).where(eq(payments.id, id));
    return result;
  });
};

export const updateTransaction = async (id: number, data: UpdatePayment) => {
  return await db.transaction(async (tx) => {
    // Fetch existing payment to know the old account + amount + type
    const [oldPayment] = await tx.select().from(payments).where(eq(payments.id, id));
    if (!oldPayment) throw new Error('Transaction not found');

    // Reverse old impact on old account
    const [oldAccount] = await tx.select().from(accounts).where(eq(accounts.id, oldPayment.accountId));
    if (oldAccount) {
      let { balance, income, expense } = oldAccount;
      if (oldPayment.type === 'CR') {
        balance -= oldPayment.amount;
        income -= oldPayment.amount;
      } else {
        balance += oldPayment.amount;
        expense -= oldPayment.amount;
      }
      await tx.update(accounts).set({ balance, income, expense }).where(eq(accounts.id, oldPayment.accountId));
    }

    // Apply new impact on (possibly different) account
    const [newAccount] = await tx.select().from(accounts).where(eq(accounts.id, data.accountId));
    if (!newAccount) throw new Error('Account not found');
    let { balance, income, expense } = newAccount;
    if (data.type === 'CR') {
      balance += data.amount;
      income += data.amount;
    } else {
      balance -= data.amount;
      expense += data.amount;
    }
    await tx.update(accounts).set({ balance, income, expense }).where(eq(accounts.id, data.accountId));

    // Persist updated payment fields
    const [updated] = await tx.update(payments).set(data).where(eq(payments.id, id)).returning();
    return updated;
  });
};
