import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/providers/ThemeProvider';
import { ThemeColors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Header } from '../../src/components/ui/Header';
import { db } from '../../src/db/client';
import { payments, accounts, categories } from '../../src/db/schema';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handleResetData = () => {
    Alert.alert("Factory Reset", "Warning: This will permanently delete ALL data (accounts, categories, transactions) and restart the application.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete Everything", style: "destructive", onPress: async () => {
        try {
          await db.delete(payments);
          await db.delete(categories);
          await db.delete(accounts);
          await AsyncStorage.clear();
          alert("Data wiped successfully. Please hard restart the App.");
        } catch {
          alert("Critical failure wiping device storage.");
        }
      }}
    ]);
  };

  type OptionRowProps = { icon: any; title: string; subtitle?: string; onPress: () => void; color?: string; };
  const OptionRow = ({ icon, title, subtitle, onPress, color = colors.primary }: OptionRowProps) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <OptionRow icon="color-palette" title="Appearance" subtitle="System Default" onPress={() => {}} />
            <View style={styles.divider} />
            <OptionRow icon="globe" title="Currency" subtitle="USD ($)" onPress={() => {}} />
            <View style={styles.divider} />
            <OptionRow icon="notifications" title="Notifications" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.card}>
            <OptionRow icon="cloud-download" title="Export Data" subtitle="CSV / JSON" color={colors.success} onPress={() => {}} />
            <View style={styles.divider} />
            <OptionRow icon="warning" title="Factory Reset" subtitle="Delete all data & start over" color={colors.danger} onPress={handleResetData} />
          </View>
        </View>

        <Text style={styles.version}>Version 1.0.0 (Expo SQLite)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72,
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: 16,
  }
});
