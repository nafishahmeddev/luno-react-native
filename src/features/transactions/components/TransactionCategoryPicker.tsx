import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import type { Category } from '../../categories/api/categories';

type Props = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  colors: ThemeColors;
};

const toHexColor = (value: number) => `#${value.toString(16).padStart(6, '0')}`;

const resolveIconName = (raw: string | null | undefined): keyof typeof Ionicons.glyphMap => {
  if (raw && raw in Ionicons.glyphMap) return raw as keyof typeof Ionicons.glyphMap;
  return 'pricetag-outline';
};

export const TransactionCategoryPicker = ({ categories, selectedId, onSelect, colors }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>CATEGORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => {
          const selected = selectedId === cat.id;
          const catColor = toHexColor(cat.color);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.item,
              ]}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.iconBox,
                { backgroundColor: selected ? catColor : colors.surface, borderColor: selected ? catColor : colors.border }
              ]}>
                <Ionicons name={resolveIconName(cat.icon)} size={20} color={selected ? colors.background : catColor} />
              </View>
              <Text style={[styles.name, { color: selected ? colors.text : colors.textMuted }]} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    fontFamily: typography.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  item: {
    width: 60,
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  name: {
    fontFamily: typography.fonts.medium,
    fontSize: 11,
    textAlign: 'center',
  },
});
