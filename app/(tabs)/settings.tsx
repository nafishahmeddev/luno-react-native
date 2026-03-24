import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

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
  const OptionRow = ({ icon, title, subtitle, onPress, color = colors.text }: OptionRowProps) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.rowTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Preferences" showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURATION</Text>
          <View style={styles.card}>
            <OptionRow 
              icon="grid" 
              title="Manage Categories" 
              subtitle="Add or modify transaction tags" 
              color={colors.primary}
              onPress={() => router.push('/categories')} 
            />
            <View style={styles.divider} />
            <OptionRow icon="color-palette" title="Appearance" subtitle="Following System Theme" onPress={() => {}} />
            <View style={styles.divider} />
            <OptionRow icon="globe" title="Default Currency" subtitle="USD ($)" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM OPERATIONS</Text>
          <View style={styles.card}>
            <OptionRow icon="cloud-download" title="Export Ledger" subtitle="Extract to CSV/JSON format" color={colors.success} onPress={() => {}} />
            <View style={styles.divider} />
            <OptionRow icon="warning" title="Factory Reset" subtitle="Purge all local SQLite records permanently" color={colors.danger} onPress={handleResetData} />
          </View>
        </View>

        <Text style={styles.version}>v1.0.0 — Edgeless Stack Architecture</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  rowTitle: {
    // @ts-ignore
    fontFamily: typography.fonts.headingRegular,
    fontSize: typography.sizes.md,
    letterSpacing: -0.2,
  },
  rowSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 80,
    opacity: 0.5,
  },
  version: {
    fontFamily: typography.fonts.mono,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
