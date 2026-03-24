import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../providers/ThemeProvider';
import { ThemeColors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { useCategories } from '../../categories/hooks/categories';
import { useCreateTransaction } from '../../transactions/hooks/transactions';
import { useCreateAccount, useUpdateAccount } from '../hooks/accounts';

import { Account } from '../api/accounts';

export type AccountFormModalProps = {
  visible: boolean;
  onClose: () => void;
  account?: Account;
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'BGN'];
const ICONS = ['wallet', 'card', 'cash', 'pie-chart', 'stats-chart', 'cart', 'car', 'home', 'airplane', 'fitness', 'gift', 'medical', 'business', 'briefcase'];
const COLORS = ['#00FFAA', '#00F0FF', '#8B5CF6', '#EC4899', '#F43F5E', '#EAB308', '#F97316', '#10B981', '#3B82F6', '#64748B'];

export function AccountFormModal({ visible, onClose, account }: AccountFormModalProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const isEditing = !!account;
  const { mutateAsync: createAccount, isPending: creating } = useCreateAccount();
  const { mutateAsync: updateAccount, isPending: updating } = useUpdateAccount();
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { data: categories } = useCategories();

  const [name, setName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [icon, setIcon] = useState('wallet');
  const [colorHex, setColorHex] = useState(COLORS[0]);

  useEffect(() => {
    if (account && visible) {
      setName(account.name);
      setHolderName(account.holderName);
      setAccountNumber(account.accountNumber);
      setBalance(account.balance.toString());
      setCurrency(account.currency || 'USD');
      setIcon(typeof account.icon === 'string' ? account.icon : 'wallet');
      const hex = '#' + account.color.toString(16).padStart(6, '0').toUpperCase();
      setColorHex(COLORS.includes(hex) ? hex : hex);
    } else if (visible) {
      setName('');
      setHolderName('');
      setAccountNumber('');
      setBalance('');
      setCurrency('USD');
      setIcon('wallet');
      setColorHex(COLORS[0]);
    }
  }, [account, visible]);

  const handleSave = async () => {
    if (!name) return alert("Account Name is required");

    try {
      if (isEditing) {
        await updateAccount({
          id: account.id,
          data: {
            name,
            holderName,
            accountNumber,
            currency,
            icon,
            color: parseInt(colorHex.replace('#', '0x')),
          }
        });
      } else {
        const initialBalance = parseFloat(balance) || 0;

        const newAcc = await createAccount({
          name,
          holderName: holderName || 'N/A',
          accountNumber: accountNumber || 'N/A',
          balance: 0,
          currency,
          isDefault: false,
          icon,
          color: parseInt(colorHex.replace('#', '0x')),
          income: 0,
          expense: 0,
        });

        if (initialBalance !== 0) {
          const defaultCategory = categories?.[0];
          if (defaultCategory) {
            await createTransaction({
              accountId: newAcc.id,
              categoryId: defaultCategory.id,
              amount: Math.abs(initialBalance),
              type: initialBalance > 0 ? 'CR' : 'DR',
              note: 'Opening Balance',
              datetime: new Date().toISOString()
            });
          }
        }
      }
      onClose();
    } catch {
      alert("Failed to save account.");
    }
  };

  const isPending = creating || updating;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 60 : 90}
            tint={isDark ? 'dark' : 'light'}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFillObject}
          />
          {Platform.OS === 'android' && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }]} pointerEvents="none" />}

          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Account' : 'New Account'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={28} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Input label="Account Name" value={name} onChangeText={setName} placeholder="e.g. Wallet, Bank" />
            <Input label="Holder Name" value={holderName} onChangeText={setHolderName} placeholder="e.g. John Doe" />
            <Input label="Account Number" value={accountNumber} onChangeText={setAccountNumber} placeholder="e.g. XXXX-XXXX" />
            {!isEditing && (
              <Input
                label="Opening Balance"
                value={balance}
                onChangeText={setBalance}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            )}

            <Text style={styles.sectionLabel}>Select Currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.pickerItem, currency === c && styles.pickerSelected]} onPress={() => setCurrency(c)}>
                  <Text style={[styles.pickerText, currency === c && styles.pickerSelectedText]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Select Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
              {ICONS.map((i) => (
                <TouchableOpacity key={i} style={[styles.pickerItem, icon === i && styles.pickerSelected]} onPress={() => setIcon(i)}>
                  <Ionicons name={i as any} size={24} color={icon === i ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Select Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorItem, { backgroundColor: c }, colorHex === c && styles.colorSelected]}
                  onPress={() => setColorHex(c)}
                />
              ))}
            </ScrollView>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Save Account" onPress={handleSave} isLoading={isPending} style={{ width: '100%' }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background === '#000000' ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeButton: { padding: 4 },
  headerTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  formContainer: { padding: 24 },
  sectionLabel: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  pickerScroll: { marginBottom: 8 },
  pickerContent: { paddingRight: 20 },
  pickerItem: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface + '80', borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 16, marginRight: 12, minWidth: 64 },
  pickerSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  pickerSelectedText: { color: colors.primary, fontWeight: typography.weights.bold },
  pickerText: { color: colors.text, fontSize: typography.sizes.sm },
  colorItem: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: colors.text, transform: [{ scale: 1.1 }] },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'transparent',
  },
});
