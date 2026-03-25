import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurBackground } from '../../../components/ui/BlurBackground';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Header } from '../../../components/ui/Header';
import { MoneyText } from '../../../components/ui/MoneyText';
import { KPICard } from '../../../components/ui/KPICard';
import { TransactionRow } from '../../../components/ui/TransactionRow';
import { useAccounts } from '../../accounts/hooks/accounts';
import { useCategories } from '../../categories/hooks/categories';
import type { TransactionListItem } from '../api/transactions';
import {
  useDeleteTransaction,
  useInfiniteTransactions,
  useTransactionsCount,
} from '../hooks/transactions';
import { useTheme } from '../../../providers/ThemeProvider';
import { ThemeColors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type TransactionTypeFilter = 'ALL' | 'CR' | 'DR';

const SWIPE_ACTION_WIDTH = 44;
type SwipeableInstance = React.ElementRef<typeof Swipeable>;
let openSwipeRow: SwipeableInstance | null = null;

const toHexColor = (value: number) => `#${value.toString(16).padStart(6, '0')}`;

const resolveParamNumber = (value: string | string[] | undefined): number | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDateLabel = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// ─── Swipeable row ───────────────────────────────────────────────────────────
const SwipeableRow = React.memo(function SwipeableRow({
  tx,
  isFirst,
  isLast,
  colors,
  onEdit,
  onDelete,
}: {
  tx: TransactionListItem;
  isFirst: boolean;
  isLast: boolean;
  colors: ThemeColors;
  onEdit: (tx: TransactionListItem) => void;
  onDelete: (tx: TransactionListItem) => void;
}) {
  const swipeRef = React.useRef<SwipeableInstance>(null);

  const handleEdit = React.useCallback(() => {
    swipeRef.current?.close();
    onEdit(tx);
  }, [onEdit, tx]);

  const handleDelete = React.useCallback(() => {
    swipeRef.current?.close();
    onDelete(tx);
  }, [onDelete, tx]);

  const renderRightActions = React.useCallback(
    () => {
      return (
        <View
          style={{
            flexDirection: 'row',
            width: SWIPE_ACTION_WIDTH * 2,
            alignItems: 'stretch',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={handleEdit}
            activeOpacity={0.85}
            style={{
              width: SWIPE_ACTION_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary + '1A',
            }}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.85}
            style={{
              width: SWIPE_ACTION_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.danger + '1A',
            }}
          >
            <Ionicons name="trash" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      );
    },
    [handleEdit, handleDelete, colors],
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={30}
      friction={1.8}
      overshootRight={false}
      onSwipeableWillOpen={() => {
        if (openSwipeRow && openSwipeRow !== swipeRef.current) {
          openSwipeRow.close();
        }
        openSwipeRow = swipeRef.current;
      }}
      onSwipeableClose={() => {
        if (openSwipeRow === swipeRef.current) {
          openSwipeRow = null;
        }
      }}
    >
      <TransactionRow
        tx={tx}
        colors={colors}
        isFirst={isFirst}
        isLast={isLast}
        onPress={handleEdit}
      />
    </Swipeable>
  );
});

export function TransactionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ accountId?: string | string[] }>();
  const initialAccountId = React.useMemo(() => resolveParamNumber(params.accountId), [params.accountId]);

  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [typeFilter, setTypeFilter] = React.useState<TransactionTypeFilter>('ALL');
  const [accountFilterId, setAccountFilterId] = React.useState<number | null>(null);
  const [categoryFilterId, setCategoryFilterId] = React.useState<number | null>(null);
  const [showFilterSheet, setShowFilterSheet] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [pendingDeleteTx, setPendingDeleteTx] = React.useState<TransactionListItem | null>(null);

  React.useEffect(() => {
    if (initialAccountId !== null) setAccountFilterId(initialAccountId);
  }, [initialAccountId]);

  const filters = React.useMemo(
    () => ({
      ...(typeFilter !== 'ALL' ? { type: typeFilter as 'CR' | 'DR' } : {}),
      ...(accountFilterId !== null ? { accountId: accountFilterId } : {}),
      ...(categoryFilterId !== null ? { categoryId: categoryFilterId } : {}),
    }),
    [typeFilter, accountFilterId, categoryFilterId],
  );

  const txQuery = useInfiniteTransactions(filters);
  const txCountQuery = useTransactionsCount(filters);
  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const deleteTransaction = useDeleteTransaction();

  const transactions = React.useMemo(
    () => txQuery.data?.pages.flat() ?? [],
    [txQuery.data],
  );

  const groupedByDate = React.useMemo(() => {
    const map = new Map<string, TransactionListItem[]>();
    transactions.forEach((item) => {
      const key = getDateLabel(item.datetime);
      const prev = map.get(key) ?? [];
      prev.push(item);
      map.set(key, prev);
    });
    return [...map.entries()];
  }, [transactions]);

  const loadMore = React.useCallback(() => {
    if (txQuery.hasNextPage && !txQuery.isFetchingNextPage) {
      txQuery.fetchNextPage();
    }
  }, [txQuery]);

  const kpiTotalsByCurrency = React.useMemo(() => {
    const source =
      accountFilterId !== null
        ? (accountsQuery.data ?? []).filter((a) => a.id === accountFilterId)
        : (accountsQuery.data ?? []);
    const map: Record<string, { income: number; expense: number }> = {};
    source.forEach((acc) => {
      const cur = acc.currency;
      if (!map[cur]) map[cur] = { income: 0, expense: 0 };
      map[cur].income += acc.income;
      map[cur].expense += acc.expense;
    });
    return map;
  }, [accountsQuery.data, accountFilterId]);

  const kpiCurrencies = React.useMemo(() => Object.keys(kpiTotalsByCurrency), [kpiTotalsByCurrency]);

  const [selectedKpiCurrency, setSelectedKpiCurrency] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (kpiCurrencies.length === 0) setSelectedKpiCurrency(null);
    else if (!selectedKpiCurrency || !kpiCurrencies.includes(selectedKpiCurrency))
      setSelectedKpiCurrency(kpiCurrencies[0]);
  }, [kpiCurrencies, selectedKpiCurrency]);

  const activeTotals = selectedKpiCurrency
    ? (kpiTotalsByCurrency[selectedKpiCurrency] ?? { income: 0, expense: 0 })
    : { income: 0, expense: 0 };

  const activeFilterCount =
    (typeFilter !== 'ALL' ? 1 : 0) + (accountFilterId !== null ? 1 : 0) + (categoryFilterId !== null ? 1 : 0);

  const clearFilters = () => {
    setTypeFilter('ALL');
    setAccountFilterId(null);
    setCategoryFilterId(null);
  };

  const handleEdit = React.useCallback(
    (tx: TransactionListItem) => {
      router.push(`/transactions/edit/${tx.id}`);
    },
    [router],
  );

  const handleDelete = React.useCallback(
    (tx: TransactionListItem) => {
      setPendingDeleteTx(tx);
      setShowDeleteDialog(true);
    },
    [],
  );

  if (txQuery.isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BlurBackground />

      <Header
        title="Transactions"
        subtitle={`${txCountQuery.data ?? 0} records`}
        showBack
        rightAction={(
          <TouchableOpacity style={styles.filterActionBtn} onPress={() => setShowFilterSheet(true)} activeOpacity={0.9}>
            <Ionicons name="filter-outline" size={20} color={colors.text} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={groupedByDate}
        keyExtractor={(item) => item[0]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListHeaderComponent={(
          <View style={styles.listHeader}>
            <KPICard
              currencies={kpiCurrencies}
              selectedCurrency={selectedKpiCurrency}
              onSelectCurrency={setSelectedKpiCurrency}
              metrics={activeTotals}
              colors={colors}
            />

            {activeFilterCount > 0 && (
              <View style={styles.activeFiltersRow}>
                <Text style={styles.activeFiltersLabel}>ACTIVE FILTERS</Text>
                <TouchableOpacity style={styles.clearChip} onPress={clearFilters}>
                  <Text style={styles.clearChipText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilterCount > 0
                ? 'No transactions match the active filters.'
                : 'Add your first transaction to start tracking.'}
            </Text>
            <TouchableOpacity style={styles.emptyAction} onPress={() => router.push('/transactions/create')}>
              <Text style={styles.emptyActionText}>Add Transaction</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.background} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={txQuery.isFetchingNextPage ? (
          <View style={styles.loadMoreWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
        renderItem={({ item }) => {
          const [dateLabel, items] = item;
          const dayTotal = items.reduce(
            (acc, tx) => {
              if (tx.type === 'CR') acc.in += tx.amount;
              else acc.out += tx.amount;
              return acc;
            },
            { in: 0, out: 0 },
          );
          return (
            <View style={styles.daySection}>
              <View style={styles.dayHeaderRow}>
                <Text style={styles.dayTitle}>{dateLabel}</Text>
                <View style={styles.dayTotals}>
                  {dayTotal.in > 0 && (
                    <Text style={[styles.dayTotalValue, { color: colors.success }]}>
                      +<MoneyText amount={dayTotal.in} type="CR" weight="bold" />
                    </Text>
                  )}
                  {dayTotal.out > 0 && (
                    <Text style={[styles.dayTotalValue, { color: colors.danger }]}>
                      -<MoneyText amount={dayTotal.out} type="DR" weight="bold" />
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.dayCard}>
                {items.map((tx, idx) => (
                  <SwipeableRow
                    key={tx.id}
                    tx={tx}
                    isFirst={idx === 0}
                    isLast={idx === items.length - 1}
                    colors={colors}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/transactions/create')} activeOpacity={0.9}>
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      <ConfirmDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Transaction"
        message="This will remove the transaction and reverse its account balance impact."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!pendingDeleteTx) return;
          deleteTransaction.mutate(pendingDeleteTx.id);
          setPendingDeleteTx(null);
        }}
      />

      {/* Filter bottom sheet */}
      <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setShowFilterSheet(false)} />
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeadRow}>
              <Text style={styles.sheetTitle}>Filters</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.sheetClearBtn} onPress={clearFilters}>
                  <Text style={styles.sheetClearBtnText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>TYPE</Text>
                <View style={styles.sheetGrid}>
                  {([
                    { key: 'ALL' as const, label: 'All', icon: 'list-outline' as const },
                    { key: 'CR' as const, label: 'Income', icon: 'arrow-down-outline' as const },
                    { key: 'DR' as const, label: 'Expense', icon: 'arrow-up-outline' as const },
                  ]).map((typeOption) => {
                    const selected = typeFilter === typeOption.key;
                    return (
                      <TouchableOpacity
                        key={typeOption.key}
                        style={[
                          styles.sheetPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          selected && { backgroundColor: colors.text, borderColor: colors.text }
                        ]}
                        onPress={() => setTypeFilter(typeOption.key)}
                      >
                        <Text style={[styles.sheetPillText, selected && { color: colors.background }]}>
                          {typeOption.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>ACCOUNT</Text>
                <View style={styles.sheetGrid}>
                  <TouchableOpacity
                    style={[
                      styles.sheetPill,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      accountFilterId === null && { backgroundColor: colors.text, borderColor: colors.text }
                    ]}
                    onPress={() => setAccountFilterId(null)}
                  >
                    <Text style={[styles.sheetPillText, accountFilterId === null && { color: colors.background }]}>All</Text>
                  </TouchableOpacity>
                  {(accountsQuery.data ?? []).map((account) => {
                    const selected = accountFilterId === account.id;
                    const accColor = toHexColor(account.color);
                    return (
                      <TouchableOpacity
                        key={account.id}
                        style={[
                          styles.sheetPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          selected && { backgroundColor: accColor, borderColor: accColor }
                        ]}
                        onPress={() => setAccountFilterId(account.id)}
                      >
                        <Text style={[styles.sheetPillText, selected && { color: colors.background }]}>{account.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>CATEGORY</Text>
                <View style={styles.sheetGrid}>
                  <TouchableOpacity
                    style={[
                      styles.sheetPill,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      categoryFilterId === null && { backgroundColor: colors.text, borderColor: colors.text }
                    ]}
                    onPress={() => setCategoryFilterId(null)}
                  >
                    <Text style={[styles.sheetPillText, categoryFilterId === null && { color: colors.background }]}>All</Text>
                  </TouchableOpacity>
                  {(categoriesQuery.data ?? []).map((category) => {
                    const selected = categoryFilterId === category.id;
                    const catColor = toHexColor(category.color);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.sheetPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          selected && { backgroundColor: catColor, borderColor: catColor }
                        ]}
                        onPress={() => setCategoryFilterId(category.id)}
                      >
                        <Text style={[styles.sheetPillText, selected && { color: colors.background }]}>{category.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.sheetApplyBtn} onPress={() => setShowFilterSheet(false)}>
              <Text style={styles.sheetApplyBtnText}>Show {txCountQuery.data ?? 0} Transactions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingWrap: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterActionBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    filterBadgeText: {
      color: colors.background,
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 120,
    },
    listHeader: {
      gap: 20,
      marginBottom: 24,
    },
    activeFiltersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activeFiltersLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.5,
    },
    clearChip: {
      backgroundColor: colors.danger + '15',
      paddingHorizontal: 12,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearChipText: {
      fontFamily: typography.fonts.semibold,
      fontSize: 11,
      color: colors.danger,
    },
    daySection: { gap: 12 },
    dayHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    dayTitle: {
      color: colors.textMuted,
      fontFamily: typography.fonts.semibold,
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    dayTotals: {
      flexDirection: 'row',
      gap: 12,
    },
    dayTotalValue: {
      fontFamily: typography.fonts.semibold,
      fontSize: 12,
    },
    dayCard: {
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    emptyWrap: {
      paddingVertical: 60,
      alignItems: 'center',
      gap: 16,
    },
    emptyIconBox: {
      width: 80,
      height: 80,
      borderRadius: 28,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontFamily: typography.fonts.semibold,
      color: colors.text,
      fontSize: 18,
    },
    emptySubtitle: {
      fontFamily: typography.fonts.regular,
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      maxWidth: 240,
      lineHeight: 20,
    },
    emptyAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.text,
      marginTop: 8,
    },
    emptyActionText: {
      fontFamily: typography.fonts.semibold,
      color: colors.background,
      fontSize: 15,
    },
    loadMoreWrap: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 34,
      right: 24,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    sheetOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheetCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      paddingBottom: 40,
      maxHeight: '85%',
    },
    sheetHandle: {
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    sheetHeadRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    sheetTitle: {
      fontFamily: typography.fonts.heading,
      fontSize: 26,
      color: colors.text,
      letterSpacing: -0.5,
    },
    sheetClearBtn: {
      paddingHorizontal: 16,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetClearBtnText: {
      fontFamily: typography.fonts.semibold,
      color: colors.text,
      fontSize: 12,
    },
    sheetScroll: {
      paddingHorizontal: 28,
      paddingTop: 24,
      paddingBottom: 100,
    },
    sheetSection: {
      marginBottom: 28,
    },
    sheetLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.5,
      marginBottom: 16,
    },
    sheetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    sheetPill: {
      paddingHorizontal: 16,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetPillText: {
      fontFamily: typography.fonts.medium,
      fontSize: 14,
      color: colors.text,
    },
    sheetApplyBtn: {
      position: 'absolute',
      bottom: 34,
      left: 28,
      right: 28,
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    sheetApplyBtnText: {
      fontFamily: typography.fonts.semibold,
      color: colors.background,
      fontSize: 16,
    },
  });
