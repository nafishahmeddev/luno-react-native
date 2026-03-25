import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type Props = {
  value: 'CR' | 'DR';
  onChange: (value: 'CR' | 'DR') => void;
  colors: ThemeColors;
};

export const TransactionTypePicker = ({ value, onChange, colors }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>TYPE</Text>
      <View style={styles.pickerRow}>
        <TouchableOpacity
          style={[
            styles.chip,
            value === 'DR' && { backgroundColor: colors.danger, borderColor: colors.danger },
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => onChange('DR')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={14} color={value === 'DR' ? colors.background : colors.danger} />
          <Text style={[styles.chipText, { color: value === 'DR' ? colors.background : colors.text }]}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            value === 'CR' && { backgroundColor: colors.success, borderColor: colors.success },
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => onChange('CR')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-down" size={14} color={value === 'CR' ? colors.background : colors.success} />
          <Text style={[styles.chipText, { color: value === 'CR' ? colors.background : colors.text }]}>Income</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  label: {
    fontFamily: typography.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 14,
  },
});
