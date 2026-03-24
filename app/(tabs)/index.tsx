import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/providers/ThemeProvider';
import { ThemeColors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useTransactions } from '../../src/features/transactions/hooks/transactions';
import { useAccounts, useDeleteAccount } from '../../src/features/accounts/hooks/accounts';
import { AccountFormModal } from '../../src/features/accounts/components/AccountFormModal';
import { MoneyText } from '../../src/components/ui/MoneyText';
import { DEFAULT_CURRENCY } from '../../src/constants/currency';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { mutateAsync: deleteAccount } = useDeleteAccount();

  const [showAccountForm, setShowAccountForm] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<any>(undefined);

  const handleAccountLongPress = (acc: any) => {
    Alert.alert(
      "Manage Account",
      `${acc.name}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Edit", onPress: () => { setEditingAccount(acc); setShowAccountForm(true); } },
        { text: "Delete", style: "destructive", onPress: () => {
          Alert.alert("Confirm Delete", `Are you sure you want to delete ${acc.name}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteAccount(acc.id) }
          ]);
        }}
      ]
    );
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  const totalIncome = accounts?.reduce((sum, acc) => sum + acc.income, 0) || 0;
  const totalExpense = accounts?.reduce((sum, acc) => sum + acc.expense, 0) || 0;

  if (txLoading || accountsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Refined Header */}
        <View style={styles.header}>
          <Text style={styles.editorialTitle}>FINTRACKER.</Text>
          <Text style={styles.editorialSubtitle}>Your tactical financial overview</Text>
        </View>

        {/* Global Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>TOTAL ASSETS (MIXED)</Text>
          <MoneyText amount={totalBalance} currency={DEFAULT_CURRENCY} style={styles.balanceHuge} weight="bold" />
        </View>

        {/* Accounts Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.accountsScroll} 
          contentContainerStyle={styles.accountsScrollContent}
        >
          {accounts?.map(acc => {
            const accColor = '#' + acc.color.toString(16).padStart(6, '0');
            return (
              <TouchableOpacity 
                key={acc.id} 
                style={[styles.accountCard, { borderTopWidth: 4, borderTopColor: accColor }]} 
                onLongPress={() => handleAccountLongPress(acc)}
                delayLongPress={250}
              >
                <View style={styles.accountCardHeader}>
                  <View style={[styles.accountIconBox, { backgroundColor: accColor + '20' }]}>
                    <Ionicons name={(acc.icon as any) || 'wallet'} size={16} color={accColor} />
                  </View>
                  <View style={styles.accountCardMeta}>
                    <Text style={styles.accountCardName}>{acc.name}</Text>
                    {acc.accountNumber && acc.accountNumber !== 'N/A' && (
                      <Text style={styles.accountCardNumber}>•••• {acc.accountNumber.slice(-4)}</Text>
                    )}
                  </View>
                </View>
                <MoneyText 
                  amount={acc.balance} 
                  currency={acc.currency} 
                  style={styles.accountCardBalance} 
                  weight="bold" 
                />
                {acc.holderName && acc.holderName !== 'N/A' && (
                  <Text style={styles.accountCardHolder}>{acc.holderName}</Text>
                )}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity 
            style={[styles.accountCard, { borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', minHeight: 70 }]}
            onPress={() => { setEditingAccount(undefined); setShowAccountForm(true); }}
          >
            <Ionicons name="add" size={24} color={colors.textMuted} />
            <Text style={[styles.accountCardName, { marginLeft: 0, marginTop: 4 }]}>New Account</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Minimalist Stat Row */}
        <View style={styles.statsRow}>
          <View style={styles.statColumnLeft}>
            <Text style={styles.statHeading}>INFLOW</Text>
            <MoneyText amount={totalIncome} currency={DEFAULT_CURRENCY} style={styles.statValue} type="CR" weight="medium" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statColumnRight}>
            <Text style={styles.statHeading}>OUTFLOW</Text>
            <MoneyText amount={totalExpense} currency={DEFAULT_CURRENCY} style={styles.statValue} type="DR" weight="medium" />
          </View>
        </View>

        {/* Hyper-Sleek Action Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/add-transaction')}>
          <View style={styles.actionBtnInner}>
            <Ionicons name="add" size={20} color={colors.background} />
            <Text style={styles.actionText}>NEW ENTRY</Text>
          </View>
        </TouchableOpacity>

        {/* Editorial Activity List */}
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>LEDGER</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text style={styles.activityLink}>READ ALL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txList}>
          {transactions?.slice(0, 5).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.txIndicator, { backgroundColor: tx.type === 'CR' ? colors.success : colors.danger }]} />
                <View>
                  <Text style={styles.txTitle}>{tx.note || 'Untitled'}</Text>
                  <Text style={styles.txCategory}>{tx.category?.name || 'Uncategorized'}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <MoneyText 
                  amount={tx.amount} 
                  currency={accounts?.find(a => a.id === tx.accountId)?.currency || DEFAULT_CURRENCY} 
                  type={tx.type} 
                  style={styles.txAmount} 
                />
                <Text style={styles.txDate}>{new Date(tx.datetime).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}

          {(!transactions || transactions.length === 0) && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No financial data registered.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      <AccountFormModal 
        visible={showAccountForm} 
        onClose={() => setShowAccountForm(false)} 
        account={editingAccount} 
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 24,
    paddingBottom: 140, 
  },
  
  header: {
    marginTop: 10,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  // @ts-ignore
  editorialTitle: {
    fontFamily: typography.fonts.heading,
    color: colors.text,
    fontSize: 32,
    letterSpacing: -1,
  },
  editorialSubtitle: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: 4,
  },

  balanceSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  balanceLabel: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceHuge: {
    fontFamily: typography.fonts.monoBold,
    color: colors.text,
    fontSize: 48,
    letterSpacing: -2,
    lineHeight: 56,
  },

  accountsScroll: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  accountsScrollContent: {
    paddingRight: 48,
  },
  accountCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCardMeta: {
    marginLeft: 8,
  },
  accountCardName: {
    fontFamily: typography.fonts.semibold,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  accountCardNumber: {
    fontFamily: typography.fonts.mono,
    color: colors.textMuted,
    fontSize: typography.sizes.xs - 2,
    marginTop: 2,
  },
  accountCardBalance: {
    fontFamily: typography.fonts.monoBold,
    color: colors.text,
    fontSize: typography.sizes.lg,
  },
  accountCardHolder: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  statColumnLeft: {
    flex: 1,
    paddingRight: 16,
  },
  statColumnRight: {
    flex: 1,
    paddingLeft: 16,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  statHeading: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.lg,
  },

  actionBtn: {
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  actionBtnInner: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  actionText: {
    // @ts-ignore
    fontFamily: typography.fonts.heading,
    color: colors.background,
    fontSize: typography.sizes.sm,
    marginLeft: 8,
    marginTop: 2, 
  },

  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  // @ts-ignore
  activityTitle: {
    fontFamily: typography.fonts.heading,
    color: colors.text,
    fontSize: 20,
    letterSpacing: -0.5,
  },
  activityLink: {
    fontFamily: typography.fonts.semibold,
    color: colors.primary,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  txList: {
    paddingHorizontal: 24,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 16,
  },
  txTitle: {
    fontFamily: typography.fonts.semibold,
    color: colors.text,
    fontSize: typography.sizes.sm,
    marginBottom: 4,
  },
  txCategory: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: typography.sizes.sm,
    marginBottom: 4,
  },
  txDate: {
    fontFamily: typography.fonts.mono,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  
  emptyCard: {
    paddingVertical: 32,
    alignItems: 'flex-start',
  },
  emptyText: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
});
