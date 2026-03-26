import { db } from '../db/client';
import { accounts, categories, payments } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Multipliers relative to USD to provide realistic amounts for different currencies.
 */
const CURRENCY_MULTIPLIERS: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83,
  JPY: 151,
  KRW: 1340,
  IDR: 15800,
  VND: 24700,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.36,
  AUD: 1.52,
  BRL: 5.0,
  MXN: 16.7,
  TRY: 32.2,
};

/**
 * Seeds the database with random transactions for the past 12 months.
 * This is intended for development and testing purposes only.
 */
export async function seedDummyData() {
  try {
    // 1. Get all accounts
    const allAccounts = await db.select().from(accounts);
    if (allAccounts.length === 0) {
      throw new Error('No accounts found. Please complete onboarding first.');
    }

    // 2. Get categories
    const allCategories = await db.select().from(categories);
    const incomeCats = allCategories.filter(c => c.type === 'CR');
    const expenseCats = allCategories.filter(c => c.type === 'DR');

    if (incomeCats.length === 0 || expenseCats.length === 0) {
      throw new Error('Missing categories. Please ensure seed categories are present.');
    }

    const now = new Date();
    let totalInserted = 0;

    // 3. Loop through each account
    for (const account of allAccounts) {
      const multiplier = CURRENCY_MULTIPLIERS[account.currency.toUpperCase()] ?? 1;
      const transactions = [];
      let accountIncome = 0;
      let accountExpense = 0;

      // Randomize base amounts slightly per account so they aren't identical
      const baseSalary = 3000 + Math.floor(Math.random() * 4000);
      const baseRent = 800 + Math.floor(Math.random() * 1000);

      // 4. Generate data for 12 months for THIS account
      for (let m = 0; m < 12; m++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
        
        // A. Monthly Salary (Income)
        const salaryAmount = (baseSalary + Math.floor(Math.random() * 1000)) * multiplier;
        const salaryDate = new Date(monthDate);
        salaryDate.setDate(1 + Math.floor(Math.random() * 5)); // 1st - 5th
        
        transactions.push({
          accountId: account.id,
          categoryId: incomeCats[Math.floor(Math.random() * incomeCats.length)].id,
          amount: salaryAmount,
          type: 'CR' as const,
          datetime: salaryDate.toISOString(),
          note: 'Monthly Salary Credit',
        });
        accountIncome += salaryAmount;

        // B. Monthly Rent (Expense) - Only for some accounts maybe? Let's do all for now.
        const rentAmount = (baseRent + Math.floor(Math.random() * 200)) * multiplier;
        const rentDate = new Date(monthDate);
        rentDate.setDate(1); // 1st of each month
        
        transactions.push({
          accountId: account.id,
          categoryId: expenseCats.find(c => c.name.toLowerCase().includes('rent'))?.id || expenseCats[0].id,
          amount: rentAmount,
          type: 'DR' as const,
          datetime: rentDate.toISOString(),
          note: 'Monthly Rent Payment',
        });
        accountExpense += rentAmount;

        // C. 4-10 Random Expenses per month
        const expenseCount = 4 + Math.floor(Math.random() * 7);
        for (let i = 0; i < expenseCount; i++) {
          const amount = (5 + Math.floor(Math.random() * 150)) * multiplier;
          const date = new Date(monthDate);
          const maxDay = m === 0 ? now.getDate() : 28;
          date.setDate(1 + Math.floor(Math.random() * maxDay));
          
          const cat = expenseCats[Math.floor(Math.random() * expenseCats.length)];
          
          transactions.push({
            accountId: account.id,
            categoryId: cat.id,
            amount: amount,
            type: 'DR' as const,
            datetime: date.toISOString(),
            note: `Purchase at ${cat.name}`,
          });
          accountExpense += amount;
        }
      }

      // 5. Batch insert payments for this account
      if (transactions.length > 0) {
        await db.insert(payments).values(transactions);
        totalInserted += transactions.length;

        // 6. Update this account's totals
        await db.update(accounts)
          .set({
            balance: sql`${accounts.balance} + ${accountIncome} - ${accountExpense}`,
            income: sql`${accounts.income} + ${accountIncome}`,
            expense: sql`${accounts.expense} + ${accountExpense}`,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(accounts.id, account.id));
      }
    }

    return totalInserted;
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}
