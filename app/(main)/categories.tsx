import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurBackground } from '../../src/components/ui/BlurBackground';
import { ConfirmDialog } from '../../src/components/ui/ConfirmDialog';
import { Header } from '../../src/components/ui/Header';
import { OptionsDialog } from '../../src/components/ui/OptionsDialog';
import { Category } from '../../src/features/categories/api/categories';
import { CategoryFormModal } from '../../src/features/categories/components/CategoryFormModal';
import { useCategories, useDeleteCategory } from '../../src/features/categories/hooks/categories';
import { useTheme } from '../../src/providers/ThemeProvider';
import { ThemeColors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';


export default function CategoriesScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { data: categories, isLoading } = useCategories();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeType, setActiveType] = useState<'CR' | 'DR'>('DR');
  const [query, setQuery] = useState('');
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredCategories = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (
      categories
        ?.filter((cat) => cat.type === activeType)
        .filter((cat) => (q ? cat.name.toLowerCase().includes(q) : true))
        .sort((a, b) => a.name.localeCompare(b.name)) || []
    );
  }, [categories, activeType, query]);

  const totalByType = React.useMemo(
    () => categories?.filter((cat) => cat.type === activeType).length ?? 0,
    [categories, activeType]
  );

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteCategory(id);
  };

  const manageOptions = React.useMemo(() => {
    if (!selectedCategory) return [];

    return [
      {
        key: 'edit-category',
        label: 'Edit category',
        icon: 'create-outline' as const,
        onPress: () => handleEdit(selectedCategory),
      },
      {
        key: 'delete-category',
        label: 'Delete category',
        icon: 'trash-outline' as const,
        destructive: true,
        onPress: () => setShowDeleteDialog(true),
      },
    ];
  }, [selectedCategory]);

  const renderItem = ({ item, index }: { item: Category; index: number }) => {
    const catColor = item.color ? '#' + item.color.toString(16).padStart(6, '0') : colors.primary;

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          index % 2 === 0 ? styles.categoryCardLeft : styles.categoryCardRight,
        ]}
        onPress={() => handleEdit(item)}
        onLongPress={() => {
          setSelectedCategory(item);
          setShowManageDialog(true);
        }}
        delayLongPress={280}
        activeOpacity={0.92}
      >
        <View style={[styles.cardGlow, { backgroundColor: catColor + '30' }]} />

        <View style={styles.cardTopRow}>
          <View style={[styles.categoryIconBox, { backgroundColor: catColor + '22' }]}> 
            <Ionicons name={item.icon as any || 'grid-outline'} size={20} color={catColor} />
          </View>
          <View style={[styles.typeBadge, item.type === 'DR' ? styles.typeBadgeDanger : styles.typeBadgeSuccess]}>
            <Text style={[styles.typeBadgeText, item.type === 'DR' ? styles.typeBadgeTextDanger : styles.typeBadgeTextSuccess]}>
              {item.type === 'DR' ? 'EXPENSE' : 'INCOME'}
            </Text>
          </View>
        </View>

        <View style={styles.cardMainRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.categorySubtext}>Tap to edit</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterText}>Hold for options</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BlurBackground />

      <Header title="Categories" subtitle="Organize your spending" showBack />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.filtersWrap}>
            <View style={styles.typeTabsRail}>
              <TouchableOpacity
                style={[styles.segmentPill, activeType === 'DR' && styles.segmentPillActive]}
                onPress={() => setActiveType('DR')}
                activeOpacity={0.9}
              >
                <Ionicons name="arrow-down-circle-outline" size={14} color={activeType === 'DR' ? colors.background : colors.textMuted} />
                <Text style={[styles.segmentPillText, activeType === 'DR' && styles.segmentPillTextActive]}>Expenses</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentPill, activeType === 'CR' && styles.segmentPillActive]}
                onPress={() => setActiveType('CR')}
                activeOpacity={0.9}
              >
                <Ionicons name="arrow-up-circle-outline" size={14} color={activeType === 'CR' ? colors.background : colors.textMuted} />
                <Text style={[styles.segmentPillText, activeType === 'CR' && styles.segmentPillTextActive]}>Income</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search categories"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
              {query.length > 0 ? (
                <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.85}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.filterMetaRow}>
              <Text style={styles.filterMetaText}>{filteredCategories.length} shown</Text>
              <Text style={styles.filterMetaText}>{totalByType} total</Text>
            </View>
          </View>

          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            key={`${activeType}-list`}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="sparkles-outline" size={22} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyText}>No {activeType === 'DR' ? 'expense' : 'income'} categories match your current filter.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleCreate}>
                  <Text style={styles.emptyBtnText}>Create category</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={28} color="#000" />
      </TouchableOpacity>

      <CategoryFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={selectedCategory || undefined}
      />

      <OptionsDialog
        visible={showManageDialog}
        onClose={() => setShowManageDialog(false)}
        title="Manage Category"
        subtitle={selectedCategory?.name}
        options={manageOptions}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Category"
        message="This will delete the category and associated transactions."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!selectedCategory) return;
          handleDelete(selectedCategory.id);
          setSelectedCategory(null);
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 100,
  },

  filtersWrap: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 8,
    gap: 8,
  },

  typeTabsRail: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface + 'D9',
    padding: 4,
    gap: 4,
  },

  segmentPill: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },

  segmentPillActive: {
    backgroundColor: colors.text,
  },

  segmentPillText: {
    fontFamily: typography.fonts.semibold,
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  segmentPillTextActive: {
    color: colors.background,
  },

  searchWrap: {
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background + 'B8',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.text,
  },

  filterMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  filterMetaText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },

  categoryCard: {
    position: 'relative',
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: 'hidden',
    minHeight: 156,
  },

  categoryCardLeft: {
    marginRight: 6,
  },

  categoryCardRight: {
    marginLeft: 6,
  },

  cardGlow: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 88,
    height: 88,
    borderRadius: 999,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  typeBadge: {
    height: 22,
    borderRadius: 999,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadgeDanger: {
    backgroundColor: colors.danger + '18',
  },
  typeBadgeSuccess: {
    backgroundColor: colors.success + '18',
  },
  typeBadgeText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  typeBadgeTextDanger: {
    color: colors.danger,
  },
  typeBadgeTextSuccess: {
    color: colors.success,
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardInfo: {
    flex: 1,
  },

  categoryName: {
    fontFamily: typography.fonts.headingRegular,
    color: colors.text,
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 23,
  },

  categorySubtext: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },

  cardFooter: {
    marginTop: 'auto',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardFooterText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  emptyTitle: {
    fontFamily: typography.fonts.headingRegular,
    color: colors.text,
    fontSize: 20,
    marginTop: 10,
    letterSpacing: -0.4,
  },

  emptyText: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
    textAlign: 'center',
    maxWidth: 260,
  },

  emptyBtn: {
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBtnText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
