import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import { typography } from '../../../theme/typography';
import { ONBOARDING_ACCOUNT_COLORS, ONBOARDING_ACCOUNT_ICONS } from '../constants';
import { OnboardingFormValues } from '../types';

type AccountStepProps = {
  defaultCurrency: string;
  accountIcon: string;
  accountColor: string;
  onIconChange: (value: string) => void;
  onColorChange: (value: string) => void;
};

export function AccountStep({
  defaultCurrency,
  accountIcon,
  accountColor,
  onIconChange,
  onColorChange,
}: AccountStepProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { control, watch, formState: { errors } } = useFormContext<OnboardingFormValues>();

  const accountName = watch('accountName');
  const accountHolder = watch('accountHolder');
  const openingBalance = watch('openingBalance');

  const previewName = accountName?.trim() || 'My Account';
  const previewHolder = accountHolder?.trim() || 'Account Holder';

  return (
    <View style={styles.wrapper}>

      {/* Q1 — account name */}
      <View style={styles.qaBlock}>
        <Text style={styles.question}>What should we call this account?</Text>
        <Controller
          control={control}
          name="accountName"
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Main Wallet"
              placeholderTextColor={colors.textMuted + '50'}
              style={styles.answerInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          )}
        />
        <View style={[styles.answerLine, errors.accountName && styles.answerLineError]} />
      </View>

      {/* Q2 — holder name */}
      <View style={styles.qaBlock}>
        <Text style={styles.question}>{"Who's the account holder?"}</Text>
        <Controller
          control={control}
          name="accountHolder"
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted + '50'}
              style={styles.answerInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          )}
        />
        <View style={[styles.answerLine, errors.accountHolder && styles.answerLineError]} />
      </View>

      {/* Q3 — account number */}
      <View style={styles.qaBlock}>
        <Text style={styles.question}>Account number or identifier?</Text>
        <Controller
          control={control}
          name="accountNumber"
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="IBAN / Last 4 / Wallet ID"
              placeholderTextColor={colors.textMuted + '50'}
              style={styles.answerInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="next"
            />
          )}
        />
        <View style={[styles.answerLine, errors.accountNumber && styles.answerLineError]} />
      </View>

      {/* Q4 — opening balance */}
      <View style={styles.qaBlock}>
        <Text style={styles.question}>Opening balance in {defaultCurrency}? <Text style={styles.questionHint}>(optional)</Text></Text>
        <Controller
          control={control}
          name="openingBalance"
          rules={{
            validate: (v) =>
              !v.trim() || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) || 'invalid',
          }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted + '50'}
              style={[styles.answerInput, styles.answerInputAmount]}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          )}
        />
        <View style={[styles.answerLine, errors.openingBalance && styles.answerLineError]} />
      </View>

      {/* Icon picker */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorLabel}>PICK AN ICON</Text>
        <View style={styles.iconWrap}>
          {ONBOARDING_ACCOUNT_ICONS.map((iconName) => {
            const selected = accountIcon === iconName;
            return (
              <TouchableOpacity
                key={iconName}
                style={[
                  styles.iconChip,
                  selected && { backgroundColor: accountColor, borderColor: accountColor },
                ]}
                onPress={() => onIconChange(iconName)}
                activeOpacity={0.9}
              >
                <Ionicons name={iconName} size={18} color={selected ? '#000100' : colors.text} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Color picker */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorLabel}>PICK A COLOR</Text>
        <View style={styles.colorWrap}>
          {ONBOARDING_ACCOUNT_COLORS.map((swatch) => {
            const selected = accountColor === swatch;
            return (
              <TouchableOpacity
                key={swatch}
                style={[
                  styles.colorChip,
                  { backgroundColor: swatch },
                  selected && styles.colorChipActive,
                ]}
                onPress={() => onColorChange(swatch)}
                activeOpacity={0.9}
              >
                {selected ? <Ionicons name="checkmark" size={14} color="#000100" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    wrapper: {
      gap: 0,
    },
    previewCard: {
      marginBottom: 28,
      minHeight: 78,
      borderRadius: 20,
      padding: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    previewIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    previewCopy: {
      flex: 1,
      paddingRight: 10,
    },
    previewName: {
      fontFamily: typography.fonts.headingRegular,
      fontSize: 17,
      color: colors.text,
      letterSpacing: -0.3,
    },
    previewMeta: {
      marginTop: 2,
      fontFamily: typography.fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    previewBalance: {
      fontFamily: typography.fonts.amountBold,
      fontSize: 16,
      color: colors.text,
    },
    qaBlock: {
      paddingBottom: 22,
    },
    question: {
      fontFamily: typography.fonts.semibold,
      fontSize: 13,
      color: colors.textMuted,
      letterSpacing: 0.1,
      marginBottom: 6,
    },
    questionHint: {
      fontFamily: typography.fonts.regular,
      fontSize: 12,
      color: colors.textMuted + 'AA',
    },
    answerInput: {
      fontFamily: typography.fonts.heading,
      fontSize: 28,
      lineHeight: 34,
      color: colors.text,
      letterSpacing: -0.7,
      paddingHorizontal: 0,
      paddingVertical: 4,
    },
    answerInputAmount: {
      fontFamily: typography.fonts.amountBold,
      letterSpacing: 0,
    },
    answerLine: {
      height: 2,
      borderRadius: 999,
      backgroundColor: colors.primary + '55',
      marginTop: 4,
    },
    answerLineError: {
      backgroundColor: colors.danger + '88',
    },
    selectorSection: {
      paddingBottom: 18,
    },
    selectorLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.3,
      marginBottom: 12,
    },
    iconWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    iconChip: {
      width: 46,
      height: 46,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background + 'B8',
      borderWidth: 1,
      borderColor: colors.text + '10',
    },
    colorWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    colorChip: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorChipActive: {
      borderColor: colors.text,
      transform: [{ scale: 1.08 }],
    },
  });
